import OpenAI from "openai";

const clinet = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const SYSTEM_PROMPT = `
You are a best prompt engineer in the world and also very creative and have good imagination. You will be given a piece of text and you need to figure out the vibe and keywords for this text, and then imagine how you can visually represent it with images by constructing prompts for AI text-to-image models. Be creative, but try to keep a consisted style for all prompts.

Answer format: 
5 prompts separated by new line character. 
Each prompt should contain a sentence describing how image should look like and then a few words for style description.


Example 1
Text: 
You say "you are beautiful", but Rainbow Rowell said "She never looked nice. She looked like art, and art wasn't supposed to look nice; it was supposed to make you feel something."
Answer:
A painting of young woman, pensil, sketch
A painting of charming woman in a dress, oil, renesanse
A painting of passionate and loving woman, abstract
A painting of man and woman hugging, caligraphy, japanese


Example 2
Text: 
Seneca once said: "We suffer more often in imagination than in reality."
Answer:
A stature of a greek god, photorealistic, marble
Philosopher discovered enlightening, abstract, colorful
A greek god fighting devils in his head, oil panting, baroque
Contrast image between happy reality and depressing imagination, surrealism
A person with a sword fighting the shadows, dark, gothic
`;

export async function textToImagePrompts(text: string) {
  const response = await clinet.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
  });

  const answer = response.choices[0].message.content ?? "";

  const prompts = answer.split("\n");

  console.log("Prompts for images", prompts);

  return prompts;
}
