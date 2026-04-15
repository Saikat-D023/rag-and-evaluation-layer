import { createClient } from "@/utils/supabase/server";
import LandingClient from "./LandingClient";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingClient user={user} />;
}
