import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #7c6aef, #5b4dc7)",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Delta triangle - diff/change symbol */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 3 L22 20 L2 20 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" opacity="0.9" />
          <line x1="6" y1="15" x2="18" y2="15" stroke="white" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
