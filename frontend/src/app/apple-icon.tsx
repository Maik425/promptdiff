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
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 14,
          padding: "0 34px 34px 34px",
        }}
      >
        {/* 3 columns - model comparison bars */}
        <div style={{ width: 26, height: 60, background: "rgba(255,255,255,0.5)", borderRadius: 8 }} />
        <div style={{ width: 26, height: 95, background: "rgba(255,255,255,0.85)", borderRadius: 8 }} />
        <div style={{ width: 26, height: 74, background: "rgba(255,255,255,0.65)", borderRadius: 8 }} />
      </div>
    ),
    { ...size }
  );
}
