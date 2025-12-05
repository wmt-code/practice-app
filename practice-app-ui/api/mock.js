const STORAGE_KEYS = {
  user: 'practice_app_user',
  records: 'practice_app_records',
};

const categoryTree = [
  {
    id: 'database',
    name: '数据库',
    children: [
      {
        id: 'mysql',
        name: 'MySQL',
        badge: '更新',
        updatedAt: '2025-05-30',
        description: 'InnoDB 事务、索引与性能调优',
        questionCount: 4,
      },
      {
        id: 'postgres',
        name: 'PostgreSQL',
        updatedAt: '2025-05-21',
        description: 'JSONB、并发控制与查询计划',
        questionCount: 3,
      },
      {
        id: 'redis',
        name: 'Redis',
        updatedAt: '2025-05-12',
        description: '持久化、集群与缓存模式',
        questionCount: 3,
      },
    ],
  },
  {
    id: 'backend',
    name: '后端开发',
    children: [
      {
        id: 'spring',
        name: 'Spring Boot',
        updatedAt: '2025-05-02',
        description: '启动参数、配置与观测性',
        questionCount: 3,
      },
      {
        id: 'java',
        name: 'Java 核心',
        updatedAt: '2025-04-26',
        description: '集合、并发与内存模型基础',
        questionCount: 3,
      },
    ],
  },
  {
    id: 'ops',
    name: '运维与云原生',
    children: [
      {
        id: 'k8s',
        name: 'Kubernetes',
        updatedAt: '2025-05-16',
        description: 'Pod 调度、健康检查与滚动发布',
        questionCount: 2,
      },
      {
        id: 'observability',
        name: '可观测性',
        updatedAt: '2025-04-30',
        description: '日志、指标、分布式追踪组合',
        questionCount: 2,
      },
    ],
  },
];

const categories = categoryTree.flatMap((parent) =>
  parent.children.map((child, index) => ({
    ...child,
    parentId: parent.id,
    parentName: parent.name,
    order: index,
  })),
);

