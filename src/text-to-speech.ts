const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY ?? "";
const ELEVEN_LABS_API_URI = "https://api.elevenlabs.io/v1";
const MODEL_ID = "eleven_multilingual_v2";
const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam

export async function tts(text: string) {
  const response = await fetch(
    `${ELEVEN_LABS_API_URI}/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Xi-Api-Key": ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        model_id: MODEL_ID,
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.6,
          style: 0.8,
          use_speaker_boost: true,
        },
      }),
    }
  );

  console.log("Generated speech for this text:\n\n\n", text);

  return response;
}
