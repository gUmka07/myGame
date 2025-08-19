import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    const { userId, username, score } = JSON.parse(req.body);

    if (!userId || !username || typeof score !== "number") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Вставляем или обновляем рекорд
    const { error } = await supabase
      .from("scores")
      .upsert({ userId, username, score }, { onConflict: ["userId"] });

    if (error) throw error;

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save score" });
  }
}
