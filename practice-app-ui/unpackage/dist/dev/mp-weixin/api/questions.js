"use strict";
const api_http = require("./http.js");
function pickRecords(payload) {
  var _a, _b;
  const data = payload && typeof payload === "object" ? payload : {};
  if (Array.isArray(data.records))
    return { records: data.records, meta: data };
  if (Array.isArray(data.list))
    return { records: data.list, meta: data };
  if (Array.isArray((_a = data.data) == null ? void 0 : _a.records))
    return { records: data.data.records, meta: data.data };
  if (Array.isArray((_b = data.data) == null ? void 0 : _b.list))
    return { records: data.data.list, meta: data.data };
  return { records: [], meta: data };
}
function legacyOptionsFromObject(data = {}) {
  const list = [];
  const choiceKeys = ["A", "B", "C", "D", "E", "F"];
  choiceKeys.forEach((letter) => {
    const val = data[`option${letter}`] || data[`option${letter.toLowerCase()}`];
    if (val) {
      list.push({ value: letter, text: val, label: val });
    }
  });
  if (list.length)
    return list;
  const tVal = data.optionTrue || data.optionT;
  const fVal = data.optionFalse || data.optionF;
  if (tVal || fVal) {
    return [
      { value: "T", text: tVal || "正确", label: tVal || "正确" },
      { value: "F", text: fVal || "错误", label: fVal || "错误" }
    ];
  }
  return [];
}
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
  let options = normalizeOptions(data.options || data.optionsJson);
  if (!options.length) {
    options = legacyOptionsFromObject(data);
  }
  if ((!options || options.length === 0) && type === "truefalse") {
    options = [
      { value: "T", text: "正确", label: "正确" },
      { value: "F", text: "错误", label: "错误" }
    ];
  }
  return {
    id: data.id,
    title: data.content || data.title || "",
    type,
    options,
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
  const { categoryId, page = 1, size = 10 } = params;
  const res = await api_http.request({
    url: "/questions/practice/sequence",
    method: "GET",
    data: { categoryId, page, size }
  });
  const { records: rawList, meta } = pickRecords(res);
  const records = rawList.map((item) => normalizeQuestion(item));
  const totalVal = (meta == null ? void 0 : meta.total) ?? (meta == null ? void 0 : meta.count) ?? records.length;
  const total = typeof totalVal === "number" ? totalVal : Number(totalVal) || records.length;
  return {
    page: Number((meta == null ? void 0 : meta.page) ?? (meta == null ? void 0 : meta.current) ?? page) || page,
    size: Number((meta == null ? void 0 : meta.size) ?? (meta == null ? void 0 : meta.pageSize) ?? size) || size,
    total,
    records
  };
}
async function fetchPracticeRandom(params = {}) {
  const { categoryId, difficulty, limit = 5 } = params;
  const res = await api_http.request({
    url: "/questions/practice/random",
    method: "GET",
    data: { categoryId, limit }
  });
  const { records: rawList } = Array.isArray(res) ? { records: res } : pickRecords(res);
  return rawList.map((item) => normalizeQuestion(item));
}
exports.fetchPracticeRandom = fetchPracticeRandom;
exports.fetchPracticeSequence = fetchPracticeSequence;
exports.fetchQuestionDetail = fetchQuestionDetail;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/questions.js.map
