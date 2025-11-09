import prisma from "../prisma/client";
import { User, CardValues } from "@prisma/client";
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
      currentTurn: newMatch.currentTurn,
      card1Flip: newMatch.card1Flip,
      card2Flip: newMatch.card2Flip,
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
      currentTurn: newMatch.currentTurn,
      card1Flip: newMatch.card1Flip,
      card2Flip: newMatch.card2Flip,
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
    const map = generateMap() as CardValues[];
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "ongoing",
        map: {
          create: map.map((value) => ({ value })),
        },
        scores: match.players.map(() => 0),
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

export const flipCard = async (
  user: User,
  matchId: number,
  cardIndex: number
) => {
  if (cardIndex < 0 || cardIndex > 29) {
    throw new Error("Invalid card index");
  }
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true, map: true },
    });
    if (!match) {
      throw new Error("Match not found");
    }
    if (match.status !== "ongoing") {
      throw new Error("Cannot flip card in a match that is not ongoing");
    }
    if (!match.players.some((player) => player.id === user.id)) {
      throw new Error("User is not part of this match");
    }
    if (
      match.players[match.currentTurn % match.players.length].id !== user.id
    ) {
      throw new Error("It's not the user's turn");
    }
    if (match.map[cardIndex].matched) {
      throw new Error("Card is already matched");
    }
    if (match.card1Flip === null) {
      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: { card1Flip: cardIndex },
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
        currentTurn: updatedMatch.currentTurn,
        card1Flip: updatedMatch.card1Flip,
        card2Flip: updatedMatch.card2Flip,
      };
      return playerFilteredMatch;
    } else if (match.card2Flip === null) {
      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: { card2Flip: cardIndex },
        include: { players: true, map: true },
      });
      if (
        updatedMatch.map[match.card1Flip].value ===
        updatedMatch.map[cardIndex].value
      ) {
        const moreUpdatedMatch = await prisma.match.update({
          where: { id: matchId },
          data: {
            map: {
              updateMany: {
                where: {
                  OR: [
                    { id: updatedMatch.map[match.card1Flip].id },
                    { id: updatedMatch.map[cardIndex].id },
                  ],
                },
                data: { matched: true },
              },
            },
            scores: [
              ...updatedMatch.scores.map((score, index) => {
                if (
                  index ===
                  updatedMatch.currentTurn % updatedMatch.players.length
                ) {
                  return score + 1;
                }
                return score;
              }),
            ],
            card1Flip: null,
            card2Flip: null,
          },
          include: { players: true, map: true },
        });
        if (moreUpdatedMatch.map.every((card) => card.matched)) {
          const wonMatch = await prisma.match.update({
            where: { id: matchId },
            data: {
              status: "completed",
              winnerId:
                moreUpdatedMatch.players[
                  moreUpdatedMatch.scores.indexOf(
                    Math.max(...moreUpdatedMatch.scores)
                  )
                ].id,
            },
            include: { players: true, map: true },
          });
          const playerFilteredWonMatch = {
            id: wonMatch.id,
            players: wonMatch.players.map((player) => ({
              id: player.id,
              username: player.username,
            })),
            winnerId: wonMatch.winnerId,
            status: wonMatch.status,
            map: wonMatch.map,
            scores: wonMatch.scores,
            currentTurn: wonMatch.currentTurn,
            card1Flip: wonMatch.card1Flip,
            card2Flip: wonMatch.card2Flip,
          };
          return playerFilteredWonMatch;
        }
        const playerFilteredMatch = {
          id: moreUpdatedMatch.id,
          players: moreUpdatedMatch.players.map((player) => ({
            id: player.id,
            username: player.username,
          })),
          winnerId: moreUpdatedMatch.winnerId,
          status: moreUpdatedMatch.status,
          map: moreUpdatedMatch.map,
          scores: moreUpdatedMatch.scores,
          currentTurn: moreUpdatedMatch.currentTurn,
          card1Flip: moreUpdatedMatch.card1Flip,
          card2Flip: moreUpdatedMatch.card2Flip,
        };
        return playerFilteredMatch;
      }
    } else {
      console.log("Both cards are already flipped, something probably broke");
      const fixedMatch = await prisma.match.update({
        where: { id: matchId },
        data: {
          card1Flip: null,
          card2Flip: null,
          currentTurn: match.currentTurn + 1,
        },
        include: { players: true, map: true },
      });
      const playerFilteredMatch = {
        id: fixedMatch.id,
        players: fixedMatch.players.map((player) => ({
          id: player.id,
          username: player.username,
        })),
        winnerId: fixedMatch.winnerId,
        status: fixedMatch.status,
        map: fixedMatch.map,
        scores: fixedMatch.scores,
        currentTurn: fixedMatch.currentTurn,
        card1Flip: fixedMatch.card1Flip,
        card2Flip: fixedMatch.card2Flip,
      };
      return playerFilteredMatch;
    }
    const playerFilteredMatch = {
      id: match.id,
      players: match.players.map((player) => ({
        id: player.id,
        username: player.username,
      })),
      winnerId: match.winnerId,
      status: match.status,
      map: match.map,
      scores: match.scores,
      currentTurn: match.currentTurn,
      card1Flip: match.card1Flip,
      card2Flip: match.card2Flip,
    };
    return playerFilteredMatch;
  } catch (error) {
    console.error("Error flipping card:", error);
    throw new Error("Failed to flip card");
  }
};
