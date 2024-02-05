import { $ } from "bun";
import { tts } from "./tts";
import { srt } from "./subs";

const QUOTE = `She never looked nice. She looked like art, and art wasn't supposed to look nice; it was supposed to make you feel something.`;
const text = `When he says "you're beautiful", but Rainbow Rowell said "${QUOTE}"`;

const speech = await tts(text);
await Bun.write("./tmp/speech.mp3", speech);

const subtitles = await srt("./tmp/speech.mp3", text);
await Bun.write("./tmp/subtitles.srt", subtitles);

await $`ffmpeg -i ./tmp/subtitles.srt -y ./tmp/subtitles.ass`;

await $`ffmpeg -i ./tmp/speech.mp3 -af "apad=pad_dur=7" -y ./tmp/speech-padded.mp3`;

const bakgroundMusicPath = "./music/idea15.mp3";

await $`ffmpeg -i ./tmp/speech-padded.mp3 -i ${bakgroundMusicPath} -filter_complex "amix=inputs=2:duration=shortest" -c:a libmp3lame -y ./tmp/mixed.mp3`;

const backgroundImagePath =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg";

await $`ffmpeg -i ${backgroundImagePath} -vf "scale=-2:1280,crop=720:1280" -y ./tmp/image.jpg`;

const outputPath = "./outputs/output_28.mp4";

await $`ffmpeg -loop 1 -framerate 2 -i ./tmp/image.jpg -i ./tmp/mixed.mp3 -filter_complex "[0:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1,subtitles=./tmp/subtitles.ass" -c:v libx264 -tune stillimage -c:a copy -shortest -y ${outputPath}`;
