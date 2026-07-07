const STORAGE = {
  sites: "reference-user-sites",
  pending: "reference-pending-sites",
  categories: "reference-categories",
  statuses: "reference-site-statuses",
  saved: "reference-saved",
  zones: "reference-zones",
  paidSites: "reference-paid-sites",
  priceItems: "reference-price-items",
  currentUser: "reference-current-user"
};

const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbw369DYHZGnNLsRcBb3ZOEdwG2Huo4gC4h6Q2J-dvflWjOUcDVlaJIprBohfa6UwSd0/exec";

const DEFAULT_CATEGORIES = [
  { id: "medical", name: "醫療診所", children: ["中醫", "牙科", "身心科", "醫美/皮膚", "物理/語言/徒手治療/復健", "其他"] },
  { id: "medical-equipment", name: "醫療器材", children: [] },
  { id: "care", name: "居家照護/長照服務/產後照護", children: [] },
  { id: "fitness", name: "運動健身", children: [] },
  { id: "metal", name: "鋁鐵門窗/隔音門窗/隔熱紙/捲門", children: [] },
  { id: "pet", name: "寵物繁殖/買賣/住宿/美容", children: [] },
  { id: "pet-hospital", name: "寵物醫院", children: [] },
  { id: "car", name: "汽機車美容/改裝/維修", children: ["美容/維修/改裝/配件/買賣", "新車/中古車買賣", "機車改裝/保養/道路救援/買賣", "租車"] },
  { id: "hardware", name: "五金/包材/加工產品/電機產品", children: [] },
  { id: "home", name: "生活服務", children: ["清潔", "淨水相關", "鑰匙/開鎖", "搬家", "其他"] },
  { id: "3c", name: "3C", children: [] },
  { id: "glasses", name: "眼鏡", children: [] },
  { id: "travel", name: "住宿/旅遊/玩樂", children: [] },
  { id: "printing", name: "3D列印", children: [] },
  { id: "video", name: "影像拍攝", children: [] },
  { id: "water", name: "浮水相關", children: [] },
  { id: "finance", name: "金融與專業服務（當舖、會計與顧問）", children: [] },
  { id: "interior", name: "室內設計與裝修", children: [] },
  { id: "beauty", name: "美容保養", children: [] },
  { id: "nails", name: "美容美甲", children: [] },
  { id: "hair", name: "美髮", children: [] },
  { id: "food", name: "食品零售", children: [] },
  { id: "renovation", name: "房屋裝潢/裝修/出租/不動產", children: [] },
  { id: "flower", name: "花藝設計/植栽", children: [] },
  { id: "logistics", name: "運輸物流（搬家服務）", children: [] },
  { id: "music", name: "樂器零售與教學", children: [] }
];

const state = {
  categories: [],
  sites: [],
  pending: [],
  statuses: {},
  saved: new Set(),
  zones: [],
  paidSites: [],
  priceItems: [],
  selectedForZone: new Set(),
  selectedCategory: "all",
  search: "",
  visibleCount: 12,
  editing: false,
  openCategories: new Set(),
  currentUser: null,
  isDirty: false,
  suppressDirty: false
};

const els = {
  body: document.body,
  mobileCategoryBtn: document.getElementById("mobileCategoryBtn"),
  mobileSidebarBackdrop: document.getElementById("mobileSidebarBackdrop"),
  mobileZoneJumpBtn: document.getElementById("mobileZoneJumpBtn"),
  mobilePaidJumpBtn: document.getElementById("mobilePaidJumpBtn"),
  categoryList: document.getElementById("categoryList"),
  toggleEditBtn: document.getElementById("toggleEditBtn"),
  addCategoryBtn: document.getElementById("addCategoryBtn"),
  addChildBtn: document.getElementById("addChildBtn"),
  searchInput: document.getElementById("searchInput"),
  resultTitle: document.getElementById("resultTitle"),
  resultCount: document.getElementById("resultCount"),
  siteList: document.getElementById("siteList"),
  loadMoreBtn: document.getElementById("loadMoreBtn"),
  checkVisibleBtn: document.getElementById("checkVisibleBtn"),
  backupInput: document.getElementById("backupInput"),
  exportBackupBtn: document.getElementById("exportBackupBtn"),
  importInput: document.getElementById("importInput"),
  importStatus: document.getElementById("importStatus"),
  pendingCount: document.getElementById("pendingCount"),
  pendingList: document.getElementById("pendingList"),
  clearPendingBtn: document.getElementById("clearPendingBtn"),
  favoritePanelBtn: document.getElementById("favoritePanelBtn"),
  favoritePanel: document.getElementById("favoritePanel"),
  zonePanel: document.getElementById("zonePanel"),
  paidPanel: document.getElementById("paidPanel"),
  favoriteCount: document.getElementById("favoriteCount"),
  favoriteList: document.getElementById("favoriteList"),
  zoneNameInput: document.getElementById("zoneNameInput"),
  addZoneBtn: document.getElementById("addZoneBtn"),
  batchZoneSelect: document.getElementById("batchZoneSelect"),
  batchAddZoneBtn: document.getElementById("batchAddZoneBtn"),
  zoneList: document.getElementById("zoneList"),
  paidImportInput: document.getElementById("paidImportInput"),
  priceBookBtn: document.getElementById("priceBookBtn"),
  paidFeatureInput: document.getElementById("paidFeatureInput"),
  paidNameInput: document.getElementById("paidNameInput"),
  paidDomainInput: document.getElementById("paidDomainInput"),
  paidNoteInput: document.getElementById("paidNoteInput"),
  paidAttachmentInput: document.getElementById("paidAttachmentInput"),
  addPaidBtn: document.getElementById("addPaidBtn"),
  paidList: document.getElementById("paidList"),
  accountLabel: document.getElementById("accountLabel"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  saveUserBtn: document.getElementById("saveUserBtn"),
  loginModal: document.getElementById("loginModal"),
  loginForm: document.getElementById("loginForm"),
  usernameInput: document.getElementById("usernameInput"),
  passwordInput: document.getElementById("passwordInput"),
  loginMessage: document.getElementById("loginMessage"),
  cancelLoginBtn: document.getElementById("cancelLoginBtn")
};

function slug(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "") || `cat-${Date.now()}`;
}

function makeId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readSeedJson(key, fallback) {
  const seed = window.REFERENCE_SEED_DATA?.storage || window.REFERENCE_SEED_DATA || {};
  return Object.prototype.hasOwnProperty.call(seed, key) ? seed[key] : fallback;
}

function loadSeedScriptIfNeeded() {
  if (window.REFERENCE_SEED_DATA) return Promise.resolve();

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `reference-data.js?v=${Date.now()}`;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

function readStateJson(key, fallback) {
  const stored = readJson(key, null);
  const seed = readSeedJson(key, null);

  if (Array.isArray(stored) && stored.length === 0 && Array.isArray(seed) && seed.length > 0) {
    return seed;
  }

  if (stored && !(Array.isArray(stored) && stored.length === 0)) {
    return stored;
  }

  return seed ?? fallback;
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeDomain(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "")
    .split("/")[0]
    .toLowerCase();
}

function ensureUrl(domain) {
  const clean = normalizeDomain(domain);
  return clean ? `https://${clean}` : "";
}

function normalizeUrlInput(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function normalizeCategory(raw, parentName = "") {
  if (typeof raw === "string") {
    return { id: slug(`${parentName}-${raw}`), name: raw.trim(), children: [] };
  }

  const name = String(raw?.name || raw?.label || raw?.title || "未命名分類").trim();
  const id = String(raw?.id || slug(`${parentName}-${name}`));
  const childrenRaw = Array.isArray(raw?.children) ? raw.children : [];
  return {
    id,
    name,
    children: childrenRaw.map((child) => normalizeCategory(child, name))
  };
}

function normalizeCategories(raw) {
  const source = Array.isArray(raw) && raw.length ? raw : DEFAULT_CATEGORIES;
  const categories = source
    .map((cat) => normalizeCategory(cat))
    .filter((cat) => cat.id !== "all" && cat.name !== "所有案例");
  return ensureUniqueCategoryIds(categories);
}

function ensureUniqueCategoryIds(categories) {
  const used = new Set();

  const uniqueId = (preferred, name, parentName = "", isChild = false) => {
    let base = String(preferred || slug(`${parentName}-${name}`));
    const parentScopedBase = slug(`${parentName}-${name}`);
    const genericChildId = slug(name);

    if (isChild && (!base || base === genericChildId || used.has(base))) {
      base = parentScopedBase;
    } else if (!base || used.has(base)) {
      base = parentScopedBase;
    }

    let id = base;
    let index = 2;
    while (used.has(id)) {
      id = `${base}-${index}`;
      index += 1;
    }

    used.add(id);
    return id;
  };

  return categories.map((cat) => {
    const parent = {
      ...cat,
      id: uniqueId(cat.id, cat.name),
      children: []
    };

    parent.children = cat.children.map((child) => ({
      ...child,
      id: uniqueId(child.id, child.name, parent.name, true)
    }));

    return parent;
  });
}

function flattenCategories(categories = state.categories) {
  const rows = [];
  categories.forEach((cat) => {
    rows.push({ id: cat.id, name: cat.name, label: cat.name, parentId: "", parentName: "", depth: 0 });
    cat.children.forEach((child) => {
      rows.push({
        id: child.id,
        name: child.name,
        label: `${cat.name}（${child.name}）`,
        parentId: cat.id,
        parentName: cat.name,
        depth: 1
      });
    });
  });
  return rows;
}

function findCategory(id, categories = state.categories) {
  for (const cat of categories) {
    if (cat.id === id) return { category: cat, parent: null };
    const child = cat.children.find((item) => item.id === id);
    if (child) return { category: child, parent: cat };
  }
  return null;
}

function categoryExists(id) {
  return Boolean(id && findCategory(id));
}

function mergeOfficialCategories(officialCategories) {
  const merged = state.categories.length ? structuredClone(state.categories) : [];
  const currentIds = new Set(flattenCategories(merged).map((cat) => cat.id));

  officialCategories.forEach((official) => {
    if (!currentIds.has(official.id)) {
      merged.push(structuredClone(official));
      flattenCategories([official]).forEach((cat) => currentIds.add(cat.id));
      return;
    }

    const existing = findCategory(official.id, merged)?.category;
    if (!existing) return;

    official.children.forEach((child) => {
      if (!currentIds.has(child.id)) {
        existing.children.push(structuredClone(child));
        currentIds.add(child.id);
      }
    });
  });

  return normalizeCategories(merged);
}

function categoryLabel(idOrName) {
  if (!idOrName) return "未分類";
  const found = flattenCategories().find((cat) => {
    return cat.id === idOrName;
  });
  return found ? found.label : String(idOrName);
}

function resolveCategoryId(value) {
  if (!value) return "";
  const flat = flattenCategories();
  const found = flat.find((cat) => cat.id === value || cat.label === value)
    || flat.find((cat) => cat.name === value);
  return found ? found.id : value;
}

function normalizeSite(raw) {
  const name = String(raw?.name || raw?.title || raw?.siteName || raw?.["網站名稱"] || "").trim();
  const domain = normalizeDomain(raw?.domain || raw?.url || raw?.href || raw?.["域名"] || "");
  if (!name || !domain) return null;
  const categoryId = resolveCategoryId(raw?.categoryId || raw?.category || raw?.categoryName || "");
  return {
    id: String(raw?.id || makeId("site")),
    name,
    domain,
    url: raw?.url?.startsWith?.("http") ? raw.url : ensureUrl(domain),
    categoryId,
    officialCategoryId: raw?.officialCategoryId || categoryId,
    categoryOverridden: Boolean(raw?.categoryOverridden),
    hiddenByUser: Boolean(raw?.hiddenByUser),
    fromOfficial: Boolean(raw?.fromOfficial),
    addedAt: raw?.addedAt || new Date().toISOString()
  };
}

function normalizePaidSite(raw) {
  const base = normalizeSite(raw);
  if (!base) return null;
  return {
    ...base,
    note: String(raw?.note || raw?.description || raw?.["簡短說明"] || raw?.["說明"] || "").trim()
  };
}

function uniqueSites(sites) {
  const map = new Map();
  sites.forEach((site) => {
    if (!site?.domain) return;
    map.set(site.domain, site);
  });
  return Array.from(map.values());
}

function loadState() {
  const canUsePersonalState = isLoggedIn();
  const storedSites = canUsePersonalState ? readJson(STORAGE.sites, null) : null;
  const seedSites = readSeedJson(STORAGE.sites, []);
  const shouldUseSeedData = Array.isArray(seedSites) && seedSites.length > 0 && (!Array.isArray(storedSites) || storedSites.length === 0);

  const readSource = (key, fallback) => canUsePersonalState && !shouldUseSeedData
    ? readStateJson(key, fallback)
    : readSeedJson(key, fallback);

  state.categories = normalizeCategories(readSource(STORAGE.categories, []));
  state.sites = uniqueSites(((shouldUseSeedData ? seedSites : readSource(STORAGE.sites, [])) || []).map(normalizeSite).filter(Boolean));
  state.pending = uniqueSites((readSource(STORAGE.pending, []) || []).map(normalizeSite).filter(Boolean));
  state.statuses = {};
  Object.keys(state.statuses).forEach((siteId) => {
    if (state.statuses[siteId] === "manual") {
      delete state.statuses[siteId];
    }
  });
  state.saved = new Set(readSource(STORAGE.saved, []) || []);
  state.zones = readSource(STORAGE.zones, []) || [];
  state.paidSites = (readSource(STORAGE.paidSites, []) || []).map(normalizePaidSite).filter(Boolean);
  state.priceItems = (readSource(STORAGE.priceItems, []) || []).map(normalizePriceItem).filter(Boolean);
  state.categories.forEach((cat) => {
    if (cat.children.length) state.openCategories.add(cat.id);
  });
  const previousSuppress = state.suppressDirty;
  state.suppressDirty = true;
  saveState();
  state.suppressDirty = previousSuppress;
}

function saveState() {
  writeJson(STORAGE.categories, state.categories);
  writeJson(STORAGE.sites, state.sites);
  writeJson(STORAGE.pending, state.pending);
  writeJson(STORAGE.statuses, state.statuses);
  writeJson(STORAGE.saved, Array.from(state.saved));
  writeJson(STORAGE.zones, state.zones);
  writeJson(STORAGE.paidSites, state.paidSites);
  writeJson(STORAGE.priceItems, state.priceItems);
  if (state.currentUser && !state.suppressDirty) {
    setDirty(true);
  }
}

function statePayload() {
  return {
    categories: state.categories,
    sites: state.sites,
    pending: state.pending,
    statuses: state.statuses,
    saved: Array.from(state.saved),
    zones: state.zones,
    paidSites: state.paidSites,
    priceItems: state.priceItems
  };
}

function applyUserPayload(payload) {
  if (!payload) return;
  state.suppressDirty = true;
  if (Array.isArray(payload.categories)) state.categories = normalizeCategories(payload.categories);
  if (Array.isArray(payload.sites)) state.sites = uniqueSites(payload.sites.map(normalizeSite).filter(Boolean));
  if (Array.isArray(payload.pending)) state.pending = uniqueSites(payload.pending.map(normalizeSite).filter(Boolean));
  state.statuses = {};
  if (Array.isArray(payload.saved)) state.saved = new Set(payload.saved);
  if (Array.isArray(payload.zones)) state.zones = payload.zones;
  if (Array.isArray(payload.paidSites)) state.paidSites = payload.paidSites.map(normalizePaidSite).filter(Boolean);
  if (Array.isArray(payload.priceItems)) state.priceItems = payload.priceItems.map(normalizePriceItem).filter(Boolean);
  saveState();
  state.suppressDirty = false;
}

function setDirty(isDirty) {
  state.isDirty = isDirty;
  updateAccountUi();
}

function isLoggedIn() {
  return Boolean(state.currentUser?.username);
}

function currentRoleName() {
  return String(state.currentUser?.role || "").trim();
}

function isAdmin() {
  const role = currentRoleName().toLowerCase();
  return ["admin", "superadmin", "總管理員", "管理員"].includes(role);
}

function updateAccountUi() {
  const name = state.currentUser?.username || "";
  const roleName = currentRoleName() || "使用者";
  els.body.classList.toggle("is-logged-in", Boolean(name));
  els.body.classList.toggle("is-admin", isAdmin());
  els.accountLabel.textContent = name ? `已登入：${name}（${roleName}）` : "未登入";
  els.loginBtn.hidden = Boolean(name);
  els.logoutBtn.hidden = !name;
  els.saveUserBtn.hidden = !name;
  els.saveUserBtn.disabled = !name || !state.isDirty;
  els.saveUserBtn.textContent = state.isDirty ? "儲存變更" : "已儲存";
  els.saveUserBtn.classList.toggle("is-dirty", state.isDirty);
  els.saveUserBtn.classList.toggle("is-saved", Boolean(name) && !state.isDirty);
  if (!name && state.editing) {
    state.editing = false;
  }
}

function requireLogin() {
  if (isLoggedIn()) return true;
  alert("請先登入帳號，登入後才能儲存你的個人分類與資料。");
  openLoginModal();
  return false;
}

function requireAdmin() {
  if (isAdmin()) return true;
  alert("只有管理員帳號可以維護官方初始資料。");
  return false;
}

function apiGet(params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `gas_callback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const url = new URL(GOOGLE_SHEET_API_URL);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value ?? "");
    });
    url.searchParams.set("callback", callbackName);
    url.searchParams.set("t", Date.now());

    const script = document.createElement("script");
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheet API 讀取逾時"));
    }, 12000);

    function cleanup() {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Google Sheet API 讀取失敗"));
    };

    script.src = url.toString();
    document.head.append(script);
  });
}

async function apiPost(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    if (payload.action === "login") {
      return apiGet({
        action: "login",
        username: payload.username || "",
        password: payload.password || ""
      });
    }

    const response = await fetch(GOOGLE_SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function apiPostNoCors(payload, waitMs = 1200) {
  await new Promise((resolve) => {
    const frameName = `gas_submit_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement("iframe");
    frame.name = frameName;
    frame.hidden = true;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = GOOGLE_SHEET_API_URL;
    form.target = frameName;
    form.enctype = "text/plain";
    form.hidden = true;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(payload);

    form.append(input);
    document.body.append(frame, form);
    form.submit();

    setTimeout(() => {
      form.remove();
      frame.remove();
      resolve();
    }, waitMs);
  });
}

