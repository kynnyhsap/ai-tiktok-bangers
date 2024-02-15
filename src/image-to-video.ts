import { wait } from "./utils";

async function imageToVideoSync(image: any) {
  const data = new FormData();
  data.append("image", image, "image.png");
  data.append("seed", 0);
  data.append("cfg_scale", 1.8);
  data.append("motion_bucket_id", 127);

  const response = await fetch(
    `https://api.stability.ai/v2alpha/generation/image-to-video`,
    {
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${process.env.STABLITY_AI_API_KEY}`,
      },
    }
  );

  const { id } = (await response.json()) as { id: string };

  while (true) {
    const videoResponse = await fetch(
      `https://api.stability.ai/v2alpha/generation/image-to-video/result/${id}`,
      {
        headers: {
          accept: "video/*",
          Authorization: `Bearer ${process.env.STABLITY_AI_API_KEY}`,
        },
      }
    );

    if (videoResponse.status === 202) {
      console.log("Generation is still running...");
    } else if (videoResponse.status === 200) {
      console.log("Generation is complete!");

      return videoResponse;
    } else {
      throw new Error(`Response ${videoResponse.status}`);
    }

    await wait(5000);
  }
}
