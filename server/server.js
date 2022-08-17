import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.get("/", (req, res) => {
  res.send("Snappy - A realtime collaborative whiteboard");
});

// socket io
io.on("connection", (server) => {
  console.log("User connected");
});

const PORT = 5000;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
