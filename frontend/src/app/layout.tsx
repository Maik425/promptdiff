import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PromptDiff — Compare LLM Outputs Across Models",
    template: "%s | PromptDiff",
  },
  description:
    "Compare LLM outputs across models with one API call. Get structured comparisons of output, latency, cost, and tokens. Supports Claude, GPT, Gemini, Grok.",
  keywords: ["LLM", "AI", "comparison", "GPT", "Claude", "Gemini", "Grok", "API", "benchmark", "prompt testing"],
  openGraph: {
    title: "PromptDiff — Compare LLM Outputs Across Models",
    description:
      "One API call. All models. Instant comparison of output, latency, cost, and tokens. Free 100 evals/month.",
    type: "website",
    url: "https://promptdiff.bizmarq.com",
    siteName: "PromptDiff",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptDiff — Compare LLM Outputs Across Models",
    description: "One API call. All models. Instant comparison.",
    creator: "@maiki_ships",
  },
  metadataBase: new URL("https://promptdiff.bizmarq.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
