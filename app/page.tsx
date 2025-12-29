"use client";

import { useSecureChat } from "@/lib/hooks/use-secure-chat";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  const {
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
  } = useSecureChat();

  return (
    <main className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto h-[calc(100vh-4rem)]">
        <ChatInterface
          messages={messages}
          input={input}
          isLoading={isLoading}
          isSafeMode={isSafeMode}
          files={files}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onToggleSafeMode={toggleSafeMode}
          onFileUpload={handleFileUpload}
          onRemoveFile={removeFile}
        />
      </div>
    </main>
  );
}

