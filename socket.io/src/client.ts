import { io } from "socket.io-client";

const socket = io("http://localhost:3002", {
  reconnectionAttempts: 3, 
  timeout: 5000,          
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // send a test message
  socket.emit("message", { text: "Hello from client!" });
});

socket.on("message", (data) => {
  console.log("📩 Message received from server:", data);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected from server:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Connection error:", err.message);
});
