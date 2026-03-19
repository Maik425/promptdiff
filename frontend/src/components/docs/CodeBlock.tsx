"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "bash", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] border-b border-white/8">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-xs font-mono text-white/50">{filename}</span>
          )}
          {!filename && (
            <span className="text-xs text-white/40 uppercase">{language}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-white/40 hover:text-white hover:bg-white/10"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
      {/* Code */}
      <div className="bg-[#0f0f1a] p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-white/85 leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
