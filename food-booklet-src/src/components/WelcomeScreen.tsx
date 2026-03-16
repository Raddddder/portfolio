import React from 'react';
import { motion } from 'motion/react';
import { PenLine, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { DeviceInfo } from '../utils/deviceId';

interface WelcomeScreenProps {
  onStart: () => void;
  buttonText?: string;
  deviceInfo?: DeviceInfo | null;
  isMobile?: boolean;
}

export default function WelcomeScreen({ onStart, buttonText = "执笔记录", deviceInfo, isMobile = true }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-sm w-full space-y-6 relative z-10"
      >
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
            animate={{ rotate: -6, scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="w-14 h-14 border-[3px] border-stamp text-stamp mx-auto flex items-center justify-center rounded-sm mb-4 bg-paper/50 mix-blend-multiply"
          >
            <span className="font-seal text-3xl pr-1">食</span>
          </motion.div>
          <h1 className="font-serif font-black text-3xl tracking-widest">食录</h1>
          <p className="font-serif text-xs opacity-60 uppercase tracking-[0.3em]">The Food Booklet</p>
        </div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center relative py-2"
        >
          <span className="absolute -top-3 -left-2 text-5xl text-ink/10 font-serif">"</span>
          <p className="font-hand text-2xl leading-relaxed text-ink/90 mb-1">
            四方食事，不过一碗人间烟火。
          </p>
          <p className="font-serif text-xs text-ink/50 tracking-widest">
            —— 汪曾祺
          </p>
        </motion.div>

        <div className="space-y-4 font-serif text-sm leading-loose text-ink/80 text-justify relative pl-2">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[#C04829]/30" />
          
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          >
            我们厌倦了充斥着营销泡沫的点评榜单，也疲于在海量信息中寻找一顿果腹的便饭。
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          >
            这里没有精致的摆拍与虚假的赞美。<br/>
            只有钱包的厚度、一人食的尴尬度，<br/>
            以及藏在巷子里的那口烟火气。
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}
            className="font-bold text-ink"
          >
            作为交换，在解锁这片大学城的美食自留地之前，请先留下你的一份真实食录。
          </motion.p>
        </div>

        {/* Returning user hint */}
        {deviceInfo?.isReturning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="text-center"
          >
            <p className="font-serif text-xs text-stamp/70">
              欢迎回来，第 {deviceInfo.visitCount} 次光临 ✦
            </p>
          </motion.div>
        )}

        {/* PC 端显示二维码 */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.6 }}
            className="flex flex-col items-center gap-3 py-2"
          >
            <div className="flex items-center gap-2 text-stamp/60">
              <div className="h-px w-8 bg-stamp/30" />
              <Smartphone className="w-4 h-4" />
              <span className="font-serif text-xs tracking-widest">推荐手机扫码体验</span>
              <div className="h-px w-8 bg-stamp/30" />
            </div>
            <div className="bg-white p-3 rounded-sm border-2 border-ink/10 shadow-sm">
              <QRCodeSVG 
                value="https://rockorbust.cn/works/food-booklet/index.html"
                size={120}
                bgColor="#FFFFFF"
                fgColor="#2C302E"
                level="M"
              />
            </div>
          </motion.div>
        )}

        {/* PC 端：二维码下方分隔 + 按钮 */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 h-px bg-ink/15" />
            <span className="font-serif text-xs text-ink/40">或在此直接体验</span>
            <div className="flex-1 h-px bg-ink/15" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isMobile ? 2.1 : 2.3 }}
        >
          <button
            onClick={onStart}
            className="w-full bg-ink text-paper font-serif font-bold tracking-[0.3em] py-3.5 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-95 transition-transform"
          >
            <PenLine className="w-5 h-5" />
            <span>{buttonText}</span>
            <div className="absolute inset-0 border-2 border-ink scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
