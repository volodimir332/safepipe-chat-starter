"use client";

import { useChat, type Message } from "ai/react";
import { useState, useCallback, useRef } from "react";

interface FileAttachment {
  id: string;
  name: string;
  content: string;
  status: "pending" | "processing" | "ready" | "error";
}

interface SecureChatConfig {
  apiEndpoint?: string;
  extractEndpoint?: string;
}

interface SecureChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  isSafeMode: boolean;
  files: FileAttachment[];
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  toggleSafeMode: () => void;
  handleFileUpload: (file: File) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

const DEFAULT_CONFIG: SecureChatConfig = {
  apiEndpoint: "/api/chat",
  extractEndpoint: "/api/extract",
};

export function useSecureChat(config: SecureChatConfig = {}): SecureChatReturn {
  const { apiEndpoint, extractEndpoint } = { ...DEFAULT_CONFIG, ...config };
  
  const [isSafeMode, setIsSafeMode] = useState(true);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const fileIdRef = useRef(0);

  const {
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    append,
  } = useChat({
    api: apiEndpoint,
    body: { safeMode: isSafeMode },
  });

  const toggleSafeMode = useCallback(() => {
    setIsSafeMode((prev) => !prev);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    const id = `file-${++fileIdRef.current}`;
    
    setFiles((prev) => [
      ...prev,
      { id, name: file.name, content: "", status: "processing" },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(extractEndpoint!, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to extract file");
      }

      const data = await response.json();
      
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, content: data.text, status: "ready" }
            : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: "error" }
            : f
        )
      );
      console.error("File extraction failed:", error);
    }
  }, [extractEndpoint]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      const readyFiles = files.filter((f) => f.status === "ready");
      
      if (readyFiles.length > 0) {
        const fileContext = readyFiles
          .map((f) => `[Document: ${f.name}]\n${f.content}`)
          .join("\n\n");
        
        append({
          role: "user",
          content: `${fileContext}\n\n${input}`,
        });
        
        clearFiles();
      } else {
        originalHandleSubmit(e);
      }
    },
    [files, input, append, clearFiles, originalHandleSubmit]
  );

  return {
    messages,
    input,
    isLoading,
    isSafeMode,
    files,
    handleInputChange,
    handleSubmit,
    toggleSafeMode,
    handleFileUpload,
    removeFile,
    clearFiles,
  };
}

