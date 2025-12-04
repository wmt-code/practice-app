"use strict";
const api_http = require("./http.js");
function addFavorite(questionId) {
  if (!questionId) {
    return Promise.reject(new Error("缺少题目 ID"));
  }
  return api_http.request({ url: `/user-favorites/${questionId}`, method: "POST" });
}
function removeFavorite(questionId) {
  if (!questionId) {
    return Promise.reject(new Error("缺少题目 ID"));
  }
  return api_http.request({ url: `/user-favorites/${questionId}`, method: "DELETE" });
}
async function fetchFavorites({ page = 1, size = 10 } = {}) {
  const res = await api_http.request({
    url: "/user-favorites",
    method: "GET",
    data: { page, size }
  });
  const records = Array.isArray(res == null ? void 0 : res.records) ? res.records.map((item) => ({
    id: item.id,
    questionId: item.questionId,
    questionTitle: item.questionTitle,
    difficulty: item.difficulty,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    createdAt: item.createdAt
  })) : [];
  return {
    page: (res == null ? void 0 : res.page) || page,
    size: (res == null ? void 0 : res.size) || size,
    total: (res == null ? void 0 : res.total) || records.length,
    records
  };
}
exports.addFavorite = addFavorite;
exports.fetchFavorites = fetchFavorites;
exports.removeFavorite = removeFavorite;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/favorites.js.map
