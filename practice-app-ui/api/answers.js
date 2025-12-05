import { request } from './http';
import { normalizeQuestion } from './questions';

export async function submitAnswer({ questionId, chosen = [], timeSpent = 0 }) {
  if (!questionId) {
    throw new Error('缺少题目 ID');
  }
  const res = await request({
    url: '/answers/submit',
    method: 'POST',
    data: {
      questionId,
      userAnswerValues: chosen,
      timeSpent,
    },
  });
  return {
    questionId: res?.questionId,
    questionTitle: res?.questionTitle,
    correct: res?.correct === true,
    isCorrect: res?.correct === true,
    correctAnswer: res?.correctAnswer || [],
    userAnswer: res?.userAnswer || [],
    score: res?.score || 0,
    timeSpent: res?.timeSpent || 0,
    explanation: res?.explanation || res?.analysis || '暂无解析',
    answeredAt: res?.answeredAt,
    difficulty: res?.difficulty,
  };
}

export async function fetchAnswerHistory({ page = 1, size = 10, categoryId } = {}) {
  const query = { page, size };
  if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
    query.categoryId = categoryId;
  }
  const res = await request({
    url: '/answers/history',
    method: 'GET',
    data: query,
  });
  const records = Array.isArray(res?.records)
    ? res.records.map((item) => ({
        questionId: item.questionId,
        categoryId: item.categoryId,
        questionTitle: item.questionTitle,
        correct: item.correct === true,
        isCorrect: item.correct === true,
        userAnswer: item.userAnswer,
        score: item.score || 0,
        timeSpent: item.timeSpent || 0,
        difficulty: item.difficulty,
        answeredAt: item.answeredAt,
      }))
    : [];
  return {
    page: res?.page || page,
    size: res?.size || size,
    total: res?.total || records.length,
    records,
  };
}

export async function fetchRetryQuestions(ids) {
  const res = await request({
    url: '/user-wrong-answers/retry',
    method: 'POST',
    data: ids && ids.length ? { ids } : {},
  });
  return Array.isArray(res) ? res.map((item) => normalizeQuestion(item)) : [];
}