const questions = [
  {
    id: 'mysql-transaction-level',
    categoryId: 'mysql',
    type: 'single',
    title: 'InnoDB 的默认事务隔离级别是？',
    options: [
      { value: 'A', text: 'READ UNCOMMITTED' },
      { value: 'B', text: 'READ COMMITTED' },
      { value: 'C', text: 'REPEATABLE READ' },
      { value: 'D', text: 'SERIALIZABLE' },
    ],
    answer: ['C'],
    score: 2,
    duration: 25,
    explanation: 'MySQL InnoDB 默认使用 REPEATABLE READ，并结合间隙锁避免幻读。',
  },
  {
    id: 'mysql-covering-index',
    categoryId: 'mysql',
    type: 'truefalse',
    title: '使用覆盖索引可以减少回表，从而降低 I/O。',
    options: [
      { value: 'T', text: '正确' },
      { value: 'F', text: '错误' },
    ],
    answer: ['T'],
    score: 1,
    duration: 15,
    explanation: '覆盖索引直接在二级索引页即可获取需要的列，避免回表读取聚簇索引数据页。',
  },
  {
    id: 'mysql-lock',
    categoryId: 'mysql',
    type: 'multiple',
    title: '以下哪些属于 InnoDB 行级锁？（多选）',
    options: [
      { value: 'A', text: '记录锁（Record Lock）' },
      { value: 'B', text: '间隙锁（Gap Lock）' },
      { value: 'C', text: '临键锁（Next-Key Lock）' },
      { value: 'D', text: '元数据锁（MDL）' },
    ],
    answer: ['A', 'B', 'C'],
    score: 3,
    duration: 40,
    explanation: 'MDL 属于表级锁。行级锁组合为记录锁、间隙锁和临键锁（记录锁+间隙锁）。',
  },
  {
    id: 'mysql-slowlog',
    categoryId: 'mysql',
    type: 'single',
    title: '定位 MySQL 慢查询首选的内置工具是？',
    options: [
      { value: 'A', text: '慢查询日志 (slow log)' },
      { value: 'B', text: 'SHOW ENGINE INNODB STATUS' },
      { value: 'C', text: 'performance_schema events_statements' },
      { value: 'D', text: 'EXPLAIN FORMAT=JSON' },
    ],
    answer: ['A'],
    score: 2,
    duration: 20,
    explanation: '慢查询日志记录执行时间超过阈值的 SQL，通常是定位慢 SQL 的第一步。',
  },
  {
    id: 'postgres-jsonb',
    categoryId: 'postgres',
    type: 'single',
    title: '使用 JSONB 类型时，如果频繁按键查询，推荐的索引是？',
    options: [
      { value: 'A', text: 'GIN 索引' },
      { value: 'B', text: 'BTREE 索引' },
      { value: 'C', text: 'HASH 索引' },
      { value: 'D', text: 'BRIN 索引' },
    ],
    answer: ['A'],
    score: 2,
    duration: 25,
    explanation: 'JSONB + GIN 支持键/值/路径的高效匹配，常用在文档型查询。',
  },
  {
    id: 'postgres-vacuum',
    categoryId: 'postgres',
    type: 'truefalse',
    title: 'PostgreSQL 依靠 autovacuum 清理过期版本，避免表膨胀。',
    options: [
      { value: 'T', text: '正确' },
      { value: 'F', text: '错误' },
    ],
    answer: ['T'],
    score: 1,
    duration: 15,
    explanation: 'MVCC 会产生死元组，autovacuum 与手工 VACUUM/ANALYZE 用于清理和收集统计信息。',
  },
  {
    id: 'postgres-concurrency',
    categoryId: 'postgres',
    type: 'multiple',
    title: '以下哪些方式可以减少 PostgreSQL 死锁概率？（多选）',
    options: [
      { value: 'A', text: '固定锁顺序访问资源' },
      { value: 'B', text: '缩短事务时间' },
      { value: 'C', text: '把大事务拆分为小事务' },
      { value: 'D', text: '关闭 autovacuum' },
    ],
    answer: ['A', 'B', 'C'],
    score: 3,
    duration: 35,
    explanation: '统一锁顺序和缩短事务时间有助于减少死锁，关闭 autovacuum 反而会增加膨胀风险。',
  },
  {
    id: 'redis-persistence',
    categoryId: 'redis',
    type: 'single',
    title: 'Redis 持久化中，以下哪项描述正确？',
    options: [
      { value: 'A', text: 'AOF 默认每条命令立刻 fsync' },
      { value: 'B', text: 'RDB 适合高频持久化' },
      { value: 'C', text: 'AOF 支持追加重写降低文件体积' },
      { value: 'D', text: '开启持久化会关闭主从复制' },
    ],
    answer: ['C'],
    score: 2,
    duration: 20,
    explanation: 'AOF 提供 always/everysec/no 三种 fsync 策略，并支持 rewrite 合并指令。',
  },
  {
    id: 'redis-cluster-slot',
    categoryId: 'redis',
    type: 'multiple',
    title: '关于 Redis Cluster 哈希槽，以下正确的有？（多选）',
    options: [
      { value: 'A', text: '共 16384 个槽位' },
      { value: 'B', text: '键通过 CRC16 取模映射槽位' },
      { value: 'C', text: '槽位只能由主节点持有' },
      { value: 'D', text: '从节点也持有槽位并可读写' },
    ],
    answer: ['A', 'B', 'C'],
    score: 3,
    duration: 40,
    explanation: '槽位仅由主节点分配，从节点复制对应主节点数据用于容灾，通常只读。',
  },
  {
    id: 'redis-hotkey',
    categoryId: 'redis',
    type: 'truefalse',
    title: '在高并发场景下，热点 Key 会导致单实例压力集中。',
    options: [
      { value: 'T', text: '正确' },
      { value: 'F', text: '错误' },
    ],
    answer: ['T'],
    score: 1,
    duration: 12,
    explanation: '热点 Key 会放大单实例的网络与 CPU 压力，常用本地缓存、拆 Key 或多级缓存缓解。',
  },
  {
    id: 'spring-port',
    categoryId: 'spring',
    type: 'single',
    title: 'Spring Boot 项目修改启动端口的推荐方式是？',
    options: [
      { value: 'A', text: '修改 pom.xml' },
      { value: 'B', text: '在 application.yml 中配置 server.port' },
      { value: 'C', text: '在代码里调用 System.setProperty' },
      { value: 'D', text: '无法自定义端口' },
    ],
    answer: ['B'],
    score: 2,
    duration: 18,
    explanation: '通过 application.yml/properties 配置 server.port 是最常见且可管理的方式。',
  },
  {
    id: 'spring-actuator',
    categoryId: 'spring',
    type: 'truefalse',
    title: 'Spring Boot Actuator 可以暴露健康检查与指标。',
    options: [
      { value: 'T', text: '正确' },
      { value: 'F', text: '错误' },
    ],
    answer: ['T'],
    score: 1,
    duration: 12,
    explanation: '引入 actuator 依赖并开启相应端点后，可获取 /health、/info、/metrics 等观测数据。',
  },
  {
    id: 'spring-profile',
    categoryId: 'spring',
    type: 'multiple',
    title: '关于 Spring Profile，以下描述正确的是？（多选）',
    options: [
      { value: 'A', text: '可以为不同环境加载不同配置文件' },
      { value: 'B', text: '支持通过 --spring.profiles.active 指定' },
      { value: 'C', text: '默认 Profile 名称为 prod' },
      { value: 'D', text: '可以在代码中使用 @Profile 控制 Bean 装配' },
    ],
    answer: ['A', 'B', 'D'],
    score: 3,
    duration: 30,
    explanation: '默认 Profile 为空，@Profile 可按环境加载 Bean，命令行参数可覆盖配置。',
  },
  {
    id: 'java-collection',
    categoryId: 'java',
    type: 'single',
    title: '下列哪个集合是线程安全的？',
    options: [
      { value: 'A', text: 'ArrayList' },
      { value: 'B', text: 'HashMap' },
      { value: 'C', text: 'ConcurrentHashMap' },
      { value: 'D', text: 'LinkedList' },
    ],
    answer: ['C'],
    score: 2,
    duration: 20,
    explanation: 'ConcurrentHashMap 通过分段或 CAS 提供线程安全，其他选项为非线程安全实现。',
  },
  {
    id: 'java-jmm',
    categoryId: 'java',
    type: 'multiple',
    title: 'Java 内存模型中，以下哪些操作属于原子性保证？（多选）',
    options: [
      { value: 'A', text: '读取和写入引用变量' },
      { value: 'B', text: 'long 和 double 的非 volatile 写入' },
      { value: 'C', text: 'volatile 变量的读写' },
      { value: 'D', text: 'i++ 自增操作' },
    ],
    answer: ['A', 'C'],
    score: 3,
    duration: 32,
    explanation: '引用和除 long/double 外的基本类型读写是原子性的，volatile 读写也具备原子性；i++ 涉及多步操作。',
  },
  {
    id: 'java-thread-pool',
    categoryId: 'java',
    type: 'truefalse',
    title: 'FixedThreadPool 默认使用有界队列，可能导致任务堆积。',
    options: [
      { value: 'T', text: '正确' },
      { value: 'F', text: '错误' },
    ],
    answer: ['T'],
    score: 1,
    duration: 14,
    explanation: 'FixedThreadPool 采用无界 LinkedBlockingQueue，线程数固定，任务多时会堆积占用内存。',
  },
  {
    id: 'k8s-liveness',
    categoryId: 'k8s',
    type: 'single',
    title: 'Kubernetes 中用于判断 Pod 是否需要重启的探针是？',
    options: [
      { value: 'A', text: 'livenessProbe' },
      { value: 'B', text: 'readinessProbe' },
      { value: 'C', text: 'startupProbe' },
      { value: 'D', text: 'volumeProbe' },
    ],
    answer: ['A'],
    score: 2,
    duration: 18,
    explanation: 'livenessProbe 失败会导致容器重启，readiness 影响流量转发，startup 用于延迟检测。',
  },
  {
    id: 'k8s-rolling',
    categoryId: 'k8s',
    type: 'truefalse',
    title: 'RollingUpdate 策略可以通过 maxUnavailable 控制一次下线的副本数量。',
    options: [
      { value: 'T', text: '正确' },
      { value: 'F', text: '错误' },
    ],
    answer: ['T'],
    score: 1,
    duration: 14,
    explanation: 'maxUnavailable、maxSurge 共同决定滚动发布时的下线与额外副本数。',
  },
  {
    id: 'observability-logs',
    categoryId: 'observability',
    type: 'single',
    title: '下列哪项做法最利于日志可观测性？',
    options: [
      { value: 'A', text: '应用内打印结构化 JSON 日志' },
      { value: 'B', text: '随意打印文本日志' },
      { value: 'C', text: '只在本地保存日志文件' },
      { value: 'D', text: '完全不打印日志' },
    ],
    answer: ['A'],
    score: 2,
    duration: 16,
    explanation: '结构化日志便于集中收集和检索，是现代可观测性的基础。',
  },
  {
    id: 'observability-trace',
    categoryId: 'observability',
    type: 'multiple',
    title: '分布式追踪的核心标识包括？（多选）',
    options: [
      { value: 'A', text: 'traceId' },
      { value: 'B', text: 'spanId' },
      { value: 'C', text: 'parentSpanId' },
      { value: 'D', text: 'userAgent' },
    ],
    answer: ['A', 'B', 'C'],
    score: 3,
    duration: 28,
    explanation: 'traceId 标识整条链路，spanId 与 parentSpanId 表示当前跨度及父跨度关系。',
  },
];

