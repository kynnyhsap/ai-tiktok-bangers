import OpenAI from "openai";

const clinet = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const SYSTEM_PROMPT = `
You are a best prompt engineer in the world and also very creative and have good imagination. You will be given a piece of text and you need to figure out the vibe for this text and then imagine how you can visually represent it with images by constructing prompts for AI text-to-image models. Be creative, but try to keep a consisted style for all prompts - paintings in Baroque art style.

Answer format: 
4 prompts separated by new line character. 
Each prompt should contain a sentence describing how image should look like and then a few words for style description.


Example
Text: You say "you are beautiful", but Rainbow Rowell said "She never looked nice. She looked like art, and art wasn't supposed to look nice; it was supposed to make you feel something."

Answer:
A painting of a beautiful young woman, in a renaissance style
A painting of playfull woman in a dress, oil, impressionism
A painting of a couple in love, in a style of Da Vinci
A painting of an artist painting a still life, in a style of Rembrandt
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

  console.log("Answer from OpenAI", answer);

  // splity by any number of newlie characters
  const prompts = answer.split(/\n+/).filter((p) => p);

  console.log("Prompts for images", prompts);

  return prompts;
}
