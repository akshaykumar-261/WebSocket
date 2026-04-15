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
    const { userKey, message, type } = parsed;
    // single user chat
    if (type === "private") {
      console.log(`User ${userId} -> User ${userKey}: ${message}`);
      //target user find karo
      const targetUser = users.get(userKey);
      if (targetUser && targetUser.readyState === 1) {
        // receiver ko msg milaga
        targetUser.send(
          `Message received recived from user ${userId}: ${message}`,
        );
        // sender ko success message bhejo
        ws.send(`Message sent successfully to user ${userKey}`);
      } else {
        ws.send(`User ${userKey} not available`);
      }
    }
    if (type === "group") {
      console.log(`Group message from user ${userId}: ${message}`);
      users.forEach((client, id) => {
        if (id !== userId && client.readyState === 1) {
          client.send(`Group message recived from user ${userId}:${message}`);
        }
      });
      ws.send("Group message sent successfully");
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
