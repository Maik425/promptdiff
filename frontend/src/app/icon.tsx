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
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 3,
          padding: "0 6px 6px 6px",
        }}
      >
        {/* 3 columns representing model comparison - different heights */}
        <div style={{ width: 5, height: 12, background: "rgba(255,255,255,0.5)", borderRadius: 2 }} />
        <div style={{ width: 5, height: 18, background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
        <div style={{ width: 5, height: 14, background: "rgba(255,255,255,0.65)", borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  );
}
