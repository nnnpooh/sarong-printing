import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { curPatternAtom, patternAtom } from "../utils/atoms";
import { type Pattern } from "../utils/types";

const initialPatterns: Pattern[] = [
  {
    id: "pattern1",
    name: "Pattern 1",
    thumbnailUrl: "/img/p1.jpg",
    imageUrl: "/img/p1.jpg",
  },
  {
    id: "pattern2",
    name: "Pattern 2",
    thumbnailUrl: "/img/p2.jpg",
    imageUrl: "/img/p2.jpg",
  },
  {
    id: "pattern3",
    name: "Pattern 3",
    thumbnailUrl: "/img/p3.jpg",
    imageUrl: "/img/p3.jpg",
  },
  {
    id: "pattern4",
    name: "Pattern 4",
    thumbnailUrl: "/img/p4.jpg",
    imageUrl: "/img/p4.jpg",
  }
];

function PatternSelector() {
  const [patterns, setPatterns] = useAtom(patternAtom);
  const [curPattern, setCurPattern] = useAtom(curPatternAtom);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        setLoading(true);
        setPatterns(initialPatterns);
      } catch (err: any) {
        console.error("Error fetching patterns:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, []);
  console.log("Current Pattern:", curPattern);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-lg text-gray-600">Loading patterns...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-4">
        {patterns.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurPattern(p)}
            className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              curPattern?.id === p.id
                ? "ring-4 ring-purple-500"
                : "hover:ring-2 hover:ring-purple-300"
            }`}
          >
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={p.thumbnailUrl}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="p-4">
              <div className="text-lg font-semibold text-gray-800">
                {p.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PatternSelector;