function openLoginModal() {
  els.loginModal.hidden = false;
  els.loginMessage.textContent = "登入後會載入你的個人分類與參考站設定。";
  els.loginForm.querySelector('button[type="submit"]').disabled = false;
  setTimeout(() => els.usernameInput.focus(), 0);
}

function closeLoginModal() {
  els.loginModal.hidden = true;
  els.passwordInput.value = "";
  els.loginMessage.textContent = "登入後會載入你的個人分類與參考站設定。";
  els.loginForm.querySelector('button[type="submit"]').disabled = false;
}

async function login(username, password) {
  const submitBtn = els.loginForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  els.loginMessage.textContent = "登入中...";

  state.currentUser = { username, role: "驗證中" };
  localStorage.setItem(STORAGE.currentUser, JSON.stringify(state.currentUser));
  setDirty(false);
  closeLoginModal();
  updateAccountUi();
  render();

  let result;
  try {
    result = await apiPost({ action: "login", username, password });
  } catch (error) {
    state.currentUser = null;
    localStorage.removeItem(STORAGE.currentUser);
    updateAccountUi();
    render();
    alert("登入失敗，請確認 Apps Script 已重新部署，或稍後再試。");
    return;
  }

  if (!result.success) {
    state.currentUser = null;
    localStorage.removeItem(STORAGE.currentUser);
    updateAccountUi();
    render();
    alert(result.message || "登入失敗，請確認帳號密碼。");
    return;
  }

  state.currentUser = { username: result.username || username, role: result.role || "user" };
  localStorage.setItem(STORAGE.currentUser, JSON.stringify(state.currentUser));

  if (result.data) {
    applyUserPayload(result.data);
  }

  setDirty(false);
  updateAccountUi();
  render();
}

function logout() {
  if (state.isDirty && !confirm("你有尚未儲存的變更，確定要登出？")) return;
  state.currentUser = null;
  localStorage.removeItem(STORAGE.currentUser);
  setDirty(false);
  updateAccountUi();
  loadState();
  render();
  loadCloudState();
}

async function saveUserData() {
  if (!state.currentUser) return;
  const pendingAttachmentCount = isAdmin()
    ? state.paidSites.filter((site) => site.attachmentData && !site.attachmentUrl).length
    : 0;
  els.saveUserBtn.disabled = true;
  els.saveUserBtn.textContent = pendingAttachmentCount ? "上傳附件中..." : (isAdmin() ? "同步官方資料中..." : "儲存中...");
  try {
    await apiPostNoCors({
      action: "saveUserData",
      username: state.currentUser.username,
      data: statePayload()
    });
    if (isAdmin()) {
      await saveOfficialData();
    }
  } catch (error) {
    console.error(error);
    alert("儲存失敗，請確認 Apps Script 已重新部署，或稍後再試。");
    els.saveUserBtn.disabled = false;
    updateAccountUi();
    return;
  }

  if (pendingAttachmentCount) {
    await loadCloudState();
    const remaining = state.paidSites.filter((site) => site.attachmentData && !site.attachmentUrl).length;
    if (remaining) {
      setDirty(true);
      alert("附件尚未成功寫入 Google Drive。請確認 Apps Script 已執行 authorizeDriveOnce 並重新部署，再按一次儲存變更。");
      return;
    }
  }
  setDirty(false);
  updateAccountUi();
}

async function saveOfficialData() {
  const payloads = [
    { action: "saveCategories", categories: state.categories },
    { action: "saveSites", sites: state.sites.filter((site) => !site.hiddenByUser).map(siteToCloudRow) },
    { action: "savePending", pending: state.pending.filter((site) => !site.hiddenByUser).map(siteToCloudRow) },
    { action: "saveZones", zones: state.zones },
    { action: "savePaidSites", paidSites: state.paidSites.map(paidSiteToCloudRow) },
    { action: "savePriceItems", priceItems: state.priceItems.map(priceItemToCloudRow) }
  ];

  for (const payload of payloads) {
    const hasAttachment = payload.action === "savePaidSites"
      && payload.paidSites?.some((site) => site.attachmentData && !site.attachmentUrl);
    await apiPostNoCors(payload, hasAttachment ? 20000 : 1200);
  }
}

function setSelectedCategory(id) {
  state.selectedCategory = id;
  state.visibleCount = 12;
  closeMobileSidebar();
  render();
}

function openMobileSidebar() {
  els.body.classList.add("mobile-sidebar-open");
}

function closeMobileSidebar() {
  els.body.classList.remove("mobile-sidebar-open");
}

function toggleMobileSidebar() {
  els.body.classList.toggle("mobile-sidebar-open");
}

function scrollToUtilityPanel(panel) {
  if (!panel) return;
  closeMobileSidebar();
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createCategoryButton(cat, isChild = false) {
  const row = document.createElement("div");
  row.className = isChild ? "child-row" : "category-row";
  row.draggable = state.editing;
  row.dataset.id = cat.id;
  row.classList.toggle("active", state.selectedCategory === cat.id);

  const nameBtn = document.createElement("button");
  nameBtn.className = isChild ? "child-name" : "category-name";
  nameBtn.type = "button";
  nameBtn.textContent = isChild ? `（${cat.name}）` : cat.name;
  nameBtn.addEventListener("click", () => setSelectedCategory(cat.id));

  const tools = document.createElement("div");
  tools.className = "category-tools";

  const editBtn = toolButton("編輯", () => renameCategory(cat.id));
  const upBtn = toolButton("上移", () => moveCategory(cat.id, -1));
  const downBtn = toolButton("下移", () => moveCategory(cat.id, 1));
  const deleteBtn = toolButton("刪除", () => deleteCategory(cat.id), "delete-btn");
  tools.append(editBtn, upBtn, downBtn, deleteBtn);

  row.append(nameBtn, tools);
  row.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", cat.id);
  });
  row.addEventListener("dragover", (event) => {
    const dragType = event.dataTransfer.types.includes("application/x-reference-site")
      || event.dataTransfer.types.includes("application/x-pending-site")
      || event.dataTransfer.types.includes("text/plain");
    if (state.editing || dragType) {
      event.preventDefault();
      row.classList.add("drop-target");
    }
  });
  row.addEventListener("dragleave", () => {
    row.classList.remove("drop-target");
  });
  row.addEventListener("drop", (event) => {
    event.preventDefault();
    row.classList.remove("drop-target");

    const siteId = event.dataTransfer.getData("application/x-reference-site");
    const pendingId = event.dataTransfer.getData("application/x-pending-site");
    const draggedId = event.dataTransfer.getData("text/plain");

    if (siteId) {
      moveSiteToCategory(siteId, cat.id);
      return;
    }

    if (pendingId) {
      classifyPending(pendingId, cat.id);
      return;
    }

    if (state.editing && draggedId && draggedId !== cat.id) {
      dropCategory(draggedId, cat.id);
    }
  });

  return row;
}

function toolButton(text, handler, className = "") {
  const btn = document.createElement("button");
  btn.className = `tool-btn ${className}`;
  btn.type = "button";
  btn.textContent = text;
  btn.addEventListener("click", handler);
  return btn;
}

