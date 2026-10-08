// 케이스 파일이 레이아웃 규칙(template/layouts.js의 fields)에 맞는지 검사해요.
import { LAYOUTS, COMMON_FIELDS } from '../template/layouts.js';

const CASE_FIELDS = {
  series: { kind: 'text', max: 24 },
  accent: COMMON_FIELDS.accent,
  caption: { kind: 'text', required: true, max: 2000 },
  hashtags: { kind: 'list', max: 30, item: { kind: 'text', max: 30 } },
  slides: { kind: 'list', required: true, min: 1, max: 20, item: { kind: 'slide' } },
};

function check(value, rule, path, errors) {
  const fail = (msg) => errors.push(`${path}: ${msg}`);
  switch (rule.kind) {
    case 'text':
      if (typeof value !== 'string') return fail('글자여야 해요');
      if (!value.trim()) return fail('비어 있어요');
      if (rule.max && [...value].length > rule.max) fail(`${rule.max}자 이하로 줄여 주세요 (지금 ${[...value].length}자)`);
      return;
    case 'number':
      if (typeof value !== 'number') return fail('숫자여야 해요');
      if (value < rule.min || value > rule.max) fail(`${rule.min}~${rule.max} 사이여야 해요`);
      return;
    case 'enum':
      if (!rule.values.includes(value)) fail(`${rule.values.join(', ')} 중 하나여야 해요`);
      return;
    case 'list':
      if (!Array.isArray(value)) return fail('목록([ ])이어야 해요');
      if (rule.min && value.length < rule.min) fail(`${rule.min}개 이상 있어야 해요`);
      if (rule.max && value.length > rule.max) fail(`${rule.max}개 이하여야 해요`);
      value.forEach((v, i) => check(v, rule.item, `${path}[${i + 1}]`, errors));
      return;
    case 'object':
      if (!value || typeof value !== 'object' || Array.isArray(value)) return fail('묶음({ })이어야 해요');
      return checkFields(value, rule.fields, path, errors);
    case 'slide': {
      const layout = value && LAYOUTS[value.type];
      if (!layout) return fail(`type은 ${Object.keys(LAYOUTS).join(', ')} 중 하나여야 해요`);
      const { type, ...rest } = value;
      return checkFields(rest, { ...COMMON_FIELDS, ...layout.fields }, `${path}(${type})`, errors);
    }
  }
}

function checkFields(obj, fields, path, errors) {
  for (const [key, rule] of Object.entries(fields)) {
    if (obj[key] === undefined) { if (rule.required) errors.push(`${path}.${key}: 꼭 있어야 해요`); }
    else check(obj[key], rule, `${path}.${key}`, errors);
  }
  for (const key of Object.keys(obj)) {
    if (!(key in fields)) errors.push(`${path}.${key}: 모르는 칸이에요. 오타인지 확인해 주세요 (쓸 수 있는 칸: ${Object.keys(fields).join(', ')})`);
  }
}

export function validateCase(data, name) {
  const errors = [];
  checkFields(data, CASE_FIELDS, name, errors);
  return errors;
}
