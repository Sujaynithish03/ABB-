import React from "react";

export function ABBLoader({ size = 32 }) {
  return (
    <div className="flex items-center justify-center">
      <span
        className="inline-block animate-spin"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="#E2001A"
            strokeWidth="4"
            strokeDasharray="22 44"
            strokeLinecap="round"
            opacity="0.2"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="#E2001A"
            strokeWidth="4"
            strokeDasharray="22 44"
            strokeLinecap="round"
            className="animate-spin"
          />
        </svg>
      </span>
    </div>
  );
}
