# FileDrop

![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-supported-2496ED?logo=docker&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)

A free, open source, peer-to-peer encrypted file sharing web app.

FileDrop lets you send files directly between devices with WebRTC, with no account required and no server-side file storage. It also includes real-time chat for quick coordination during transfers.

- Owner: **Vraj Shiroya**
- Email: **vraj@shiroya.in**
- Website: **https://drop.shiroya.in**
- GitHub: **https://github.com/VG31OP/drop**

## Features

- End-to-end encrypted file transfers
- Peer-to-peer using WebRTC (no server storage)
- Real-time chat
- No account required
- Progressive Web App (installable)
- Self-hostable
- Mobile friendly
- No file size limits on self-hosted instances

## How It Works

1. Open FileDrop on your first device.
2. Open the same room on another device (QR code or URL).
3. Devices establish a direct WebRTC connection when possible.
4. Files transfer directly between peers with end-to-end encryption.
5. Use built-in real-time chat during transfers.

## Tech Stack

- Node.js
- Fastify
- WebSockets
- React
- Vite
- TypeScript
- WebRTC

## Self-Hosting

### Docker

#### Requirements

- Docker
- Docker Compose
- Bash
- OpenSSL

#### Run

```bash
git clone https://github.com/VG31OP/drop
cd drop
chmod +x ./docker-start.sh
./docker-start.sh
```

TURN uses TCP `3478` and UDP `49152-65535`.

### Manual (Node.js 20+)

#### Requirements

- Node.js 20+
- A TURN server (recommended for cross-network transfers)

#### Run

```bash
git clone https://github.com/VG31OP/drop
cd drop
corepack yarn install
corepack yarn build
corepack yarn start
```

## Environment Variables

### Frontend

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_APP_NAME` | `FileDrop` | Default app title shown before server app info is received. |

### WebSocket Server

| Variable | Default | Description |
| --- | --- | --- |
| `WS_APP_NAME` | `FileDrop` | Application title sent to clients. |
| `WS_ABUSE_EMAIL` | `vraj@shiroya.in` | Contact email shown in abuse/report context. |
| `WS_HOST` | `127.0.0.1` | Bind host for the server. |
| `WS_PORT` | `5000` | Bind port for the server. |
| `WS_USE_X_FORWARDED_FOR` | `0` | Set `1` to trust `X-Forwarded-For` (reverse proxy setups). |
| `WS_MAX_SIZE` | `65536` | Max signaling message size. |
| `WS_MAX_NETWORK_CLIENTS` | `64` | Max clients per room/network. |
| `WS_REQUIRE_CRYPTO` | `0` | Set `1` to require secure crypto-capable clients. |
| `WS_STATIC_ROOT` | `../web/build` | Path to frontend build output relative to `ws`. |
| `STUN_SERVER` | `stun:stun1.l.google.com:19302` | STUN server URL. |
| `TURN_MODE` | `default` | `default` or `hmac`. |
| `TURN_SERVER` | `null` | TURN server URL. |
| `TURN_USERNAME` | `null` | TURN username (default mode). |
| `TURN_CREDENTIAL` | `null` | TURN credential/password (default mode). |
| `TURN_SECRET` | `null` | TURN secret (hmac mode). |
| `TURN_EXPIRY` | `3600` | TURN token expiry in seconds (hmac mode). |
| `NOTICE_TEXT` | `null` | Global notice text shown to users. |
| `NOTICE_URL` | `null` | URL linked from global notice text. |

## Deployment Notes

- Deploy with Docker for quickest setup.
- Manual deployment is supported with Node.js 20+.
- For internet-facing instances, run behind HTTPS and configure TURN for reliable NAT traversal.

## License

BSD 3-Clause License. See [LICENSE](./LICENSE).
