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

export async function fetchCategoryTree() {
  const tree = await request({ url: '/categories/tree', method: 'GET' });
  if (!Array.isArray(tree)) return [];
  return tree.map((item) => normalizeNode(item));
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
