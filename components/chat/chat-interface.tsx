"use client";

import { useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Send, Paperclip, X, FileText, Loader2 } from "lucide-react";
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

// Highlight redacted PII tokens
function RedactedText({ text }: { text: string }) {
  const parts = text.split(/(\[[A-Z_]+_REDACTED\])/g);
  
  return (
    <>
      {parts.map((part, i) =>
        part.match(/\[[A-Z_]+_REDACTED\]/) ? (
          <span
            key={i}
            className="text-cyan-400 font-medium"
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

// Message bubble - minimalist design
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const hasRedacted = message.content.includes("_REDACTED]");

  if (!isUser) {
    // Assistant message - no bubble, just text
    return (
      <div className="flex justify-start py-4">
        <div className="max-w-[85%]">
          {hasRedacted ? (
            <RedactedText text={message.content} />
          ) : (
            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}
        </div>
      </div>
    );
  }

  // User message - rounded bubble
  return (
    <div className="flex justify-end py-2">
      <div className="max-w-[80%] bg-zinc-800 rounded-3xl rounded-br-lg px-4 py-3">
        {hasRedacted ? (
          <RedactedText text={message.content} />
        ) : (
          <p className="text-white whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  );
}

// File chip component
function FileChip({ file, onRemove }: { file: FileAttachment; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 bg-zinc-800/80 rounded-lg px-3 py-1.5 text-sm">
      {file.status === "processing" ? (
        <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
      ) : file.status === "error" ? (
        <FileText className="h-4 w-4 text-red-400" />
      ) : (
        <FileText className="h-4 w-4 text-green-400" />
      )}
      <span className="text-zinc-300 max-w-[150px] truncate">{file.name}</span>
      {file.status === "ready" && (
        <span className="text-green-400 text-xs">✓</span>
      )}
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

// Typing indicator
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-4">
      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header - Minimal */}
      <header className="flex items-center justify-end px-4 py-3">
        <button
          type="button"
          onClick={onToggleSafeMode}
          className="flex items-center gap-2 text-sm"
        >
          <span className={isSafeMode ? "text-cyan-400" : "text-zinc-500"}>
            Safe
          </span>
          <div
            className={`relative w-10 h-5 rounded-full transition-colors ${
              isSafeMode ? "bg-cyan-500" : "bg-zinc-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                isSafeMode ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <p className="text-zinc-400 text-lg mb-2">What can I help you with?</p>
                <p className="text-zinc-600 text-sm">Your data is protected by SafePipe</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <TypingDots />}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Rounded, centered */}
      <div className="px-4 md:px-8 lg:px-16 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((file) => (
                <FileChip key={file.id} file={file} onRemove={() => onRemoveFile(file.id)} />
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.csv,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={onInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message SafePipe..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none py-2"
              />

              <button
                type="submit"
                disabled={isLoading || (!input.trim() && files.length === 0)}
                className="p-2 rounded-full bg-zinc-700 text-white hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {isSafeMode && (
              <p className="text-center text-[10px] text-zinc-600 mt-2">
                PII is automatically redacted before sending to AI
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
