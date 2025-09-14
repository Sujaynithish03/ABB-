import React from "react";

export function ABBJumpingLoader() {
  return (
    <div className="flex items-center justify-center h-16">
      {"ABB".split("").map((char, i) => (
        <span
          key={i}
          className={
            `text-4xl font-extrabold text-[#E2001A] mx-2 animate-jump` +
            ` animation-delay-${i}`
          }
          style={{
            animation: `jump 0.7s infinite ${i * 0.15}s`,
            display: "inline-block"
          }}
        >
          {char}
        </span>
      ))}
      <style>{`
        @keyframes jump {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  );
}
