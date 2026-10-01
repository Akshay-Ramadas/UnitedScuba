import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, renameSync, rmSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const scenesDir = join(root, 'client', 'public', 'scenes');
const outDir = join(root, 'client', 'public', 'frames');
const tmp = join(root, 'client', 'public', 'frames-new');
const perScene = 60;

const scenes = [1, 2, 3, 4, 5].map((n) => join(scenesDir, `scene ${n}.mp4`));

function durationOf(file) {
  const result = spawnSync(ffmpegPath, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const text = `${result.stdout || ''}\n${result.stderr || ''}`;
  const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Could not read duration for ${file}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function extract(file, count) {
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const duration = durationOf(file);
  const fps = (count + 6) / Math.max(duration, 0.2);
  const pattern = join(tmp, 'part_%04d.jpg');
  const result = spawnSync(
    ffmpegPath,
    [
      '-hide_banner',
      '-y',
      '-i',
      file,
      '-vf',
      `fps=${fps},scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720`,
      '-frames:v',
      String(count + 8),
      '-q:v',
      '4',
      pattern,
    ],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || `ffmpeg failed for ${file}`);
  }
  const parts = readdirSync(tmp)
    .filter((name) => name.startsWith('part_'))
    .sort();
  if (parts.length < count) {
    throw new Error(`${file} produced ${parts.length} frames, needed ${count}`);
  }
  const chosen = [];
  for (let i = 0; i < count; i += 1) {
    const src = Math.round((i * (parts.length - 1)) / (count - 1));
    chosen.push(parts[src]);
  }
  return { duration, parts: chosen, extras: parts.filter((name) => !chosen.includes(name)) };
}

let index = 0;
for (const file of scenes) {
  const { duration, parts, extras } = extract(file, perScene);
  console.log(`${file} ${duration.toFixed(2)}s -> frames ${index}–${index + perScene - 1}`);
  parts.forEach((name) => {
    const dest = join(outDir, `frame_${String(index).padStart(4, '0')}.jpg`);
    renameSync(join(tmp, name), dest);
    index += 1;
  });
  extras.forEach((name) => unlinkSync(join(tmp, name)));
}

rmSync(tmp, { recursive: true, force: true });
console.log(`Replaced ${index} frames`);
