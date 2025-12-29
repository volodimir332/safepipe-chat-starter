"use client";

import { useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Send, Paperclip, Shield, ShieldOff, X, FileText, Loader2 } from "lucide-react";
import type { Message } from "ai/react";

interface FileAttachment {
  id: string;
  name: string;
  content: string;
  status: "pending" | "processing" | "ready" | "error";
}

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  isSafeMode: boolean;
  files: FileAttachment[];
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onToggleSafeMode: () => void;
  onFileUpload: (file: File) => Promise<void>;
  onRemoveFile: (id: string) => void;
}

function RedactedText({ text }: { text: string }) {
  const parts = text.split(/(\[[A-Z_]+_REDACTED\])/g);
  
  return (
    <>
      {parts.map((part, i) =>
        part.match(/\[[A-Z_]+_REDACTED\]/) ? (
          <span
            key={i}
            className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono text-xs"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const hasRedacted = message.content.includes("_REDACTED]");

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-zinc-800 text-zinc-100 border border-zinc-700"
        }`}
      >
        {hasRedacted ? (
          <RedactedText text={message.content} />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  );
}

function FileChip({ file, onRemove }: { file: FileAttachment; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm">
      {file.status === "processing" ? (
        <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      ) : file.status === "error" ? (
        <FileText className="h-4 w-4 text-red-400" />
      ) : (
        <FileText className="h-4 w-4 text-emerald-400" />
      )}
      <span className="text-zinc-300 max-w-[150px] truncate">{file.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ChatInterface({
  messages,
  input,
  isLoading,
  isSafeMode,
  files,
  onInputChange,
  onSubmit,
  onToggleSafeMode,
  onFileUpload,
  onRemoveFile,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">SafePipe Chat</h1>
            <p className="text-xs text-zinc-500">Enterprise AI Assistant</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSafeMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isSafeMode
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}
        >
          {isSafeMode ? (
            <>
              <Shield className="h-3.5 w-3.5" />
              Protected
            </>
          ) : (
            <>
              <ShieldOff className="h-3.5 w-3.5" />
              Unprotected
            </>
          )}
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 text-sm">Start a secure conversation</p>
              <p className="text-zinc-600 text-xs mt-1">Your data is protected by SafePipe</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3">
              <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4 bg-zinc-900/30">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((file) => (
              <FileChip key={file.id} file={file} onRemove={() => onRemoveFile(file.id)} />
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />

          <button
            type="submit"
            disabled={isLoading || (!input.trim() && files.length === 0)}
            className="shrink-0 p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        <p className="text-center text-[10px] text-zinc-600 mt-3">
          {isSafeMode ? "🛡️ PII is automatically redacted before sending" : "⚠️ Data sent without protection"}
        </p>
      </div>
    </div>
  );
}

