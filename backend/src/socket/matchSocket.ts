import { Server } from "socket.io";
import { parse } from "cookie";
import authenticate from "../utils/authenticate";
import { User } from "@prisma/client";
import {
  joinMatch,
  leaveMatch,
  startMatch,
} from "../controllers/matchController";

const matchSocket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        throw new Error("Unauthorized");
      }
      const { token } = parse(cookies);
      if (!token) {
        throw new Error("Unauthorized");
      }
      const user = (await authenticate(token)) as User;
      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user as User;
    console.log(`User connected: ${user.username}`);

    socket.on("joinMatch", async (matchId: number) => {
      const match = await joinMatch(user, matchId);
      socket.join(`match_${match.id}`);
      io.to(`match_${match.id}`).emit("playerJoined", { match });
      socket.emit("joinedMatch", { match });
    });

    socket.on("leaveMatch", async (matchId: number) => {
      const match = await leaveMatch(user, matchId);
      socket.leave(`match_${matchId}`);
      io.to(`match_${matchId}`).emit("playerLeft", { match });
      socket.emit("leftMatch");
    });

    socket.on("startMatch", async (matchId: number) => {
      const match = await startMatch(user, matchId);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.username}`);
    });
  });
};

export default matchSocket;
