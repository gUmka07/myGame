import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { userId } = JSON.parse(req.body);

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Проверяем подписку на канал
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember?chat_id=${process.env.TELEGRAM_CHANNEL_ID}&user_id=${userId}`;
    const tgResp = await fetch(url);
    const data = await tgResp.json();

    if (data.ok && ["member", "administrator", "creator"].includes(data.result.status)) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(403).json({ ok: false, error: "Not a subscriber" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}
