import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profileRecord = await db.query.profiles.findFirst({
            where: eq(profiles.id, user.id)
        });

        return NextResponse.json({ apiKey: profileRecord?.openaiApiKey || null });
    } catch (error) {
        console.error("[GET /api/user/key error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { apiKey } = body;

        if (typeof apiKey !== 'string') {
            return NextResponse.json({ error: "Invalid API Key format" }, { status: 400 });
        }

        await db.update(profiles)
            .set({ openaiApiKey: apiKey })
            .where(eq(profiles.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[POST /api/user/key error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
