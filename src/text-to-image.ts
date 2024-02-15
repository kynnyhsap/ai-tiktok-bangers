import { $ } from "bun";

const HEIGHT = 1344;
const WIDTH = 768;
const SEED = 0;
const STEPS = 40;

const engineId = "stable-diffusion-xl-1024-v1-0"; // 'stable-diffusion-v1-6'

export async function textToImage(
  prompt: string,
  negativePrompt = "blurry, bad"
) {
  const body = JSON.stringify({
    steps: STEPS,
    width: WIDTH,
    height: HEIGHT,
    seed: SEED,
    cfg_scale: 5,
    samples: 1,
    text_prompts: [
      {
        text: prompt,
        weight: 1,
      },
      {
        text: negativePrompt,
        weight: -1,
      },
    ],
  });

  const response = await fetch(
    `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
    {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.STABLITY_AI_API_KEY}`,
      },
    }
  );

  console.log("response", response);

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  const data = (await response.json()) as {
    artifacts: {
      base64: string;
      seed: number;
      finishReason: string;
    }[];
  };

  return await fetch(`data:image/png;base64,${data.artifacts[0].base64}`);
}

const prompt =
  "expansive landscape rolling greens with gargantuan yggdrasil, intricate world-spanning roots towering under a blue alien sky, masterful, ghibli";

const image = await textToImage(prompt);
await Bun.write("./tmp/stable-image.png", image);
await $`ffmpeg -i ./tmp/stable-image.png -vf scale=576:1024 ./tmp/stable-image-scaled.png`;
