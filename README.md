# ☕ Coffee Queue

Real-time coffee shop ordering & queue-calling system.

- **Counter screen** (`/counter.html`) – take orders, issue queue numbers, mark orders done
- **Display screen** (`/display.html`) – full-screen popup + chime + Thai voice call-out when an order is ready
- Works across devices on the same network (Mac, iPad, iPhone) and updates instantly

## Tech stack
| Layer | Tech |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Real-time | Socket.io |
| Database | SQLite (`node:sqlite`) |

## Run locally
```bash
npm install
npm start
```
Then open http://localhost:3000/counter.html and http://localhost:3000/display.html
