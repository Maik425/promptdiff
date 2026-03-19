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
    "Compare LLM outputs across models with one API call. Get structured comparisons of output, latency, cost, and tokens per model.",
  keywords: ["LLM", "AI", "comparison", "GPT", "Claude", "API", "benchmark"],
  openGraph: {
    title: "PromptDiff — Compare LLM Outputs Across Models",
    description:
      "Compare LLM outputs across models with one API call. Structured comparisons of output, latency, cost, and tokens.",
    type: "website",
    url: "https://promptdiff.bizmarq.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptDiff — Compare LLM Outputs Across Models",
    description: "Compare LLM outputs across models with one API call.",
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
