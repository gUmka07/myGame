import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from("scores")
      .select("username, score")
      .order("score", { ascending: false })
      .limit(10);

    if (error) throw error;

    res.status(200).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}