function renderCategories() {
  els.body.classList.toggle("editing", state.editing);
  els.toggleEditBtn.textContent = state.editing ? "完成編輯" : "編輯分類";
  els.categoryList.innerHTML = "";

  const allRow = document.createElement("button");
  allRow.className = `category-row category-name ${state.selectedCategory === "all" ? "active" : ""}`;
  allRow.type = "button";
  allRow.textContent = "所有案例";
  allRow.addEventListener("click", () => setSelectedCategory("all"));
  els.categoryList.append(allRow);

  state.categories.forEach((cat) => {
    const row = createCategoryButton(cat);
    const toggle = document.createElement("button");
    toggle.className = "category-name";
    toggle.type = "button";
    toggle.textContent = cat.children.length ? (state.openCategories.has(cat.id) ? "⌃" : "›") : "";
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      if (state.openCategories.has(cat.id)) state.openCategories.delete(cat.id);
      else state.openCategories.add(cat.id);
      renderCategories();
    });
    row.insertBefore(toggle, row.lastChild);
    els.categoryList.append(row);

    if (cat.children.length && state.openCategories.has(cat.id)) {
      cat.children.forEach((child) => els.categoryList.append(createCategoryButton(child, true)));
    }
  });
}

function renameCategory(id) {
  if (!requireLogin()) return;
  const found = findCategory(id);
  if (!found) return;
  const nextName = prompt("請輸入新的分類名稱", found.category.name);
  if (!nextName || !nextName.trim()) return;
  found.category.name = nextName.trim();
  saveState();
  render();
}

function addCategory() {
  if (!requireLogin()) return;
  const name = prompt("請輸入主分類名稱");
  if (!name || !name.trim()) return;
  const category = { id: makeId("cat"), name: name.trim(), children: [] };
  state.categories.push(category);
  setSelectedCategory(category.id);
}

function addChildCategory() {
  if (!requireLogin()) return;
  const parentId = state.selectedCategory === "all" ? state.categories[0]?.id : state.selectedCategory;
  const found = findCategory(parentId);
  const parent = found?.parent || found?.category || state.categories[0];
  if (!parent) return;
  const name = prompt(`新增到「${parent.name}」底下，請輸入子分類名稱`);
  if (!name || !name.trim()) return;
  const child = { id: makeId("sub"), name: name.trim(), children: [] };
  parent.children.push(child);
  state.openCategories.add(parent.id);
  setSelectedCategory(child.id);
}

function deleteCategory(id) {
  if (!requireLogin()) return;
  const label = categoryLabel(id);
  if (!confirm(`確定刪除「${label}」？此分類底下的參考站會改成未分類。`)) return;
  state.categories = state.categories
    .map((cat) => ({ ...cat, children: cat.children.filter((child) => child.id !== id) }))
    .filter((cat) => cat.id !== id);
  state.sites.forEach((site) => {
    if (site.categoryId === id) site.categoryId = "";
  });
  if (state.selectedCategory === id) state.selectedCategory = "all";
  saveState();
  render();
}

function moveCategory(id, direction) {
  if (!requireLogin()) return;
  const found = findCategory(id);
  if (!found) return;
  const list = found.parent ? found.parent.children : state.categories;
  const index = list.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= list.length) return;
  [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
  saveState();
  render();
}

function dropCategory(draggedId, targetId) {
  if (!requireLogin()) return;
  const dragged = findCategory(draggedId);
  const target = findCategory(targetId);
  if (!dragged || !target || target.parent) return;

  const sourceList = dragged.parent ? dragged.parent.children : state.categories;
  const index = sourceList.findIndex((item) => item.id === draggedId);
  const [item] = sourceList.splice(index, 1);
  item.children = item.children || [];
  target.category.children.push(item);
  state.openCategories.add(target.category.id);
  saveState();
  render();
}

function filteredSites() {
  const query = state.search.trim().toLowerCase();
  const selectedIds = selectedCategoryIds();
  return state.sites.filter((site) => {
    if (site.hiddenByUser) return false;
    const categoryText = categoryLabel(site.categoryId).toLowerCase();
    const text = `${site.name} ${site.domain} ${categoryText}`.toLowerCase();
    const categoryMatch = state.selectedCategory === "all" || selectedIds.has(site.categoryId);
    return categoryMatch && (!query || text.includes(query));
  });
}

function selectedCategoryIds() {
  if (state.selectedCategory === "all") return new Set(["all"]);

  const found = findCategory(state.selectedCategory);
  if (!found) return new Set([state.selectedCategory]);

  const ids = new Set([state.selectedCategory]);
  if (!found.parent) {
    found.category.children.forEach((child) => ids.add(child.id));
  }

  return ids;
}

function renderSites() {
  const sites = filteredSites();
  const visible = sites.slice(0, state.visibleCount);
  const label = state.selectedCategory === "all" ? "所有案例" : categoryLabel(state.selectedCategory);
  els.resultTitle.textContent = label;
  els.resultCount.textContent = `${sites.length} Results`;
  els.siteList.innerHTML = "";

  if (!visible.length) {
    els.siteList.innerHTML = '<div class="empty-state">目前沒有符合的參考站。若剛下載備份，請用右側「上傳備份 JSON」還原。</div>';
  } else {
    visible.forEach((site) => els.siteList.append(createSiteCard(site)));
  }

  els.loadMoreBtn.style.display = sites.length > state.visibleCount ? "block" : "none";
}

function createSiteCard(site) {
  const card = document.createElement("article");
  card.className = `site-card ${isLoggedIn() ? "" : "readonly"}`;
  card.draggable = isLoggedIn();
  card.addEventListener("dragstart", (event) => {
    if (!isLoggedIn()) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("application/x-reference-site", site.id);
    event.dataTransfer.effectAllowed = "move";
  });

  const link = document.createElement("a");
  link.className = "site-link";
  link.href = site.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const icon = document.createElement("div");
  icon.className = "site-icon";
  icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8"></circle><path d="M3.5 12h17"></path><path d="M12 3.5c2 2.2 3 5 3 8.5s-1 6.3-3 8.5"></path><path d="M12 3.5c-2 2.2-3 5-3 8.5s1 6.3 3 8.5"></path></svg>';
  const info = document.createElement("div");
  const name = document.createElement("div");
  name.className = "site-name";
  name.textContent = site.name;
  const url = document.createElement("div");
  url.className = "site-url";
  url.textContent = site.url;
  const status = document.createElement("div");
  const statusValue = state.statuses[site.id] || "unknown";
  status.className = `status-badge status-${statusValue}`;
  status.textContent = getStatusText(statusValue);
  info.append(name, url, status);
  link.append(icon, info);

  const checkBtn = document.createElement("button");
  checkBtn.className = "small-btn";
  checkBtn.type = "button";
  checkBtn.textContent = "\u6aa2\u67e5";
  checkBtn.addEventListener("click", () => checkSite(site));

  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "small-btn";
  favoriteBtn.type = "button";
  favoriteBtn.textContent = state.saved.has(site.id) ? "\u5df2\u6536\u85cf" : "\u6536\u85cf";
  favoriteBtn.addEventListener("click", () => {
    if (!requireLogin()) return;
    if (state.saved.has(site.id)) state.saved.delete(site.id);
    else state.saved.add(site.id);
    saveState();
    render();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "small-btn delete-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "\u522a\u9664";
  deleteBtn.addEventListener("click", () => deleteSite(site.id));

  const select = createCategorySelect(site.categoryId);
  select.addEventListener("change", () => {
    if (!requireLogin()) {
      select.value = site.categoryId || "";
      return;
    }
    site.categoryId = select.value;
    site.categoryOverridden = true;
    saveState();
    render();
  });

  const zoneSelect = document.createElement("select");
  zoneSelect.className = "category-select compact-select";
  zoneSelect.append(new Option("\u9078\u64c7\u5c08\u5340", ""));
  state.zones.forEach((zone) => zoneSelect.append(new Option(zone.name, zone.id)));

  const zoneBtn = document.createElement("button");
  zoneBtn.className = "small-btn";
  zoneBtn.type = "button";
  zoneBtn.textContent = "\u52a0\u5165\u5c08\u5340";
  zoneBtn.addEventListener("click", () => addSiteToZone(site.id, zoneSelect.value));

  const batchCheck = document.createElement("label");
  batchCheck.className = "site-check";
  const batchInput = document.createElement("input");
  batchInput.type = "checkbox";
  batchInput.checked = state.selectedForZone.has(site.id);
  batchInput.addEventListener("change", () => {
    if (batchInput.checked) state.selectedForZone.add(site.id);
    else state.selectedForZone.delete(site.id);
  });
  batchCheck.append(batchInput, document.createTextNode("\u52fe\u9078"));

  card.append(link, checkBtn);
  if (isLoggedIn()) {
    card.append(batchCheck, favoriteBtn, deleteBtn, select, zoneSelect, zoneBtn);
  }
  return card;
}
function createCategorySelect(value = "") {
  const select = document.createElement("select");
  select.className = "category-select";
  select.append(new Option("未分類", ""));
  flattenCategories().forEach((cat) => {
    select.append(new Option(cat.label, cat.id));
  });
  select.value = resolveCategoryId(value);
  return select;
}

function deleteSite(id) {
  if (!requireLogin()) return;
  const site = state.sites.find((item) => item.id === id);
  if (!site) return;
  if (!isAdmin() && !confirm(`確定從你的清單隱藏「${site.name}」？這不會刪除官方資料。`)) return;
  site.hiddenByUser = true;
  delete state.statuses[id];
  state.saved.delete(id);
  saveState();
  render();
}

function moveSiteToCategory(id, categoryId) {
  if (!requireLogin()) return;
  const site = state.sites.find((item) => item.id === id);
  if (!site) return;
  site.categoryId = categoryId;
  site.categoryOverridden = true;
  saveState();
  render();
}

async function checkSite(site) {
  state.statuses[site.id] = "checking";
  saveState();
  renderSites();

  try {
    await fetch(site.url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store"
    });
    state.statuses[site.id] = "ok";
  } catch {
    state.statuses[site.id] = "bad";
  }

  saveState();
  renderSites();
}

async function checkVisibleSites() {
  const visible = filteredSites().slice(0, state.visibleCount);
  for (const site of visible) {
    await checkSite(site);
  }
}

function getStatusText(status) {
  if (status === "ok") return "可開啟";
  if (status === "bad") return "可能無法開啟";
  if (status === "checking") return "檢查中";
  return "未檢查";
}

function renderPending() {
  const pendingSites = state.pending.filter((site) => !site.hiddenByUser);
  els.pendingCount.textContent = `${pendingSites.length} Pending`;
  els.pendingList.innerHTML = "";

  if (!pendingSites.length) {
    els.pendingList.innerHTML = '<div class="empty-state">目前沒有待分類資料。</div>';
    return;
  }

  pendingSites.forEach((site) => {
    const card = document.createElement("article");
    card.className = "pending-card";
    const title = document.createElement("div");
    title.className = "pending-title";
    title.textContent = site.name;
    const domain = document.createElement("div");
    domain.className = "pending-domain";
    domain.textContent = site.url;

    const actions = document.createElement("div");
    actions.className = "pending-actions";
    const select = createCategorySelect();
    const addBtn = document.createElement("button");
    addBtn.className = "primary-btn";
    addBtn.type = "button";
    addBtn.textContent = "加入分類";
    addBtn.addEventListener("click", () => classifyPending(site.id, select.value));
    actions.append(select, addBtn);

    const dragHandle = document.createElement("button");
    dragHandle.className = "small-btn drag-handle";
    dragHandle.type = "button";
    dragHandle.textContent = "拖移到左側分類";
    dragHandle.draggable = true;
    dragHandle.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("application/x-pending-site", site.id);
      event.dataTransfer.effectAllowed = "move";
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "small-btn delete-btn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", () => {
      if (!requireLogin()) return;
      site.hiddenByUser = true;
      state.sites = uniqueSites([...state.sites, site]);
      state.pending = state.pending.filter((item) => item.id !== site.id);
      saveState();
      renderPending();
    });

    card.append(title, domain, actions, dragHandle, deleteBtn);
    els.pendingList.append(card);
  });
}

function classifyPending(id, categoryId) {
  if (!requireLogin()) return;
  if (!categoryId) {
    alert("請先選擇分類");
    return;
  }
  const site = state.pending.find((item) => item.id === id);
  if (!site) return;
  site.categoryId = categoryId;
  site.categoryOverridden = true;
  site.hiddenByUser = false;
  state.pending = state.pending.filter((item) => item.id !== id);
  state.sites = uniqueSites([...state.sites, site]);
  saveState();
  render();
}

