// 케이스 파일을 인스타용 이미지와 릴스 영상으로 만들어요.
//
//   npm run render                       모든 케이스
//   npm run render -- 01-commit-vs-push  특정 케이스만
//   npm run render -- --format post      게시글만 (reel: 릴스만)
//   npm run render -- --no-video         릴스 영상(mp4) 건너뛰기
//   npm run check                        검사만 하고 만들지 않기
//
// 결과는 out/<케이스>/ 에 생겨요.
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, listCases, startServer } from './server.mjs';
import { validateCase } from './validate.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const wanted = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--format'));

const config = JSON.parse(await readFile(join(ROOT, 'config.json'), 'utf8'));
const formats = option('--format') ? [option('--format')] : Object.keys(config.formats);
for (const f of formats) if (!config.formats[f]) fail(`--format은 ${Object.keys(config.formats).join(', ')} 중 하나여야 해요`);

const all = await listCases();
const ids = wanted.length ? wanted : all;
for (const id of ids) if (!all.includes(id)) fail(`cases/${id}.json 파일이 없어요`);

// 1. 검사
const cases = {};
const errors = [];
for (const id of ids) {
  try {
    cases[id] = JSON.parse(await readFile(join(ROOT, 'cases', `${id}.json`), 'utf8'));
    errors.push(...validateCase(cases[id], `cases/${id}.json`));
  } catch (e) {
    errors.push(`cases/${id}.json: JSON 형식이 잘못됐어요 (${e.message})`);
  }
}
if (errors.length) fail(`케이스 파일에 고칠 곳이 ${errors.length}개 있어요\n  - ${errors.join('\n  - ')}`);
console.log(`✓ 케이스 ${ids.length}개 검사 통과`);
if (flag('--check')) process.exit(0);

// 2. 이미지 만들기
const { chromium } = await import('playwright');
const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const hasFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0;

try {
  for (const id of ids) {
    const data = cases[id];
    const outDir = join(ROOT, 'out', id);
    await rm(outDir, { recursive: true, force: true });

    for (const format of formats) {
      const { width, height } = config.formats[format];
      const dir = join(outDir, format);
      await mkdir(dir, { recursive: true });
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const files = [];
      for (let i = 1; i <= data.slides.length; i++) {
        await page.goto(`${base}/template/index.html?case=${encodeURIComponent(id)}&format=${format}&slide=${i}`);
        await page.waitForFunction(() => window.__ready === true);
        const problem = await page.evaluate(() => {
          const err = document.querySelector('.error');
          if (err) return err.textContent;
          const c = document.querySelector('.content');
          const overflows = () => c && c.scrollHeight > c.clientHeight + 1;
          if (overflows()) return '글이 너무 길어서 화면 밖으로 넘쳐요. 내용을 줄여 주세요';
          // 컴퓨터마다 글자 폭이 조금씩 달라요. 폭을 30px 좁혀도 넘치지 않아야 어디서 만들어도 같은 결과가 나와요.
          const squeeze = document.createElement('style');
          squeeze.textContent = '.slide { padding-right: calc(var(--pad-right) + 30px) !important; }';
          document.head.append(squeeze);
          const tight = overflows();
          squeeze.remove();
          return tight ? '여유가 거의 없어서 다른 컴퓨터에서는 넘칠 수 있어요. 문장을 조금 줄여 주세요' : null;
        });
        if (problem) throw new Error(`cases/${id}.json ${i}번째 장(${format}): ${problem}`);
        const file = join(dir, `${String(i).padStart(2, '0')}.png`);
        await page.screenshot({ path: file });
        files.push(file);
      }
      await page.close();
      console.log(`✓ ${id} ${format === 'post' ? '게시글' : '릴스'} 이미지 ${files.length}장`);

      if (format === 'reel' && !flag('--no-video')) {
        if (!hasFfmpeg) console.log('  ! ffmpeg가 없어서 릴스 영상(mp4)은 건너뛰었어요');
        else makeVideo(data, files, join(outDir, 'reel.mp4'));
      }
    }

    const tags = (data.hashtags || []).map((t) => `#${t.replace(/^#/, '')}`).join(' ');
    await writeFile(join(outDir, 'caption.txt'), `${data.caption.trim()}\n\n${tags}\n`.replace(/\n\n\n$/, '\n'));
    console.log(`✓ ${id} 캡션 → out/${id}/caption.txt`);
  }
} catch (e) {
  process.exitCode = 1;
  console.error(`✗ ${e.message}`);
} finally {
  await browser.close();
  server.close();
}

// 이미지들을 이어 붙여 릴스 영상을 만들어요. 장마다 부드럽게 넘어가요.
function makeVideo(data, files, out) {
  const r = config.reel;
  const fade = r.transitionSeconds;
  const durations = data.slides.map((s, i) => s.seconds ?? (i === files.length - 1 ? r.lastSlideSeconds : r.secondsPerSlide));
  const inputs = files.flatMap((f, i) => ['-loop', '1', '-framerate', String(r.fps), '-t', String(durations[i]), '-i', f]);
  let filter = '';
  let last = '[0:v]';
  let offset = 0;
  for (let i = 1; i < files.length; i++) {
    offset += durations[i - 1] - fade;
    filter += `${last}[${i}:v]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(3)}[v${i}];`;
    last = `[v${i}]`;
  }
  filter += `${last}format=yuv420p[out]`;
  const res = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-map', '[out]',
    '-r', String(r.fps), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', out], { stdio: 'inherit' });
  if (res.status !== 0) throw new Error('릴스 영상을 만들지 못했어요 (ffmpeg 오류)');
  const total = durations.reduce((a, b) => a + b, 0) - fade * (files.length - 1);
  console.log(`✓ 릴스 영상 ${total.toFixed(1)}초 → ${out.slice(ROOT.length + 1)}`);
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}
