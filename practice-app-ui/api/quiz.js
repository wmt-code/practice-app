import { request } from './http';
import { normalizeQuestion } from './questions';

export async function fetchAvailableQuizzes() {
  const res = await request({ url: '/quizzes/available', method: 'GET' });
  return Array.isArray(res) ? res : [];
}

export async function fetchQuizPaper(id) {
  if (!id) throw new Error('缺少测验 ID');
  const res = await request({ url: `/quizzes/${id}/paper`, method: 'GET' });
  return {
    ...res,
    questions: Array.isArray(res?.questions) ? res.questions.map((q) => normalizeQuestion(q)) : [],
  };
}

export async function submitQuiz(id, payload = {}) {
  if (!id) throw new Error('缺少测验 ID');
  return request({
    url: `/quizzes/${id}/submit`,
    method: 'POST',
    data: payload,
  });
}

export function fetchQuizStats(id) {
  if (!id) return Promise.reject(new Error('缺少测验 ID'));
  return request({ url: `/quizzes/${id}/stats`, method: 'GET' });
}

export async function fetchMyQuizRecords({ page = 1, size = 10 } = {}) {
  const res = await request({
    url: '/user-quiz-record/my',
    method: 'GET',
    data: { page, size },
  });
  const records = Array.isArray(res?.records) ? res.records : [];
  return {
    page: res?.page || page,
    size: res?.size || size,
    total: res?.total || records.length,
    records,
  };
}

export async function fetchQuizRank(quizId, { page = 1, size = 10 } = {}) {
  const res = await request({
    url: `/user-quiz-record/${quizId}/rank`,
    method: 'GET',
    data: { page, size },
  });
  const records = Array.isArray(res?.records) ? res.records : [];
  return {
    page: res?.page || page,
    size: res?.size || size,
    total: res?.total || records.length,
    records,
  };
}