function siteById(id) {
  return state.sites.find((site) => site.id === id)
    || state.pending.find((site) => site.id === id)
    || state.paidSites.find((site) => site.id === id);
}

function renderFavorites() {
  if (!els.favoriteList) return;
  const favorites = state.sites.filter((site) => state.saved.has(site.id) && !site.hiddenByUser);
  els.favoriteCount.textContent = String(favorites.length);
  els.favoriteList.innerHTML = "";
  if (!favorites.length) {
    els.favoriteList.innerHTML = '<div class="empty-state">目前沒有收藏資料。</div>';
    return;
  }
  favorites.forEach((site) => els.favoriteList.append(createMiniSiteCard(site, {
    actionText: "取消收藏",
    onAction: () => {
      state.saved.delete(site.id);
      saveState();
      render();
    }
  })));
}

function createMiniSiteCard(site, options = {}) {
  const card = document.createElement("article");
  card.className = "pending-card";
  const title = document.createElement("div");
  title.className = "pending-title";
  title.textContent = site.name;
  const domain = document.createElement("a");
  domain.className = "pending-domain";
  domain.href = site.url;
  domain.target = "_blank";
  domain.rel = "noopener noreferrer";
  domain.textContent = site.url;
  card.append(title, domain);

  if (site.note) {
    const note = document.createElement("p");
    note.className = "mini-note";
    note.textContent = site.note;
    card.append(note);
  }

  if (options.actionText && options.onAction) {
    const button = document.createElement("button");
    button.className = "small-btn";
    button.type = "button";
    button.textContent = options.actionText;
    button.addEventListener("click", options.onAction);
    card.append(button);
  }
  (options.extraActions || []).forEach((action) => {
    if (!action?.text || !action?.onClick) return;
    const button = document.createElement("button");
    button.className = action.className || "small-btn";
    button.type = "button";
    button.textContent = action.text;
    button.addEventListener("click", action.onClick);
    card.append(button);
  });
  return card;
}

function addZone() {
  if (!requireAdmin()) return;
  const name = els.zoneNameInput.value.trim();
  if (!name) return;
  state.zones.push({ id: makeId("zone"), name, items: [] });
  els.zoneNameInput.value = "";
  saveState();
  render();
}

function addSiteToZone(siteId, zoneId) {
  if (!requireLogin()) return;
  if (!zoneId) {
    alert("請先選擇專區");
    return;
  }
  const zone = state.zones.find((item) => item.id === zoneId);
  if (!zone) return;
  zone.items = zone.items || [];
  zone.items.push({ id: makeId("zone-item"), siteId });
  saveState();
  render();
}

function renderZones() {
  if (!els.zoneList) return;
  if (els.batchZoneSelect) {
    els.batchZoneSelect.innerHTML = "";
    els.batchZoneSelect.append(new Option("選擇專區", ""));
    state.zones.forEach((zone) => els.batchZoneSelect.append(new Option(zone.name, zone.id)));
  }
  els.zoneList.innerHTML = "";
  if (!state.zones.length) {
    els.zoneList.innerHTML = '<div class="empty-state">目前沒有專區。</div>';
    return;
  }
  state.zones.forEach((zone) => {
    const card = document.createElement("article");
    card.className = "pending-card";
    const title = document.createElement("div");
    title.className = "pending-title zone-title";
    title.textContent = `${zone.name}（${(zone.items || []).length}）`;
    card.append(title);
    if (isAdmin()) {
      const editZone = document.createElement("button");
      editZone.className = "small-btn";
      editZone.type = "button";
      editZone.textContent = "\u7de8\u8f2f\u5c08\u5340";
      editZone.addEventListener("click", () => openZoneEditModal(zone.id));
      card.append(editZone);

      const removeZone = document.createElement("button");
      removeZone.className = "small-btn delete-btn";
      removeZone.type = "button";
      removeZone.textContent = "刪除專區";
      removeZone.addEventListener("click", () => {
        state.zones = state.zones.filter((item) => item.id !== zone.id);
        saveState();
        render();
      });
      card.append(removeZone);
    }
    (zone.items || []).forEach((item) => {
      const site = siteById(item.siteId);
      if (!site) return;
      const options = isAdmin()
        ? {
            extraActions: [
              {
                text: "編輯",
                onClick: () => openZoneItemEditModal(site.id)
              },
              {
                text: "移除",
                className: "small-btn delete-btn",
                onClick: () => {
                  zone.items = zone.items.filter((entry) => entry.id !== item.id);
                  saveState();
                  render();
                }
              }
            ]
          }
        : {};
      card.append(createMiniSiteCard(site, options));
    });
    els.zoneList.append(card);
  });
}

function addSelectedSitesToZone() {
  if (!requireAdmin()) return;
  const zoneId = els.batchZoneSelect?.value || "";
  const zone = state.zones.find((item) => item.id === zoneId);
  if (!zone) {
    alert("請先選擇專區");
    return;
  }
  const selected = Array.from(state.selectedForZone);
  if (!selected.length) {
    alert("請先勾選參考站");
    return;
  }
  zone.items = zone.items || [];
  selected.forEach((siteId) => {
    zone.items.push({ id: makeId("zone-item"), siteId });
  });
  state.selectedForZone.clear();
  saveState();
  render();
}

function addPaidSite() {
  if (!requireLogin()) return;
  const site = normalizePaidSite({
    name: els.paidNameInput.value,
    domain: els.paidDomainInput.value,
    note: els.paidNoteInput.value
  });
  if (!site) {
    alert("請輸入網站名稱與域名");
    return;
  }
  state.paidSites = uniqueSites([...state.paidSites, site]);
  els.paidNameInput.value = "";
  els.paidDomainInput.value = "";
  els.paidNoteInput.value = "";
  saveState();
  render();
}

function renderPaidSites() {
  if (!els.paidList) return;
  els.paidList.innerHTML = "";
  if (!state.paidSites.length) {
    els.paidList.innerHTML = '<div class="empty-state">目前沒有付費功能網站。</div>';
    return;
  }
  state.paidSites.forEach((site) => {
    els.paidList.append(createMiniSiteCard(site, {
      actionText: "刪除",
      onAction: () => {
        state.paidSites = state.paidSites.filter((item) => item.id !== site.id);
        saveState();
        render();
      }
    }));
  });
}

function render() {
  renderCategories();
  renderSites();
  renderPending();
  renderFavorites();
  renderZones();
  renderPaidSites();
}

function parseCsv(text, delimiter) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const split = (line) => line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, "").trim());
  return lines.map(split);
}

function rowsToSites(rows) {
  return normalizeImportedRows(rows).map((row) => normalizeSite({
    name: getRowValue(row, ["網站名稱", "網站名称", "網站名", "名稱", "name", "Name"]),
    domain: getRowValue(row, ["域名", "網址", "URL", "url", "domain", "Domain"])
  })).filter(Boolean);
}

function normalizeImportedRows(rows) {
  if (!rows.length) return rows;
  const matrix = rows.map(rowToValues).filter((row) => row.some((value) => String(value || "").trim()));

  const firstUsefulRow = matrix.findIndex((row) => {
    const values = row.map((value) => normalizeHeader(value));
    return values.some((value) => ["網站名稱", "網站名称", "網站名", "名稱", "name"].map(normalizeHeader).includes(value))
      && values.some((value) => ["域名", "網址", "url", "domain"].map(normalizeHeader).includes(value));
  });

  if (firstUsefulRow < 0) return inferImportedRows(matrix);

  const headerValues = matrix[firstUsefulRow].map((value) => String(value || "").trim());
  return matrix.slice(firstUsefulRow + 1).map((values) => {
    return Object.fromEntries(headerValues.map((header, index) => [header, values[index] || ""]));
  });
}

function rowToValues(row) {
  if (Array.isArray(row)) return row;
  return Object.keys(row)
    .sort((a, b) => columnSortValue(a) - columnSortValue(b))
    .map((key) => row[key]);
}

function columnSortValue(key) {
  const text = String(key);
  const match = text.match(/^__COL_(\d+)$/);
  if (match) return Number(match[1]);
  return Number.MAX_SAFE_INTEGER;
}

function looksLikeDomain(value) {
  const text = normalizeDomain(value);
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(text);
}

function inferImportedRows(matrix) {
  return matrix
    .map((values) => {
      const domainIndex = values.findIndex(looksLikeDomain);
      if (domainIndex < 0) return null;
      const nameIndex = Math.max(0, domainIndex - 1);
      const name = values[nameIndex] || values[0] || "";
      const domain = values[domainIndex] || "";
      return {
        "網站名稱": name,
        "域名": domain
      };
    })
    .filter(Boolean)
    .filter((row) => normalizeHeader(row["網站名稱"]) !== normalizeHeader("網站名稱"));
}

function normalizeHeader(header) {
  return String(header || "").replace(/^\uFEFF/, "").replace(/\s+/g, "").trim().toLowerCase();
}

function getRowValue(row, names) {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
  );
  for (const name of names) {
    const value = normalized[normalizeHeader(name)];
    if (value !== undefined && value !== null && String(value).trim()) return value;
  }
  return "";
}

function statusValueFromText(text) {
  const value = String(text || "").trim();
  if (value === "可開啟") return "ok";
  if (value === "可能無法開啟") return "bad";
  if (value === "檢查中") return "checking";
  return "unknown";
}

function siteFromSheetRow(row) {
  const name = getRowValue(row, ["網站名稱", "name"]);
  const domain = normalizeDomain(getRowValue(row, ["域名", "domain"]));
  if (!name || !domain) return null;

  return {
    id: String(getRowValue(row, ["id"]) || makeId("site")),
    name,
    domain,
    url: getRowValue(row, ["網址", "url"]) || ensureUrl(domain),
    categoryId: String(getRowValue(row, ["分類ID", "categoryId"]) || ""),
    addedAt: getRowValue(row, ["建立時間", "addedAt"]) || new Date().toISOString()
  };
}

function categoriesFromSheetRows(rows) {
  const parents = new Map();
  const pendingChildren = [];

  rows.forEach((row) => {
    const id = String(getRowValue(row, ["分類ID", "id"]) || "").trim();
    const name = String(getRowValue(row, ["分類名稱", "name"]) || "").trim();
    const parentId = String(getRowValue(row, ["父分類ID", "parentId"]) || "").trim();
    const depth = Number(getRowValue(row, ["層級", "depth"]) || 0);

    if (!id || !name) return;

    if (!parentId && depth !== 1) {
      parents.set(id, { id, name, children: [] });
    } else {
      pendingChildren.push({ id, name, parentId });
    }
  });

  pendingChildren.forEach((child) => {
    const parent = parents.get(child.parentId);
    if (parent) parent.children.push({ id: child.id, name: child.name, children: [] });
    else parents.set(child.id, { id: child.id, name: child.name, children: [] });
  });

  return Array.from(parents.values());
}

function zonesFromSheetRows(rows) {
  return rows.map((row) => {
    const id = String(getRowValue(row, ["專區ID", "id"]) || "").trim();
    const name = String(getRowValue(row, ["專區名稱", "name"]) || "").trim();
    const itemsText = String(getRowValue(row, ["項目JSON", "itemsJSON", "items"]) || "[]");
    if (!id || !name) return null;
    let items = [];
    try {
      items = JSON.parse(itemsText || "[]");
    } catch {
      items = [];
    }
    return { id, name, items: Array.isArray(items) ? items : [] };
  }).filter(Boolean);
}

function mergeZones(localZones, officialZones) {
  const map = new Map();
  officialZones.forEach((zone) => map.set(zone.id, structuredClone(zone)));
  localZones.forEach((zone) => map.set(zone.id, structuredClone(zone)));
  return Array.from(map.values());
}

function mergePaidSites(localPaidSites, officialPaidSites) {
  const map = new Map();
  const keyFor = (site, index) => site.domain || site.url || site.id || `${site.name || "paid"}-${index}`;

  officialPaidSites.forEach((site, index) => {
    map.set(keyFor(site, index), site);
  });

  localPaidSites.forEach((site, index) => {
    const key = keyFor(site, index);
    const official = map.get(key);
    if (!official) {
      map.set(key, site);
      return;
    }

    map.set(key, {
      ...official,
      ...site,
      attachmentUrl: official.attachmentUrl || site.attachmentUrl || "",
      attachmentName: official.attachmentName || site.attachmentName || "",
      attachmentType: official.attachmentType || site.attachmentType || "",
      attachmentData: official.attachmentUrl ? "" : (site.attachmentData || "")
    });
  });

  return Array.from(map.values());
}

function mergePriceItems(localItems, officialItems) {
  const map = new Map();
  officialItems.forEach((item) => map.set(item.id || `${item.item}-${item.description}`, item));
  localItems.forEach((item) => map.set(item.id || `${item.item}-${item.description}`, { ...(map.get(item.id) || {}), ...item }));
  return Array.from(map.values());
}

