import { Server } from "socket.io";
import { parse } from "cookie";
import authenticate from "../utils/authenticate";
import { User } from "@prisma/client";
import {
  getActivePlayerMatches,
  joinMatch,
  leaveMatch,
  startMatch,
  flipCard,
  tickTurn,
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
      try {
        const match = await joinMatch(user, matchId);
        socket.join(`match_${match.id}`);
        io.to(`match_${match.id}`).emit("playerJoined", { match });
        socket.emit("joinedMatch", { match });
      } catch (error) {
        socket.emit("error", { message: (error as Error).message });
      }
    });

    socket.on("leaveMatch", async (matchId: number) => {
      try {
        const match = await leaveMatch(user, matchId);
        socket.leave(`match_${matchId}`);
        io.to(`match_${matchId}`).emit("playerLeft", { match });
        socket.emit("leftMatch");
      } catch (error) {
        socket.emit("error", { message: (error as Error).message });
      }
    });

    socket.on("startMatch", async (matchId: number) => {
      try {
        const match = await startMatch(user, matchId);
        io.to(`match_${match.id}`).emit("matchStarted", { match });
      } catch (error) {
        socket.emit("error", { message: (error as Error).message });
      }
    });

    socket.on(
      "flipCard",
      async (data: { matchId: number; cardOrder: number }) => {
        try {
          const { matchId, cardOrder } = data;
          const match = await flipCard(user, matchId, cardOrder);
          io.to(`match_${match.id}`).emit("cardFlipped", { match });
          if (match.card2Flip !== null && match.status === "ongoing") {
            setTimeout(async () => {
              const updatedMatch = await tickTurn(match.id);
              io.to(`match_${match.id}`).emit("turnTicked", {
                match: updatedMatch,
              });
            }, 1000);
          }
        } catch (error) {
          socket.emit("error", { message: (error as Error).message });
        }
      }
    );

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${user.username}`);
      try {
        const matches = await getActivePlayerMatches(user);
        for (const match of matches) {
          await leaveMatch(user, match.id);
          io.to(`match_${match.id}`).emit("playerLeft", { match });
        }
      } catch (error) {
        console.error(
          `Error during disconnect cleanup for ${user.username}:`,
          error
        );
      }
    });
  });
};

export default matchSocket;
