# Drop (FileDrop) 🚀

![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-supported-2496ED?logo=docker&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)

A fast, free, open-source peer-to-peer encrypted file sharing web application engineered by [Vraj Shiroya (VG31OP)](https://github.com/VG31OP). Part of the [Shiroya Tool Lab](https://shiroya.in).

Drop streams files directly between devices over WebRTC RTCDataChannels with end-to-end encryption. No account required, zero intermediate cloud storage, and no arbitrary file size caps on self-hosted instances.

- **Live Application**: [https://drop.shiroya.in](https://drop.shiroya.in)
- **Parent Platform**: [https://shiroya.in](https://shiroya.in)
- **Creator**: [Vraj Shiroya (@VG31OP)](https://github.com/VG31OP) • [Website](https://vraj.shiroya.in) • [LinkedIn](https://www.linkedin.com/in/vrajshiroya)
- **Email Contact**: [vraj@shiroya.in](mailto:vraj@shiroya.in)

---

## ✨ Features

- **Direct Peer-to-Peer Streaming**: Files transfer directly between browser instances over WebRTC without uploading to cloud drives.
- **End-to-End Encryption**: Data channels are secured using DTLS encryption.
- **Zero Account Friction**: No signups, email verification, passwords, or tracking cookies.
- **Built-in Real-Time Chat**: Ephemeral messaging for peers to communicate during file transfers.
- **Progressive Web App (PWA)**: Installable on desktop and mobile devices.
- **Cross-Platform**: Operates on any modern browser (Chrome, Firefox, Safari, Edge) across iOS, Android, macOS, Linux, and Windows.
- **Self-Hostable**: Full Docker and manual Node.js deployment support with customizable STUN/TURN configurations.

---

## 🔍 How It Works

1. **Create/Join a Room**: Open Drop on your sender device. Share the room code or QR code with the receiver.
2. **Signaling Handshake**: The lightweight WebSocket server negotiates SDP offers, answers, and ICE candidates between peers.
3. **Direct DataChannel**: A direct WebRTC peer connection is established.
4. **Encrypted Transfer**: File chunks stream directly from device memory to device memory.
5. **No Intermediate Storage**: Files never touch the signaling server or third-party cloud storage.

---

## ⚠️ Known Limitations

- **Both Peers Must Remain Online**: Because transfers are direct P2P streams, both sender and recipient browser tabs must remain open until transfer completion.
- **NAT / Firewall Traversal**: Direct P2P connections work seamlessly on LANs and standard residential networks. Symmetric NATs, strict corporate firewalls, or cellular connections require a properly configured TURN server.
- **Browser Memory Limits**: Extremely large files on low-RAM mobile devices may be constrained by browser memory management during chunking.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Signaling**: Node.js, Fastify, WebSockets (`ws`)
- **Transport**: WebRTC RTCDataChannel (DTLS / SCTP)
- **Containerization**: Docker, Docker Compose

---

## 🚀 Self-Hosting & Deployment

### Option A: Docker (Recommended)

#### Prerequisites
- Docker Engine & Docker Compose
- OpenSSL & Bash

#### Run
```bash
git clone https://github.com/VG31OP/drop.git
cd drop
chmod +x ./docker-start.sh
./docker-start.sh
```

> **Note**: TURN uses TCP port `3478` and UDP ports `49152-65535`.

### Option B: Manual Setup (Node.js 20+)

#### Prerequisites
- Node.js 20 or newer
- Corepack / Yarn

#### Run
```bash
git clone https://github.com/VG31OP/drop.git
cd drop
corepack yarn install
corepack yarn build
corepack yarn start
```

---

## ⚙️ Configuration & Environment Variables

### Frontend

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_APP_NAME` | `FileDrop` | Default application title shown before server info is received. |

### WebSocket Signaling Server

| Variable | Default | Description |
| --- | --- | --- |
| `WS_APP_NAME` | `FileDrop` | Application title sent to connected clients. |
| `WS_ABUSE_EMAIL` | `vraj@shiroya.in` | Contact email shown in report contexts. |
| `WS_HOST` | `127.0.0.1` | Bind host for the server. |
| `WS_PORT` | `5000` | Bind port for the server. |
| `WS_USE_X_FORWARDED_FOR` | `0` | Set `1` to trust reverse proxy `X-Forwarded-For` headers. |
| `WS_MAX_SIZE` | `65536` | Max signaling message size in bytes. |
| `WS_MAX_NETWORK_CLIENTS` | `64` | Max clients allowed per room. |
| `WS_REQUIRE_CRYPTO` | `0` | Set `1` to require crypto-capable clients. |
| `WS_STATIC_ROOT` | `../web/build` | Path to frontend build output relative to `ws`. |
| `STUN_SERVER` | `stun:stun1.l.google.com:19302` | Primary STUN server URL. |
| `TURN_MODE` | `default` | `default` or `hmac`. |
| `TURN_SERVER` | `null` | TURN server URL for NAT traversal. |
| `TURN_USERNAME` | `null` | TURN username. |
| `TURN_CREDENTIAL` | `null` | TURN credential. |
| `TURN_SECRET` | `null` | TURN secret (for HMAC mode). |
| `TURN_EXPIRY` | `3600` | TURN token expiry in seconds. |
| `NOTICE_TEXT` | `null` | Optional global announcement banner text. |
| `NOTICE_URL` | `null` | Optional link URL for announcement banner. |

---

## 📄 License

This project is licensed under the **BSD 3-Clause License**. See the [LICENSE](./LICENSE) file for complete terms.
