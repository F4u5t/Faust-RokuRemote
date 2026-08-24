const dgram = require('dgram');
const os = require('os');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

class RokuDiscovery {
  constructor() {
    this.discoveredDevices = new Map();
  }

  /**
   * Get all active IPv4 local subnets from network interfaces
   */
  getLocalSubnets() {
    const interfaces = os.networkInterfaces();
    const subnets = new Set();

    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        // Skip internal/loopback and non-IPv4
        if (net.family === 'IPv4' && !net.internal) {
          const parts = net.address.split('.');
          if (parts.length === 4) {
            subnets.add(`${parts[0]}.${parts[1]}.${parts[2]}`);
          }
        }
      }
    }
    return Array.from(subnets);
  }

  /**
   * Fast parallel probe across local /24 subnet IPs on port 8060
   */
  async scanSubnets() {
    const subnets = this.getLocalSubnets();
    const probePromises = [];

    for (const subnet of subnets) {
      for (let i = 1; i <= 254; i++) {
        const ip = `${subnet}.${i}`;
        probePromises.push(
          axios.get(`http://${ip}:8060/query/device-info`, { timeout: 1200 })
            .then(res => {
              const parsed = parser.parse(res.data);
              const info = parsed['device-info'] || {};
              const deviceObj = {
                ip,
                location: `http://${ip}:8060/`,
                name: info['user-device-name'] || info['friendly-device-name'] || info['model-name'] || `Roku (${ip})`,
                model: info['model-name'] || 'Roku',
                modelNumber: info['model-number'] || '',
                serialNumber: info['serial-number'] || '',
                isTv: info['is-tv'] === 'true' || info['is-tv'] === true,
                powerMode: info['power-mode'] || 'PowerOn',
                ecpMode: info['ecp-setting-mode'] || 'permissive',
                active: true,
                lastSeen: Date.now()
              };
              this.discoveredDevices.set(ip, deviceObj);
              return deviceObj;
            })
            .catch(() => null)
        );
      }
    }

    await Promise.all(probePromises);
    return Array.from(this.discoveredDevices.values());
  }

  /**
   * Discovers Roku devices using both SSDP multicast and fast subnet scanning
   * @param {number} timeoutMs Search timeout in milliseconds (default: 2500ms)
   * @returns {Promise<Array>} List of discovered Roku devices
   */
  async discover(timeoutMs = 2500) {
    // Run fast subnet scan and SSDP concurrently
    const subnetScanPromise = this.scanSubnets();

    const ssdpPromise = new Promise((resolve) => {
      const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      const ssdpMessage = [
        'M-SEARCH * HTTP/1.1',
        'HOST: 239.255.255.250:1900',
        'MAN: "ssdp:discover"',
        'ST: roku:ecp',
        'MX: 2',
        '',
        ''
      ].join('\r\n');

      socket.on('error', () => {
        try { socket.close(); } catch (e) {}
        resolve();
      });

      socket.on('message', async (msg, rinfo) => {
        const text = msg.toString();
        if (text.includes('roku:ecp') || text.includes('LOCATION:')) {
          const match = text.match(/LOCATION:\s*(http:\/\/[^\r\n]+)/i);
          const location = match ? match[1].trim() : `http://${rinfo.address}:8060/`;
          const ip = rinfo.address;

          try {
            const info = await this.getDeviceInfo(ip);
            const deviceObj = {
              ip,
              location,
              name: info['user-device-name'] || info['friendly-device-name'] || info['model-name'] || `Roku (${ip})`,
              model: info['model-name'] || 'Roku',
              modelNumber: info['model-number'] || '',
              serialNumber: info['serial-number'] || '',
              isTv: info['is-tv'] === 'true' || info['is-tv'] === true,
              powerMode: info['power-mode'] || 'PowerOn',
              ecpMode: info['ecp-setting-mode'] || 'permissive',
              active: true,
              lastSeen: Date.now()
            };
            this.discoveredDevices.set(ip, deviceObj);
          } catch (e) {
            // ignore
          }
        }
      });

      socket.bind(() => {
        try {
          socket.setBroadcast(true);
          const buffer = Buffer.from(ssdpMessage);
          socket.send(buffer, 0, buffer.length, 1900, '239.255.255.250');
        } catch (err) {
          // ignore
        }
      });

      setTimeout(() => {
        try { socket.close(); } catch (e) {}
        resolve();
      }, timeoutMs);
    });

    await Promise.all([subnetScanPromise, ssdpPromise]);
    return Array.from(this.discoveredDevices.values());
  }

  /**
   * Fetches device-info from a Roku IP address
   */
  async getDeviceInfo(ip) {
    const url = `http://${ip}:8060/query/device-info`;
    const response = await axios.get(url, { timeout: 2500 });
    const parsed = parser.parse(response.data);
    return parsed['device-info'] || {};
  }
}

module.exports = new RokuDiscovery();
