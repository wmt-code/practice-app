"use strict";
const api_http = require("./http.js");
async function submitAnswer({ questionId, chosen = [], timeSpent = 0 }) {
  if (!questionId) {
    throw new Error("缺少题目 ID");
  }
  const res = await api_http.request({
    url: "/answers/submit",
    method: "POST",
    data: {
      questionId,
      userAnswerValues: chosen,
      timeSpent
    }
  });
  return {
    questionId: res == null ? void 0 : res.questionId,
    questionTitle: res == null ? void 0 : res.questionTitle,
    correct: (res == null ? void 0 : res.correct) === true,
    isCorrect: (res == null ? void 0 : res.correct) === true,
    correctAnswer: (res == null ? void 0 : res.correctAnswer) || [],
    userAnswer: (res == null ? void 0 : res.userAnswer) || [],
    score: (res == null ? void 0 : res.score) || 0,
    timeSpent: (res == null ? void 0 : res.timeSpent) || 0,
    explanation: (res == null ? void 0 : res.explanation) || (res == null ? void 0 : res.analysis) || "暂无解析",
    answeredAt: res == null ? void 0 : res.answeredAt,
    difficulty: res == null ? void 0 : res.difficulty
  };
}
async function fetchAnswerHistory({ page = 1, size = 10, categoryId } = {}) {
  const query = { page, size };
  if (categoryId !== void 0 && categoryId !== null && categoryId !== "") {
    query.categoryId = categoryId;
  }
  const res = await api_http.request({
    url: "/answers/history",
    method: "GET",
    data: query
  });
  const records = Array.isArray(res == null ? void 0 : res.records) ? res.records.map((item) => ({
    questionId: item.questionId,
    categoryId: item.categoryId,
    questionTitle: item.questionTitle,
    correct: item.correct === true,
    isCorrect: item.correct === true,
    userAnswer: item.userAnswer,
    score: item.score || 0,
    timeSpent: item.timeSpent || 0,
    difficulty: item.difficulty,
    answeredAt: item.answeredAt
  })) : [];
  return {
    page: (res == null ? void 0 : res.page) || page,
    size: (res == null ? void 0 : res.size) || size,
    total: (res == null ? void 0 : res.total) || records.length,
    records
  };
}
async function clearAnswerHistory({ categoryId }) {
  if (!categoryId) {
    throw new Error("缺少分类 ID");
  }
  await api_http.request({
    url: `/answers/history/${categoryId}`,
    method: "DELETE"
  });
  return true;
}
exports.clearAnswerHistory = clearAnswerHistory;
exports.fetchAnswerHistory = fetchAnswerHistory;
exports.submitAnswer = submitAnswer;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/answers.js.map
