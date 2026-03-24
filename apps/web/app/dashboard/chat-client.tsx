"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { filename: string; chunkId: string }[];
  isStreaming?: boolean;
};

export default function ChatClient({ userEmail }: { userEmail: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    const assistantMsgId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMsg).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.body) throw new Error("No readable stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = "";
      let isMetadataParsed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        buffer += text;

        if (!isMetadataParsed && buffer.startsWith("metadata:")) {
          const splitPoint = buffer.indexOf("\n\n");
          if (splitPoint !== -1) {
            const metadataStr = buffer.slice("metadata:".length, splitPoint);
            let parsedSources = [];
            try {
              const citations = JSON.parse(metadataStr);
              parsedSources = citations.map((c: any) => ({
                filename: c.source || "Unknown",
                chunkId: c.id,
              }));
            } catch (err) {
              console.error("Failed to parse metadata", err);
            }

            const remainingText = buffer.slice(splitPoint + 2);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, sources: parsedSources, content: m.content + remainingText }
                  : m
              )
            );
            isMetadataParsed = true;
          }
        } else if (isMetadataParsed) {
          // Normal appending of stream tokens
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: m.content + text } : m
            )
          );
        } else {
          // Fallback if the stream started but doesn't have the metadata prefix
          if (!buffer.startsWith("metadata:")) {
            isMetadataParsed = true; // We bypass metadata scanning
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: m.content + text } : m
              )
            );
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: m.content + "\n[Connection Error]" }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      );
    }
  };

  const latestSource = messages
    .filter((m) => m.role === "assistant" && m.sources && m.sources.length > 0)
    .pop()?.sources?.[0]?.filename;

  return (
    <div className="flex h-screen w-full font-sans text-black overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-[220px] shrink-0 border-r-2 border-black flex flex-col bg-white">
        <div className="bg-[#E8FF00] border-b-2 border-black p-4 font-black uppercase text-xl leading-none">
          RAG EXPLORER
        </div>
        <div className="p-4 border-b-2 border-black">
          <Link
            href="/dashboard/documents"
            className="flex items-center justify-center gap-2 w-full bg-[#E8FF00] border-2 border-black p-3 font-bold text-sm uppercase hover:bg-black hover:text-[#E8FF00] transition-colors"
          >
            <span>NEW KB</span>
            <span className="text-lg leading-none">+</span>
          </Link>
        </div>
        <nav className="flex-1 flex flex-col uppercase font-bold text-sm">
          <button className="text-left border-b-2 border-black p-4 hover:bg-[#F5F0E8] transition-colors">
            History
          </button>
          <Link
            href="/dashboard/documents"
            className="text-left border-b-2 border-black p-4 hover:bg-[#F5F0E8] transition-colors"
          >
            Documents
          </Link>
          <div className="bg-black text-white p-4 border-b-2 border-black cursor-default">
            Active Session
          </div>
          <button className="text-left border-b-2 border-black p-4 hover:bg-[#F5F0E8] transition-colors">
            Settings
          </button>
        </nav>
        <div className="p-4 border-t-2 border-black bg-[#F5F0E8] flex flex-col gap-3">
          <div className="text-xs font-bold uppercase flex justify-between">
            <span>Storage</span>
            <span>45%</span>
          </div>
          <div className="h-2 w-full border-2 border-black bg-white">
            <div className="h-full bg-black w-[45%]" />
          </div>
          <button className="w-full bg-white border-2 border-black p-2 text-xs font-bold uppercase hover:bg-[#E8FF00] transition-colors">
            Upgrade Plan
          </button>
          <button
            onClick={handleSignOut}
            className="w-full bg-black text-white border-2 border-black p-2 text-xs font-bold uppercase hover:text-red-400 transition-colors mt-2"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#F5F0E8] overflow-hidden">
        {/* Top bar */}
        <div className="h-[60px] border-b-2 border-black flex items-center px-6 justify-between shrink-0 bg-white">
          <h2 className="font-black uppercase text-lg tracking-wide">
            AI Assistant
          </h2>
          {latestSource && (
            <div className="hidden sm:flex border-2 border-black bg-[#E8FF00] px-3 py-1 font-bold text-xs uppercase items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              Retrieving from: {latestSource}
            </div>
          )}
        </div>

        {/* Chat thread */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 pointer-events-none">
              <div className="font-black text-2xl sm:text-4xl text-center uppercase">
                Ask anything about your documents
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-3xl flex flex-col ${
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className="text-[10px] font-bold uppercase mb-1 opacity-60 tracking-widest px-1">
                  {msg.role === "user" ? "You" : "Assistant"}
                </div>
                {msg.role === "user" ? (
                  <div className="bg-[#E8FF00] text-black border-2 border-black px-5 py-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full max-w-full">
                    <div className="bg-white text-black border-2 border-black px-5 py-4 font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block animate-pulse ml-1 font-black">
                          |
                        </span>
                      )}
                    </div>
                    {/* Source Document Card */}
                    {msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-white border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <span className="text-xs font-bold uppercase truncate max-w-[150px]">
                              {src.filename}
                            </span>
                            <span className="text-[10px] bg-[#E8FF00] px-1 border border-black font-bold">
                              {src.chunkId}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom input bar */}
        <div className="shrink-0 p-4 sm:p-6 bg-white border-t-2 border-black relative z-10">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 w-full max-w-4xl mx-auto"
          >
            <button
              type="button"
              className="shrink-0 p-3 bg-[#F5F0E8] border-2 border-black hover:bg-[#E8FF00] transition-colors"
              title="Attach Document"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              className="flex-1 bg-white border-2 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#E8FF00] font-medium disabled:opacity-50 transition-all rounded-none"
              placeholder="Ask about your technical documents..."
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="shrink-0 bg-[#E8FF00] border-2 border-black p-3 hover:bg-black hover:text-[#E8FF00] disabled:opacity-50 transition-colors focus:outline-none focus:ring-4 focus:ring-black"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </form>
          <div className="mt-4 text-center text-[10px] font-bold tracking-widest uppercase opacity-60">
            RAG Augmented • Encrypted Storage • GPT-4o-mini
          </div>
        </div>
      </div>
    </div>
  );
}
