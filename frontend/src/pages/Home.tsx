import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createMatch, getAllMatches } from "../utils/MatchAPIHandler";

export default function Home() {
  interface Match {
    id: number;
    players: { id: number; username: string }[];
  }
  const [matches, setMatches] = useState<Match[]>([]);
  const navigate = useNavigate();

  const fetchMatches = async () => {
    try {
      const data = await getAllMatches();
      setMatches(data.matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateMatch = async () => {
    try {
      const data = await createMatch();
      navigate(`/match/${data.id}`);
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-primary-a3 text-primary-a4">
      <div className="grid grid-cols-3 items-center p-3">
        <div />
        <h1 className="text-4xl font-bold text-center">Shrek Matching Game</h1>
        <div className="flex justify-end">
          <button
            onClick={handleCreateMatch}
            className="bg-primary-a1 hover:bg-primary-a0 transition-colors text-white font-bold p-2 rounded-lg"
          >
            Create Match
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 grid-rows-3 w-full h-full gap-4 p-6">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="w-full h-full flex flex-col justify-center items-center bg-primary-a2 rounded-lg p-2"
          >
            {i === 0 ? (
              matches.length === 0 ? (
                <h2 className="text-xl font-semibold">No matches found</h2>
              ) : (
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-1">
                    Match #{matches[0].id}
                  </h2>
                  <p className="text-lg">
                    Players:{" "}
                    {matches[0].players
                      .map((player) => player.username)
                      .join(", ")}
                  </p>
                  <a
                    href={`/match/${matches[0].id}`}
                    className="bg-primary-a1 hover:bg-primary-a0 transition-colors text-white font-bold p-2 rounded-lg"
                  >
                    Join Match
                  </a>
                </div>
              )
            ) : (
              i < matches.length && (
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-1">
                    Match #{matches[i].id}
                  </h2>
                  <p className="text-lg">
                    Players:{" "}
                    {matches[i].players
                      .map((player) => player.username)
                      .join(", ")}
                  </p>
                  <a
                    href={`/match/${matches[i].id}`}
                    className="bg-primary-a1 hover:bg-primary-a0 transition-colors text-white font-bold p-2 rounded-lg"
                  >
                    Join Match
                  </a>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
