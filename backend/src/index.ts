import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter";
import matchRouter from "./routes/matchRouter";
import matchSocket from "./socket/matchSocket";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());

// APIs
app.use("/api/auth", authRouter);
app.use("/api/match", matchRouter);
matchSocket(io);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
