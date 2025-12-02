const STORAGE_KEYS = {
  user: 'practice_app_user',
  records: 'practice_app_records',
};

const categories = [
  { id: 'base', name: '基础知识', color: '#2563eb' },
  { id: 'logic', name: '算法与逻辑', color: '#f97316' },
  { id: 'prog', name: '编程实践', color: '#10b981' },
  { id: 'db', name: '数据库', color: '#0ea5e9' },
];

const questions = [
  {
    id: 'q1',
    categoryId: 'base',
    type: 'single',
    title: 'HTTP 状态码 200 的含义是？',
    options: [
      { value: 'A', text: '客户端请求出错' },
      { value: 'B', text: '请求成功，服务器已返回资源' },
      { value: 'C', text: '服务器内部错误' },
      { value: 'D', text: '需要用户认证' },
    ],
    answer: ['B'],
    score: 2,
    duration: 30,
    explanation: '2xx 表示成功，200 OK 意味着请求成功并返回期望的响应体。',
  },
  {
    id: 'q2',
    categoryId: 'base',
    type: 'truefalse',
    title: 'Java 是解释型语言。',
    options: [
      { value: 'T', text: '正确' },
      { value: 'F', text: '错误' },
    ],
    answer: ['F'],
    score: 1,
    duration: 15,
    explanation: 'Java 源码会被编译成字节码，运行时由 JVM 解释或 JIT 编译执行。',
  },
  {
    id: 'q3',
    categoryId: 'logic',
    type: 'multiple',
    title: '以下哪些时间复杂度更低？（多选）',
    options: [
      { value: 'A', text: 'O(n log n)' },
      { value: 'B', text: 'O(1)' },
      { value: 'C', text: 'O(n^2)' },
      { value: 'D', text: 'O(log n)' },
    ],
    answer: ['A', 'B', 'D'],
    score: 3,
    duration: 45,
    explanation: '从低到高依次是 O(1) < O(log n) < O(n log n) < O(n^2)。',
  },
  {
    id: 'q4',
    categoryId: 'prog',
    type: 'single',
    title: 'Spring Boot 里通过哪种方式配置服务器端口？',
    options: [
      { value: 'A', text: '修改 pom.xml' },
      { value: 'B', text: '在 application.yml 配置 server.port' },
      { value: 'C', text: '在代码里调用 System.setProperty' },
      { value: 'D', text: '无法自定义端口' },
    ],
    answer: ['B'],
    score: 2,
    duration: 25,
    explanation: '推荐在 application.yml 或 application.properties 中配置 server.port。',
  },
  {
    id: 'q5',
    categoryId: 'prog',
    type: 'multiple',
    title: 'Lombok 的 @Data 注解会自动生成以下哪些内容？',
    options: [
      { value: 'A', text: 'Getter/Setter 方法' },
      { value: 'B', text: 'toString 方法' },
      { value: 'C', text: '构造函数' },
      { value: 'D', text: 'hashCode 和 equals 方法' },
    ],
    answer: ['A', 'B', 'D'],
    score: 3,
    duration: 35,
    explanation: '@Data 组合了 Getter/Setter、toString、equals、hashCode 以及 RequiredArgsConstructor。',
    typeMeta: '多项正确',
  },
  {
    id: 'q6',
    categoryId: 'db',
    type: 'single',
    title: '下列哪个 SQL 可以统计表中记录总数？',
    options: [
      { value: 'A', text: 'SELECT COUNT(*) FROM table;' },
      { value: 'B', text: 'SELECT SUM(*) FROM table;' },
      { value: 'C', text: 'SELECT TOTAL(*) FROM table;' },
      { value: 'D', text: 'SELECT LENGTH(*) FROM table;' },
    ],
    answer: ['A'],
    score: 2,
    duration: 20,
    explanation: 'COUNT(*) 用于统计结果集中行数。',
  },
  {
    id: 'q7',
    categoryId: 'db',
    type: 'multiple',
    title: '关于数据库事务隔离级别，以下正确的是？（多选）',
    options: [
      { value: 'A', text: 'READ UNCOMMITTED 可能出现脏读' },
      { value: 'B', text: 'READ COMMITTED 能避免脏读但可能出现不可重复读' },
      { value: 'C', text: 'REPEATABLE READ 能避免不可重复读和幻读' },
      { value: 'D', text: 'SERIALIZABLE 能避免幻读但并发性最低' },
    ],
    answer: ['A', 'B', 'D'],
    score: 4,
    duration: 50,
    explanation:
      'MySQL InnoDB 在 REPEATABLE READ 下通过 MVCC 与间隙锁也能避免大部分幻读，但标准定义下 SERIALIZABLE 最严格。',
  },
  {
    id: 'q8',
    categoryId: 'logic',
    type: 'truefalse',
    title: '队列（Queue）遵循先进先出（FIFO）的访问方式。',
    options: [
      { value: 'T', text: '正确' },
      { value: 'F', text: '错误' },
    ],
    answer: ['T'],
    score: 1,
    duration: 10,
    explanation: '队列是一种典型的 FIFO 线性表，与栈的 LIFO 相对应。',
  },
];

