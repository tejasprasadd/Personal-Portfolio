/** Lightweight, accessible illustration used before WebGL and on low-power devices. */
export function IslandFallback({ timeOfDay = "day" }: { timeOfDay?: "day" | "night" }) {
  return (
    <div className="island-fallback" aria-label="Illustrated island playground">
      <svg
        viewBox="0 0 700 500"
        role="img"
        aria-label="A little green island with a rover, trees, and project buildings"
      >
        <ellipse
          cx="355"
          cy="320"
          rx="335"
          ry="175"
          fill={timeOfDay === "night" ? "#193b50" : "#6dadae"}
        />
        <ellipse
          cx="355"
          cy="300"
          rx="275"
          ry="144"
          fill="none"
          stroke={timeOfDay === "night" ? "#44727a" : "#cae1d4"}
          strokeWidth="3"
          opacity=".6"
        />
        <ellipse cx="365" cy="405" rx="230" ry="48" fill="#91a89a" opacity=".13" />
        <path d="M100 290Q350 90 610 280L610 318Q360 495 100 328Z" fill="#b4b196" />
        <ellipse cx="355" cy="283" rx="259" ry="128" fill="#b7cba9" />
        <ellipse cx="355" cy="283" rx="183" ry="85" fill="none" stroke="#e9dcbb" strokeWidth="32" />
        <ellipse
          cx="355"
          cy="283"
          rx="183"
          ry="85"
          fill="none"
          stroke="#fff0cf"
          strokeWidth="2"
          strokeDasharray="10 14"
        />
        {[
          [170, 220],
          [210, 180],
          [485, 190],
          [560, 280],
          [500, 370],
          [205, 350],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M0 0v-35" stroke="#937b57" strokeWidth="8" />
            <path d="M-24-25 0-85 24-25Z" fill={i % 2 ? "#779f78" : "#8eaf81"} />
          </g>
        ))}
        {[
          [300, 220],
          [420, 295],
          [235, 285],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="m0 0 0-35 50-15 0 35Z" fill="#568779" />
            <path d="m50-50 30 15 0 35-30-15Z" fill="#729c88" />
            <path d="m-3-35 53-18 36 17-53 18Z" fill="#f4e7c8" />
          </g>
        ))}
        <g transform="translate(344 365)">
          <ellipse cx="0" cy="3" rx="29" ry="10" fill="#647a65" opacity=".2" />
          <path d="m-25-10 0-17 34-12 23 11 0 18-34 12Z" fill="#d8704a" />
          <path d="m-10-28 0-17 23-5 12 6 0 17Z" fill="#416561" />
          <path d="m-14-44 28-9 17 8-30 9Z" fill="#f5e7c5" />
          <circle cx="-15" cy="-3" r="8" fill="#304b43" />
          <circle cx="20" cy="-14" r="8" fill="#304b43" />
        </g>
      </svg>
    </div>
  );
}
