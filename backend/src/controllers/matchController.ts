import prisma from "../prisma/client";
import { User } from "@prisma/client";
import generateMap from "../utils/generateMap";

export const createMatch = async (req: any, res: any) => {
  const user = req.user as User;

  try {
    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            id: user.id,
          },
        },
      },
    });
    const nonCompletedMatches = matches.filter(
      (match) => match.status !== "completed"
    );
    if (nonCompletedMatches.length > 0) {
      return res
        .status(400)
        .json({ message: "User already has an ongoing or pending match" });
    }
    const newMatch = await prisma.match.create({
      data: {
        players: {
          connect: { id: user.id },
        },
      },
    });
    return res
      .status(201)
      .json({ id: newMatch.id, message: "Match created successfully" });
  } catch (error) {
    console.error("Error creating match:", error);
    return res.status(500).json({ message: "Failed to create match" });
  }
};

export const getAllMatches = async (req: any, res: any) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        players: true,
      },
      where: {
        status: "pending",
      },
    });
    const removedUnnecessaryFieldsMatches = matches.map((match) => ({
      id: match.id,
      players: match.players.map((player) => ({
        id: player.id,
        username: player.username,
      })),
    }));
    return res.status(200).json({
      matches: removedUnnecessaryFieldsMatches,
      message: "Matches fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({ message: "Failed to fetch matches" });
  }
};

export const joinMatch = async (user: User, matchId: number) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });
    if (!match) {
      throw new Error("Match not found");
    }
    if (match.status !== "pending") {
      throw new Error("Cannot join a match that is not pending");
    }
    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            id: user.id,
          },
        },
      },
    });
    const nonCompletedMatches = matches.filter(
      (match) => match.status !== "completed"
    );
    if (nonCompletedMatches.length > 0) {
      throw new Error("User already has an ongoing or pending match");
    }
    const newMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        players: {
          connect: { id: user.id },
        },
      },
      include: { players: true, map: true },
    });
    const playerFilteredMatch = {
      id: newMatch.id,
      players: newMatch.players.map((player) => ({
        id: player.id,
        username: player.username,
      })),
      winnerId: newMatch.winnerId,
      status: newMatch.status,
      map: newMatch.map,
      scores: newMatch.scores,
    };
    return playerFilteredMatch;
  } catch (error) {
    console.error("Error joining match:", error);
    throw new Error("Failed to join match");
  }
};

export const leaveMatch = async (user: User, matchId: number) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });
    if (!match) {
      throw new Error("Match not found");
    }
    if (!match.players.find((player) => player.id === user.id)) {
      throw new Error("User is not part of this match");
    }
    const newMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        players: {
          disconnect: { id: user.id },
        },
      },
      include: { players: true, map: true },
    });
    const playerFilteredMatch = {
      id: newMatch.id,
      players: newMatch.players.map((player) => ({
        id: player.id,
        username: player.username,
      })),
      winnerId: newMatch.winnerId,
      status: newMatch.status,
      map: newMatch.map,
      scores: newMatch.scores,
    };
    return playerFilteredMatch;
  } catch (error) {
    console.error("Error leaving match:", error);
    throw new Error("Failed to leave match");
  }
};

export const startMatch = async (user: User, matchId: number) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });
    if (!match) {
      throw new Error("Match not found");
    }
    if (match.status !== "pending") {
      throw new Error("Cannot start a match that is not pending");
    }
    if (!match.players.some((player) => player.id === user.id)) {
      throw new Error("User is not part of this match");
    }
    if (match.players.length < 2) {
      throw new Error("Not enough players to start the match");
    }
    const map = generateMap();
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "ongoing",
        map: {
          create: map.map((value) => ({ value })),
        },
      },
      include: { players: true, map: true },
    });
    const playerFilteredMatch = {
      id: updatedMatch.id,
      players: updatedMatch.players.map((player) => ({
        id: player.id,
        username: player.username,
      })),
      winnerId: updatedMatch.winnerId,
      status: updatedMatch.status,
      map: updatedMatch.map,
      scores: updatedMatch.scores,
    };
    return playerFilteredMatch;
  } catch (error) {
    console.error("Error starting match:", error);
    throw new Error("Failed to start match");
  }
};
