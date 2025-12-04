import { request } from './http';

export function addFavorite(questionId) {
  if (!questionId) {
    return Promise.reject(new Error('缺少题目 ID'));
  }
  return request({ url: `/user-favorites/${questionId}`, method: 'POST' });
}

export function removeFavorite(questionId) {
  if (!questionId) {
    return Promise.reject(new Error('缺少题目 ID'));
  }
  return request({ url: `/user-favorites/${questionId}`, method: 'DELETE' });
}

export async function fetchFavorites({ page = 1, size = 10 } = {}) {
  const res = await request({
    url: '/user-favorites',
    method: 'GET',
    data: { page, size },
  });
  const records = Array.isArray(res?.records)
    ? res.records.map((item) => ({
        id: item.id,
        questionId: item.questionId,
        questionTitle: item.questionTitle,
        difficulty: item.difficulty,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        createdAt: item.createdAt,
      }))
    : [];
  return {
    page: res?.page || page,
    size: res?.size || size,
    total: res?.total || records.length,
    records,
  };
}
