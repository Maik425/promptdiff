import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #7c6aef, #5b4dc7)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none">
          <path d="M12 3 L22 20 L2 20 Z" stroke="white" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
          <line x1="6" y1="15" x2="18" y2="15" stroke="white" strokeWidth="1.2" opacity="0.5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
