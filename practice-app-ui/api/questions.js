import { request, upload } from './http';

function pickRecords(payload) {
  const data = payload && typeof payload === 'object' ? payload : {};
  if (Array.isArray(data.records)) return { records: data.records, meta: data };
  if (Array.isArray(data.list)) return { records: data.list, meta: data };
  if (Array.isArray(data.data?.records)) return { records: data.data.records, meta: data.data };
  if (Array.isArray(data.data?.list)) return { records: data.data.list, meta: data.data };
  return { records: [], meta: data };
}

function legacyOptionsFromObject(data = {}) {
  const list = [];
  const choiceKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
  choiceKeys.forEach((letter) => {
    const val = data[`option${letter}`] || data[`option${letter.toLowerCase()}`];
    if (val) {
      list.push({ value: letter, text: val, label: val });
    }
  });
  if (list.length) return list;
  const tVal = data.optionTrue || data.optionT;
  const fVal = data.optionFalse || data.optionF;
  if (tVal || fVal) {
    return [
      { value: 'T', text: tVal || '正确', label: tVal || '正确' },
      { value: 'F', text: fVal || '错误', label: fVal || '错误' },
    ];
  }
  return [];
}

function normalizeOptions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((opt, idx) => ({
      value: opt.value || String.fromCharCode(65 + idx),
      text: opt.label || opt.text || opt.value || '',
      label: opt.label || opt.text || opt.value || '',
      correct: opt.correct,
      images: Array.isArray(opt.images) ? opt.images : [],
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
  let options = normalizeOptions(data.options || data.optionsJson);
  if (!options.length) {
    options = legacyOptionsFromObject(data);
  }
  if ((!options || options.length === 0) && type === 'truefalse') {
    options = [
      { value: 'T', text: '正确', label: '正确' },
      { value: 'F', text: '错误', label: '错误' },
    ];
  }
  return {
    id: data.id,
    title: data.content || data.title || '',
    type,
    options,
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

export async function fetchQuestionRaw(id) {
  return request({ url: `/questions/${id}`, method: 'GET' });
}

export async function fetchQuestionDetail(id) {
  const res = await fetchQuestionRaw(id);
  return normalizeQuestion(res);
}

export async function createQuestion(payload) {
  return request({ url: '/questions', method: 'POST', data: payload });
}

export async function updateQuestion(id, payload) {
  if (!id) throw new Error('缺少题目ID');
  return request({ url: `/questions/${id}`, method: 'PUT', data: payload });
}

export async function uploadQuestionImage(filePath) {
  if (!filePath) throw new Error('缺少文件路径');
  return upload({ url: '/files/questions', filePath, name: 'file' });
}

export async function fetchQuestionPage(params = {}) {
  const { page = 1, size = 10, categoryId, difficulty, keyword } = params;
  const res = await request({
    url: '/questions',
    method: 'GET',
    data: { page, size, categoryId, difficulty, keyword },
  });
  const { records: rawList, meta } = pickRecords(res);
  const records = rawList.map((item) => normalizeQuestion(item));
  const totalVal = meta?.total ?? meta?.count ?? records.length;
  const total = typeof totalVal === 'number' ? totalVal : Number(totalVal) || records.length;
  return {
    page: Number(meta?.page ?? meta?.current ?? page) || page,
    size: Number(meta?.size ?? meta?.pageSize ?? size) || size,
    total,
    records,
  };
}

export async function fetchPracticeSequence(params = {}) {
  const { categoryId, page = 1, size = 10 } = params;
  const res = await request({
    url: '/questions/practice/sequence',
    method: 'GET',
    data: { categoryId, page, size },
  });
  const { records: rawList, meta } = pickRecords(res);
  const records = rawList.map((item) => normalizeQuestion(item));
  const totalVal = meta?.total ?? meta?.count ?? records.length;
  const total = typeof totalVal === 'number' ? totalVal : Number(totalVal) || records.length;
  return {
    page: Number(meta?.page ?? meta?.current ?? page) || page,
    size: Number(meta?.size ?? meta?.pageSize ?? size) || size,
    total,
    records,
  };
}

export async function fetchPracticeRandom(params = {}) {
  const { categoryId, difficulty, limit = 5 } = params;
  const res = await request({
    url: '/questions/practice/random',
    method: 'GET',
    data: { categoryId, limit },
  });
  const { records: rawList } = Array.isArray(res) ? { records: res } : pickRecords(res);
  return rawList.map((item) => normalizeQuestion(item));
}
