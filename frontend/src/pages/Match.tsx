import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

export default function Match() {
  const { matchId } = useParams<{ matchId: string }>();
  interface Match {
    id: number;
    players: { id: number; name: string }[];
    winnerId: number;
    status: "pending" | "ongoing" | "completed";
    map: {
      id: number;
      value: string;
      matched: boolean;
      matchId: number;
    }[];
    scores: number[];
    currentTurn: number;
    card1Flip: number | null;
    card2Flip: number | null;
  }
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!matchId) return;

    socket.emit("joinMatch", { matchId });

    socket.on("joinedMatch", (data: { match: Match }) => {
      setMatch(data.match);
      setLoading(false);
    });

    socket.on("playerJoined", (data: { match: Match }) => {
      setMatch(data.match);
    });

    socket.on("playerLeft", (data: { match: Match }) => {
      setMatch(data.match);
    });

    socket.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
      setLoading(false);
    });
  }, [matchId]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-primary-a3 text-primary-a4">
        <div className="bg-primary-a2 p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Loading Match...</h2>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-primary-a3 text-primary-a4">
        <div className="bg-primary-a2 p-6 rounded-lg w-120">
          <h2 className="text-2xl font-bold">Unable to join match</h2>
          <p className="text-xl">
            You are either in a match, this match doesn't exist, or this match
            is already started.
          </p>
        </div>
      </div>
    );
  }
}
