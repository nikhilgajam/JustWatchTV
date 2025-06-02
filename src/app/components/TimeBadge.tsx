import React from "react";

export default function TimeBadge({ time }: { time: string }) {
  return (
    <div>
      <span className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 text-xs rounded-md bg-opacity-50">
        {time}
      </span>
    </div>
  );
}
