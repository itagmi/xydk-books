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

      <rect x="16" y="132" width="288" height="52" rx="14" fill="#B8895A" />
      <rect x="16" y="132" width="288" height="52" rx="14" fill="url(#deskShine)" />
      <rect x="28" y="140" width="264" height="4" rx="2" fill="#A6784A" opacity="0.35" />

      <rect
        x="118"
        y="88"
        width="84"
        height="52"
        rx="6"
        fill="#FFF8E8"
        stroke="#8B5A30"
        strokeWidth="2"
      />
      <rect x="126" y="96" width="68" height="4" rx="2" fill="#DDB882" />
      <rect x="126" y="106" width="52" height="3" rx="1.5" fill="#E8C89A" />
      <rect x="126" y="114" width="58" height="3" rx="1.5" fill="#E8C89A" />
      <rect x="126" y="122" width="44" height="3" rx="1.5" fill="#E8C89A" />

      <rect
        x="108"
        y="78"
        width="104"
        height="72"
        rx="12"
        stroke="#E8A800"
        strokeWidth="2"
        strokeDasharray="6 5"
        opacity="0.75"
      />

      <path
        d="M248 42 C228 58 214 72 198 88"
        stroke="#8B5A30"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.55"
      />
      <path d="M198 88 L206 84 L202 94 Z" fill="#8B5A30" opacity="0.55" />

      <circle cx="252" cy="34" r="22" fill="#FFF8E8" stroke="#8B5A30" strokeWidth="2" />
      <path
        d="M252 24 V44 M242 34 H262"
        stroke="#8B5A30"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        fill="#E8A800"
        opacity="0.35"
        transform="translate(34, 24) scale(0.08)"
        d="M510.498,203.255c-24.604-81.778-83.91-148.965-161.78-179.214c-4.509-1.745-6.396-2.274-6.396-2.274c-1.911-0.679-4.011-0.544-5.827,0.364c-1.809,0.908-3.166,2.519-3.766,4.453l-1.138,3.688l-23.32,75.675c-2.795,9.072-12.425,14.165-21.505,11.37c-9.084-2.795-14.177-12.428-11.378-21.508l21.962-71.269l1.705-5.543c0.636-2.061,0.344-4.296-0.801-6.128c-1.145-1.823-3.028-3.071-5.16-3.403c0,0,0.723,0.024-3.206-0.498c-11.066-1.46-22.369-2.218-33.889-2.218c-122.28,0-220.834,84.629-254.498,196.506c-5.958,19.803,7.332,27.336,13.514,28.726c99.797,22.392,181.07,92.461,217.558,184.52c8.002,31,11.129,66,10.726,140c4.213,0.205,8.441,0.323,12.701,0.323c4.26,0,8.488-0.118,12.7-0.323c-0.402,-70,2.724,-106,10.727,-140c36.487-92.058,117.756-162.127,217.561-184.52C503.17,230.591,516.459,223.058,510.498,203.255z"
      />
    </svg>
  );
}
