import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
// user store
const users = new Map();
let userCount = 0;
wss.on("connection", (ws) => {
  userCount++;
  const userId = userCount;
  ws.userId = userId;
  // store user
  users.set(userId, ws);
  console.log(`User ${userId} Connected`);
  ws.on("message", (data) => {
    const parsed = JSON.parse(data);
    const { to, message } = parsed;
    console.log(`User ${userId} -> User ${to}: ${message}`);
    //target user find karo
    const targetUser = users.get(to);
    if (targetUser && targetUser.readyState === 1) {
      targetUser.send(`Private from ${userId}: ${message}`);
    } else {
      ws.send("User not available");
    }
  });
  ws.on("close", () => {
    users.delete(userId);
    console.log(`User ${userId} Disconnected`);
  });
});
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});