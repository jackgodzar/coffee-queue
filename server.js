const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000; // บนเว็บโฮสติ้งจะกำหนด PORT ให้เอง

// ---------- ฐานข้อมูล ----------
// เปิดไฟล์ฐานข้อมูล (ถ้ายังไม่มีจะสร้างให้อัตโนมัติ)
const db = new DatabaseSync('coffee.db');

// สร้างตาราง orders (ถ้ายังไม่มี)
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    number     INTEGER PRIMARY KEY AUTOINCREMENT,
    drink      TEXT NOT NULL,
    done       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// ดึงออเดอร์ทั้งหมดจากฐานข้อมูล
function getOrders() {
  const rows = db.prepare('SELECT number, drink, done FROM orders ORDER BY number').all();
  return rows.map(r => ({ number: r.number, drink: r.drink, done: r.done === 1 }));
}

// ---------- เว็บ ----------
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('<h1>☕ ร้านกาแฟ</h1><a href="/counter.html">ไปหน้าเคาน์เตอร์</a>');
});

// ---------- เรียลไทม์ ----------
io.on('connection', (socket) => {
  socket.emit('orders', getOrders());

  // สั่งเครื่องดื่มใหม่ → บันทึกลงฐานข้อมูล
  socket.on('newOrder', (drink) => {
    db.prepare('INSERT INTO orders (drink) VALUES (?)').run(drink);
    io.emit('orders', getOrders());
  });

  // กดปุ่ม "เสร็จ" → อัปเดตในฐานข้อมูล
  socket.on('orderDone', (number) => {
    db.prepare('UPDATE orders SET done = 1 WHERE number = ?').run(number);
    const order = db.prepare('SELECT number, drink FROM orders WHERE number = ?').get(number);
    if (order) {
      io.emit('orders', getOrders());
      io.emit('ready', order);
    }
  });
});

server.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานแล้วที่ http://localhost:${PORT}`);
});