const hasUni = typeof uni !== 'undefined';
const questionMap = new Map(questions.map((q) => [q.id, q]));

const initialUser = {
  id: 'guest',
  nickname: '未登录',
  avatar: '/static/uni.png',
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

function shuffle(list = []) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
  };
  persist();
  return delay({ ...state.user });
}

export async function fetchCategoryTree() {
  return delay(categoryTree.map((item) => ({ ...item, children: [...item.children] })));
}

export async function fetchCategories() {
  return delay([...categories]);
}

export async function fetchSubCategories(parentId) {
  if (!parentId) return delay([...categories]);
  return delay(categories.filter((c) => c.parentId === parentId));
}

export async function fetchCategoryDetail(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return delay(null);
  const relatedQuestions = questions.filter((q) => q.categoryId === categoryId);
  const answeredIds = new Set(
    state.records.filter((r) => relatedQuestions.some((q) => q.id === r.questionId)).map((r) => r.questionId),
  );
  return delay({
    ...category,
    total: relatedQuestions.length,
    answered: answeredIds.size,
    lastUpdated: category.updatedAt,
  });
}

export async function fetchQuestions(params = {}) {
  const { categoryId, keyword } = params;
  const list = questions.filter((q) => {
    const hitCategory = categoryId ? q.categoryId === categoryId : true;
    const hitKeyword = keyword
      ? q.title.toLowerCase().includes(String(keyword).toLowerCase())
      : true;
    return hitCategory && hitKeyword;
  });
  return delay(list);
}

export async function fetchQuestionDetail(id) {
  const question = questionMap.get(id);
  return delay(question ? { ...question } : null);
}

export async function startPracticeSession({ categoryId, mode = 'order', count } = {}) {
  const base = questions.filter((q) => q.categoryId === categoryId);
  const ordered = mode === 'order' ? base : shuffle(base);
  const limited =
    typeof count === 'number' && count > 0 ? ordered.slice(0, Math.min(count, ordered.length)) : ordered;
  const category = categories.find((c) => c.id === categoryId);
  const parent = categoryTree.find((c) => c.id === category?.parentId);
  return delay({
    questions: limited.map((q) => ({ ...q })),
    total: limited.length,
    mode,
    category,
    parent,
  });
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
