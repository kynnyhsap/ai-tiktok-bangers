import { $ } from "bun";
import { tts } from "./text-to-speech";
import { srt } from "./subtitles";
import { QUOTE_TEMPLATES } from "./quote-templates";
import { textToImage } from "./text-to-image";
import { textToImagePrompts } from "./text-to-image-prompts";

const folderId = Date.now();

const outputFolder = `./outputs/${folderId}`;

await $`mkdir -p ${outputFolder}`;

// const text = QUOTE_TEMPLATES.youSay({
//   mid: "i love you",
//   him: "Howie Day",
//   banger: `Meeting you was a coincidence, becoming friends was a choice, but falling in love with you was beyond my control.`,
// });

const text = QUOTE_TEMPLATES.whenHeSays({
  mid: "you're beautiful",
  him: "Rainbow Rowell",
  banger: `She never looked nice. She looked like art, and art wasn't supposed to look nice; it was supposed to make you feel something.`,
});

await Bun.write(`${outputFolder}/text.txt`, text);

const speech = await tts(text);
await Bun.write(`${outputFolder}/speech.mp3`, speech);

// add few seconds of silence to the end
const SILENCE_DURATION = 7;
await $`ffmpeg -i ${outputFolder}/speech.mp3 -af "apad=pad_dur=${SILENCE_DURATION}" -y ${outputFolder}/speech-padded.mp3`;

const bakgroundMusicPath = "./music/lalecon.mp3";

// mix speech with background music
await $`ffmpeg -i ${outputFolder}/speech-padded.mp3 -i ${bakgroundMusicPath} -filter_complex "amix=inputs=2:duration=shortest" -c:a libmp3lame -y ${outputFolder}/audio.mp3`;

// generate image prompts
const imagePrompts = await textToImagePrompts(text);

// generate images
const imagePaths = await Promise.all(
  imagePrompts.map(async (prompt, index) => {
    const image = await textToImage(prompt);

    const p = `${outputFolder}/images/${index}.png`;
    await Bun.write(p, image);
    return p;
  })
);

// generate zoommed in/out videos
await $`mkdir -p ${outputFolder}/videos`;

const videoPaths = [];
const ZOOM_DURATION = 3;
for (const [index, imagePath] of imagePaths.entries()) {
  const videoPath = `${outputFolder}/videos/${index}.mp4`;

  if (index % 2 === 0) {
    // zoom in
    await $`ffmpeg -loop 1 -framerate 60 -i ${imagePath} -vf "scale=8000:-1,zoompan=z='zoom+0.001':x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):d=${ZOOM_DURATION}*60:s=576x1024:fps=60" -t ${ZOOM_DURATION} -c:v libx264 -pix_fmt yuv420p -y ${videoPath}`;
  } else {
    // zoom out
    await $`ffmpeg -loop 1 -framerate 60 -i ${imagePath} -vf "scale=8000:-1,zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):d=${ZOOM_DURATION}*60:s=576x1024:fps=60" -t ${ZOOM_DURATION} -c:v libx264 -pix_fmt yuv420p -y ${videoPath}`;
  }

  videoPaths.push(videoPath);
}

// create file with list of of videos to concat, repeat many times to loop the video in order to make it longer than the audio
const videosTxt = (
  videoPaths.map((_, index) => `file 'videos/${index}.mp4'`).join("\n") + "\n"
).repeat(5);
await Bun.write(`${outputFolder}/videos.txt`, videosTxt);

// // stich videos toghether
await $`ffmpeg -f concat -safe 0 -i ${outputFolder}/videos.txt -c copy -y ${outputFolder}/looped.mp4`;

// combine video with audio
await $`ffmpeg -i ${outputFolder}/looped.mp4 -i ${outputFolder}/audio.mp3 -c:v libx264 -c:a copy -shortest -y ${outputFolder}/with-audio.mp4`;

// generate subtitiles
const subtitles = await srt(`${outputFolder}/speech.mp3`, text);
await Bun.write(`${outputFolder}/subtitles.srt`, subtitles);

// convert subtitles from srt to ass format
await $`ffmpeg -i ${outputFolder}/subtitles.srt -y ${outputFolder}/subtitles.ass`;

// TODO: add those styles to ass file
const customAssStyles = `Style: Default,Arial Rounded MT Bold,20,&Hffffff,&Hffffff,&H0,&H0,0,0,0,0,100,100,0,0,1,1,2,5,10,10,10,1`;
const assFile = await Bun.file(`${outputFolder}/subtitles.ass`);
const assText = await assFile.text();

const newAssText = assText
  .split("\n")
  .map((line) => {
    if (line.startsWith("Style: ")) {
      return customAssStyles;
    }
    return line;
  })
  .join("\n");

await Bun.write(`${outputFolder}/styled-subtitles.ass`, newAssText);

// add subtitles to video
await $`ffmpeg -i ${outputFolder}/with-audio.mp4 -vf "subtitles=${outputFolder}/styled-subtitles.ass" -c:a copy ${outputFolder}/result.mp4`;
