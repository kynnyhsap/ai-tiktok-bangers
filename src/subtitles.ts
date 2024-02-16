import { AssemblyAI, type TranscriptWord } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY ?? "",
});

function ms2srt(ms: number): string {
  const date = new Date(ms);

  return date.toISOString().slice(11, -1).replace(".", ",");
}

export async function srt(audio: string, originalText: string) {
  const transcript = await client.transcripts.transcribe({
    audio,
    punctuate: false,
    format_text: false,
  });

  console.log({ transcript });

  const batched = combineWordsInBatches(transcript.words ?? []);

  const unformattedSrt = batched
    .map(({ start, end, text }, index) => {
      return `${index + 1}\n${ms2srt(start)} --> ${ms2srt(
        end
      )}\n${text.toUpperCase()}`;
    })
    .join("\n\n");

  const formattedSrt = unformattedSrt;

  console.log({ formattedSrt });

  return formattedSrt;
}

function combineWordsInBatches(
  words: TranscriptWord[],
  batchSize: number = 3
): TranscriptWord[] {
  const combinedWords: TranscriptWord[] = [];

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    if (batch.length > 0) {
      const combinedText = batch.map((w) => w.text).join(" ");
      const start = batch[0].start;
      const end = batch[batch.length - 1].end;
      combinedWords.push({ text: combinedText, start, end, confidence: 1 });
    }
  }

  return combinedWords;
}
