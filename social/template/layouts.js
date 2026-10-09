// 슬라이드 레이아웃 정의.
// 브라우저(template/index.html)는 render로 화면을 그리고,
// Node(scripts/render.mjs)는 fields로 케이스 파일을 검사해요.
// 새 레이아웃을 만들려면 여기에 항목 하나와 template/slides.css에 스타일을 더하면 돼요.

import { WHO, MOODS, POSES, character, avatar, duo } from './characters.js';

export const ACCENTS = ['main', 'cloud', 'feature', 'hot', 'mate'];

// 모든 슬라이드에 쓸 수 있는 공통 칸
export const COMMON_FIELDS = {
  accent: { kind: 'enum', values: ACCENTS },
  seconds: { kind: 'number', min: 1, max: 15 },
  // 캐릭터 넣기. who가 duo면 나와 팀원이 함께 나오는 장면이에요(표지에 어울려요)
  cast: { kind: 'object', fields: {
    who: { kind: 'enum', required: true, values: [...WHO, 'duo'] },
    mood: { kind: 'enum', values: MOODS },
    pose: { kind: 'enum', values: POSES },
    say: { kind: 'text', max: 24 },
  } },
};

const WHO_NAME = { me: '나', tm: '팀원' };

// 비유 장의 장면 아이콘(선으로 그린 48×48)
const SCENES = {
  restaurant: '<path d="M15 6v13a5 5 0 0 0 10 0V6M20 6v36M34 6c-5 4-6 13-6 19h6v17"/>',
  library: '<path d="M6 11c6-3 12-3 18 1 6-4 12-4 18-1v27c-6-3-12-3-18 1-6-4-12-4-18-1z"/><path d="M24 12v27"/>',
  photo: '<rect x="5" y="14" width="38" height="25" rx="5"/><circle cx="24" cy="26.5" r="7"/><path d="M16 14l3-5h10l3 5"/>',
};
const sceneIcon = (k) => `<svg class="scene-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SCENES[k]}</svg>`;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// **강조**, `코드`, 줄바꿈을 지원해요.
export const rich = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong class="hl">$1</strong>')
  .replace(/`(.+?)`/g, '<code>$1</code>')
  .replace(/\n/g, '<br>');

const opt = (tag, cls, value) => (value ? `<${tag} class="${cls}">${rich(value)}</${tag}>` : '');

