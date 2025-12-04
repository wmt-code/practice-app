"use strict";
const api_http = require("./http.js");
function normalizeOptions(raw) {
  if (!raw)
    return [];
  if (Array.isArray(raw)) {
    return raw.map((opt, idx) => ({
      value: opt.value || String.fromCharCode(65 + idx),
      text: opt.label || opt.text || opt.value || "",
      label: opt.label || opt.text || opt.value || "",
      correct: opt.correct
    }));
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return normalizeOptions(parsed);
    } catch (err) {
      return [];
    }
  }
  return [];
}
function normalizeQuestion(data = {}) {
  const typeRaw = String(data.type || "").toLowerCase();
  let type = data.type;
  if (typeRaw.includes("multiple"))
    type = "multiple";
  else if (typeRaw.includes("true") || typeRaw.includes("judge"))
    type = "truefalse";
  else if (typeRaw.includes("fill") || typeRaw.includes("short"))
    type = "short";
  else if (typeRaw.includes("single"))
    type = "single";
  return {
    id: data.id,
    title: data.content || data.title || "",
    type,
    options: normalizeOptions(data.options || data.optionsJson),
    score: data.score || 0,
    duration: data.duration || 0,
    explanation: data.explanation,
    categoryId: data.categoryId,
    difficulty: data.difficulty,
    answer: typeof data.answer === "string" ? data.answer.split(/[,;\s]+/).filter(Boolean) : Array.isArray(data.answer) ? data.answer : []
  };
}
async function fetchQuestionDetail(id) {
  const res = await api_http.request({ url: `/questions/${id}`, method: "GET" });
  return normalizeQuestion(res);
}
async function fetchPracticeSequence(params = {}) {
  const { categoryId, difficulty, page = 1, size = 10 } = params;
  const res = await api_http.request({
    url: "/questions/practice/sequence",
    method: "GET",
    data: { categoryId, difficulty, page, size }
  });
  const records = Array.isArray(res == null ? void 0 : res.records) ? res.records.map((item) => normalizeQuestion(item)) : [];
  return {
    page: (res == null ? void 0 : res.page) || page,
    size: (res == null ? void 0 : res.size) || size,
    total: (res == null ? void 0 : res.total) || records.length,
    records
  };
}
async function fetchPracticeRandom(params = {}) {
  const { categoryId, difficulty, limit = 5 } = params;
  const res = await api_http.request({
    url: "/questions/practice/random",
    method: "GET",
    data: { categoryId, difficulty, limit }
  });
  return Array.isArray(res) ? res.map((item) => normalizeQuestion(item)) : [];
}
exports.fetchPracticeRandom = fetchPracticeRandom;
exports.fetchPracticeSequence = fetchPracticeSequence;
exports.fetchQuestionDetail = fetchQuestionDetail;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/questions.js.map
