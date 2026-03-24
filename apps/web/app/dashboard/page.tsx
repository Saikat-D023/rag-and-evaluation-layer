import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ChatClient from "./chat-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware handles this, but adding standard fallback as requested
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="h-screen w-full bg-[#F5F0E8] overflow-hidden text-black font-sans">
      <ChatClient userEmail={user.email || "Unknown"} />
    </main>
  );
}
