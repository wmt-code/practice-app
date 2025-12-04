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
async function fetchCategoryTree() {
  const tree = await api_http.request({ url: "/categories/tree", method: "GET" });
  if (!Array.isArray(tree))
    return [];
  return tree.map((item) => normalizeNode(item));
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
exports.fetchCategories = fetchCategories;
exports.fetchCategoryTree = fetchCategoryTree;
exports.flattenCategoryTree = flattenCategoryTree;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/categories.js.map
