// 사이트(index.html)에 나오는 "나"와 "팀원" 캐릭터를 인스타용으로 다시 그린 것.
// 머리 모양과 색은 사이트와 같게 두어 같은 인물로 보이게 했어요.
//   나:   짧은 검은 머리, 파란 옷(main 색)
//   팀원: 단발 갈색 머리, 노란 옷(mate 색)

export const WHO = ['me', 'tm'];
export const MOODS = ['idle', 'happy', 'proud', 'confused', 'surprised'];
export const POSES = ['idle', 'wave', 'point', 'laptop'];

const C = {
  skin: '#f6cfae', skinShade: '#e8b48f', ink: '#1d232b', blush: '#ff8f8f',
  me: { hair: '#262b33', hairHi: '#3b424d', shirt: '#1c8db3', shirtDark: '#156f8d' },
  tm: { hair: '#7a4528', hairHi: '#97603d', shirt: '#e3a21a', shirtDark: '#c0850c' },
  laptop: '#d5dce4', laptopDark: '#aab4bf',
};

const eyes = {
  idle: () => `
    <ellipse cx="98" cy="100" rx="6.5" ry="8" fill="${C.ink}"/><circle cx="100.5" cy="96.5" r="2.4" fill="#fff"/>
    <ellipse cx="142" cy="100" rx="6.5" ry="8" fill="${C.ink}"/><circle cx="144.5" cy="96.5" r="2.4" fill="#fff"/>`,
  happy: () => eyes.idle(),
  proud: () => `
    <path d="M90 102 Q98 91 106 102" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M134 102 Q142 91 150 102" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  confused: () => eyes.idle(),
  surprised: () => `
    <circle cx="98" cy="100" r="9" fill="#fff" stroke="${C.ink}" stroke-width="3"/><circle cx="98" cy="101" r="4.5" fill="${C.ink}"/>
    <circle cx="142" cy="100" r="9" fill="#fff" stroke="${C.ink}" stroke-width="3"/><circle cx="142" cy="101" r="4.5" fill="${C.ink}"/>`,
};

const brows = {
  idle: 'M88 82 Q98 77 107 81 M133 81 Q142 77 152 82',
  happy: 'M88 80 Q98 74 107 79 M133 79 Q142 74 152 80',
  proud: 'M88 80 Q98 74 107 79 M133 79 Q142 74 152 80',
  confused: 'M88 84 Q98 82 107 84 M133 76 Q143 70 152 76',
  surprised: 'M88 76 Q98 69 107 74 M133 74 Q142 69 152 76',
};

const mouths = {
  idle: `<path d="M110 122 Q120 130 130 122" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  happy: `<path d="M106 119 Q120 140 134 119 Z" fill="#7b2b2b"/><path d="M112 128 Q120 135 128 128 Q120 125 112 128Z" fill="#f07c7c"/>`,
  proud: `<path d="M104 118 Q120 142 136 118 Z" fill="#7b2b2b"/><path d="M111 129 Q120 137 129 129 Q120 125 111 129Z" fill="#f07c7c"/>`,
  confused: `<path d="M108 126 q6 -6 12 0 t12 0" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  surprised: `<ellipse cx="120" cy="126" rx="7" ry="9" fill="#7b2b2b"/>`,
};

// 머리 위에 뜨는 작은 기호
const marks = {
  idle: '',
  happy: `<g fill="#ffc83d"><path d="M196 40l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M40 58l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"/></g>`,
  proud: `<g fill="#ffc83d"><path d="M198 34l5 12 12 5-12 5-5 12-5-12-12-5 12-5z"/><path d="M36 50l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M214 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>`,
  confused: `<text x="196" y="62" font-family="Pretendard, sans-serif" font-size="56" font-weight="900" fill="#5a5fe0">?</text>`,
  surprised: `<g stroke="#e5336b" stroke-width="7" stroke-linecap="round"><path d="M200 30 L194 60"/><path d="M222 46 L206 66"/><path d="M180 26 L182 54"/></g>`,
};

function hair(who, layer) {
  const h = C[who];
  if (who === 'me') {
    if (layer === 'back') return '';
    return `
      <path d="M60 100 C54 50 88 26 124 28 C164 30 188 58 182 102 C176 84 166 72 150 66 C138 78 110 82 86 76 C74 82 64 90 60 100 Z" fill="${h.hair}"/>
      <path d="M96 40 C112 30 140 30 156 40 C140 36 116 36 96 40 Z" fill="${h.hairHi}"/>
      <path d="M118 30 C120 18 132 12 142 14 C134 18 128 24 126 32 Z" fill="${h.hair}"/>`;
  }
  if (layer === 'back') return `<path d="M52 158 C40 96 56 30 120 30 C184 30 200 96 188 158 C176 166 160 164 154 156 L86 156 C80 164 64 166 52 158 Z" fill="${h.hair}"/>`;
  return `
    <path d="M60 98 C58 54 90 36 122 36 C156 36 184 56 182 98 C164 90 146 78 136 62 C124 78 96 92 60 98 Z" fill="${h.hair}"/>
    <path d="M90 50 C108 40 138 40 158 50 C138 46 110 46 90 50 Z" fill="${h.hairHi}"/>`;
}

