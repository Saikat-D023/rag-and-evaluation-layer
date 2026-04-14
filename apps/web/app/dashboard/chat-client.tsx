"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

type Session = {
  id: string;
  title: string;
  updatedAt: string;
};

type DocumentStat = {
  source: string;
  chunkCount: number;
};

const STREAMING_STAGES = [
  "Thinking...",
  "Generating report...",
  "Finalizing response...",
];

export default function ChatClient({ userEmail }: { userEmail: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState(STREAMING_STAGES[0]);
  
  // Sidebar State
  const [activeSection, setActiveSection] = useState<"history" | "documents" | "settings" | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [documents, setDocuments] = useState<DocumentStat[]>([]);
  const [storage, setStorage] = useState({ percentage: 0, totalChunks: 0, maxChunks: 10000 });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (userEmail) {
      fetchStorage();
    }
  }, [userEmail]);

  const fetchStorage = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("/api/storage");
      if (res.ok) setStorage(await res.json());
    } catch (e) { console.error("Storage fetch failed", e); }
  };

  const fetchSessions = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) setSessions(await res.json());
    } catch (e) { console.error("Sessions fetch failed", e); }
  };

  const fetchDocuments = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("/api/documents");
      if (res.ok) setDocuments(await res.json());
    } catch (e) { console.error("Documents fetch failed", e); }
  };

  const loadSession = async (sessionId: string) => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
        setCurrentSessionId(sessionId);
      }
    } catch(e) { console.error("Failed to load session messages", e); }
  };

  const toggleSection = (section: "history" | "documents" | "settings") => {
    if (!userEmail && (section === "history" || section === "documents")) {
      alert("Please login to see your history and documents.");
      return;
    }
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      if (section === "history") fetchSessions();
      if (section === "documents") fetchDocuments();
    }
  };

  const startNewSession = () => {
    if (!userEmail) {
      alert("Please login to start a new chat.");
      return;
    }
    setCurrentSessionId(null);
    setMessages([]);
    setActiveSection(null);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!isStreaming) {
      setLoadingLabel(STREAMING_STAGES[0]);
      return;
    }

    setLoadingLabel(STREAMING_STAGES[0]);

    const thinkingTimer = window.setTimeout(() => {
      setLoadingLabel(STREAMING_STAGES[1]);
    }, 5000);

    const finalizingTimer = window.setTimeout(() => {
      setLoadingLabel(STREAMING_STAGES[2]);
    }, 10000);

    return () => {
      window.clearTimeout(thinkingTimer);
      window.clearTimeout(finalizingTimer);
    };
  }, [isStreaming]);

  const handleSignOut = async () => {
    if (userEmail) {
      await supabase.auth.signOut();
      router.push("/login");
    } else {
      router.push("/login");
    }
  };

  const parseResponsePayload = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    const text = await res.text();
    return { error: text || `Request failed with status ${res.status}` };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const payload = await parseResponsePayload(res);

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Document added successfully: ${file.name}`,
          },
        ]);
        fetchStorage(); // Refresh storage indicator
        if(activeSection === "documents") fetchDocuments(); // Refresh if open
      } else {
        throw new Error(payload.error || payload.message || "Failed to upload document");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error uploading document: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
          sessionId: currentSessionId,
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
            const metadataStr = buffer.slice(9, splitPoint); // Extract json
            try {
              const parsedMeta = JSON.parse(metadataStr);
              if (parsedMeta.sessionId && !currentSessionId) {
                 setCurrentSessionId(parsedMeta.sessionId);
              }
            } catch(e) {}

            const remainingText = buffer.slice(splitPoint + 2);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: m.content + remainingText }
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

  return (
    <div className="flex h-screen w-full font-sans text-black overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-[260px] shrink-0 border-r-2 border-black flex flex-col bg-white overflow-y-auto">
        <div className="bg-[#7AB547] border-b-2 border-black p-4 font-black uppercase text-xl leading-none">
          RAG EXPLORER
        </div>
        
        <nav className="flex-1 flex flex-col uppercase font-bold text-sm">
          <button 
            onClick={startNewSession}
            className="text-left border-b-2 border-black p-4 bg-[#B88A60] text-black hover:bg-gray-900 transition-colors flex items-center justify-between"
          >
            <span>New Chat</span>
            <span className="text-xl leading-none">+</span>
          </button>
          
          {/* HISTORY SECTION */}
          <button 
            onClick={() => toggleSection("history")}
            className={`text-left border-b-2 border-black p-4 transition-colors flex justify-between items-center ${activeSection === "history" ? "bg-[#F2F4EC]" : "hover:bg-gray-50"}`}
          >
            History
            <span className="text-xs">{activeSection === "history" ? "▼" : "▶"}</span>
          </button>
          {activeSection === "history" && (
            <div className="bg-[#F2F4EC] border-b-2 border-black p-2 flex flex-col max-h-[250px] overflow-y-auto">
              {sessions.length === 0 ? (
                 <div className="p-2 text-xs opacity-50 text-center normal-case">No past sessions</div>
              ) : sessions.map(s => (
                <button 
                  key={s.id}
                  onClick={() => loadSession(s.id)} 
                  className={`text-left p-2 text-xs normal-case truncate border-2 border-transparent hover:border-black ${currentSessionId === s.id ? "bg-[#7AB547] font-black border-black" : "font-medium"}`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {/* DOCUMENTS SECTION */}
          <button 
             onClick={() => toggleSection("documents")}
            className={`text-left border-b-2 border-black p-4 transition-colors flex justify-between items-center ${activeSection === "documents" ? "bg-[#F2F4EC]" : "hover:bg-gray-50"}`}
          >
            Documents
            <span className="text-xs">{activeSection === "documents" ? "▼" : "▶"}</span>
          </button>
          {activeSection === "documents" && (
            <div className="bg-[#F2F4EC] border-b-2 border-black p-2 flex flex-col max-h-[250px] overflow-y-auto gap-1">
              {documents.length === 0 ? (
                 <div className="p-2 text-xs opacity-50 text-center normal-case">No documents indexed</div>
              ) : documents.map((doc, idx) => (
                <div key={idx} className="flex flex-col p-2 bg-white border-2 border-black text-xs normal-case shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                   <div className="font-bold truncate">{doc.source}</div>
                   <div className="text-[10px] opacity-70 mt-1">{doc.chunkCount} internal chunks</div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS SECTION */}
          <button 
             onClick={() => toggleSection("settings")}
            className={`text-left border-b-2 border-black p-4 transition-colors flex justify-between items-center ${activeSection === "settings" ? "bg-[#F2F4EC]" : "hover:bg-gray-50"}`}
          >
            Settings
            <span className="text-xs">{activeSection === "settings" ? "▼" : "▶"}</span>
          </button>
          {activeSection === "settings" && (
            <div className="bg-[#F2F4EC] border-b-2 border-black p-4 flex flex-col text-xs normal-case gap-2">
               <div><span className="font-bold uppercase text-[10px] opacity-70">LLM Engine</span><br/>GPT-4o-mini</div>
               <div><span className="font-bold uppercase text-[10px] opacity-70">Embeddings</span><br/>text-embedding-3-small</div>
               <div><span className="font-bold uppercase text-[10px] opacity-70">Chunk Size</span><br/>500 characters</div>
               <div><span className="font-bold uppercase text-[10px] opacity-70">Search Strategy</span><br/>Hybrid (BM25 + Vector)</div>
               <div><span className="font-bold uppercase text-[10px] opacity-70">Threshold</span><br/>0.3 (Vector Match)</div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t-2 border-black bg-white flex flex-col gap-3">
          <div className="text-[10px] font-bold uppercase flex justify-between items-end">
            <span>Storage ({storage.totalChunks}/{storage.maxChunks})</span>
            <span>{storage.percentage}%</span>
          </div>
          <div className="h-2 w-full border-2 border-black bg-[#F2F4EC]">
            <div className="h-full bg-[#7AB547]" style={{ width: `${storage.percentage}%` }} />
          </div>
          <button
            onClick={handleSignOut}
            className={`w-full ${userEmail ? "bg-black text-white hover:text-red-400" : "bg-[#7AB547] text-black hover:bg-[#B88A60]"} border-2 border-black p-2 text-xs font-bold uppercase transition-colors mt-2`}
          >
            {userEmail ? "Sign Out" : "Sign In"}
          </button>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#F2F4EC] overflow-hidden">
        {/* Top bar */}
        <div className="h-[80px] border-b-2 border-black flex items-center px-6 justify-between shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-[#7AB547] border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line></svg>
            </div>
            <div>
              <h2 className="font-black uppercase text-2xl italic tracking-tight">
                AI ASSISTANT {userEmail ? `• ${userEmail}` : ""}
              </h2>
            </div>
          </div>
        </div>

        {/* Chat thread */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth"
        >
          {!userEmail ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="font-black text-2xl sm:text-4xl text-center uppercase max-w-lg">
                PLEASE SIGN IN TO START EXPLORING YOUR DOCUMENTS
              </div>
              <Link
                href="/login"
                className="bg-[#B88A60] text-black border-2 border-black font-bold uppercase p-4 text-lg hover:bg-gray-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Go to Login
              </Link>
            </div>
          ) : messages.length === 0 ? (
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
                  <div className="bg-[#7AB547] text-black border-2 border-black px-5 py-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full max-w-full">
                    <div className="bg-white text-black border-2 border-black px-5 py-4 font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-pre-wrap leading-relaxed">
                      {msg.content || (msg.isStreaming ? loadingLabel : "")}
                      {msg.isStreaming && (
                        <span className="inline-block animate-pulse ml-1 font-black">
                          |
                        </span>
                      )}
                    </div>
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => {
                if (!userEmail) {
                  alert("Please login to upload documents.");
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={isUploading || isStreaming}
              className={`shrink-0 p-3 border-2 border-black transition-colors ${isUploading ? "bg-gray-300 animate-pulse" : "bg-[#F2F4EC] hover:bg-[#7AB547]"}`}
              title="Add document"
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
              disabled={isStreaming || isUploading || !userEmail}
              className="flex-1 bg-white border-2 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#7AB547] font-medium disabled:opacity-50 transition-all rounded-none"
              placeholder={!userEmail ? "Sign in to chat..." : isUploading ? "Uploading document..." : isStreaming ? "Assistant is working..." : "Ask your question..."}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="shrink-0 bg-[#7AB547] border-2 border-black p-3 hover:bg-[#B88A60] hover:text-black disabled:opacity-50 transition-colors focus:outline-none focus:ring-4 focus:ring-black"
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
