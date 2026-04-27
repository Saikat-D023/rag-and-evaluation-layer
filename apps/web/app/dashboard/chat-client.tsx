"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  
  const [activeSection, setActiveSection] = useState<"history" | "documents" | "settings" | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [documents, setDocuments] = useState<DocumentStat[]>([]);
  const [storage, setStorage] = useState({ percentage: 0, totalChunks: 0, maxChunks: 10000 });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchStorage = useCallback(async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("/api/storage");
      if (res.ok) setStorage(await res.json());
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Storage fetch failed", err.message);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      fetchStorage();
    }
  }, [userEmail, fetchStorage]);

  const fetchSessions = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) setSessions(await res.json());
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Sessions fetch failed", err.message);
    }
  };

  const fetchDocuments = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("/api/documents");
      if (res.ok) setDocuments(await res.json());
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Documents fetch failed", err.message);
    }
  };

  const loadSession = async (sessionId: string) => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
        setCurrentSessionId(sessionId);
        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Failed to load session messages", err.message);
    }
  };

  const toggleSection = (section: "history" | "documents" | "settings") => {
    if (!userEmail && (section === "history" || section === "documents")) {
      setShowAuthModal(true);
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
      setShowAuthModal(true);
      return;
    }
    setCurrentSessionId(null);
    setMessages([]);
    setActiveSection(null);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
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
        fetchStorage();
        if(activeSection === "documents") fetchDocuments();
      } else {
        throw new Error(payload.error || payload.message || "Failed to upload document");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error(err);
      alert(`Error uploading document: ${error.message ?? 'Unknown error'}`);
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
            const metadataStr = buffer.slice(9, splitPoint);
            try {
              const parsedMeta = JSON.parse(metadataStr);
              if (parsedMeta.sessionId && !currentSessionId) {
                 setCurrentSessionId(parsedMeta.sessionId);
              }
            } catch (error: unknown) {
              // Ignore metadata parsing errors
              void error;
            }

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
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: m.content + text } : m
            )
          );
        } else {
          if (!buffer.startsWith("metadata:")) {
            isMetadataParsed = true;
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
    <div className="flex h-screen w-full font-sans text-[#1A1A1A] overflow-hidden selection:bg-[#92B57A] selection:text-white relative">
      {/* MOBILE BACKDROP */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring" as const, stiffness: 100, damping: 20 }}
            className="fixed lg:relative z-50 lg:z-auto w-[260px] h-full shrink-0 border-r-2 border-[#1A1A1A] flex flex-col bg-white overflow-hidden"
          >
            <div className="bg-[#92B57A] border-b-2 border-[#1A1A1A] p-6 font-display font-black uppercase text-xl leading-none flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-[#1A1A1A]"></div>
              RAG EXPLORER
            </div>
            
            <nav className="flex-1 flex flex-col uppercase font-bold text-[10px] tracking-widest overflow-y-auto">
          <motion.button 
            whileHover={{ backgroundColor: "#1A1A1A", color: "#FFFFFF" }}
            whileTap={{ scale: 0.98 }}
            onClick={startNewSession}
            className="text-left border-b-2 border-[#1A1A1A] p-5 bg-[#D1D1F7] text-[#1A1A1A] transition-colors flex items-center justify-between group"
          >
            <span>New Chat</span>
            <motion.span 
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl leading-none"
            >+</motion.span>
          </motion.button>
          
          {/* HISTORY SECTION */}
          <button 
            onClick={() => toggleSection("history")}
            className={`text-left border-b-2 border-[#1A1A1A] p-5 transition-colors flex justify-between items-center ${activeSection === "history" ? "bg-[#F9F8F3]" : "hover:bg-[#F9F8F3]"}`}
          >
            History
            <motion.span 
              animate={{ rotate: activeSection === "history" ? 90 : 0 }}
              className="text-[10px]"
            >▶</motion.span>
          </button>
          <AnimatePresence>
            {activeSection === "history" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#F9F8F3] border-b-2 border-[#1A1A1A] p-2 flex flex-col max-h-[300px] overflow-y-auto gap-1"
              >
                {sessions.length === 0 ? (
                   <div className="p-4 text-[10px] opacity-50 text-center normal-case font-medium">No past sessions</div>
                ) : sessions.map(s => (
                  <motion.button 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={s.id}
                    onClick={() => loadSession(s.id)} 
                    className={`text-left p-3 text-[10px] normal-case truncate border-2 border-[#1A1A1A] transition-all ${currentSessionId === s.id ? "bg-[#92B57A] text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]" : "bg-white hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-0.5"}`}
                  >
                    {s.title}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* DOCUMENTS SECTION */}
          <button 
             onClick={() => toggleSection("documents")}
            className={`text-left border-b-2 border-[#1A1A1A] p-5 transition-colors flex justify-between items-center ${activeSection === "documents" ? "bg-[#F9F8F3]" : "hover:bg-[#F9F8F3]"}`}
          >
            Documents
            <motion.span 
              animate={{ rotate: activeSection === "documents" ? 90 : 0 }}
              className="text-[10px]"
            >▶</motion.span>
          </button>
          <AnimatePresence>
            {activeSection === "documents" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#F9F8F3] border-b-2 border-[#1A1A1A] p-2 flex flex-col max-h-[300px] overflow-y-auto gap-2"
              >
                {documents.length === 0 ? (
                   <div className="p-4 text-[10px] opacity-50 text-center normal-case font-medium">No documents indexed</div>
                ) : documents.map((doc, idx) => (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={idx} 
                    className="flex flex-col p-3 bg-white border-2 border-[#1A1A1A] text-[10px] normal-case shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                  >
                     <div className="font-bold truncate uppercase tracking-tighter">{doc.source}</div>
                     <div className="opacity-50 mt-1 font-black">{doc.chunkCount} internal chunks</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SETTINGS SECTION */}
          <button 
             onClick={() => toggleSection("settings")}
            className={`text-left border-b-2 border-[#1A1A1A] p-5 transition-colors flex justify-between items-center ${activeSection === "settings" ? "bg-[#F9F8F3]" : "hover:bg-[#F9F8F3]"}`}
          >
            Settings
            <motion.span 
              animate={{ rotate: activeSection === "settings" ? 90 : 0 }}
              className="text-[10px]"
            >▶</motion.span>
          </button>
          <AnimatePresence>
            {activeSection === "settings" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#F9F8F3] border-b-2 border-[#1A1A1A] p-4 flex flex-col text-[10px] normal-case gap-4"
              >
                 <div className="space-y-1">
                   <span className="font-black uppercase text-[8px] opacity-40 tracking-[0.2em]">LLM Engine</span>
                   <div className="font-bold">GPT-4o-mini</div>
                 </div>
                 <div className="space-y-1">
                   <span className="font-black uppercase text-[8px] opacity-40 tracking-[0.2em]">Embeddings</span>
                   <div className="font-bold">text-embedding-3-small</div>
                 </div>
                 <div className="space-y-1">
                   <span className="font-black uppercase text-[8px] opacity-40 tracking-[0.2em]">Chunk Size</span>
                   <div className="font-bold">500 characters</div>
                 </div>
                 <div className="space-y-1">
                   <span className="font-black uppercase text-[8px] opacity-40 tracking-[0.2em]">Search Strategy</span>
                   <div className="font-bold">Hybrid (BM25 + Vector)</div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <div className="p-6 border-t-2 border-[#1A1A1A] bg-white flex flex-col gap-4">
          <div className="text-[9px] font-black uppercase flex justify-between items-end tracking-widest">
            <span>Storage ({storage.totalChunks}/{storage.maxChunks})</span>
            <span className="text-[#92B57A]">{storage.percentage}%</span>
          </div>
          <div className="h-3 w-full border-2 border-[#1A1A1A] bg-[#F9F8F3] p-0.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${storage.percentage}%` }}
              className="h-full bg-[#92B57A]" 
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#1A1A1A", color: "#FFFFFF" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className={`w-full border-2 border-[#1A1A1A] p-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] ${userEmail ? "bg-white" : "bg-[#92B57A] text-white"}`}
          >
            {userEmail ? "Sign Out" : "Sign In"}
          </motion.button>
        </div>
      </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#F9F8F3] overflow-hidden">
        {/* Top bar */}
        <motion.div 
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          className="h-[80px] border-b-2 border-[#1A1A1A] flex items-center px-4 sm:px-8 justify-between shrink-0 bg-white z-10"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 border-2 border-[#1A1A1A] bg-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="hidden min-[500px]:flex bg-[#92B57A] border-2 border-[#1A1A1A] p-2.5 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line></svg>
            </motion.div>
            <div>
              <h2 className="font-display font-black uppercase text-2xl italic tracking-tighter">
                AI ASSISTANT <span className="text-[10px] not-italic opacity-30 ml-2 tracking-widest">{userEmail || "GUEST_MODE"}</span>
              </h2>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <div className="px-3 py-1 bg-[#D1D1F7] border border-[#1A1A1A] rounded-full text-[8px] font-black uppercase tracking-widest">v2.0_stable</div>
             <div className="w-3 h-3 rounded-full bg-[#92B57A] animate-pulse border border-[#1A1A1A]"></div>
          </div>
        </motion.div>

        {/* Chat thread */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-10 scroll-smooth"
        >
          {!userEmail ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 px-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display font-black text-2xl sm:text-5xl text-center uppercase max-w-xl tracking-tighter leading-none"
              >
                PLEASE <span className="text-[#92B57A]">SIGN IN</span> TO START EXPLORING YOUR DOCUMENTS
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="bg-[#D1D1F7] text-[#1A1A1A] border-2 border-[#1A1A1A] font-black uppercase py-4 sm:py-5 px-8 sm:px-10 text-xs sm:text-sm tracking-widest hover:bg-[#92B57A] hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] inline-block"
                >
                  Go to Login
                </Link>
              </motion.div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 pointer-events-none select-none px-4">
              <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="font-display font-black text-3xl sm:text-7xl text-center uppercase tracking-tighter leading-none"
              >
                ASK ANYTHING<br/>ABOUT YOUR DATA
              </motion.div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ y: 20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  layout
                  className={`w-full max-w-3xl flex flex-col ${
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div className="text-[8px] font-black uppercase mb-2 opacity-40 tracking-[0.3em] px-1">
                    {msg.role === "user" ? "LOCAL_USER" : "CORE_AI"}
                  </div>
                  {msg.role === "user" ? (
                    <div className="bg-[#92B57A] text-white border-2 border-[#1A1A1A] px-4 sm:px-6 py-3 sm:py-4 font-bold shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] text-sm sm:text-base">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] px-4 sm:px-6 py-4 sm:py-5 font-medium shadow-[6px_6px_0px_0px_rgba(209,209,247,1)] whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                        {msg.content || (msg.isStreaming ? (
                          <span className="flex items-center gap-2">
                            <motion.span 
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >{loadingLabel}</motion.span>
                          </span>
                        ) : "")}
                        {msg.isStreaming && (
                          <motion.span 
                            animate={{ opacity: [0, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                            className="inline-block ml-1 font-black text-[#92B57A]"
                          >
                            _
                          </motion.span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Bottom input bar */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="shrink-0 p-4 sm:p-10 bg-white border-t-2 border-[#1A1A1A] relative z-10"
        >
          <form
            onSubmit={handleSubmit}
            className="flex items-stretch gap-4 w-full max-w-5xl mx-auto"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#D1D1F7" }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                if (!userEmail) {
                  setShowAuthModal(true);
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={isUploading || isStreaming}
              className={`shrink-0 w-14 border-2 border-[#1A1A1A] flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] ${isUploading ? "bg-[#D1D1F7] animate-pulse" : "bg-white"}`}
              title="Add document"
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
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </motion.button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming || isUploading || !userEmail}
                className="w-full h-full bg-[#F9F8F3] border-2 border-[#1A1A1A] px-6 py-4 focus:outline-none focus:ring-0 font-bold placeholder:opacity-30 disabled:opacity-50 transition-all text-sm uppercase tracking-tight"
                placeholder={!userEmail ? "SYSTEM_LOCKED_PLEASE_LOGIN" : isUploading ? "UPLOADING_VECTORS..." : isStreaming ? "CORE_PROCESSING..." : "ENTER_QUERY_"}
              />
              <div className="absolute top-0 right-0 h-full flex items-center pr-4 pointer-events-none opacity-10">
                 <span className="font-black text-xs uppercase tracking-widest">CMD+ENTER</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, x: 2, y: 2, boxShadow: "0px 0px 0px 0px rgba(26,26,26,1)" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="shrink-0 w-14 bg-[#92B57A] border-2 border-[#1A1A1A] flex items-center justify-center text-white disabled:opacity-50 transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </motion.button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="text-[8px] font-black tracking-[0.3em] uppercase opacity-20">RAG_CORE_V2.0</div>
            <div className="text-[8px] font-black tracking-[0.3em] uppercase opacity-20">ENC_STORAGE_ENABLED</div>
            <div className="text-[8px] font-black tracking-[0.3em] uppercase opacity-20">MODEL_GPT_4O_MINI</div>
          </div>
        </motion.div>
      </div>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border-4 border-[#1A1A1A] p-8 sm:p-12 max-w-md w-full relative z-[101] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)]"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-2xl font-black hover:text-[#92B57A] transition-colors"
              >
                ×
              </button>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-[#D1D1F7] border-2 border-[#1A1A1A] mx-auto flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>
                </div>
                <h3 className="font-display font-black text-3xl uppercase tracking-tighter leading-none">
                  ACCESS <span className="text-[#92B57A]">RESTRICTED</span>
                </h3>
                <p className="font-bold text-sm uppercase tracking-widest opacity-60 leading-relaxed">
                  Please sign in to your account to access history, documents, and start new chat sessions.
                </p>
                <div className="pt-4 space-y-4">
                  <Link 
                    href="/login"
                    className="block w-full bg-[#1A1A1A] text-white font-black uppercase py-4 tracking-widest text-xs hover:bg-[#92B57A] transition-all shadow-[4px_4px_0px_0px_rgba(146,181,122,1)]"
                  >
                    Go to Login
                  </Link>
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="block w-full font-black uppercase py-2 tracking-widest text-[10px] opacity-40 hover:opacity-100 transition-all"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
