import { request } from './http';
import { normalizeQuestion } from './questions';

export async function fetchWrongList({ page = 1, size = 10 } = {}) {
  const res = await request({
    url: '/user-wrong-answers',
    method: 'GET',
    data: { page, size },
  });
  const records = Array.isArray(res?.records)
    ? res.records.map((item) => ({
        wrongId: item.wrongId,
        questionId: item.questionId,
        questionTitle: item.questionTitle,
        difficulty: item.difficulty,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        userAnswer: item.userAnswer,
        correctAnswer: item.correctAnswer,
        wrongCount: item.wrongCount || 0,
        lastAttemptedAt: item.lastAttemptedAt,
      }))
    : [];
  return {
    page: res?.page || page,
    size: res?.size || size,
    total: res?.total || records.length,
    records,
  };
}

export async function retryWrongQuestions(ids) {
  const res = await request({
    url: '/user-wrong-answers/retry',
    method: 'POST',
    data: ids && ids.length ? { ids } : {},
  });
  return Array.isArray(res) ? res.map((item) => normalizeQuestion(item)) : [];
}

export function clearWrongQuestions(categoryId) {
  return request({
    url: '/user-wrong-answers/clear',
    method: 'DELETE',
    data: categoryId ? { categoryId } : {},
  });
}