function paidSiteFromSheetRow(row) {
  return normalizePaidSite({
    id: getRowValue(row, ["id"]),
    name: getRowValue(row, ["網站名稱", "name"]),
    domain: getRowValue(row, ["域名", "domain"]),
    url: getRowValue(row, ["網址", "url"]),
    note: getRowValue(row, ["簡短說明", "說明", "note"])
  });
}

function applyCloudData(data) {
  const cloudSites = Array.isArray(data?.sites) ? data.sites : [];
  const cloudPending = Array.isArray(data?.pending) ? data.pending : [];
  const cloudCategories = Array.isArray(data?.categories) ? data.categories : [];
  const cloudZones = Array.isArray(data?.zones) ? data.zones : [];
  const cloudPaidSites = Array.isArray(data?.paidSites) ? data.paidSites : [];
  const cloudPriceItems = Array.isArray(data?.priceItems) ? data.priceItems : [];

  const officialSites = uniqueSites(cloudSites.map(siteFromSheetRow).filter(Boolean));
  const officialPending = uniqueSites(cloudPending.map(siteFromSheetRow).filter(Boolean));
  const nextCategories = categoriesFromSheetRows(cloudCategories);
  const nextStatuses = {};
  const nextSaved = new Set();

  cloudSites.forEach((row) => {
    const id = String(getRowValue(row, ["id"]) || "");
    if (!id) return;
    nextStatuses[id] = statusValueFromText(getRowValue(row, ["檢查狀態", "status"]));
    if (String(getRowValue(row, ["已收藏", "saved"])).trim() === "是") {
      nextSaved.add(id);
    }
  });

  if (nextCategories.length) {
    const officialCategories = normalizeCategories(nextCategories);
    state.categories = isLoggedIn()
      ? mergeOfficialCategories(officialCategories)
      : officialCategories;
  }

  const officialZones = zonesFromSheetRows(cloudZones);
  if (officialZones.length) {
    state.zones = isLoggedIn() ? mergeZones(state.zones, officialZones) : officialZones;
  }

  const officialPaidSites = uniqueSites(cloudPaidSites.map(paidSiteFromSheetRow).filter(Boolean));
  if (officialPaidSites.length) {
    state.paidSites = isLoggedIn() ? mergePaidSites(state.paidSites, officialPaidSites) : officialPaidSites;
  }

  const officialPriceItems = cloudPriceItems.map(normalizePriceItem).filter(Boolean);
  if (officialPriceItems.length) {
    state.priceItems = isLoggedIn() ? mergePriceItems(state.priceItems, officialPriceItems) : officialPriceItems;
  }

  mergeOfficialSites(officialSites, officialPending);

  nextSaved.forEach((id) => state.saved.add(id));
}

function mergeOfficialSites(officialSites, officialPending) {
  const officialDomains = new Set(officialSites.map((site) => site.domain));
  const localSites = new Map(state.sites.map((site) => [site.domain, site]));
  const localPending = new Map(state.pending.map((site) => [site.domain, site]));
  const nextSites = [];
  const nextPending = [];

  officialSites.forEach((official) => {
    const existing = localSites.get(official.domain) || localPending.get(official.domain);
    const officialCategoryId = official.categoryId || "";
    const hasOfficialCategory = categoryExists(officialCategoryId);

    const merged = {
      ...(existing || {}),
      ...official,
      officialCategoryId,
      fromOfficial: true,
      categoryOverridden: Boolean(existing?.categoryOverridden),
      hiddenByUser: Boolean(existing?.hiddenByUser)
    };

    if (merged.categoryOverridden && categoryExists(existing?.categoryId)) {
      merged.categoryId = existing.categoryId;
      nextSites.push(merged);
      return;
    }

    merged.categoryId = hasOfficialCategory ? officialCategoryId : "";

    if (hasOfficialCategory) {
      nextSites.push(merged);
    } else {
      nextPending.push(merged);
    }
  });

  officialPending.forEach((official) => {
    if (officialDomains.has(official.domain)) return;
    const existing = localSites.get(official.domain) || localPending.get(official.domain);
    if (existing?.categoryOverridden && categoryExists(existing.categoryId)) {
      nextSites.push({
        ...official,
        ...existing,
        officialCategoryId: official.categoryId || "",
        fromOfficial: true,
        categoryOverridden: true,
        hiddenByUser: Boolean(existing.hiddenByUser)
      });
      return;
    }

    nextPending.push({
      ...(existing || {}),
      ...official,
      officialCategoryId: official.categoryId || "",
      categoryId: existing?.categoryOverridden ? existing.categoryId : "",
      fromOfficial: true,
      categoryOverridden: Boolean(existing?.categoryOverridden),
      hiddenByUser: Boolean(existing?.hiddenByUser)
    });
  });

  state.sites.forEach((site) => {
    if (!site.fromOfficial && !officialDomains.has(site.domain)) {
      nextSites.push(site);
    }
  });

  state.sites = uniqueSites(nextSites);
  state.pending = uniqueSites(nextPending);
}

function siteToCloudRow(site) {
  return {
    id: site.id || "",
    name: site.name || "",
    domain: site.domain || "",
    url: site.url || ensureUrl(site.domain),
    categoryId: site.categoryId || "",
    categoryName: categoryLabel(site.categoryId),
    status: getStatusText(state.statuses[site.id] || "unknown"),
    saved: state.saved.has(site.id),
    addedAt: site.addedAt || ""
  };
}

function paidSiteToCloudRow(site) {
  return {
    ...siteToCloudRow(site),
    note: site.note || ""
  };
}

async function loadCloudState() {
  try {
    const data = await apiGet();
    applyCloudData(data);
    saveState();
    render();
  } catch (error) {
    console.warn(error);
  }
}

async function importSpreadsheet(file) {
  if (!requireLogin()) return;
  if (!requireAdmin()) return;
  const ext = file.name.split(".").pop().toLowerCase();
  let rows = [];
  if (ext === "csv" || ext === "tsv") {
    const text = await file.text();
    rows = parseCsv(text, ext === "tsv" ? "\t" : ",");
  } else {
    rows = window.XLSX ? await parseWithSheetJs(file) : await parseXlsxBasic(file);
  }

  const incoming = rowsToSites(rows);
  const existingDomains = new Set([...state.sites, ...state.pending].map((site) => site.domain));
  const fresh = incoming.filter((site) => !existingDomains.has(site.domain));
  state.pending = uniqueSites([...state.pending, ...fresh]);
  saveState();

  const duplicateCount = incoming.length - fresh.length;
  const invalidCount = rows.length - incoming.length;
  els.importStatus.textContent = `讀到 ${rows.length} 列，成功匯入 ${fresh.length} 筆，略過 ${duplicateCount} 筆重複、${invalidCount} 筆欄位不完整。`;

  if (!incoming.length) {
    alert(`有讀到 ${rows.length} 列，但沒有抓到可匯入資料。請確認檔案內有網站名稱與域名，或把「域名」欄放在「網站名稱」右邊。`);
  } else if (!fresh.length && duplicateCount > 0) {
    alert("檔案資料已經存在，所以沒有新增重複資料。");
  }

  render();
}

async function importPaidSpreadsheet(file) {
  if (!requireLogin()) return;
  const ext = file.name.split(".").pop().toLowerCase();
  let rows = [];
  if (ext === "csv" || ext === "tsv") {
    const text = await file.text();
    rows = parseCsv(text, ext === "tsv" ? "\t" : ",");
  } else {
    rows = window.XLSX ? await parseWithSheetJs(file) : await parseXlsxBasic(file);
  }

  const paid = normalizeImportedRows(rows)
    .map((row) => normalizePaidSite({
      name: getRowValue(row, ["網站名稱", "name", "Name"]),
      domain: getRowValue(row, ["域名", "網址", "URL", "url", "domain", "Domain"]),
      note: getRowValue(row, ["簡短說明", "說明", "功能", "note", "description"])
    }))
    .filter(Boolean);

  state.paidSites = uniqueSites([...state.paidSites, ...paid]);
  saveState();
  render();
}

async function parseWithSheetJs(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
}

async function parseXlsxBasic(file) {
  if (!("DecompressionStream" in window)) {
    throw new Error("這個瀏覽器不支援離線解析 Excel，請改用 CSV 或更新瀏覽器。");
  }

  const files = await unzipXlsx(await file.arrayBuffer());
  const workbookXml = await readZipText(files, "xl/workbook.xml");
  const workbookRelsXml = await readZipText(files, "xl/_rels/workbook.xml.rels");
  const workbookDoc = parseXml(workbookXml);
  const relsDoc = parseXml(workbookRelsXml);
  const firstSheet = firstElement(workbookDoc, "sheet");

  if (!firstSheet) {
    throw new Error("找不到 Excel 工作表。");
  }

  const relationshipId = firstSheet.getAttribute("r:id")
    || firstSheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
  const relationship = elements(relsDoc, "Relationship")
    .find((item) => item.getAttribute("Id") === relationshipId);
  const target = relationship?.getAttribute("Target") || "worksheets/sheet1.xml";
  const sheetPath = target.startsWith("xl/") ? target : `xl/${target.replace(/^\/+/, "")}`;
  const sharedStrings = files.has("xl/sharedStrings.xml")
    ? parseSharedStrings(await readZipText(files, "xl/sharedStrings.xml"))
    : [];

  return parseSheetRows(await readZipText(files, sheetPath), sharedStrings);
}

async function unzipXlsx(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const eocdOffset = findEndOfCentralDirectory(view);
  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  const decoder = new TextDecoder();
  const files = new Map();
  let offset = centralOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameBytes = bytes.slice(offset + 46, offset + 46 + fileNameLength);
    const name = decoder.decode(nameBytes).replace(/\\/g, "/");

    const localNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    files.set(name, decompressZipEntry(compressed, method));

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return files;
}

function findEndOfCentralDirectory(view) {
  const start = Math.max(0, view.byteLength - 66000);
  for (let offset = view.byteLength - 22; offset >= start; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  throw new Error("這個 Excel 檔案格式無法讀取。");
}

async function decompressZipEntry(bytes, method) {
  if (method === 0) return bytes;
  if (method !== 8) throw new Error("Excel 壓縮格式不支援。");

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipText(files, path) {
  const entry = files.get(path);
  if (!entry) throw new Error(`Excel 缺少必要檔案：${path}`);
  return new TextDecoder().decode(await entry);
}

function parseXml(text) {
  return new DOMParser().parseFromString(text, "application/xml");
}

function parseSharedStrings(xml) {
  return elements(parseXml(xml), "si").map((item) => {
    return elements(item, "t").map((node) => node.textContent || "").join("");
  });
}

function parseSheetRows(xml, sharedStrings) {
  const doc = parseXml(xml);
  const matrix = elements(doc, "row").map((row) => {
    const values = [];
    elements(row, "c").forEach((cell) => {
      const colIndex = columnIndexFromRef(cell.getAttribute("r"));
      values[colIndex] = readCellValue(cell, sharedStrings);
    });
    return values;
  });

  if (!matrix.length) return [];

  return matrix.map((row) => {
    return Object.fromEntries(row.map((value, index) => [`__COL_${index}`, value ?? ""]));
  });
}

function columnIndexFromRef(ref) {
  const letters = String(ref || "A").replace(/\d+/g, "");
  return letters.split("").reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function readCellValue(cell, sharedStrings) {
  const type = cell.getAttribute("t");
  if (type === "inlineStr") return firstElement(cell, "t")?.textContent || "";
  const value = firstElement(cell, "v")?.textContent || "";
  if (type === "s") return sharedStrings[Number(value)] || "";
  return value;
}

function elements(root, localName) {
  return Array.from(root.getElementsByTagNameNS("*", localName));
}

function firstElement(root, localName) {
  return elements(root, localName)[0] || null;
}

async function restoreBackup(file) {
  const data = JSON.parse(await file.text());
  const storage = data.storage || data;
  Object.entries(STORAGE).forEach(([, key]) => {
    if (Object.prototype.hasOwnProperty.call(storage, key)) {
      const value = storage[key];
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  });
  loadState();
  render();
  alert(`備份已還原：${state.sites.length} 筆已分類，${state.pending.length} 筆待分類。`);
}

function exportBackup() {
  const storage = {};
  Object.values(STORAGE).forEach((key) => {
    storage[key] = readJson(key, null);
  });
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), storage }, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reference-sites-backup.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function uniqueSites(sites) {
  const map = new Map();
  sites.forEach((site, index) => {
    if (!site) return;
    const key = site.domain || site.url || site.id || `${site.name || "site"}-${index}`;
    map.set(key, site);
  });
  return Array.from(map.values());
}

function normalizePaidSite(raw) {
  const name = String(raw?.name || raw?.title || raw?.siteName || raw?.["\u7db2\u7ad9\u540d\u7a31"] || "").trim();
  const domain = normalizeDomain(raw?.domain || raw?.["\u57df\u540d"] || "");
  const url = raw?.url?.startsWith?.("http") ? raw.url : ensureUrl(domain);
  const featureName = String(raw?.featureName || raw?.feature || raw?.["\u529f\u80fd\u540d\u7a31"] || raw?.note || raw?.["\u7c21\u77ed\u8aaa\u660e"] || "\u672a\u5206\u985e\u4ed8\u8cbb\u529f\u80fd").trim();
  const note = String(raw?.description || raw?.note || raw?.["\u529f\u80fd\u8aaa\u660e"] || raw?.["\u8aaa\u660e"] || raw?.["\u7c21\u77ed\u8aaa\u660e"] || "").trim();
  if (!name && !featureName) return null;
  return {
    id: String(raw?.id || makeId("paid")),
    name: name || featureName,
    domain,
    url,
    featureName,
    note,
    attachmentUrl: String(raw?.attachmentUrl || raw?.["\u9644\u4ef6\u9023\u7d50"] || "").trim(),
    attachmentName: String(raw?.attachmentName || raw?.["\u9644\u4ef6\u540d\u7a31"] || "").trim(),
    attachmentType: String(raw?.attachmentType || raw?.["\u9644\u4ef6\u985e\u578b"] || "").trim(),
    attachmentData: raw?.attachmentData || "",
    addedAt: raw?.addedAt || new Date().toISOString()
  };
}

function normalizePriceItem(raw) {
  const item = String(raw?.item || raw?.name || raw?.["\u9805\u76ee"] || "").trim();
  const description = String(raw?.description || raw?.note || raw?.["\u8aaa\u660e"] || "").trim();
  const quote = String(raw?.quote || raw?.["\u662f\u5426\u5831\u50f9"] || "").trim();
  const price = String(raw?.price || raw?.["\u8cbb\u7528\uff08\u672a\u7a05\uff09"] || raw?.["\u8cbb\u7528(\u672a\u7a05)"] || raw?.["\u8cbb\u7528"] || "").trim();
  const remark = String(raw?.remark || raw?.memo || raw?.["\u5099\u8a3b"] || raw?.["\u8aaa\u660e2"] || "").trim();
  if (!item && !description && !price) return null;
  return {
    id: String(raw?.id || makeId("price")),
    item,
    description,
    quote,
    price,
    remark,
    addedAt: raw?.addedAt || new Date().toISOString()
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("\u9644\u4ef6\u8b80\u53d6\u5931\u6557\u3002"));
    reader.readAsDataURL(file);
  });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("\u5716\u7247\u8f09\u5165\u5931\u6557\u3002"));
    };
    img.src = url;
  });
}