const hasUni = typeof uni !== 'undefined';
const questionMap = new Map(questions.map((q) => [q.id, q]));

const initialUser = {
  id: 'guest',
  nickname: '未登录',
  avatar: '/static/uni.png',
  points: 0,
  loggedIn: false,
};

let state = {
  user: initialUser,
  records: [],
};

loadState();

function loadState() {
  if (!hasUni) return;
  try {
    const storedUser = uni.getStorageSync(STORAGE_KEYS.user);
    const storedRecords = uni.getStorageSync(STORAGE_KEYS.records);
    if (storedUser) {
      state.user = { ...initialUser, ...storedUser };
    }
    if (Array.isArray(storedRecords)) {
      state.records = storedRecords;
    }
  } catch (err) {
    console.warn('读取本地缓存失败', err);
  }
}

function persist() {
  if (!hasUni) return;
  try {
    uni.setStorageSync(STORAGE_KEYS.user, state.user);
    uni.setStorageSync(STORAGE_KEYS.records, state.records);
  } catch (err) {
    console.warn('保存本地缓存失败', err);
  }
}

function normalizeAnswer(answer = []) {
  return [...answer].sort().join('|');
}

function buildProgress() {
  const totalQuestions = questions.length;
  const answeredQuestions = new Set(state.records.map((r) => r.questionId)).size;
  const correctCount = state.records.filter((r) => r.isCorrect).length;
  const attemptCount = state.records.length;
  const correctRate = attemptCount ? Math.round((correctCount / attemptCount) * 100) : 0;

  const categoriesProgress = categories.map((cat) => {
    const catQuestions = questions.filter((q) => q.categoryId === cat.id);
    const catRecords = state.records.filter((r) =>
      catQuestions.some((q) => q.id === r.questionId),
    );
    const catCorrect = catRecords.filter((r) => r.isCorrect).length;
    return {
      ...cat,
      total: catQuestions.length,
      answered: catRecords.length,
      correct: catCorrect,
      correctRate: catRecords.length
        ? Math.round((catCorrect / catRecords.length) * 100)
        : 0,
    };
  });

  return {
    totalQuestions,
    answeredQuestions,
    correctCount,
    correctRate,
    points: state.user.points,
    categories: categoriesProgress,
    percent: totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
  };
}

function delay(data, ms = 120) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function fetchCurrentUser() {
  loadState();
  return delay({ ...state.user });
}

export async function loginWithWeixin(profile = {}) {
  const nickname = profile.nickName || profile.nickname || '微信用户';
  const avatar = profile.avatarUrl || profile.avatar || '/static/uni.png';
  state.user = {
    ...state.user,
    id: `wx-${Date.now()}`,
    nickname,
    avatar,
    points: Math.max(state.user.points, 10),
    loggedIn: true,
  };
  persist();
  return delay({ ...state.user });
}

export async function updateUserProfile(payload = {}) {
  state.user = {
    ...state.user,
    nickname: payload.nickname || state.user.nickname,
    avatar: payload.avatar || state.user.avatar,
    points: state.user.points + 1,
  };
  persist();
  return delay({ ...state.user });
}

export async function fetchCategories() {
  return delay([...categories]);
}

export async function fetchQuestions(params = {}) {
  const { categoryId, keyword } = params;
  const list = questions.filter((q) => {
    const hitCategory = categoryId ? q.categoryId === categoryId : true;
    const hitKeyword = keyword
      ? q.title.toLowerCase().includes(keyword.toLowerCase())
      : true;
    return hitCategory && hitKeyword;
  });
  return delay(list);
}

export async function fetchQuestionDetail(id) {
  const question = questionMap.get(id);
  return delay({ ...question });
}

export async function submitAnswer({ questionId, chosen = [], spentSeconds = 20 }) {
  const question = questionMap.get(questionId);
  if (!question) {
    throw new Error('题目不存在');
  }
  const isCorrect = normalizeAnswer(chosen) === normalizeAnswer(question.answer);
  const record = {
    id: `rec-${Date.now()}`,
    questionId,
    chosen,
    isCorrect,
    score: isCorrect ? question.score : 0,
    spentSeconds,
    answeredAt: new Date().toISOString(),
  };
  state.records.unshift(record);
  state.user.points += isCorrect ? 3 : 1;
  persist();
  return delay({
    isCorrect,
    correctAnswer: question.answer,
    explanation: question.explanation,
    record,
    progress: buildProgress(),
  });
}

export async function fetchRecords() {
  loadState();
  const mapped = state.records.map((r) => ({
    ...r,
    question: questionMap.get(r.questionId),
  }));
  return delay(mapped);
}

export async function fetchProgress() {
  loadState();
  return delay(buildProgress());
}

export async function fetchRecommendedQuestions(limit = 3) {
  const answered = new Set(state.records.map((r) => r.questionId));
  const candidates = questions.filter((q) => !answered.has(q.id));
  const pick = candidates.slice(0, limit);
  return delay(pick.length ? pick : questions.slice(0, limit));
}

export function resetMock() {
  state = { user: initialUser, records: [] };
  persist();
}
