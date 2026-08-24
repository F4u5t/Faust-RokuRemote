# Roku TV Web Remote: Architecture, API Research & Implementation Plan

## 1. Executive Summary

This document outlines the research, technical feasibility, architecture, and step-by-step implementation plan for building a responsive **Web-based Roku TV Remote Control application**. The application allows users to control their Roku TV from any phone, tablet, or desktop browser on the local network, dynamically list and launch installed streaming channels (YouTube TV, Prime Video, Netflix, etc.), and launch web applications or web browsing workflows on the Roku.

---

## 2. Roku External Control Protocol (ECP) API Overview

Roku devices run a local HTTP server on **port 8060** implementing the **External Control Protocol (ECP)**. ECP enables external devices on the same local subnet to discover, query, and send commands to Roku streaming players and Roku TVs without requiring cloud authentication or API keys.

### 2.1 ECP Protocol Summary

| Feature | Method / Endpoint | Description |
| :--- | :--- | :--- |
| **SSDP Auto-Discovery** | `UDP 239.255.255.250:1900` | Multicast search with `ST: roku:ecp` |
| **Send Button Press** | `POST /keypress/{key}` | Emulates single button press |
| **Key Down (Hold)** | `POST /keydown/{key}` | Emulates pressing and holding a button |
| **Key Up (Release)** | `POST /keyup/{key}` | Emulates releasing a held button |
| **Type Character** | `POST /keypress/Lit_{char}` | Sends a URL-encoded single alphanumeric/symbol character |
| **Query Installed Apps** | `GET /query/apps` | Returns XML list of all installed channels and their App IDs |
| **Query Active App** | `GET /query/active-app` | Returns XML with currently open channel |
| **Fetch App Icon** | `GET /query/icon/{appId}` | Returns raw image data (JPEG/PNG) of channel icon |
| **Launch Channel** | `POST /launch/{appId}` | Launches an app with optional deep link query parameters |
| **Install Channel** | `POST /install/{appId}` | Opens channel store page to install an app |
| **Query Device Info** | `GET /query/device-info` | Returns model, serial, power state, network info, friendly name |
| **Media Player State** | `GET /query/media-player` | Returns playback state, position, and buffer status |

---

## 3. Remote Control Capabilities & Key Mappings

### 3.1 Standard Roku Navigation & Transport Controls
- **Directional Navigation**: `Up`, `Down`, `Left`, `Right`, `Select` (OK button)
- **Navigation Controls**: `Home`, `Back`, `InstantReplay` (Jump back 7s), `Info` (`*` Options button), `Search`
- **Media Controls**: `Play` (Play/Pause toggle), `Rev` (Rewind), `Fwd` (Fast Forward)

### 3.2 Roku TV Specific Controls
*(Available on Roku TVs and soundbars with TV tuners)*
- **Power**: `PowerOff`, `PowerOn`, `Power` (Toggle)
- **Audio**: `VolumeUp`, `VolumeDown`, `VolumeMute`
- **Tuner & Inputs**: `ChannelUp`, `ChannelDown`, `InputTuner`, `InputHDMI1`, `InputHDMI2`, `InputHDMI3`, `InputHDMI4`, `InputAV1`

### 3.3 Keyboard & Text Input
To type text into Roku search fields or login screens:
- Send `POST /keypress/Lit_{URL_ENCODED_CHAR}` for each character.
  - *Example:* To type space: `POST /keypress/Lit_%20`
  - *Example:* To type `@`: `POST /keypress/Lit_%40`
- Special keys: `Backspace`, `Enter`

---

## 4. App Quick-Launch & Dynamic Channel Management

### 4.1 Dynamic App Querying
Instead of hardcoding channel IDs, the web app queries `GET /query/apps` on connect. The Roku responds with XML:
```xml
<apps>
  <app id="12" type="appl" version="5.1.98079410">Netflix</app>
  <app id="13" type="appl" version="14.1.2023112015">Prime Video</app>
  <app id="837" type="appl" version="2.22.115005118">YouTube</app>
  <app id="195316" type="appl" version="1.0.80000155">YouTube TV</app>
  <app id="2285" type="appl" version="6.73.0">Hulu</app>
  <app id="291097" type="appl" version="3.3.0">Disney Plus</app>
  <app id="61322" type="appl" version="3.1.2">HBO Max / Max</app>
  <app id="151908" type="appl" version="1.0.0">The Roku Channel</app>
</apps>
```