async function compressImageToDataUrl(file) {
  const img = await loadImageFromFile(file);
  const maxSide = 1400;
  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

async function readPaidAttachmentFromInput(input) {
  const file = input?.files?.[0];
  if (!file) return {};
  const isImage = file.type.startsWith("image/");
  const maxBytes = isImage ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("\u5716\u7247\u8acb\u63a7\u5236\u5728 10MB \u4ee5\u5167\uff0cPDF/Word \u8acb\u63a7\u5236\u5728 3MB \u4ee5\u5167\u3002");
  }
  const attachmentData = isImage ? await compressImageToDataUrl(file) : await fileToDataUrl(file);
  return {
    attachmentName: isImage ? file.name.replace(/\.[^.]+$/, ".jpg") : file.name,
    attachmentType: isImage ? "image/jpeg" : (file.type || "application/octet-stream"),
    attachmentData
  };
}

function appendPaidAttachmentLink(container, site) {
  if (!site.attachmentUrl && !site.attachmentData) return;
  if (!site.attachmentUrl) {
    const pending = document.createElement("span");
    pending.className = "paid-attachment-link";
    pending.textContent = site.attachmentName ? `\u9644\u4ef6\u5f85\u540c\u6b65\uff1a${site.attachmentName}` : "\u9644\u4ef6\u5f85\u540c\u6b65";
    container.append(pending);
    return;
  }
  const link = document.createElement("a");
  link.className = "paid-attachment-link";
  link.href = site.attachmentUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = site.attachmentName ? `\u67e5\u770b\u9644\u4ef6\uff1a${site.attachmentName}` : "\u67e5\u770b\u9644\u4ef6";
  container.append(link);
}

function isImageAttachment(site) {
  const type = String(site.attachmentType || "").toLowerCase();
  const name = String(site.attachmentName || site.attachmentUrl || "").toLowerCase();
  return type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
}

function getDriveFileId(url) {
  const value = String(url || "");
  const fileMatch = value.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return fileMatch[1];
  const idMatch = value.match(/[?&]id=([^&]+)/);
  return idMatch ? idMatch[1] : "";
}

