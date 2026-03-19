"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getStoredApiKey } from "@/lib/api";
import { copyToClipboard } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Copy, Check, Eye, EyeOff, Key, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function maskKey(key: string): string {
  if (!key || key.length < 10) return "••••••••••••••••••";
  return key.slice(0, 7) + "••••••••••••" + key.slice(-4);
}

export default function KeysPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setApiKey(getStoredApiKey());
  }, []);

  const handleCopy = async () => {
    if (!apiKey) return;
    await copyToClipboard(apiKey);
    setCopied(true);
    toast.success("API key copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          API Keys
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your PromptDiff API credentials
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-6">
        {/* Key display */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Your API Key
            </label>
            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
              Active
            </Badge>
          </div>

          {apiKey ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={revealed ? apiKey : maskKey(apiKey)}
                  readOnly
                  className="font-mono text-sm pr-10 bg-muted/30 border-border"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevealed(!revealed)}
                className="gap-1.5 h-10"
              >
                {revealed ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {revealed ? "Hide" : "Reveal"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 h-10"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              No API key found. Please sign in again.
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Keep this key secret. It provides full access to your PromptDiff
            account.
          </p>
        </div>

        <Separator />

        {/* Usage hint */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">
            Usage example
          </p>
          <div className="bg-[#1a1a2e] rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-white/80 whitespace-pre">
              {`curl -X POST https://promptdiff.bizmarq.com/api/v1/compare \\
  -H "Authorization: Bearer ${revealed && apiKey ? apiKey : "pd_your_api_key"}" \\
  -d '{"prompt": "...", "models": ["gpt-4o"]}'`}
            </pre>
          </div>
        </div>

        <Separator />

        {/* Regenerate (placeholder) */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground mb-0.5">
                Regenerate API key
              </p>
              <p className="text-xs text-muted-foreground">
                Regenerating will invalidate your current key immediately.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Key regeneration coming soon")}
              className="gap-1.5 text-muted-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 mb-0.5">
            Security reminder
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Never commit your API key to version control. Use environment
            variables (e.g., <code className="font-mono">PROMPTDIFF_API_KEY</code>) in your
            applications.
          </p>
        </div>
      </div>
    </div>
  );
}
