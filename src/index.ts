import { $ } from "bun";
import { tts } from "./text-to-speech";
import { srt } from "./subtitles";
import { QUOTE_TEMPLATES } from "./quote-templates";

const folderId = Date.now();

const outputFolder = `./outputs/${folderId}`;

await $`mkdir -p ${outputFolder}`;

const text = QUOTE_TEMPLATES.whenHeSays({
  mid: "you're beautiful",
  him: "Rainbow Rowell",
  banger: `She never looked nice. She looked like art, and art wasn't supposed to look nice; it was supposed to make you feel something.`,
});

const speech = await tts(text);
await Bun.write(`${outputFolder}/speech.mp3`, speech);

const subtitles = await srt(`${outputFolder}/speech.mp3`, text);
await Bun.write(`${outputFolder}/subtitles.srt`, subtitles);

// convert subtitles from srt to ass format
await $`ffmpeg -i ${outputFolder}/subtitles.srt -y ${outputFolder}/subtitles.ass`;

// add few seconds of silence to the end
const SILCENCE_DURATION = 7;
await $`ffmpeg -i ${outputFolder}/speech.mp3 -af "apad=pad_dur=${SILCENCE_DURATION}" -y ${outputFolder}/speech-padded.mp3`;

const bakgroundMusicPath = "./music/idea15.mp3";

// mix speech with background music
await $`ffmpeg -i ${outputFolder}/speech-padded.mp3 -i ${bakgroundMusicPath} -filter_complex "amix=inputs=2:duration=shortest" -c:a libmp3lame -y ${outputFolder}/mixed.mp3`;

const backgroundImagePath =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg";

// crop and scale image to 16:9 ratio
await $`ffmpeg -i ${backgroundImagePath} -vf "scale=-2:1280,crop=720:1280" -y ${outputFolder}/image.jpg`;

await $`ffmpeg -loop 1 -framerate 2 -i ./tmp/image.jpg -i ./tmp/mixed.mp3 -filter_complex "[0:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1,subtitles=./tmp/subtitles.ass" -c:v libx264 -tune stillimage -c:a copy -shortest -y ${outputFolder}/banger.mp4`;
