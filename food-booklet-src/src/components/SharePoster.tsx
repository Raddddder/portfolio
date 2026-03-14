import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, RotateCcw } from 'lucide-react';
import { Record } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

// ======== 颜色常量 ========
const PAPER = '#F4F1EA';
const INK = '#2C302E';
const STAMP = '#3B4D43';
const CINNABAR = '#C04829';
const SHARE_URL = 'https://rockorbust.cn/works/food-booklet/index.html';

// ======== 辅助函数 ========

/** 加载图片（带超时，失败返回 null） */
function loadImage(src: string, timeout = 5000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), timeout);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = src;
  });
}

/** 加载图片，失败后尝试通过代理 */
async function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  let img = await loadImage(src, 4000);
  if (img) return img;
  // 通过 wsrv.nl 免费图片代理（自动加 CORS 头）
  img = await loadImage(`https://wsrv.nl/?url=${encodeURIComponent(src)}&w=600&q=80`, 5000);
  return img;
}

/** 等待字体就绪 */
async function waitForFonts(timeout = 2500): Promise<void> {
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise(r => setTimeout(r, timeout)),
    ]);
  } catch { /* ignore */ }
}

/** 绘制圆角矩形路径 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** 文本自动换行绘制，返回结束 Y 坐标 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = 'center'
): number {
  ctx.textAlign = align;
  let line = '';
  let curY = y;
  for (let i = 0; i < text.length; i++) {
    const test = line + text[i];
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line, x, curY);
      line = text[i];
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, curY);
  return curY + lineHeight;
}

// ======== Canvas 绘制海报 ========
async function generatePosterCanvas(
  record: Record,
  qrCanvasEl: HTMLCanvasElement | null
): Promise<string> {
  const W = 750; // 2x retina
  const PAD = 60;
  const serifFont = '"Noto Serif SC", "Songti SC", "SimSun", serif';
  const sealFont = '"Zhi Mang Xing", "STKaiti", "KaiTi", cursive';

  // 等字体 + 加载图片并行
  const [, photo] = await Promise.all([
    waitForFonts(),
    record.photoUrl ? loadImageSafe(record.photoUrl) : Promise.resolve(null),
  ]);

  // ---- 预计算高度 ----
  const tmpC = document.createElement('canvas');
  const tmpX = tmpC.getContext('2d')!;

  // soul note 行数
  tmpX.font = `20px ${serifFont}`;
  const noteMaxW = W - PAD * 2 - 100;
  let noteTextW = 0;
  const noteText = record.soulNote || '无言的美味...';
  for (const ch of noteText) noteTextW += tmpX.measureText(ch).width;
  const noteLines = Math.max(1, Math.ceil(noteTextW / noteMaxW));

  let H = PAD;           // top
  H += 80;               // header
  if (photo) H += (W - PAD * 2) * 0.56 + 36; // photo
  H += 56;               // store name
  H += 44;               // tags
  H += noteLines * 32 + 70; // soul note box
  H += 30;               // gap
  H += 100;              // footer
  H += PAD;              // bottom

  // ---- 创建 canvas ----
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 背景
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // 轻微纸张纹理
  const imgData = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < imgData.data.length; i += 16) { // 每4像素处理一次，性能
    const n = (Math.random() - 0.5) * 10;
    imgData.data[i] += n;
    imgData.data[i + 1] += n;
    imgData.data[i + 2] += n;
  }
  ctx.putImageData(imgData, 0, 0);

  // 装饰双线边框
  ctx.strokeStyle = `${INK}33`;
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.strokeStyle = `${INK}1A`;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // ======== 御印食录 (右上角红色印章) ========
  ctx.save();
  ctx.translate(W - PAD - 58, PAD + 44);
  ctx.rotate(-8 * Math.PI / 180);
  ctx.strokeStyle = CINNABAR;
  ctx.lineWidth = 6;
  ctx.globalAlpha = 0.85;
  roundRect(ctx, -54, -54, 108, 108, 4);
  ctx.stroke();
  ctx.fillStyle = CINNABAR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 42px ${sealFont}`;
  // 右列：食 录   左列：御 印
  ctx.fillText('食', 24, -22);
  ctx.fillText('录', 24, 26);
  ctx.fillText('御', -24, -22);
  ctx.fillText('印', -24, 26);
  ctx.globalAlpha = 1;
  ctx.restore();

  // ======== Header: 食录编号 ========
  let curY = PAD + 20;
  ctx.fillStyle = `${INK}99`;
  ctx.font = `14px ${serifFont}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('食录编号', PAD, curY);
  curY += 26;
  ctx.fillStyle = INK;
  ctx.font = `bold 18px ${serifFont}`;
  ctx.fillText(record.id.toUpperCase(), PAD, curY);
  curY += 36;

  // ======== Photo ========
  if (photo) {
    const pW = W - PAD * 2;
    const pH = pW * 0.56;
    ctx.save();
    ctx.translate(W / 2, curY + pH / 2);
    ctx.rotate(1 * Math.PI / 180);
    // 外框阴影
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = PAPER;
    ctx.fillRect(-pW / 2 - 10, -pH / 2 - 10, pW + 20, pH + 20);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(-pW / 2 - 10, -pH / 2 - 10, pW + 20, pH + 20);
    // 照片
    ctx.drawImage(photo, -pW / 2, -pH / 2, pW, pH);
    // 轻微暖色调
    ctx.fillStyle = 'rgba(112, 66, 20, 0.05)';
    ctx.fillRect(-pW / 2, -pH / 2, pW, pH);
    ctx.restore();
    curY += pH + 36;
  }

  // ======== 店名（带字间距） ========
  ctx.fillStyle = INK;
  ctx.font = `900 36px ${serifFont}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const chars = record.storeName.split('');
  const spacing = 8;
  let totalW = 0;
  chars.forEach(ch => { totalW += ctx.measureText(ch).width + spacing; });
  totalW -= spacing;
  let cx = (W - totalW) / 2;
  chars.forEach(ch => {
    ctx.fillText(ch, cx, curY);
    cx += ctx.measureText(ch).width + spacing;
  });
  curY += 20;

  // ======== 标签 ========
  curY += 16;
  ctx.font = `13px ${serifFont}`;
  const tags = [`¥${record.budget}`, record.scene, ...record.details];
  const gap = 12;
  const padX = 12;
  const padY = 6;
  const tagMeasures = tags.map(t => ({ text: t, w: ctx.measureText(t).width + padX * 2 }));
  let totalTW = tagMeasures.reduce((s, t) => s + t.w, 0) + gap * (tags.length - 1);
  // 如果超过宽度，只显示前几个
  while (totalTW > W - PAD * 2 && tagMeasures.length > 2) {
    tagMeasures.pop();
    totalTW = tagMeasures.reduce((s, t) => s + t.w, 0) + gap * (tagMeasures.length - 1);
  }
  let tx = (W - totalTW) / 2;
  tagMeasures.forEach(({ text, w }) => {
    ctx.strokeStyle = `${STAMP}55`;
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, curY - padY - 8, w, 24);
    ctx.fillStyle = `${STAMP}0D`;
    ctx.fillRect(tx, curY - padY - 8, w, 24);
    ctx.fillStyle = STAMP;
    ctx.textAlign = 'center';
    ctx.fillText(text, tx + w / 2, curY + 2);
    tx += w + gap;
  });
  curY += 30;

  // ======== 灵魂附言 ========
  const noteBoxX = PAD + 20;
  const noteBoxW = W - PAD * 2 - 40;
  const noteBoxH = noteLines * 32 + 48;
  // 背景
  ctx.fillStyle = `${INK}0A`;
  roundRect(ctx, noteBoxX, curY, noteBoxW, noteBoxH, 4);
  ctx.fill();
  // 引号装饰
  ctx.fillStyle = `${STAMP}33`;
  ctx.font = `48px ${serifFont}`;
  ctx.textAlign = 'left';
  ctx.fillText('\u201C', noteBoxX + 12, curY + 34);
  ctx.textAlign = 'right';
  ctx.fillText('\u201D', noteBoxX + noteBoxW - 12, curY + noteBoxH - 2);
  // 文字
  ctx.fillStyle = INK;
  ctx.font = `20px ${serifFont}`;
  drawWrappedText(ctx, noteText, W / 2, curY + 36, noteBoxW - 70, 32, 'center');
  curY += noteBoxH + 24;

  // ======== 分隔线 ========
  ctx.strokeStyle = `${INK}33`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, curY);
  ctx.lineTo(W - PAD, curY);
  ctx.stroke();
  curY += 28;

  // ======== Footer: 记录者 + 二维码 ========
  ctx.fillStyle = `${INK}99`;
  ctx.font = `12px ${serifFont}`;
  ctx.textAlign = 'left';
  ctx.fillText('记录者', PAD, curY);
  curY += 24;
  ctx.fillStyle = INK;
  ctx.font = `bold 20px ${serifFont}`;
  ctx.fillText(record.author, PAD, curY);
  // 作者小印章
  const aW = ctx.measureText(record.author).width;
  ctx.save();
  ctx.translate(PAD + aW + 18, curY - 6);
  ctx.rotate(4 * Math.PI / 180);
  ctx.strokeStyle = CINNABAR;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.8;
  ctx.strokeRect(-9, -9, 18, 18);
  ctx.fillStyle = CINNABAR;
  ctx.font = `12px ${sealFont}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(record.author.slice(0, 1), 0, 0);
  ctx.globalAlpha = 1;
  ctx.restore();
  curY += 20;
  ctx.fillStyle = `${INK}99`;
  ctx.font = `12px ${serifFont}`;
  ctx.textAlign = 'left';
  ctx.fillText(record.campus, PAD, curY);

  // 二维码（从预渲染的 QRCodeCanvas 拿）
  if (qrCanvasEl) {
    const qS = 120;
    const qX = W - PAD - qS - 10;
    const qY = curY - 60;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qX - 6, qY - 6, qS + 12, qS + 12);
    ctx.strokeStyle = `${INK}33`;
    ctx.lineWidth = 1;
    ctx.strokeRect(qX - 6, qY - 6, qS + 12, qS + 12);
    ctx.drawImage(qrCanvasEl, qX, qY, qS, qS);
    ctx.fillStyle = `${INK}99`;
    ctx.font = `10px ${serifFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('扫码查看食录', qX + qS / 2, qY + qS + 18);
  }

  return canvas.toDataURL('image/png', 0.92);
}

// ======== React 组件 ========
export default function SharePoster({ record, onClose }: { record: Record; onClose: () => void }) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(false);
    setPosterUrl(null);

    // 等一帧让 QRCodeCanvas 渲染完
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const qrCanvas = qrRef.current?.querySelector('canvas') || null;
      const url = await generatePosterCanvas(record, qrCanvas);
      setPosterUrl(url);
    } catch (err) {
      console.error('海报生成失败:', err);
      setError(true);
    } finally {
      setIsGenerating(false);
    }
  }, [record]);

  useEffect(() => {
    generate();
  }, [generate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4">
      {/* 隐藏的 QRCodeCanvas，用于拿 canvas 元素 */}
      <div ref={qrRef} className="absolute -left-[9999px] -top-[9999px]">
        <QRCodeCanvas value={SHARE_URL} size={120} fgColor={INK} bgColor="#FFFFFF" level="M" />
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-paper/10 rounded-full flex items-center justify-center text-paper active:bg-paper/30 transition-colors z-50"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        {/* 海报 / loading / 错误 */}
        <div className="w-full bg-paper/10 rounded-lg flex items-center justify-center overflow-hidden shadow-2xl" style={{ minHeight: '300px' }}>
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-paper py-20">
              <div className="w-6 h-6 border-2 border-paper border-t-transparent rounded-full animate-spin" />
              <p className="font-serif text-sm tracking-widest">正在研墨...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-paper py-20">
              <p className="font-serif text-sm opacity-80">墨迹未干，生成失败</p>
              <button
                onClick={generate}
                className="flex items-center gap-2 px-4 py-2 bg-paper/10 rounded-full text-paper font-serif text-sm active:bg-paper/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                再试一次
              </button>
            </div>
          ) : posterUrl ? (
            <img src={posterUrl} alt="食录海报" className="w-full h-auto" />
          ) : null}
        </div>

        {/* 操作 */}
        {posterUrl && (
          <div className="flex flex-col items-center gap-3 text-paper w-full">
            <p className="font-serif text-xs opacity-60 text-center">长按上方图片保存，或点击下方按钮</p>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.download = `食录-${record.storeName}.png`;
                link.href = posterUrl!;
                link.click();
              }}
              className="flex items-center gap-2 bg-stamp text-paper px-6 py-3 rounded-full font-serif font-bold tracking-widest active:bg-stamp/80 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Download className="w-4 h-4" />
              保存海报
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
