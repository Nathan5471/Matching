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
      data: {},
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

export const getActivePlayerMatches = async (user: User) => {
  // To be used internally, not sent to user
  try {
    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            id: user.id,
          },
        },
        status: {
          not: "completed",
        },
      },
      include: { players: true },
    });
    return matches;
  } catch (error) {
    console.error("Error fetching active player matches:", error);
    throw new Error("Failed to fetch active player matches");
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
      map: newMatch.map.sort((a, b) => a.order - b.order),
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
    if (match.players.length <= 1) {
      await prisma.match.delete({
        where: { id: matchId },
      });
      return null;
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
      map: newMatch.map.sort((a, b) => a.order - b.order),
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
          create: map.map((value, index) => ({ value, order: index })),
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
      map: updatedMatch.map.sort((a, b) => a.order - b.order),
      scores: updatedMatch.scores,
      currentTurn: updatedMatch.currentTurn,
      card1Flip: updatedMatch.card1Flip,
      card2Flip: updatedMatch.card2Flip,
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
  cardOrder: number
) => {
  if (cardOrder < 0 || cardOrder > 29) {
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
    if (match.map.filter((card) => card.order === cardOrder)[0].matched) {
      throw new Error("Card is already matched");
    }
    if (match.card1Flip === null) {
      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: { card1Flip: cardOrder },
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
        map: updatedMatch.map.sort((a, b) => a.order - b.order),
        scores: updatedMatch.scores,
        currentTurn: updatedMatch.currentTurn,
        card1Flip: updatedMatch.card1Flip,
        card2Flip: updatedMatch.card2Flip,
      };
      return playerFilteredMatch;
    } else if (match.card2Flip === null) {
      if (match.card1Flip === cardOrder) {
        throw new Error("Cannot flip the same card twice");
      }
      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: { card2Flip: cardOrder },
        include: { players: true, map: true },
      });
      if (
        updatedMatch.map.filter((card) => card.order === match.card1Flip)[0]
          .value ===
        updatedMatch.map.filter((card) => card.order === cardOrder)[0].value
      ) {
        const moreUpdatedMatch = await prisma.match.update({
          where: { id: matchId },
          data: {
            map: {
              updateMany: {
                where: {
                  OR: [
                    {
                      id: updatedMatch.map.filter(
                        (card) => card.order === match.card1Flip
                      )[0].id,
                    },
                    {
                      id: updatedMatch.map.filter(
                        (card) => card.order === cardOrder
                      )[0].id,
                    },
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
            map: wonMatch.map.sort((a, b) => a.order - b.order),
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
          map: moreUpdatedMatch.map.sort((a, b) => a.order - b.order),
          scores: moreUpdatedMatch.scores,
          currentTurn: moreUpdatedMatch.currentTurn,
          card1Flip: moreUpdatedMatch.card1Flip,
          card2Flip: moreUpdatedMatch.card2Flip,
        };
        return playerFilteredMatch;
      } else {
        const playerFilteredMatch = {
          id: updatedMatch.id,
          players: updatedMatch.players.map((player) => ({
            id: player.id,
            username: player.username,
          })),
          winnerId: updatedMatch.winnerId,
          status: updatedMatch.status,
          map: updatedMatch.map.sort((a, b) => a.order - b.order),
          scores: updatedMatch.scores,
          currentTurn: updatedMatch.currentTurn,
          card1Flip: updatedMatch.card1Flip,
          card2Flip: updatedMatch.card2Flip,
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
        map: fixedMatch.map.sort((a, b) => a.order - b.order),
        scores: fixedMatch.scores,
        currentTurn: fixedMatch.currentTurn,
        card1Flip: fixedMatch.card1Flip,
        card2Flip: fixedMatch.card2Flip,
      };
      return playerFilteredMatch;
    }
  } catch (error) {
    console.error("Error flipping card:", error);
    throw new Error("Failed to flip card");
  }
};

export const tickTurn = async (matchId: number) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true, map: true },
    });
    if (!match) {
      throw new Error("Match not found");
    }
    if (match.status !== "ongoing") {
      throw new Error("Cannot tick turn in a match that is not ongoing");
    }
    if (match.card1Flip === null || match.card2Flip === null) {
      throw new Error("Cannot tick turn before both cards are flipped");
    }
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        card1Flip: null,
        card2Flip: null,
        currentTurn: match.currentTurn + 1,
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
      map: updatedMatch.map.sort((a, b) => a.order - b.order),
      scores: updatedMatch.scores,
      currentTurn: updatedMatch.currentTurn,
      card1Flip: updatedMatch.card1Flip,
      card2Flip: updatedMatch.card2Flip,
    };
    return playerFilteredMatch;
  } catch (error) {
    console.error("Error ticking turn:", error);
    throw new Error("Failed to tick turn");
  }
};
