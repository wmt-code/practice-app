"use strict";
const api_http = require("./http.js");
function normalizeNode(node = {}) {
  return {
    id: node.id,
    name: node.name,
    parentId: node.parentId,
    badgeText: node.badgeText,
    questionCount: node.questionCount || 0,
    finishedCount: node.finishedCount || 0,
    children: Array.isArray(node.children) ? node.children.map((child) => normalizeNode(child)) : []
  };
}
let cachedTree = null;
let cachedAt = 0;
let pendingPromise = null;
const CACHE_TTL = 60 * 1e3;
function cloneTree(tree) {
  return JSON.parse(JSON.stringify(tree));
}
async function fetchCategoryTree(force = false) {
  const now = Date.now();
  if (!force && cachedTree && now - cachedAt < CACHE_TTL) {
    return cloneTree(cachedTree);
  }
  if (!force && pendingPromise) {
    return cloneTree(await pendingPromise);
  }
  pendingPromise = api_http.request({ url: "/categories/tree", method: "GET" }).then((tree) => {
    if (!Array.isArray(tree))
      return [];
    const normalized = tree.map((item) => normalizeNode(item));
    cachedTree = normalized;
    cachedAt = Date.now();
    return normalized;
  }).finally(() => {
    pendingPromise = null;
  });
  const result = await pendingPromise;
  return cloneTree(result);
}
async function fetchCategories() {
  const list = await api_http.request({ url: "/categories", method: "GET" });
  if (!Array.isArray(list))
    return [];
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    parentId: item.parentId,
    badgeText: item.badgeText,
    sort: item.sort
  }));
}
async function createCategory(payload) {
  return api_http.request({ url: "/categories", method: "POST", data: payload });
}
async function updateCategory(id, payload) {
  if (!id)
    throw new Error("缺少分类ID");
  return api_http.request({ url: `/categories/${id}`, method: "PUT", data: payload });
}
async function deleteCategory(id) {
  if (!id)
    throw new Error("缺少分类ID");
  return api_http.request({ url: `/categories/${id}`, method: "DELETE" });
}
function flattenCategoryTree(tree = []) {
  const result = [];
  const walk = (nodes) => {
    (nodes || []).forEach((node) => {
      result.push(node);
      if (node.children && node.children.length) {
        walk(node.children);
      }
    });
  };
  walk(tree);
  return result;
}
function categoryNameById(list = [], id) {
  var _a;
  return ((_a = list.find((item) => String(item.id) === String(id))) == null ? void 0 : _a.name) || "";
}
exports.categoryNameById = categoryNameById;
exports.createCategory = createCategory;
exports.deleteCategory = deleteCategory;
exports.fetchCategories = fetchCategories;
exports.fetchCategoryTree = fetchCategoryTree;
exports.flattenCategoryTree = flattenCategoryTree;
exports.updateCategory = updateCategory;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/categories.js.map
