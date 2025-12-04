import { request } from './http';

function normalizeOptions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((opt, idx) => ({
      value: opt.value || String.fromCharCode(65 + idx),
      text: opt.label || opt.text || opt.value || '',
      label: opt.label || opt.text || opt.value || '',
      correct: opt.correct,
    }));
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return normalizeOptions(parsed);
    } catch (err) {
      return [];
    }
  }
  return [];
}

export function normalizeQuestion(data = {}) {
  const typeRaw = String(data.type || '').toLowerCase();
  let type = data.type;
  if (typeRaw.includes('multiple')) type = 'multiple';
  else if (typeRaw.includes('true') || typeRaw.includes('judge')) type = 'truefalse';
  else if (typeRaw.includes('fill') || typeRaw.includes('short')) type = 'short';
  else if (typeRaw.includes('single')) type = 'single';
  return {
    id: data.id,
    title: data.content || data.title || '',
    type,
    options: normalizeOptions(data.options || data.optionsJson),
    score: data.score || 0,
    duration: data.duration || 0,
    explanation: data.explanation,
    categoryId: data.categoryId,
    difficulty: data.difficulty,
    answer:
      typeof data.answer === 'string'
        ? data.answer.split(/[,;\s]+/).filter(Boolean)
        : Array.isArray(data.answer)
          ? data.answer
          : [],
  };
}

export async function fetchQuestionDetail(id) {
  const res = await request({ url: `/questions/${id}`, method: 'GET' });
  return normalizeQuestion(res);
}

export async function fetchQuestionPage(params = {}) {
  const { page = 1, size = 10, categoryId, difficulty, keyword } = params;
  const res = await request({
    url: '/questions',
    method: 'GET',
    data: { page, size, categoryId, difficulty, keyword },
  });
  const records = Array.isArray(res?.records) ? res.records.map((item) => normalizeQuestion(item)) : [];
  return {
    page: res?.page || page,
    size: res?.size || size,
    total: res?.total || records.length,
    records,
  };
}

export async function fetchPracticeSequence(params = {}) {
  const { categoryId, difficulty, page = 1, size = 10 } = params;
  const res = await request({
    url: '/questions/practice/sequence',
    method: 'GET',
    data: { categoryId, difficulty, page, size },
  });
  const records = Array.isArray(res?.records) ? res.records.map((item) => normalizeQuestion(item)) : [];
  return {
    page: res?.page || page,
    size: res?.size || size,
    total: res?.total || records.length,
    records,
  };
}

export async function fetchPracticeRandom(params = {}) {
  const { categoryId, difficulty, limit = 5 } = params;
  const res = await request({
    url: '/questions/practice/random',
    method: 'GET',
    data: { categoryId, difficulty, limit },
  });
  return Array.isArray(res) ? res.map((item) => normalizeQuestion(item)) : [];
}
