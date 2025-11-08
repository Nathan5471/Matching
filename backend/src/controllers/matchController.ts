import prisma from "../prisma/client";
import { User } from "@prisma/client";

export const createMatch = async (req: any, res: any) => {
  const user = req.user as User;

  try {
    const ongoingMatches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            id: user.id,
          },
        },
        status: "ongoing",
      },
    });
    if (ongoingMatches.length > 0) {
      return res
        .status(400)
        .json({ message: "User already has an ongoing match" });
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
    return res
      .status(200)
      .json({
        matches: removedUnnecessaryFieldsMatches,
        message: "Matches fetched successfully",
      });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({ message: "Failed to fetch matches" });
  }
};
