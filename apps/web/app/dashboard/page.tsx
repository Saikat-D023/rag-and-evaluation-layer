import { createClient } from "@/utils/supabase/server";
import ChatClient from "./chat-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="h-screen w-full bg-[#F2F4EC] overflow-hidden text-black font-sans">
      <ChatClient userEmail={user?.email || null} />
    </main>
  );
}
