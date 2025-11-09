import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

export default function Match() {
  const { matchId } = useParams<{ matchId: string }>();
  interface Match {
    id: number;
    players: { id: number; username: string }[];
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!matchId) return;

    socket.emit("joinMatch", Number(matchId));

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

    socket.on("leftMatch", () => {
      navigate("/");
    });

    socket.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
      setLoading(false);
    });
  }, [matchId, navigate]);

  const handleStartMatch = () => {
    if (!matchId) return;
    socket.emit("startMatch", Number(matchId));
  };

  const handleLeaveMatch = () => {
    if (!matchId) return;
    socket.emit("leaveMatch", Number(matchId));
  };

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

  if (match.status === "pending") {
    return (
      <div className="w-screen h-screen flex flex-col bg-primary-a3 text-primary-a4">
        <h1 className="text-4xl font-bold text-center p-4">
          Match #{match.id}
        </h1>
        <div className="grid grid-cols-5 grid-rows-3 w-full h-full gap-4 p-4">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="w-full h-full flex justify-center items-center bg-primary-a2 rounded-lg p-2"
            >
              {match.players[i] && (
                <h2 className="text-xl font-semibold">
                  {match.players[i].username}
                </h2>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-row p-2 justify-center items-center">
          <button
            className="bg-primary-a1 hover:bg-primary-a0 transition-colors text-white font-bold p-2 rounded-lg"
            onClick={handleStartMatch}
          >
            Start Match
          </button>
          <button
            className="bg-primary-a1 hover:bg-primary-a0 transition-colors text-white font-bold p-2 rounded-lg ml-4"
            onClick={handleLeaveMatch}
          >
            Leave Match
          </button>
        </div>
      </div>
    );
  }
}
