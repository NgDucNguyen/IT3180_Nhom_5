export interface EladeLogoProps {
  size?: "sm" | "md";
  suffix?: string;
  className?: string;
}

/**
 * EladeLogo — Biểu tượng thương hiệu Elade (Electronic/Electric + Trade).
 * Kết hợp tia sét điện tử (Electric) ở trung tâm cùng cặp mũi tên trao đổi đối xứng (Trade).
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function EladeLogo({
  size = "md",
  suffix,
  className = "",
}: EladeLogoProps) {
  const iconBoxClass = size === "sm" ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl";
  const svgClass = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const textClass = size === "sm" ? "text-base" : "text-lg";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <span
        className={`relative flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-sm ring-1 ring-white/15 transition-transform group-hover:scale-105 ${iconBoxClass}`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={svgClass}
          aria-hidden="true"
        >
          {/* Vòng mũi tên trao đổi trên (Trade - hướng sang phải) */}
          <path
            d="M7.5 13.5C8.9 9.2 12.9 6.5 17.4 6.8C20.2 7 22.7 8.4 24.3 10.6"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M24.8 6.8V11.1H20.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vòng mũi tên trao đổi dưới (Trade - hướng sang trái) */}
          <path
            d="M24.5 18.5C23.1 22.8 19.1 25.5 14.6 25.2C11.8 25 9.3 23.6 7.7 21.4"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M7.2 25.2V20.9H11.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Tia sét điện tử ở tâm (Electric / Electronic) */}
          <path
            d="M17.2 9.5L12.6 16.4H16.2L14.8 22.5L19.4 15.6H15.8L17.2 9.5Z"
            fill="#FDE047"
            stroke="#FEF08A"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className={`font-extrabold tracking-tight text-white ${textClass}`}>
        El
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          ade
        </span>
        {suffix ? (
          <span className="ml-1 font-bold text-slate-200">{suffix}</span>
        ) : null}
      </span>
    </span>
  );
}
