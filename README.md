# Faust Roku Remote Web App

A modern, responsive, full-featured web-based remote control for Roku TVs and streaming players built with **Node.js, Express, React 19, Vite, and Tailwind CSS**.

![Faust Roku Remote](https://img.shields.io/badge/Roku-ECP%20API-6c38cc?style=for-the-badge&logo=roku)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)
![Dokploy](https://img.shields.io/badge/Dokploy-Deployable-black?style=for-the-badge)

---

## 🌟 Key Features

1. **Roku TV Remote Control**:
   - **Directional Pad**: Ergonomic circular D-pad with Up, Down, Left, Right, and center OK/Select.
   - **Navigation Hub**: Home, Back, Options (`*`), Instant Replay (Jump back 7s), and Search.
   - **Transport Controls**: Play/Pause, Fast Forward, Rewind.
   - **TV Controls**: Power toggle, Volume Up / Down / Mute, and HDMI 1/2/3/4 & TV Tuner input switching.
   - **Haptic Feedback**: Subtle vibration on touchscreen taps for tactile responsiveness.

2. **Drag-and-Drop Channel Favorites & Quick Launch**:
   - Dynamic channel querying via Roku External Control Protocol (`/query/apps`).
   - Drag any channel from **All Channels** into your **Favorites** bar to pin it.
   - Reorder favorites via drag-and-drop or use the one-tap **⭐ Star toggle**.
   - Live banner displaying the channel currently playing on the TV.

3. **Responsive Multi-Pane Dashboard**:
   - **Phones**: Single-column remote view with bottom tab navigation.
   - **Tablets & Laptops**: Split dashboard with persistent remote on the left and wide channel grid on the right.
   - **Desktop / Wide Screens**: Responsive layout supporting up to 8-column grids.

4. **Virtual Keyboard / Text Input**:
   - Type search queries, movie titles, and credentials directly on your computer or phone keyboard into Roku on-screen search inputs.

5. **Web Browser & Custom Web App Launcher**:
   - Launch custom web apps, Home Assistant dashboards, weather screens, or web URLs directly onto your Roku TV screen.
   - Supports 3 launch strategies: Sideloaded Dev Channel (`dev`), Channel Store browsers, or direct media streams.
   - Built-in bookmark manager with persistent storage.

6. **Dual Discovery (Fast LAN Subnet Scanner + SSDP Multicast)**:
   - High-speed concurrent subnet scan detects all Roku TVs in under 1 second, even on mesh Wi-Fi (TP-Link Deco, Eero) and through firewalls.

---

## 🚀 Quick Start (Local Development)

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/F4u5t/Faust-RokuRemote.git
cd Faust-RokuRemote
npm run install:all
```

### 2. Run in Development Mode
Starts both Express backend (`localhost:4000`) and Vite frontend (`localhost:3000`):
```bash
npm run dev
```

### 3. Run in Production Mode
Build the frontend and run the single Express production server:
```bash
npm run build
npm start
```
Access at `http://localhost:4000`.

---

## 🐳 Deploying with Dokploy

This repository includes a multi-stage `Dockerfile` and `docker-compose.yml` preconfigured for seamless deployment with [Dokploy](https://dokploy.com/).

### Option A: Deploy via GitHub (Recommended)

1. Log into your **Dokploy Dashboard**.
2. Click **Create Application** &rarr; Select **Application**.
3. Under **Source Code**:
   - Provider: **GitHub**
   - Repository: `F4u5t/Faust-RokuRemote`
   - Branch: `main`
4. Under **Build Type**:
   - Select **Dockerfile** (or **Docker Compose**).
5. Under **Environment Variables**:
   ```env
   PORT=4000
   NODE_ENV=production
   ```
6. Under **Port Mapping / Domain**:
   - Container Port: `4000`
   - Assign your desired domain or subdomain (e.g. `remote.yourdomain.com`).
7. Click **Deploy**. Dokploy will build the React frontend and launch the Express container.

> [!TIP]
> **LAN Discovery Note for Self-Hosted Dokploy**:
> If your Dokploy host is running in your home network and you want automatic SSDP / Subnet discovery across your local Wi-Fi, you can set `network_mode: host` in your Dokploy advanced settings or Compose deployment. Alternatively, you can always connect to your Roku by entering its local IP address (e.g. `192.168.68.101`).

---

## 📺 Important Roku TV Setup Setting

For any third-party remote or web app to send button commands to Roku OS:
1. On your Roku TV, go to **Settings** &rarr; **System** &rarr; **Advanced system settings**.
2. Select **Control by mobile apps** &rarr; **Network access**.
3. Set it to **"Permissive"** (or **"Default"**).

---

## 📁 Repository Documentation
- [ROKU_REMOTE_WEB_APP_PLAN.md](ROKU_REMOTE_WEB_APP_PLAN.md) — Comprehensive technical architecture, ECP specification, and API contracts.
