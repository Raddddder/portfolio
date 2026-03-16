import React, { useEffect, useState } from 'react';
import { Award, Star, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BountyRewardProps {
  storeName: string;
  onClose: () => void;
  newTitle: string;
  recordsCount: number;
}

export default function BountyReward({ storeName, onClose, newTitle, recordsCount }: BountyRewardProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 分步显示动画
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1000);
    const t3 = setTimeout(() => setStep(3), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      >
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-ink/85 backdrop-blur-sm" />

        {/* 主卡片 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
          className="relative w-full max-w-sm bg-[#F4F1EA] border-4 border-ink shadow-[8px_8px_0_rgba(26,26,26,1)] overflow-hidden"
        >
          {/* 顶部印章装饰 */}
          <div className="bg-[#C04829] p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-20 mix-blend-overlay pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
              className="inline-flex items-center justify-center w-20 h-20 border-[4px] border-paper/80 rounded-sm transform -rotate-[6deg] mb-3"
            >
              <span className="font-seal text-4xl text-paper/90 leading-none">赏</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-serif font-black text-paper text-2xl tracking-[0.3em] relative z-10"
            >
              接榜成功
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="font-serif text-paper/70 text-xs mt-1 tracking-widest uppercase relative z-10"
            >
              Bounty Completed
            </motion.p>
          </div>

          {/* 奖励内容 */}
          <div className="p-6 space-y-5">
            {/* 探店信息 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={step >= 1 ? { opacity: 1, x: 0 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex items-center gap-3 p-3 bg-paper/60 border-2 border-ink/10"
            >
              <div className="w-10 h-10 bg-stamp/10 border-2 border-stamp/30 rounded-sm flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-stamp" />
              </div>
              <div>
                <p className="font-serif text-xs text-ink/50">悬赏目标</p>
                <p className="font-serif font-bold text-base">{storeName}</p>
              </div>
              <div className="ml-auto">
                <span className="inline-block px-2 py-1 bg-[#C04829]/10 border border-[#C04829]/30 text-[#C04829] font-serif font-bold text-xs">已完成</span>
              </div>
            </motion.div>

            {/* 奖励项 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={step >= 2 ? { opacity: 1, x: 0 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 p-3 bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30">
                <div className="w-10 h-10 bg-[#D4AF37]/15 border-2 border-[#D4AF37]/40 rounded-sm flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-xs text-ink/50">悬赏额外奖励</p>
                  <p className="font-serif font-bold text-[#D4AF37]">+3 声望印章</p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={step >= 2 ? { scale: 1 } : {}}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-8 h-8 border-2 border-[#D4AF37] rounded-sm flex items-center justify-center transform -rotate-6 bg-paper/50"
                >
                  <span className="font-seal text-sm text-[#D4AF37]">赏</span>
                </motion.div>
              </div>
            </motion.div>

            {/* 称号更新 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={step >= 3 ? { opacity: 1, y: 0 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="text-center pt-3 border-t-2 border-ink/10"
            >
              <p className="font-serif text-xs text-ink/50 mb-2">当前头衔</p>
              <div className="inline-flex items-center gap-2">
                <span className="bg-stamp/10 text-stamp px-3 py-1 border border-stamp/30 font-serif font-bold text-sm">{newTitle}</span>
              </div>
              <p className="font-serif text-xs text-ink/40 mt-2">
                已记录 <span className="font-bold text-stamp">{recordsCount}</span> 卷食录
              </p>
            </motion.div>

            {/* 激励语 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={step >= 3 ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="text-center pt-2"
            >
              <p className="font-hand text-lg text-ink/60 leading-relaxed">
                多谢大人亲赴探路，此番情报已录入食录！
              </p>
            </motion.div>
          </div>

          {/* 底部按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={step >= 3 ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="p-4 border-t-4 border-ink bg-[#F4F1EA]"
          >
            <button
              onClick={onClose}
              className="w-full bg-ink text-paper font-serif font-bold tracking-[0.3em] py-4 text-base flex items-center justify-center gap-2 hover:bg-ink/90 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              查看食录
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
