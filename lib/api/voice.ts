function toBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

export async function synthesizeVoice(text: string, voiceId?: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const selectedVoice = voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID;

  if (!apiKey || !selectedVoice) return null;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(selectedVoice)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    }
  );

  if (!response.ok) return null;

  const audioBuffer = await response.arrayBuffer();
  const base64 = toBase64(audioBuffer);
  return `data:audio/mpeg;base64,${base64}`;
}