function arms(who, pose) {
  const s = C[who];
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="${C.skin}"/>`;
  if (pose === 'wave') return `
    <path d="M168 196 C186 180 196 156 202 132" stroke="${s.shirt}" stroke-width="26" stroke-linecap="round" fill="none"/>
    ${hand(204, 120)}
    <path d="M216 104 q8 6 6 16 M226 96 q12 10 8 26" stroke="${s.shirtDark}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>`;
  if (pose === 'point') return `
    <path d="M170 204 C190 200 208 190 222 178" stroke="${s.shirt}" stroke-width="26" stroke-linecap="round" fill="none"/>
    ${hand(228, 172)}`;
  if (pose === 'laptop') return `
    <rect x="66" y="196" width="108" height="70" rx="10" fill="${C.laptop}"/>
    <rect x="66" y="196" width="108" height="70" rx="10" fill="none" stroke="${C.laptopDark}" stroke-width="3"/>
    <circle cx="120" cy="230" r="8" fill="#fff" opacity=".8"/>
    ${hand(70, 222)}${hand(170, 222)}`;
  return '';
}

// 캐릭터 한 명. viewBox 240×260(상반신)
export function character({ who = 'me', mood = 'idle', pose = 'idle', flip = false } = {}) {
  const s = C[who];
  const body = `
    ${hair(who, 'back')}
    <path d="M58 262 C58 196 82 164 120 164 C158 164 182 196 182 262 Z" fill="${s.shirt}"/>
    <path d="M92 168 Q120 192 148 168 Q140 162 120 162 Q100 162 92 168 Z" fill="${s.shirtDark}"/>
    <rect x="109" y="140" width="22" height="30" rx="8" fill="${C.skinShade}"/>
    <path d="M104 186 l-4 26 M136 186 l4 26" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>
    ${who === 'me' ? `<circle cx="62" cy="106" r="11" fill="${C.skin}"/><circle cx="178" cy="106" r="11" fill="${C.skin}"/>` : ''}
    <ellipse cx="120" cy="96" rx="60" ry="58" fill="${C.skin}"/>
    ${hair(who, 'front')}
    <path d="${brows[mood]}" stroke="${who === 'me' ? C.me.hair : C.tm.hair}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    ${eyes[mood]()}
    <ellipse cx="84" cy="118" rx="10" ry="6" fill="${C.blush}" opacity=".35"/>
    <ellipse cx="156" cy="118" rx="10" ry="6" fill="${C.blush}" opacity=".35"/>
    ${mouths[mood]}
    ${arms(who, pose)}`;
  const inner = flip ? `<g transform="translate(240 0) scale(-1 1)">${body}</g>` : body;
  return `<svg class="char" viewBox="0 0 240 262" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}${marks[mood]}</svg>`;
}

// 대화 장에 쓰는 얼굴만 보이는 동그란 아바타
export function avatar({ who = 'me', mood = 'idle' } = {}) {
  return character({ who, mood }).replace('viewBox="0 0 240 262"', 'viewBox="30 18 180 180"').replace('class="char"', 'class="avatar"');
}

// 표지용 장면: 나와 팀원이 GitHub를 사이에 두고 노트북을 든 모습
export function duo({ mood = 'happy' } = {}) {
  const me = character({ who: 'me', mood, pose: 'laptop' }).replace('<svg ', '<svg x="0" y="40" width="300" height="327" ');
  const tm = character({ who: 'tm', mood, pose: 'laptop', flip: true }).replace('<svg ', '<svg x="600" y="40" width="300" height="327" ');
  return `
    <svg class="scene" viewBox="0 0 900 370" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M260 230 C320 120 380 110 410 120" stroke="#ffffff" stroke-opacity=".55" stroke-width="5" stroke-dasharray="4 14" stroke-linecap="round" fill="none"/>
      <path d="M640 230 C580 120 520 110 490 120" stroke="#ffffff" stroke-opacity=".55" stroke-width="5" stroke-dasharray="4 14" stroke-linecap="round" fill="none"/>
      <g transform="translate(450 112)">
        <path d="M-92 34 C-118 34 -122 -4 -96 -10 C-96 -46 -48 -58 -28 -32 C-16 -66 50 -66 56 -22 C88 -26 104 6 84 26 C80 32 74 34 66 34 Z" fill="#ffffff"/>
        <text x="-4" y="14" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="34" font-weight="850" fill="#4b4fa8">GitHub</text>
      </g>
      ${me}${tm}
    </svg>`;
}