function getAttachmentPreviewUrl(site) {
  if (site.attachmentData) return site.attachmentData;
  const url = String(site.attachmentUrl || "");
  const fileId = getDriveFileId(url);
  if (fileId) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`;
  return url;
}

function createAttachmentPreview(site) {
  if (!site.attachmentUrl && !site.attachmentData) return null;

  const wrap = document.createElement("div");
  wrap.className = "paid-attachment-preview";

  if (isImageAttachment(site)) {
    const img = document.createElement("img");
    img.src = getAttachmentPreviewUrl(site);
    img.alt = site.attachmentName || "\u4ed8\u8cbb\u529f\u80fd\u5716\u7247";
    img.loading = "lazy";
    wrap.append(img);
  } else {
    const fileLabel = document.createElement("p");
    fileLabel.className = "info-modal-site";
    fileLabel.textContent = site.attachmentName ? `\u9644\u4ef6\uff1a${site.attachmentName}` : "\u6b64\u9805\u76ee\u6709\u9644\u4ef6";
    wrap.append(fileLabel);
  }

  if (site.attachmentUrl) {
    const link = document.createElement("a");
    link.className = "ghost-btn attachment-open-btn";
    link.href = site.attachmentUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "\u958b\u555f\u9644\u4ef6";
    wrap.append(link);
  }

  return wrap;
}

function openPaidAttachmentUpload(site) {
  if (!requireAdmin()) return;
  if (!site?.id) {
    alert("\u8acb\u5148\u5132\u5b58\u6b64\u4ed8\u8cbb\u9805\u76ee\uff0c\u518d\u4e0a\u50b3\u9644\u4ef6\u3002");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,.pdf,.doc,.docx";
  input.addEventListener("change", async () => {
    let attachment = {};
    try {
      attachment = await readPaidAttachmentFromInput(input);
    } catch (error) {
      alert(error.message || "\u9644\u4ef6\u8b80\u53d6\u5931\u6557\u3002");
      return;
    }

    if (!attachment.attachmentData) return;
    site.attachmentName = attachment.attachmentName;
    site.attachmentType = attachment.attachmentType;
    site.attachmentData = attachment.attachmentData;
    site.attachmentUrl = "";
    saveState();
    render();
    alert("\u9644\u4ef6\u5df2\u9078\u64c7\uff0c\u8acb\u6309\u53f3\u4e0a\u89d2\u300c\u5132\u5b58\u8b8a\u66f4\u300d\u4e0a\u50b3\u5230 Google Drive\u3002");
  });
  input.click();
}

function createMiniSiteCard(site, options = {}) {
  const card = document.createElement("article");
  card.className = "pending-card";
  const title = document.createElement("div");
  title.className = "pending-title";
  title.textContent = site.name;
  card.append(title);

  if (site.url) {
    const domain = document.createElement("a");
    domain.className = "pending-domain";
    domain.href = site.url;
    domain.target = "_blank";
    domain.rel = "noopener noreferrer";
    domain.textContent = site.url;
    card.append(domain);
  }

  if (site.note) {
    const note = document.createElement("p");
    note.className = "mini-note";
    note.textContent = site.note;
    card.append(note);
  }

  if (options.actionText && options.onAction) {
    const button = document.createElement("button");
    button.className = "small-btn";
    button.type = "button";
    button.textContent = options.actionText;
    button.addEventListener("click", options.onAction);
    card.append(button);
  }

  if (Array.isArray(options.extraActions) && options.extraActions.length) {
    const actionWrap = document.createElement("div");
    actionWrap.className = "mini-card-actions";
    options.extraActions.forEach((action) => {
      const button = document.createElement("button");
      button.className = action.className || "small-btn";
      button.type = "button";
      button.textContent = action.text || "";
      button.addEventListener("click", action.onClick);
      actionWrap.append(button);
    });
    card.append(actionWrap);
  }
  return card;
}

function addSiteToZone(siteId, zoneId) {
  if (!requireAdmin()) return;
  if (!zoneId) {
    alert("\u8acb\u5148\u9078\u64c7\u5c08\u5340");
    return;
  }
  const zone = state.zones.find((item) => item.id === zoneId);
  if (!zone) return;
  zone.items = zone.items || [];
  zone.items.push({ id: makeId("zone-item"), siteId });
  saveState();
  render();
}

function openZoneEditModal(zoneId) {
  if (!requireAdmin()) return;
  const zone = state.zones.find((item) => item.id === zoneId);
  if (!zone) return;

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop info-modal-backdrop";
  const modal = document.createElement("form");
  modal.className = "login-modal paid-edit-modal";

  const heading = document.createElement("h2");
  heading.textContent = "\u7de8\u8f2f\u5c08\u5340";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = zone.name || "";
  nameInput.placeholder = "\u5c08\u5340\u540d\u7a31";

  const actions = document.createElement("div");
  actions.className = "login-actions";
  const cancel = document.createElement("button");
  cancel.className = "ghost-btn";
  cancel.type = "button";
  cancel.textContent = "\u53d6\u6d88";
  cancel.addEventListener("click", () => backdrop.remove());
  const save = document.createElement("button");
  save.className = "primary-btn";
  save.type = "submit";
  save.textContent = "\u5132\u5b58";
  actions.append(cancel, save);

  modal.append(heading, nameInput, actions);
  modal.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      alert("\u8acb\u8f38\u5165\u5c08\u5340\u540d\u7a31");
      return;
    }
    zone.name = name;
    saveState();
    render();
    backdrop.remove();
  });

  backdrop.append(modal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  document.body.append(backdrop);
  setTimeout(() => nameInput.focus(), 0);
}

function openZoneItemEditModal(siteId) {
  if (!requireAdmin()) return;
  const site = siteById(siteId);
  if (!site) return;

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop info-modal-backdrop";
  const modal = document.createElement("form");
  modal.className = "login-modal paid-edit-modal";

  const heading = document.createElement("h2");
  heading.textContent = "\u7de8\u8f2f\u5c08\u5340\u9805\u76ee";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = site.name || "";
  nameInput.placeholder = "\u7db2\u7ad9\u540d\u7a31";
  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.value = site.url || ensureUrl(site.domain || "");
  urlInput.placeholder = "\u7db2\u5740";

  const actions = document.createElement("div");
  actions.className = "login-actions";
  const cancel = document.createElement("button");
  cancel.className = "ghost-btn";
  cancel.type = "button";
  cancel.textContent = "\u53d6\u6d88";
  cancel.addEventListener("click", () => backdrop.remove());
  const save = document.createElement("button");
  save.className = "primary-btn";
  save.type = "submit";
  save.textContent = "\u5132\u5b58";
  actions.append(cancel, save);

  modal.append(heading, nameInput, urlInput, actions);
  modal.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const url = normalizeUrlInput(urlInput.value);
    const domain = normalizeDomain(url);
    if (!name || !url || !domain) {
      alert("\u8acb\u8f38\u5165\u7db2\u7ad9\u540d\u7a31\u8207\u7db2\u5740");
      return;
    }
    site.name = name;
    site.domain = domain;
    site.url = url;
    saveState();
    render();
    backdrop.remove();
  });

  backdrop.append(modal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  document.body.append(backdrop);
  setTimeout(() => nameInput.focus(), 0);
}

function renderZones() {
  if (!els.zoneList) return;
  if (els.batchZoneSelect) {
    els.batchZoneSelect.innerHTML = "";
    els.batchZoneSelect.append(new Option("\u9078\u64c7\u5c08\u5340", ""));
    state.zones.forEach((zone) => els.batchZoneSelect.append(new Option(zone.name, zone.id)));
  }
  els.zoneList.innerHTML = "";
  if (!state.zones.length) {
    els.zoneList.innerHTML = '<div class="empty-state">\u76ee\u524d\u6c92\u6709\u5c08\u5340\u3002</div>';
    return;
  }
  state.zones.forEach((zone) => {
    const card = document.createElement("article");
    card.className = "pending-card";
    const title = document.createElement("div");
    title.className = "pending-title zone-title";
    title.textContent = `${zone.name}\uff08${(zone.items || []).length}\uff09`;
    card.append(title);

    if (isAdmin()) {
      const removeZone = document.createElement("button");
      removeZone.className = "small-btn delete-btn";
      removeZone.type = "button";
      removeZone.textContent = "\u522a\u9664\u5c08\u5340";
      removeZone.addEventListener("click", () => {
        state.zones = state.zones.filter((item) => item.id !== zone.id);
        saveState();
        render();
      });
      card.append(removeZone);
    }

    (zone.items || []).forEach((item) => {
      const site = siteById(item.siteId);
      if (!site) return;
      const options = isAdmin()
        ? {
            extraActions: [
              {
                text: "\u7de8\u8f2f",
                onClick: () => openZoneItemEditModal(site.id)
              },
              {
                text: "\u79fb\u9664",
                className: "small-btn delete-btn",
                onClick: () => {
                  zone.items = zone.items.filter((entry) => entry.id !== item.id);
                  saveState();
                  render();
                }
              }
            ]
          }
        : {};
      card.append(createMiniSiteCard(site, options));
    });
    els.zoneList.append(card);
  });
}

function addSelectedSitesToZone() {
  if (!requireLogin()) return;
  const zoneId = els.batchZoneSelect?.value || "";
  const zone = state.zones.find((item) => item.id === zoneId);
  if (!zone) {
    alert("\u8acb\u5148\u9078\u64c7\u5c08\u5340");
    return;
  }
  const selected = Array.from(state.selectedForZone);
  if (!selected.length) {
    alert("\u8acb\u5148\u52fe\u9078\u53c3\u8003\u7ad9");
    return;
  }
  zone.items = zone.items || [];
  selected.forEach((siteId) => {
    zone.items.push({ id: makeId("zone-item"), siteId });
  });
  state.selectedForZone.clear();
  saveState();
  render();
}

async function addPaidSite() {
  if (!requireAdmin()) return;
  const featureName = (els.paidFeatureInput?.value || "").trim();
  const name = (els.paidNameInput?.value || "").trim();
  const domain = normalizeDomain(els.paidDomainInput?.value || "");
  const note = (els.paidNoteInput?.value || "").trim();
  if (!featureName || !name) {
    alert("\u8acb\u8f38\u5165\u4ed8\u8cbb\u529f\u80fd\u540d\u7a31\u8207\u53c3\u8003\u7ad9\u540d\u7a31");
    return;
  }
  let attachment = {};
  try {
    attachment = await readPaidAttachmentFromInput(els.paidAttachmentInput);
  } catch (error) {
    alert(error.message || "\u9644\u4ef6\u8b80\u53d6\u5931\u6557\u3002");
    return;
  }
  state.paidSites = uniqueSites([...state.paidSites, {
    id: makeId("paid"),
    name,
    domain,
    url: domain ? ensureUrl(domain) : "",
    featureName,
    note,
    ...attachment,
    addedAt: new Date().toISOString()
  }]);
  if (els.paidFeatureInput) els.paidFeatureInput.value = "";
  els.paidNameInput.value = "";
  els.paidDomainInput.value = "";
  els.paidNoteInput.value = "";
  if (els.paidAttachmentInput) els.paidAttachmentInput.value = "";
  saveState();
  render();
}

function renderPaidSites() {
  if (!els.paidList) return;
  els.paidList.innerHTML = "";
  if (!state.paidSites.length) {
    els.paidList.innerHTML = '<div class="empty-state">\u76ee\u524d\u6c92\u6709\u4ed8\u8cbb\u529f\u80fd\u7db2\u7ad9\u3002</div>';
    return;
  }

  const groups = new Map();
  state.paidSites.forEach((site) => {
    const key = String(site.featureName || site.note || "\u672a\u5206\u985e\u4ed8\u8cbb\u529f\u80fd").trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(site);
  });

  groups.forEach((sites, featureName) => {
    const groupCard = document.createElement("article");
    groupCard.className = "pending-card paid-feature-card";
    const title = document.createElement("div");
    title.className = "pending-title zone-title";
    title.textContent = `${featureName}\uff08${sites.length}\uff09`;
    const tagline = document.createElement("p");
    tagline.className = "paid-tagline";
    tagline.textContent = "\u5be6\u969b\u5831\u50f9\u8acb\u8a62\u554fPM";
    groupCard.append(title, tagline);

    sites.forEach((site) => {
      const item = document.createElement("article");
      item.className = "pending-card paid-site-card";
      const siteTitle = document.createElement("div");
      siteTitle.className = "pending-title";
      siteTitle.textContent = site.name;
      item.append(siteTitle);

      if (site.url) {
        const link = document.createElement("a");
        link.className = "pending-domain";
        link.href = site.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = site.url;
        item.append(link);
      }

      if (site.note) {
        const detailBtn = document.createElement("button");
        detailBtn.className = "small-btn";
        detailBtn.type = "button";
        detailBtn.textContent = site.url ? "\u67e5\u770b\u8aaa\u660e" : "\u67e5\u770b\u529f\u80fd\u8aaa\u660e";
        detailBtn.addEventListener("click", () => openInfoModal(featureName, site));
        item.append(detailBtn);
      }
      appendPaidAttachmentLink(item, site);

      if (isAdmin()) {
        const editBtn = document.createElement("button");
        editBtn.className = "small-btn";
        editBtn.type = "button";
        editBtn.textContent = "\u7de8\u8f2f";
        editBtn.addEventListener("click", () => openPaidEditModal(site.id));
        item.append(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "small-btn delete-btn";
        deleteBtn.type = "button";
        deleteBtn.textContent = "\u522a\u9664";
        deleteBtn.addEventListener("click", () => {
          state.paidSites = state.paidSites.filter((entry) => entry.id !== site.id);
          saveState();
          render();
        });
        item.append(deleteBtn);
      }

      groupCard.append(item);
    });
    els.paidList.append(groupCard);
  });
}

function openInfoModal(title, site) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop info-modal-backdrop";
  const modal = document.createElement("div");
  modal.className = "login-modal info-modal";
  const heading = document.createElement("h2");
  heading.textContent = title;
  const name = document.createElement("p");
  name.className = "info-modal-site";
  name.textContent = site.name;
  const note = document.createElement("p");
  note.className = "info-modal-text";
  note.textContent = site.note || "\u76ee\u524d\u6c92\u6709\u529f\u80fd\u8aaa\u660e\u3002";
  const quote = document.createElement("p");
  quote.className = "paid-tagline";
  quote.textContent = "\u5be6\u969b\u5831\u50f9\u8acb\u8a62\u554fPM";
  const attachmentPreview = createAttachmentPreview(site);
  const actions = document.createElement("div");
  actions.className = "login-actions";
  if (site.url) {
    const link = document.createElement("a");
    link.className = "primary-btn";
    link.href = site.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "\u958b\u555f\u53c3\u8003\u7ad9";
    actions.append(link);
  }
  const close = document.createElement("button");
  close.className = "ghost-btn";
  close.type = "button";
  close.textContent = "\u95dc\u9589";
  close.addEventListener("click", () => backdrop.remove());
  actions.append(close);
  modal.append(heading, name, note, quote);
  if (attachmentPreview) modal.append(attachmentPreview);
  modal.append(actions);
  backdrop.append(modal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  document.body.append(backdrop);
}

function openPriceBookModal() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop info-modal-backdrop";
  const modal = document.createElement("div");
  modal.className = "login-modal price-modal";

  const head = document.createElement("div");
  head.className = "price-modal-head";
  const title = document.createElement("h2");
  title.textContent = "\u6a21\u7d44\u529f\u80fd\u9700\u52a0\u50f9-\u696d\u52d9\u7248";
  head.append(title);

  if (isAdmin()) {
    const addBtn = document.createElement("button");
    addBtn.className = "primary-btn";
    addBtn.type = "button";
    addBtn.textContent = "\u65b0\u589e\u9805\u76ee";
    addBtn.addEventListener("click", () => openPriceItemEditModal());
    head.append(addBtn);
  }

  const tableWrap = document.createElement("div");
  tableWrap.className = "price-table-wrap";
  const table = document.createElement("table");
  table.className = "price-table";
  table.innerHTML = `<thead><tr><th>\u9805\u76ee</th><th>\u8aaa\u660e</th><th>\u662f\u5426\u5831\u50f9</th><th>\u8cbb\u7528\uff08\u672a\u7a05\uff09</th><th>\u5099\u8a3b</th>${isAdmin() ? "<th>\u7ba1\u7406</th>" : ""}</tr></thead>`;
  const tbody = document.createElement("tbody");

  if (!state.priceItems.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = isAdmin() ? 6 : 5;
    cell.className = "empty-state";
    cell.textContent = "\u76ee\u524d\u6c92\u6709\u516c\u5b9a\u50f9\u8cc7\u6599\u3002";
    row.append(cell);
    tbody.append(row);
  } else {
    state.priceItems.forEach((item) => {
      const row = document.createElement("tr");
      [item.item, item.description, item.quote, item.price, item.remark].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value || "";
        row.append(cell);
      });
      if (isAdmin()) {
        const cell = document.createElement("td");
        const edit = document.createElement("button");
        edit.className = "small-btn";
        edit.type = "button";
        edit.textContent = "\u7de8\u8f2f";
        edit.addEventListener("click", () => openPriceItemEditModal(item.id));
        const del = document.createElement("button");
        del.className = "small-btn delete-btn";
        del.type = "button";
        del.textContent = "\u522a\u9664";
        del.addEventListener("click", () => {
          if (!confirm(`\u78ba\u5b9a\u522a\u9664\u300c${item.item || item.description}\u300d\uff1f`)) return;
          state.priceItems = state.priceItems.filter((entry) => entry.id !== item.id);
          saveState();
          backdrop.remove();
          openPriceBookModal();
        });
        cell.append(edit, del);
        row.append(cell);
      }
      tbody.append(row);
    });
  }

  table.append(tbody);
  tableWrap.append(table);

  const actions = document.createElement("div");
  actions.className = "login-actions";
  const close = document.createElement("button");
  close.className = "ghost-btn";
  close.type = "button";
  close.textContent = "\u95dc\u9589";
  close.addEventListener("click", () => backdrop.remove());
  actions.append(close);

  modal.append(head, tableWrap, actions);
  backdrop.append(modal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  document.body.append(backdrop);
}

function openPriceItemEditModal(itemId) {
  if (!requireAdmin()) return;
  const item = itemId ? state.priceItems.find((entry) => entry.id === itemId) : null;
  const draft = item || { id: makeId("price"), item: "", description: "", quote: "", price: "", remark: "", addedAt: new Date().toISOString() };

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop info-modal-backdrop";
  const modal = document.createElement("form");
  modal.className = "login-modal paid-edit-modal";

  const heading = document.createElement("h2");
  heading.textContent = item ? "\u7de8\u8f2f\u516c\u5b9a\u50f9" : "\u65b0\u589e\u516c\u5b9a\u50f9";
  const itemInput = document.createElement("input");
  itemInput.type = "text";
  itemInput.placeholder = "\u9805\u76ee";
  itemInput.value = draft.item || "";
  const descInput = document.createElement("textarea");
  descInput.placeholder = "\u8aaa\u660e";
  descInput.value = draft.description || "";
  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "\u662f\u5426\u5831\u50f9";
  quoteInput.value = draft.quote || "";
  const priceInput = document.createElement("input");
  priceInput.type = "text";
  priceInput.placeholder = "\u8cbb\u7528\uff08\u672a\u7a05\uff09";
  priceInput.value = draft.price || "";
  const remarkInput = document.createElement("textarea");
  remarkInput.placeholder = "\u5099\u8a3b";
  remarkInput.value = draft.remark || "";

  const actions = document.createElement("div");
  actions.className = "login-actions";
  const cancel = document.createElement("button");
  cancel.className = "ghost-btn";
  cancel.type = "button";
  cancel.textContent = "\u53d6\u6d88";
  cancel.addEventListener("click", () => backdrop.remove());
  const save = document.createElement("button");
  save.className = "primary-btn";
  save.type = "submit";
  save.textContent = "\u5132\u5b58";
  actions.append(cancel, save);

  modal.append(heading, itemInput, descInput, quoteInput, priceInput, remarkInput, actions);
  modal.addEventListener("submit", (event) => {
    event.preventDefault();
    const next = {
      id: draft.id,
      item: itemInput.value.trim(),
      description: descInput.value.trim(),
      quote: quoteInput.value.trim(),
      price: priceInput.value.trim(),
      remark: remarkInput.value.trim(),
      addedAt: draft.addedAt || new Date().toISOString()
    };
    if (!next.item && !next.description && !next.price) {
      alert("\u8acb\u81f3\u5c11\u8f38\u5165\u9805\u76ee\u3001\u8aaa\u660e\u6216\u8cbb\u7528\u3002");
      return;
    }
    if (item) {
      Object.assign(item, next);
    } else {
      state.priceItems.push(next);
    }
    saveState();
    render();
    backdrop.remove();
    openPriceBookModal();
  });

  backdrop.append(modal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  document.body.append(backdrop);
}

function openPaidEditModal(siteId) {
  if (!requireAdmin()) return;
  const site = state.paidSites.find((item) => item.id === siteId);
  if (!site) return;

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop info-modal-backdrop";
  const modal = document.createElement("form");
  modal.className = "login-modal paid-edit-modal";

  const heading = document.createElement("h2");
  heading.textContent = "\u7de8\u8f2f\u4ed8\u8cbb\u9805\u76ee";
  const featureInput = document.createElement("input");
  featureInput.type = "text";
  featureInput.value = site.featureName || "";
  featureInput.placeholder = "\u4ed8\u8cbb\u529f\u80fd\u540d\u7a31";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = site.name || "";
  nameInput.placeholder = "\u53c3\u8003\u7ad9\u540d\u7a31";
  const domainInput = document.createElement("input");
  domainInput.type = "text";
  domainInput.value = site.domain || "";
  domainInput.placeholder = "\u57df\u540d\uff08\u53ef\u7559\u7a7a\uff09";
  const noteInput = document.createElement("textarea");
  noteInput.value = site.note || "";
  noteInput.placeholder = "\u529f\u80fd\u8aaa\u660e";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,.pdf,.doc,.docx";

  const currentFile = document.createElement("p");
  currentFile.className = "info-modal-site";
  currentFile.textContent = site.attachmentUrl
    ? `\u76ee\u524d\u9644\u4ef6\uff1a${site.attachmentName || site.attachmentUrl}`
    : "\u76ee\u524d\u6c92\u6709\u9644\u4ef6\u3002";
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) {
      currentFile.textContent = `\u5df2\u9078\u64c7\uff1a${file.name}\uff0c\u8acb\u5148\u6309\u300c\u5132\u5b58\u300d\uff0c\u518d\u6309\u53f3\u4e0a\u89d2\u300c\u5132\u5b58\u8b8a\u66f4\u300d\u4e0a\u50b3\u3002`;
    }
  });

  const actions = document.createElement("div");
  actions.className = "login-actions";
  const cancel = document.createElement("button");
  cancel.className = "ghost-btn";
  cancel.type = "button";
  cancel.textContent = "\u53d6\u6d88";
  cancel.addEventListener("click", () => backdrop.remove());
  const save = document.createElement("button");
  save.className = "primary-btn";
  save.type = "submit";
  save.textContent = "\u5132\u5b58";
  actions.append(cancel, save);

  modal.append(heading, featureInput, nameInput, domainInput, noteInput, fileInput, currentFile, actions);
  modal.addEventListener("submit", async (event) => {
    event.preventDefault();
    const featureName = featureInput.value.trim();
    const name = nameInput.value.trim();
    if (!featureName || !name) {
      alert("\u8acb\u8f38\u5165\u4ed8\u8cbb\u529f\u80fd\u540d\u7a31\u8207\u53c3\u8003\u7ad9\u540d\u7a31");
      return;
    }
    let attachment = {};
    try {
      attachment = await readPaidAttachmentFromInput(fileInput);
    } catch (error) {
      alert(error.message || "\u9644\u4ef6\u8b80\u53d6\u5931\u6557\u3002");
      return;
    }
    site.featureName = featureName;
    site.name = name;
    site.domain = normalizeDomain(domainInput.value);
    site.url = site.domain ? ensureUrl(site.domain) : "";
    site.note = noteInput.value.trim();
    Object.assign(site, attachment);
    if (attachment.attachmentData) {
      site.attachmentUrl = "";
    }
    saveState();
    render();
    backdrop.remove();
    if (attachment.attachmentData) {
      alert("\u9644\u4ef6\u5df2\u5148\u66ab\u5b58\uff0c\u8acb\u6309\u53f3\u4e0a\u89d2\u300c\u5132\u5b58\u8b8a\u66f4\u300d\uff0c\u624d\u6703\u4e0a\u50b3\u5230 Google Drive\u3002");
    }
  });

  backdrop.append(modal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  document.body.append(backdrop);
}

function paidSiteFromSheetRow(row) {
  return normalizePaidSite({
    id: getRowValue(row, ["id"]),
    name: getRowValue(row, ["\u7db2\u7ad9\u540d\u7a31", "name"]),
    domain: getRowValue(row, ["\u57df\u540d", "domain"]),
    url: getRowValue(row, ["\u7db2\u5740", "url"]),
    featureName: getRowValue(row, ["\u529f\u80fd\u540d\u7a31", "featureName", "feature"]),
    note: getRowValue(row, ["\u529f\u80fd\u8aaa\u660e", "\u7c21\u77ed\u8aaa\u660e", "note", "description"]),
    attachmentUrl: getRowValue(row, ["\u9644\u4ef6\u9023\u7d50", "attachmentUrl"]),
    attachmentName: getRowValue(row, ["\u9644\u4ef6\u540d\u7a31", "attachmentName"]),
    attachmentType: getRowValue(row, ["\u9644\u4ef6\u985e\u578b", "attachmentType"]),
    addedAt: getRowValue(row, ["\u5efa\u7acb\u6642\u9593", "addedAt"])
  });
}

function paidSiteToCloudRow(site) {
  return {
    ...siteToCloudRow(site),
    featureName: site.featureName || site.note || "",
    note: site.note || "",
    attachmentUrl: site.attachmentUrl || "",
    attachmentName: site.attachmentName || "",
    attachmentType: site.attachmentType || "",
    attachmentData: site.attachmentData || ""
  };
}

function priceItemToCloudRow(item) {
  return {
    id: item.id || makeId("price"),
    item: item.item || "",
    description: item.description || "",
    quote: item.quote || "",
    price: item.price || "",
    remark: item.remark || "",
    addedAt: item.addedAt || ""
  };
}

async function importPaidSpreadsheet(file) {
  if (!requireAdmin()) return;
  const ext = file.name.split(".").pop().toLowerCase();
  let rows = [];
  if (ext === "csv" || ext === "tsv") {
    const text = await file.text();
    rows = parseCsv(text, ext === "tsv" ? "\t" : ",");
  } else {
    rows = window.XLSX ? await parseWithSheetJs(file) : await parseXlsxBasic(file);
  }

  const paid = normalizeImportedRows(rows)
    .map((row) => normalizePaidSite({
      featureName: getRowValue(row, ["\u529f\u80fd\u540d\u7a31", "featureName", "feature"]),
      name: getRowValue(row, ["\u7db2\u7ad9\u540d\u7a31", "\u53c3\u8003\u7ad9\u540d\u7a31", "name", "Name"]),
      domain: getRowValue(row, ["\u57df\u540d", "\u7db2\u5740", "URL", "url", "domain", "Domain"]),
      note: getRowValue(row, ["\u529f\u80fd\u8aaa\u660e", "\u7c21\u77ed\u8aaa\u660e", "\u8aaa\u660e", "note", "description"])
    }))
    .filter(Boolean);

  state.paidSites = uniqueSites([...state.paidSites, ...paid]);
  saveState();
  render();
}

function isAdmin() {
  const role = currentRoleName().toLowerCase();
  return ["admin", "superadmin", "\u7e3d\u7ba1\u7406\u54e1", "\u7ba1\u7406\u54e1"].includes(role);
}

function updateAccountUi() {
  const name = state.currentUser?.username || "";
  const roleName = currentRoleName() || "\u4f7f\u7528\u8005";
  els.body.classList.toggle("is-logged-in", Boolean(name));
  els.body.classList.toggle("is-admin", isAdmin());
  els.accountLabel.textContent = name ? `\u5df2\u767b\u5165\uff1a${name}\uff08${roleName}\uff09` : "\u672a\u767b\u5165";
  els.loginBtn.hidden = Boolean(name);
  els.logoutBtn.hidden = !name;
  els.saveUserBtn.hidden = !name;
  els.saveUserBtn.disabled = !name || !state.isDirty;
  els.saveUserBtn.textContent = state.isDirty ? "\u5132\u5b58\u8b8a\u66f4" : "\u5df2\u5132\u5b58";
  els.saveUserBtn.classList.toggle("is-dirty", state.isDirty);
  els.saveUserBtn.classList.toggle("is-saved", Boolean(name) && !state.isDirty);
  if ((!name || !isAdmin()) && state.editing) {
    state.editing = false;
  }
}

function requireLogin() {
  if (isLoggedIn()) return true;
  alert("\u8acb\u5148\u767b\u5165\u5e33\u865f\u3002");
  openLoginModal();
  return false;
}

function requireAdmin() {
  if (isAdmin()) return true;
  alert("\u53ea\u6709\u7e3d\u7ba1\u7406\u54e1\u624d\u80fd\u7de8\u8f2f\u6b64\u5340\u584a\u3002");
  return false;
}

els.toggleEditBtn.addEventListener("click", () => {
  if (!state.editing && !requireLogin()) return;
  state.editing = !state.editing;
  renderCategories();
});
if (els.mobileCategoryBtn) {
  els.mobileCategoryBtn.addEventListener("click", toggleMobileSidebar);
}
if (els.mobileSidebarBackdrop) {
  els.mobileSidebarBackdrop.addEventListener("click", closeMobileSidebar);
}
if (els.mobileZoneJumpBtn) {
  els.mobileZoneJumpBtn.addEventListener("click", () => scrollToUtilityPanel(els.zonePanel));
}
if (els.mobilePaidJumpBtn) {
  els.mobilePaidJumpBtn.addEventListener("click", () => scrollToUtilityPanel(els.paidPanel));
}
els.addCategoryBtn.addEventListener("click", addCategory);
els.addChildBtn.addEventListener("click", addChildCategory);
els.searchInput.addEventListener("input", () => {
  state.search = els.searchInput.value;
  state.visibleCount = 12;
  renderSites();
});
els.loadMoreBtn.addEventListener("click", () => {
  state.visibleCount += 12;
  renderSites();
});
els.checkVisibleBtn.addEventListener("click", checkVisibleSites);
els.exportBackupBtn.addEventListener("click", () => {
  if (!requireLogin()) return;
  exportBackup();
});
els.importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    importSpreadsheet(file).catch((error) => {
      console.error(error);
      els.importStatus.textContent = "匯入失敗，請確認 Excel 欄位有「網站名稱」與「域名」。";
      alert(error.message || "匯入失敗，請確認 Excel 檔案格式。");
    });
  }
  event.target.value = "";
});
if (els.backupInput) {
  els.backupInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) restoreBackup(file);
    event.target.value = "";
  });
}
if (els.favoritePanelBtn && els.favoritePanel) {
  els.favoritePanelBtn.addEventListener("click", () => {
    els.favoritePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
if (els.addZoneBtn) {
  els.addZoneBtn.addEventListener("click", addZone);
}
if (els.batchAddZoneBtn) {
  els.batchAddZoneBtn.addEventListener("click", addSelectedSitesToZone);
}
if (els.zoneNameInput) {
  els.zoneNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addZone();
  });
}
if (els.addPaidBtn) {
  els.addPaidBtn.addEventListener("click", () => {
    addPaidSite().catch((error) => {
      console.error(error);
      alert(error.message || "\u4ed8\u8cbb\u9805\u76ee\u65b0\u589e\u5931\u6557\u3002");
    });
  });
}
if (els.paidImportInput) {
  els.paidImportInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      importPaidSpreadsheet(file).catch((error) => {
        console.error(error);
        alert(error.message || "付費參考站匯入失敗。");
      });
    }
    event.target.value = "";
  });
}
if (els.priceBookBtn) {
  els.priceBookBtn.addEventListener("click", openPriceBookModal);
}
els.clearPendingBtn.addEventListener("click", () => {
  if (!requireLogin()) return;
  if (!confirm("確定清空所有待分類資料？")) return;
  state.pending = [];
  saveState();
  renderPending();
});

els.loginBtn.addEventListener("click", openLoginModal);
els.logoutBtn.addEventListener("click", logout);
els.cancelLoginBtn.addEventListener("click", closeLoginModal);
els.saveUserBtn.addEventListener("click", saveUserData);
els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  login(els.usernameInput.value.trim(), els.passwordInput.value);
});

async function initApp() {
  await loadSeedScriptIfNeeded();
  closeLoginModal();
  state.currentUser = readJson(STORAGE.currentUser, null);
  if (state.currentUser?.role === "驗證中") {
    state.currentUser = null;
    localStorage.removeItem(STORAGE.currentUser);
  }
  updateAccountUi();
  loadState();
  render();
  loadCloudState();
}

initApp();
