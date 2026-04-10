/**
 * 用户工具函数
 *
 * 设计：
 * - userId: 长UUID，用于数据库关联，保证唯一性
 * - accessCode: 短码(8位)，方便用户记忆和分享
 */

// localStorage keys
const USER_ID_KEY = "vote_system_user_id";
const ACCESS_CODE_KEY = "vote_system_access_code";

// 生成UUID
function generateUUID(): string {
  return "user_" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

// 生成访问码 (8位字母数字，方便记忆)
function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混淆的字符
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 访问码到userId的映射（存储在localStorage）
const CODE_MAP_KEY = "vote_system_code_map";

/**
 * 获取或创建用户ID
 * 如果用户是新访问，自动生成userId和accessCode
 */
export function getOrCreateUser(): { userId: string; accessCode: string; isNew: boolean } {
  if (typeof window === "undefined") {
    return { userId: "", accessCode: "", isNew: false };
  }

  // 检查是否已有userId
  const existingUserId = localStorage.getItem(USER_ID_KEY);
  const existingAccessCode = localStorage.getItem(ACCESS_CODE_KEY);

  if (existingUserId && existingAccessCode) {
    return { userId: existingUserId, accessCode: existingAccessCode, isNew: false };
  }

  // 生成新的用户标识
  const userId = generateUUID();
  const accessCode = generateAccessCode();

  // 存储到localStorage
  localStorage.setItem(USER_ID_KEY, userId);
  localStorage.setItem(ACCESS_CODE_KEY, accessCode);

  // 存储映射关系（用于通过访问码查找userId）
  const codeMapStr = localStorage.getItem(CODE_MAP_KEY) || "{}";
  const codeMap = JSON.parse(codeMapStr);
  codeMap[accessCode] = userId;
  localStorage.setItem(CODE_MAP_KEY, JSON.stringify(codeMap));

  return { userId, accessCode, isNew: true };
}

/**
 * 获取当前用户ID
 */
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * 获取当前访问码
 */
export function getCurrentAccessCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_CODE_KEY);
}

/**
 * 通过访问码恢复用户身份
 * 返回是否成功
 */
export function restoreByAccessCode(accessCode: string): boolean {
  if (typeof window === "undefined") return false;

  // 从映射中查找userId
  const codeMapStr = localStorage.getItem(CODE_MAP_KEY) || "{}";
  const codeMap = JSON.parse(codeMapStr);
  const userId = codeMap[accessCode.toUpperCase()];

  if (userId) {
    // 在当前设备上恢复身份
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(ACCESS_CODE_KEY, accessCode.toUpperCase());
    return true;
  }

  // 本地没有映射，可能是新设备
  // 将访问码标记为待验证，跳转到验证页面
  return false;
}

/**
 * 设置用户身份（用于恢复或切换账号）
 */
export function setUserIdentity(userId: string, accessCode: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(USER_ID_KEY, userId);
  localStorage.setItem(ACCESS_CODE_KEY, accessCode);

  // 更新映射
  const codeMapStr = localStorage.getItem(CODE_MAP_KEY) || "{}";
  const codeMap = JSON.parse(codeMapStr);
  codeMap[accessCode] = userId;
  localStorage.setItem(CODE_MAP_KEY, JSON.stringify(codeMap));
}

/**
 * 清除用户身份（登出）
 */
export function clearUserIdentity(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(ACCESS_CODE_KEY);
}

/**
 * 检查是否已登录
 */
export function hasUserIdentity(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(USER_ID_KEY);
}