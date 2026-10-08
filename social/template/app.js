// 주소 뒤의 값에 따라 화면을 그려요.
//   ?case=ID&format=post&slide=1  → 슬라이드 한 장(이미지로 저장할 때 씀)
//   ?case=ID&format=reel          → 그 케이스의 모든 장 미리보기
//   (값 없음)                      → 케이스 목록
import { renderSlide } from './layouts.js';

const params = new URLSearchParams(location.search);
const app = document.getElementById('app');
const getJSON = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`${url}을(를) 읽지 못했어요 (${r.status})`);
  return r.json();
});

function sizeVars(config, format) {
  const f = config.formats[format];
  document.documentElement.style.setProperty('--w', f.width + 'px');
  document.documentElement.style.setProperty('--h', f.height + 'px');
}

async function main() {
  const config = await getJSON('/config.json');
  const id = params.get('case');
  const format = params.get('format') || 'post';
  if (!config.formats[format]) throw new Error(`format은 ${Object.keys(config.formats).join(', ')} 중 하나여야 해요`);

  if (!id) {
    const ids = await getJSON('/api/cases');
    document.body.className = 'gallery';
    app.innerHTML = `<h1>케이스 목록</h1><ul class="case-list">${ids.map((x) =>
      `<li><a href="?case=${encodeURIComponent(x)}&format=post">${x}</a> · <a href="?case=${encodeURIComponent(x)}&format=reel">릴스</a></li>`).join('')}</ul>`;
    return;
  }

  const caseData = await getJSON(`/cases/${encodeURIComponent(id)}.json`);
  sizeVars(config, format);
  const total = caseData.slides.length;
  const one = params.get('slide');

  if (one) {
    const index = Number(one) - 1;
    document.body.className = 'capture';
    app.innerHTML = renderSlide(caseData.slides[index], { config, caseData, format, index, total });
  } else {
    document.body.className = 'preview';
    const other = format === 'post' ? 'reel' : 'post';
    app.innerHTML = `
      <nav class="bar"><a href="/">← 목록</a><strong>${id}</strong>
        <a href="?case=${encodeURIComponent(id)}&format=${other}">${other === 'reel' ? '릴스' : '게시글'}로 보기</a></nav>
      <div class="grid">${caseData.slides.map((s, index) =>
        `<div class="thumb">${renderSlide(s, { config, caseData, format, index, total })}</div>`).join('')}</div>`;
  }
}

main()
  .catch((e) => { app.innerHTML = `<pre class="error">${String(e.message || e)}</pre>`; })
  .finally(async () => { await document.fonts.ready; window.__ready = true; });
