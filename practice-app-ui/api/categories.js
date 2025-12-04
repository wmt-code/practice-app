import { request } from './http';

function normalizeNode(node = {}) {
  return {
    id: node.id,
    name: node.name,
    parentId: node.parentId,
    badgeText: node.badgeText,
    questionCount: node.questionCount || 0,
    finishedCount: node.finishedCount || 0,
    children: Array.isArray(node.children)
      ? node.children.map((child) => normalizeNode(child))
      : [],
  };
}

// 简单缓存分类树，减少重复请求导致的等待
let cachedTree = null;
let cachedAt = 0;
let pendingPromise = null;
const CACHE_TTL = 60 * 1000; // 1 分钟

function cloneTree(tree) {
  return JSON.parse(JSON.stringify(tree));
}

export async function fetchCategoryTree(force = false) {
  const now = Date.now();
  if (!force && cachedTree && now - cachedAt < CACHE_TTL) {
    return cloneTree(cachedTree);
  }
  if (!force && pendingPromise) {
    return cloneTree(await pendingPromise);
  }
  pendingPromise = request({ url: '/categories/tree', method: 'GET' }).then((tree) => {
    if (!Array.isArray(tree)) return [];
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

export async function fetchCategories() {
  const list = await request({ url: '/categories', method: 'GET' });
  if (!Array.isArray(list)) return [];
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    parentId: item.parentId,
    badgeText: item.badgeText,
    sort: item.sort,
  }));
}

export function flattenCategoryTree(tree = []) {
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

export function categoryNameById(list = [], id) {
  return list.find((item) => String(item.id) === String(id))?.name || '';
}
