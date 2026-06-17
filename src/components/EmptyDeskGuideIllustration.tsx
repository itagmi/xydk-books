export function EmptyDeskGuideIllustration() {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-auto w-full max-w-[280px]"
    >
      <defs>
        <linearGradient
          id="deskShine"
          x1="16"
          y1="132"
          x2="304"
          y2="184"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF8E8" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FFF8E8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 책상 */}
      <rect x="16" y="132" width="288" height="52" rx="14" fill="#B8895A" />
      <rect x="16" y="132" width="288" height="52" rx="14" fill="url(#deskShine)" />
      <rect x="28" y="140" width="264" height="4" rx="2" fill="#A6784A" opacity="0.35" />

      {/* 문서 (더 연하게) */}
      <rect
        x="118"
        y="88"
        width="84"
        height="52"
        rx="6"
        fill="#FFF8E8"
        stroke="#C8986A"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <rect x="126" y="96" width="68" height="4" rx="2" fill="#DDB882" opacity="0.5" />
      <rect x="126" y="106" width="52" height="3" rx="1.5" fill="#E8C89A" opacity="0.5" />
      <rect x="126" y="114" width="58" height="3" rx="1.5" fill="#E8C89A" opacity="0.5" />
      <rect x="126" y="122" width="44" height="3" rx="1.5" fill="#E8C89A" opacity="0.5" />

      {/* 점선 박스 */}
      <rect
        x="108"
        y="78"
        width="104"
        height="72"
        rx="12"
        stroke="#E8A800"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        opacity="0.4"
      />

      {/* 화살표 */}
      <path
        d="M248 42 C228 58 214 72 198 88"
        stroke="#C8986A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.35"
      />
      <path d="M198 88 L206 84 L202 94 Z" fill="#C8986A" opacity="0.35" />

      {/* + 버튼 (더 연하게) */}
      <circle cx="252" cy="34" r="22" fill="#FFF8E8" stroke="#C8986A" strokeWidth="1.5" opacity="0.55" />
      <path
        d="M252 24 V44 M242 34 H262"
        stroke="#C8986A"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