### 4.2 Fetching App Icons
The app can render high-resolution channel icons directly in the web UI by fetching:
```http
GET http://<roku-ip>:8060/query/icon/<appId>
```

### 4.3 Launching Apps
To launch any channel:
```bash
curl -d '' "http://<roku-ip>:8060/launch/<appId>"
```

---

## 5. Research: Launching Web Browsers & Web Apps on Roku

### 5.1 The Roku Platform Constraint
Unlike Android TV, Fire TV (Silk Browser), or Apple TV, **Roku OS does not include a native, built-in full-featured web browser** (such as Chrome or Safari). Roku OS is designed around its proprietary SceneGraph / BrightScript application framework, and Roku does not expose an arbitrary URL handler endpoint directly in ECP (e.g., you cannot do `POST /launch/browser?url=https://...` natively out of the box).

### 5.2 Solutions & Implementation Strategies

To open web pages and user-created web apps on Roku, four viable architectural strategies exist:

```
+-------------------------------------------------------------------------+
|                  Roku Web App Launch Strategies                         |
+-------------------------------------------------------------------------+
|                                                                         |
|  [Strategy A: Third-Party Browser Channels with Deep Linking]           |
|  * Launch store apps (BrowseHere, Web Browser X, OpenBrowser)           |
|  * Pass target URL via ECP launch query parameters                      |
|                                                                         |
|  [Strategy B: Custom Sideloaded Roku Developer Channel (Recommended)]   |
|  * Sideload a lightweight custom BrightScript/SceneGraph Web Channel    |
|  * Directly listens to ECP POST /launch/dev?url=https://...             |
|  * Renders web apps or responsive HTML dashboards                       |
|                                                                         |
|  [Strategy C: Media Stream / Dashboard Casting (Play on Roku)]          |
|  * Use Roku channel 15985 (Play on Roku) or HLS/DASH/MP4 video stream   |
|  * Cast live dashboard/rendered web streams to the TV                   |
|                                                                         |
|  [Strategy D: Native AirPlay 2 / Miracast Screen Casting]               |
|  * Trigger screen mirroring from the user's phone or computer browser   |
|                                                                         |
+-------------------------------------------------------------------------+
```

#### Strategy A: Deep Linking into Third-Party Roku Web Browsers
Several web browser channels exist in the Roku Channel Store (e.g., *BrowseHere*, *Web Browser X*, *Web View*). When installed, these can be launched with target URL query parameters:
```http
POST http://<roku-ip>:8060/launch/<browserAppId>?url=https%3A%2F%2Fmy-web-app.com
```

#### Strategy B: Custom Sideloaded Roku Web-Viewer Channel (Most Direct & Customizable)
Every Roku device has **Developer Mode** (activated via remote key combo: `Home 3x + Up 2x + Right + Left + Right + Left + Right`).
- You can create and sideload a simple BrightScript SceneGraph channel (`dev` channel).
- The channel parses `launchParameters.url` passed from ECP:
  ```http
  POST http://<roku-ip>:8060/launch/dev?url=https%3A%2F%2Fmy-web-app.com
  ```
- The channel loads the URL or presents an iframe/web-view / dashboard on screen.

#### Strategy C: Play on Roku / Cast Video Stream
If your web app produces video/media or dynamic visual dashboard streams, you can stream directly to Roku's native media player:
```http
POST http://<roku-ip>:8060/input/15985?hls=https%3A%2F%2Fmy-stream.m3u8
```

---

## 6. Web App Architecture & Technical Challenges

### 6.1 Browser Network Sandbox & CORS Constraint
When building a web application, browsers enforce security restrictions:
1. **No CORS Headers on Roku**: Roku's ECP HTTP server (`http://<roku-ip>:8060`) does not include `Access-Control-Allow-Origin: *` headers. Browser `fetch()` / `XMLHttpRequest` calls from another origin will be blocked.
2. **Mixed Content Policy**: If the web app is hosted over HTTPS (e.g., `https://my-remote.app`), the browser blocks calls to insecure HTTP local targets (`http://192.168.1.X:8060`).
3. **No UDP in Browsers**: Pure browser JavaScript cannot broadcast UDP SSDP packets (`239.255.255.250:1900`) to auto-discover Roku devices on the LAN.

### 6.2 Recommended Full-Stack Architecture

To solve these constraints cleanly, the recommended architecture uses a **Lightweight Local Backend + Modern Web Frontend (or Single-Node Fullstack)**:

```
+--------------------------------------------------------------------+
|                         CLIENT (Browser / PWA)                     |
|  - Modern Dark-Theme TV Remote UI (D-pad, Transport, Volume)       |
|  - App Grid with Live Icons (YouTube TV, Netflix, Prime, etc.)     |
|  - Web URL Launcher Modal (Pre-saved bookmarks & custom URLs)      |
|  - Device Selector / Scanner UI & Virtual Keyboard Input           |
+--------------------------------------------------------------------+
                               |
                        HTTP / WebSocket
                               |
+--------------------------------------------------------------------+
|                   BACKEND SERVER (Node.js / Express)               |
|  1. SSDP Discovery Engine (Auto-detects all Roku TVs on LAN)       |
|  2. ECP Reverse Proxy & CORS Handler (Relays POST/GET to Roku)     |
|  3. XML-to-JSON Transformer (Parses /query/apps, device-info)      |
|  4. Icon Caching Layer (Proxies and caches /query/icon/{id})       |
|  5. Web App Bookmark & Config Storage (Saved URLs, device aliases) |
+--------------------------------------------------------------------+
                               |
                     Local Network (Port 8060)
                               |
+--------------------------------------------------------------------+
|                         ROKU TV DEVICE                             |
|  - Port 8060: External Control Protocol (ECP) Server               |
+--------------------------------------------------------------------+
```

---

## 7. Proposed Features & UI Specification

### 7.1 Key Features
1. **Automatic Device Discovery & Manual IP Fallback**:
   - Background SSDP scanner finds all Roku TVs in the house (e.g., "Living Room TV", "Bedroom Roku").
   - Manual IP input with connectivity ping test and localStorage persistence.
2. **Full Remote Control Interface**:
   - Ergonomic directional pad (Up/Down/Left/Right/OK).
   - Core controls: Home, Back, Options (`*`), Replay, Info.
   - Playback bar: Play/Pause, Fast Forward, Rewind.
   - Roku TV controls: Power, Volume Up/Down/Mute, HDMI 1/2/3/4 input switcher.
   - Virtual keyboard input (types directly into Roku search/text fields).
   - Haptic vibration feedback on mobile touch.
3. **App Grid & Quick Launch**:
   - Dynamic grid displaying all installed apps with official icons.
   - One-tap quick launch for favorite apps (YouTube TV, Netflix, Prime Video, Disney+, etc.).
   - Active app indicator showing what is currently playing/open.
4. **Web Browser & Custom Web App Launcher**:
   - Quick launcher drawer for user-defined web apps (e.g., Home Assistant, custom dashboards, web apps).
   - Configurable launch method (Third-party browser deep link, sideloaded dev channel, or stream casting).
   - Saved bookmarks management (add/edit/delete URLs and custom titles).

---

## 8. Technology Stack Recommendation

| Component | Recommended Technology | Rationale |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v18+) with Express | Fast, lightweight, cross-platform, native UDP socket support (`dgram`) |
| **SSDP Discovery** | `node-ssdp` / native `dgram` | Reliable UDP multicast search for `roku:ecp` |
| **XML Parser** | `fast-xml-parser` | Ultra-fast conversion of Roku ECP XML responses to JSON |
| **Frontend Framework**| React / Vite + Tailwind CSS | Ultra-fast UI, modern styling, mobile-first responsive layout |
| **Icons & Design** | Lucide Icons | Clean SVG icons for TV controls, d-pad, volume, power |
| **PWA Support** | `vite-plugin-pwa` | Installable as a standalone app on iPhone/Android home screen |

---

## 9. Next Steps / Implementation Plan

1. **Project Setup**:
   - Initialize repository with Node.js backend (`server/`) and React/Vite frontend (`client/`).
2. **Backend Implementation**:
   - Build SSDP Roku discovery module (`GET /api/discover`).
   - Build ECP Proxy Router (`POST /api/roku/keypress/:key`, `GET /api/roku/apps`, `POST /api/roku/launch/:appId`).
   - Build Web Bookmark / Config storage (`/api/bookmarks`).
3. **Frontend Implementation**:
   - Build mobile-optimized remote control layout with tactile button styling.
   - Build dynamic App Grid with icon rendering and search filter.
   - Build Web Launcher modal with URL bookmarks.
   - Add virtual keyboard typing interface.
4. **Testing & Verification**:
   - Test against live Roku TV on the local network.
   - Test app launching and custom web app deep linking.
