import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PromptDiff — Compare LLM Outputs Across Models";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 100px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: "#7c6aef",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              PD
            </span>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            PromptDiff
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            color: "white",
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: "-0.02em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ display: "flex" }}>Compare LLM outputs</span>
          <span style={{ display: "flex" }}>across models.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 30,
            fontWeight: 400,
            marginBottom: 56,
            display: "flex",
          }}
        >
          One API call. Instant comparison of output, latency, cost, and tokens.
        </div>

        {/* Provider badges */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {[
            { label: "Anthropic", dot: "#c97b4b" },
            { label: "OpenAI", dot: "#10a37f" },
            { label: "Google", dot: "#4285f4" },
            { label: "Grok", dot: "#9333ea" },
          ].map((provider) => (
            <div
              key={provider.label}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: "10px 20px",
                color: "rgba(255,255,255,0.85)",
                fontSize: 20,
                fontWeight: 600,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: provider.dot,
                  display: "flex",
                }}
              />
              <span style={{ display: "flex" }}>{provider.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: "0.02em",
            display: "flex",
          }}
        >
          promptdiff.bizmarq.com
        </div>
      </div>
    ),
    { ...size }
  );
}
