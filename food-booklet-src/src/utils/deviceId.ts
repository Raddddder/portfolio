/**
 * 简单设备指纹：canvas fingerprint + UA + 屏幕分辨率
 * 生成后存 localStorage，下次直接匹配
 */

const DEVICE_ID_KEY = 'food-booklet-device-id';
const DEVICE_VISIT_KEY = 'food-booklet-visits';

function generateFingerprint(): string {
  const components: string[] = [];
  
  // UA
  components.push(navigator.userAgent);
  
  // 屏幕
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  
  // 时区
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // 语言
  components.push(navigator.language);
  
  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('食录fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102,204,0,0.7)';
      ctx.fillText('食录fingerprint', 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch {
    components.push('no-canvas');
  }
  
  // 简单 hash
  const str = components.join('|||');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // 转成可读的 hex + 随机后缀（防碰撞）
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const rand = Math.random().toString(36).substring(2, 6);
  return `fb-${hex}-${rand}`;
}

export interface DeviceInfo {
  deviceId: string;
  isReturning: boolean;
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
}

export function getDeviceInfo(): DeviceInfo {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  let isReturning = false;
  
  const visitsRaw = localStorage.getItem(DEVICE_VISIT_KEY);
  let visits = visitsRaw ? JSON.parse(visitsRaw) : null;
  
  if (deviceId && visits) {
    // 回访用户
    isReturning = true;
    visits.count += 1;
    visits.lastVisit = new Date().toISOString();
  } else {
    // 新用户
    deviceId = generateFingerprint();
    visits = {
      count: 1,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    };
  }
  
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  localStorage.setItem(DEVICE_VISIT_KEY, JSON.stringify(visits));
  
  return {
    deviceId,
    isReturning,
    visitCount: visits.count,
    firstVisit: visits.firstVisit,
    lastVisit: visits.lastVisit,
  };
}
