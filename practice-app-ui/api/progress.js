import { request } from './http';

export const emptyProgress = () => ({
  totalQuestions: 0,
  answeredQuestions: 0,
  correctRate: 0,
  correctCount: 0,
  categories: [],
  percent: 0,
});

export async function fetchProgressSummary() {
  const list = await request({ url: '/progress', method: 'GET' });
  if (!Array.isArray(list)) {
    return emptyProgress();
  }
  const totalQuestions = list.reduce((sum, item) => sum + (item.totalQuestions || 0), 0);
  const answeredQuestions = list.reduce((sum, item) => sum + (item.completedQuestions || 0), 0);
  const correctCount = list.reduce((sum, item) => sum + (item.correctCount || 0), 0);
  const categories = list.map((item) => ({
    id: item.categoryId,
    name: item.categoryName,
    total: item.totalQuestions || 0,
    answered: item.completedQuestions || 0,
    correct: item.correctCount || 0,
    correctRate: item.completedQuestions ? Math.round((item.accuracy || 0) * 100) : 0,
  }));
  const percent = totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  const correctRate = answeredQuestions ? Math.round((correctCount / answeredQuestions) * 100) : 0;
  return {
    totalQuestions,
    answeredQuestions,
    correctRate,
    correctCount,
    categories,
    percent,
  };
}

