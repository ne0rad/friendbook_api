import { Server } from "socket.io";
import { httpServer } from "./server";

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("[socket.io] Connected :", socket.id);

  socket.on("disconnect", () => {
    console.log("[socket.io] Disconnected :", socket.id);
  });
});