export const LAYOUTS = {
  // 첫 장. 피드에서 눈에 띄는 큰 질문
  cover: {
    fields: {
      kicker: { kind: 'text', max: 30 },
      title: { kind: 'text', required: true, max: 40 },
      subtitle: { kind: 'text', max: 60 },
    },
    render: (s) => `
      ${opt('p', 'kicker', s.kicker)}
      <h1 class="cover-title">${rich(s.title)}</h1>
      ${opt('p', 'subtitle', s.subtitle)}`,
  },

  // 개념 하나를 설명하는 장
  concept: {
    fields: {
      label: { kind: 'text', max: 30 },
      title: { kind: 'text', required: true, max: 36 },
      body: { kind: 'text', max: 140 },
    },
    render: (s) => `
      ${opt('p', 'label', s.label)}
      <h2 class="title">${rich(s.title)}</h2>
      ${opt('p', 'body', s.body)}`,
  },

  // 두 가지를 나란히 비교하는 장
  compare: {
    fields: {
      title: { kind: 'text', max: 30 },
      left: { kind: 'object', required: true, fields: {
        label: { kind: 'text', required: true, max: 16 },
        points: { kind: 'list', required: true, min: 1, max: 4, item: { kind: 'text', max: 40 } },
      } },
      right: { kind: 'object', required: true, fields: {
        label: { kind: 'text', required: true, max: 16 },
        points: { kind: 'list', required: true, min: 1, max: 4, item: { kind: 'text', max: 40 } },
      } },
      verdict: { kind: 'text', max: 60 },
    },
    render: (s) => {
      const side = (x, cls) => `
        <div class="side ${cls}">
          <p class="side-label">${rich(x.label)}</p>
          <ul>${x.points.map((p) => `<li>${rich(p)}</li>`).join('')}</ul>
        </div>`;
      return `
        ${opt('h2', 'title', s.title)}
        <div class="compare">${side(s.left, 'left')}${side(s.right, 'right')}</div>
        ${opt('p', 'verdict', s.verdict)}`;
    },
  },

  // 순서가 있는 과정
  steps: {
    fields: {
      title: { kind: 'text', max: 30 },
      items: { kind: 'list', required: true, min: 2, max: 5, item: { kind: 'object', fields: {
        name: { kind: 'text', required: true, max: 24 },
        desc: { kind: 'text', max: 50 },
      } } },
    },
    render: (s) => `
      ${opt('h2', 'title', s.title)}
      <ol class="steps">${s.items.map((it, i) => `
        <li><span class="num">${i + 1}</span><div><p class="step-name">${rich(it.name)}</p>${opt('p', 'step-desc', it.desc)}</div></li>`).join('')}
      </ol>`,
  },

  // 터미널 화면. cmd는 입력한 명령, out은 출력, code는 파일 내용처럼 밝게 보이는 줄
  terminal: {
    fields: {
      title: { kind: 'text', max: 30 },
      lines: { kind: 'list', required: true, min: 1, max: 8, item: { kind: 'object', fields: {
        cmd: { kind: 'text', max: 44 },
        out: { kind: 'text', max: 44 },
        code: { kind: 'text', max: 44 },
      } } },
      note: { kind: 'text', max: 80 },
    },
    render: (s) => `
      ${opt('h2', 'title', s.title)}
      <div class="terminal">
        <div class="term-bar"><i></i><i></i><i></i></div>
        <pre>${s.lines.map((l) => {
          if (l.cmd) return `<span class="cmd"><span class="prompt">$</span> ${esc(l.cmd)}</span>`;
          if (l.code) return `<span class="cmd">${esc(l.code)}</span>`;
          return `<span class="out">${esc(l.out || '')}</span>`;
        }).join('\n')}</pre>
      </div>
      ${opt('p', 'note', s.note)}`,
  },

  // 오해와 사실
  myth: {
    fields: {
      myth: { kind: 'text', required: true, max: 40 },
      truth: { kind: 'text', required: true, max: 120 },
    },
    render: (s) => `
      <div class="myth"><span class="tag no">오해</span><p>${rich(s.myth)}</p></div>
      <div class="truth"><span class="tag yes">사실</span><p>${rich(s.truth)}</p></div>`,
  },

  // 나와 팀원의 대화. 첫 장 바로 뒤에 두면 이야기로 끌어들이기 좋아요
  talk: {
    fields: {
      title: { kind: 'text', max: 30 },
      lines: { kind: 'list', required: true, min: 2, max: 4, item: { kind: 'object', fields: {
        who: { kind: 'enum', required: true, values: WHO },
        mood: { kind: 'enum', values: MOODS },
        text: { kind: 'text', required: true, max: 40 },
      } } },
    },
    render: (s) => `
      ${opt('h2', 'title', s.title)}
      <div class="chat">${s.lines.map((l) => `
        <div class="msg ${l.who}">
          <div class="face">${avatar({ who: l.who, mood: l.mood || 'idle' })}</div>
          <div class="said"><span class="who-name">${WHO_NAME[l.who]}</span><p class="bubble">${rich(l.text)}</p></div>
        </div>`).join('')}
      </div>`,
  },

  // 일상 장면에 빗대어 설명하는 장. 왼쪽은 일상, 오른쪽은 깃 용어
  analogy: {
    fields: {
      scene: { kind: 'enum', required: true, values: Object.keys(SCENES) },
      label: { kind: 'text', required: true, max: 20 },
      title: { kind: 'text', max: 30 },
      pairs: { kind: 'list', required: true, min: 2, max: 4, item: { kind: 'object', fields: {
        life: { kind: 'text', required: true, max: 26 },
        git: { kind: 'text', required: true, max: 12 },
      } } },
      note: { kind: 'text', max: 60 },
    },
    render: (s) => `
      <div class="analogy-head">${sceneIcon(s.scene)}<p class="label">${rich(s.label)}</p></div>
      ${opt('h2', 'title', s.title)}
      <ol class="pairs">${s.pairs.map((x) => `
        <li><p class="life">${rich(x.life)}</p><span class="eq" aria-hidden="true">=</span><span class="git">${rich(x.git)}</span></li>`).join('')}
      </ol>
      ${opt('p', 'note', s.note)}`,
  },

  // 마지막 장. 정리와 안내(사이트 주소와 계정은 config.json에서 자동으로 붙어요)
  end: {
    fields: {
      title: { kind: 'text', required: true, max: 36 },
      body: { kind: 'text', max: 100 },
      cta: { kind: 'text', max: 30 },
    },
    render: (s, ctx) => `
      <h2 class="title">${rich(s.title)}</h2>
      ${opt('p', 'body', s.body)}
      <div class="cta">
        ${opt('p', 'cta-text', s.cta)}
        ${ctx.config.site ? `<p class="cta-site">${esc(ctx.config.site)}</p>` : ''}
      </div>`,
  },
};

// 슬라이드 한 장의 HTML. 머리말·쪽 번호·꼬리말은 모든 레이아웃이 함께 써요.
export function renderSlide(slide, ctx) {
  const layout = LAYOUTS[slide.type];
  const accent = slide.accent || ctx.caseData.accent || 'main';
  return `
    <article class="slide type-${slide.type} accent-${accent} format-${ctx.format}">
      <header class="chrome-top">
        <span class="series">${esc(ctx.caseData.series || ctx.config.brand)}</span>
        <span class="page">${ctx.index + 1} / ${ctx.total}</span>
      </header>
      <div class="content">${layout.render(slide, ctx)}${renderCast(slide.cast)}</div>
      <footer class="chrome-bottom">
        <span class="brand">${esc(ctx.config.brand)}</span>
        ${ctx.config.handle ? `<span class="handle">${esc(ctx.config.handle)}</span>` : ''}
      </footer>
    </article>`;
}

function renderCast(cast) {
  if (!cast) return '';
  if (cast.who === 'duo') return `<div class="cast duo">${duo({ mood: cast.mood || 'happy' })}</div>`;
  return `
    <div class="cast solo ${cast.who}">
      ${cast.say ? `<p class="say">${rich(cast.say)}</p>` : ''}
      ${character({ who: cast.who, mood: cast.mood || 'idle', pose: cast.pose || 'idle' })}
    </div>`;
}
