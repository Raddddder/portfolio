import React, { useState } from 'react';
import { Search, Dice5, Coins, Footprints, X, BookOpen, Award, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Record, UserProfile, getTitle } from '../types';
import SharePoster from './SharePoster';

interface FeedProps {
  records: Record[];
  userProfile: UserProfile;
  onAddRecord: (prefillStoreName?: string) => void;
  onBountyAccept: (storeName: string) => void;
  completedBounties: string[];
  onShowWelcome: () => void;
  onStamp: (id: string) => void;
}

export default function Feed({ records, userProfile, onAddRecord, onBountyAccept, completedBounties, onShowWelcome, onStamp }: FeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [sharingRecord, setSharingRecord] = useState<Record | null>(null);

  const filteredRecords = records.filter(record => {
    if (searchQuery && !record.storeName.includes(searchQuery) && !record.details.some(d => d.includes(searchQuery))) {
      return false;
    }
    if (activeFilter === '月底吃土' && !['15↓', '15-30'].includes(record.budget)) {
      return false;
    }
    if (activeFilter === '步行5分钟' && record.campus !== '仙林校区') { // Mock logic
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-paper text-ink pb-[100px]">
      {/* Top Nav */}
      <div className="sticky top-0 bg-paper/90 backdrop-blur-md border-b-2 border-ink z-20 p-4">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
              <input 
                type="text" 
                placeholder="Search 店名/标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-2 border-ink py-2 pl-9 pr-4 font-serif text-sm focus:outline-none focus:border-stamp"
              />
            </div>
            <button 
              onClick={onShowWelcome} 
              className="p-2 border-2 border-ink text-ink hover:bg-ink hover:text-paper transition-colors" 
              title="关于食录"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <FilterCapsule 
              icon={<Dice5 className="w-3 h-3" />} 
              label="DDL续命" 
              active={activeFilter === 'DDL续命'}
              onClick={() => setActiveFilter(prev => prev === 'DDL续命' ? null : 'DDL续命')}
            />
            <FilterCapsule 
              icon={<Coins className="w-3 h-3" />} 
              label="月底吃土" 
              active={activeFilter === '月底吃土'}
              onClick={() => setActiveFilter(prev => prev === '月底吃土' ? null : '月底吃土')}
            />
            <FilterCapsule 
              icon={<Footprints className="w-3 h-3" />} 
              label="步行5分钟" 
              active={activeFilter === '步行5分钟'}
              onClick={() => setActiveFilter(prev => prev === '步行5分钟' ? null : '步行5分钟')}
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* User Profile Summary */}
        <div className="mb-6 relative bg-[#F4F1EA] border-[3px] border-ink p-5 flex items-center justify-between shadow-md">
          <div className="pl-3">
            <h2 className="font-serif font-black text-xl tracking-widest">{userProfile.name}</h2>
            <p className="font-serif text-xs text-ink/70 mt-2 flex items-center gap-3">
              <span className="bg-stamp/10 text-stamp px-2 py-0.5 border border-stamp/30 font-bold">{getTitle(userProfile.recordsCount)}</span>
              <span>食录 <span className="font-bold text-stamp">{userProfile.recordsCount}</span> 卷</span>
              <span>获赞 <span className="font-bold text-[#C04829]">{userProfile.stampsReceived}</span> 枚</span>
            </p>
          </div>
          <div className="w-14 h-14 border-[3px] border-[#C04829] text-[#C04829] flex items-center justify-center rounded-sm transform rotate-[-4deg] opacity-80 mix-blend-multiply bg-paper/50 pr-2">
            <span className="font-seal text-2xl leading-none">{userProfile.name[0]}</span>
          </div>
        </div>

        {/* AI Bounty Banner */}
        {completedBounties.includes('南门新开螺蛳粉') ? (
          <div className="mb-6 bg-[#F4F1EA] border-[3px] border-ink/30 p-4 flex items-start gap-4 relative opacity-75">
            <div className="w-10 h-10 bg-ink/20 text-paper rounded-full flex items-center justify-center shrink-0 relative z-10">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-serif font-bold text-ink/60 tracking-widest">司膳悬赏</h3>
                <span className="px-2 py-0.5 bg-stamp/15 border border-stamp/30 text-stamp font-serif font-bold text-[10px]">已接榜</span>
              </div>
              <p className="font-serif text-sm text-ink/50 leading-relaxed mb-2 line-through decoration-ink/20">听闻南门新开了一家螺蛳粉，不知味道几何，哪位大人愿去探探路？</p>
              <p className="font-serif text-xs text-stamp font-bold">✓ 感谢探路，情报已录入食录</p>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-[#F4F1EA] border-[3px] border-stamp/80 p-4 flex items-start gap-4 cursor-pointer hover:bg-stamp/5 transition-colors shadow-[4px_4px_0_rgba(59,77,67,0.2)] relative" onClick={() => onBountyAccept('南门新开螺蛳粉')}>
            <div className="w-10 h-10 bg-stamp text-paper rounded-full flex items-center justify-center shrink-0 relative z-10">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-serif font-bold text-stamp tracking-widest">司膳悬赏</h3>
                <span className="px-2 py-0.5 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-serif font-bold text-[10px]">+3 印章</span>
              </div>
              <p className="font-serif text-sm text-ink/80 leading-relaxed mb-2">听闻南门新开了一家螺蛳粉，不知味道几何，哪位大人愿去探探路？</p>
              <button className="text-xs font-serif font-bold text-stamp border-b border-stamp pb-0.5">接榜探店 →</button>
            </div>
          </div>
        )}

        {/* Vertical Feed (Meituan Style) */}
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-16 h-16 border-2 border-dashed border-ink rounded-full flex items-center justify-center mb-4">
              <span className="font-serif text-2xl">?</span>
            </div>
            <p className="font-serif tracking-widest">此地尚无食录</p>
            <p className="font-serif text-xs mt-1 uppercase">Archive Empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-8 pt-2">
            {filteredRecords.map(record => (
              <RecordCard 
                key={record.id} 
                record={record} 
                onClick={() => setSelectedRecord(record)} 
                onStamp={() => onStamp(record.id)}
                onShare={() => setSharingRecord(record)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => onAddRecord()}
        className="fixed bottom-[80px] right-6 w-14 h-14 bg-stamp text-paper rounded-full shadow-lg flex items-center justify-center z-10 active:scale-95 transition-transform"
        title="记一笔"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Chopsticks */}
          <path d="M17 2L5 14" />
          <path d="M21 2L9 14" />
          {/* Bowl */}
          <path d="M2 14h14" />
          <path d="M2 14a7 7 0 0 0 14 0" />
          {/* Base */}
          <path d="M7 21h4" />
        </svg>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <RecordModal 
            record={selectedRecord} 
            onClose={() => setSelectedRecord(null)} 
            onAddRecord={() => onAddRecord(selectedRecord.storeName)}
            onStamp={() => onStamp(selectedRecord.id)}
            onShare={() => setSharingRecord(selectedRecord)}
          />
        )}
      </AnimatePresence>

      {/* Share Poster Modal */}
      {sharingRecord && (
        <SharePoster record={sharingRecord} onClose={() => setSharingRecord(null)} />
      )}
    </div>
  );
}

const FilterCapsule: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-serif whitespace-nowrap transition-colors ${
        active ? 'border-stamp bg-stamp text-paper' : 'border-ink/20 text-ink hover:border-ink'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

const RecordCard: React.FC<{ record: Record, onClick: () => void, onStamp: () => void, onShare: () => void }> = ({ record, onClick, onStamp, onShare }) => {
  return (
    <motion.div 
      layoutId={`card-${record.id}`}
      className="bg-[#F4F1EA] border-[3px] border-ink hover:-translate-y-1 transition-transform shadow-[4px_4px_0_rgba(44,48,46,0.15)] group relative overflow-hidden flex cursor-pointer"
      onClick={onClick}
    >
      {/* Left: Photo */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 border-r-[3px] border-ink relative">
        <img src={record.photoUrl} alt={record.storeName} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale-[20%] contrast-125 group-hover:grayscale-0 transition-all duration-500" />
        {record.stamps >= 10 && (
          <div className="absolute top-1 left-1 w-6 h-6 border-[2px] border-[#D4AF37] text-[#D4AF37] flex items-center justify-center rounded-sm transform -rotate-[8deg] shadow-sm bg-paper/90 backdrop-blur-sm z-20">
            <span className="font-seal text-xs leading-none">御</span>
          </div>
        )}
      </div>

      {/* Right: Content */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="font-serif font-black text-lg leading-tight truncate pr-2">{record.storeName}</h3>
            <button 
              onClick={(e) => { e.stopPropagation(); onStamp(); }}
              className="flex items-center gap-1 text-[#C04829] shrink-0 hover:opacity-80 transition-opacity bg-[#C04829]/5 px-1.5 py-0.5 rounded-sm border border-[#C04829]/20"
            >
              <div className="w-3.5 h-3.5 border border-[#C04829] rounded-sm flex items-center justify-center transform -rotate-6 bg-paper/50 mix-blend-multiply">
                <span className="font-seal text-[9px]">阅</span>
              </div>
              <span className="font-bold text-xs">{record.stamps}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="px-1.5 py-0.5 border border-ink text-[9px] font-serif bg-ink/5">¥{record.budget}</span>
            <span className="px-1.5 py-0.5 border border-ink text-[9px] font-serif bg-ink/5">{record.scene}</span>
            {record.details.slice(0, 1).map(d => (
              <span key={d} className="px-1.5 py-0.5 border border-ink text-[9px] font-serif bg-ink/5 truncate max-w-[60px]">{d}</span>
            ))}
          </div>

          <p className="font-hand text-sm leading-tight line-clamp-2 text-ink/80">
            {record.soulNote || "无言的美味..."}
          </p>
        </div>

        <div className="mt-2 text-[10px] font-serif text-ink/50 flex justify-between items-end">
          <span className="flex items-center gap-1 truncate">
            <div className="w-3.5 h-3.5 border border-[#C04829] text-[#C04829] flex items-center justify-center rounded-sm transform rotate-[4deg] opacity-80 mix-blend-multiply shrink-0">
              <span className="font-seal text-[8px] leading-none">{record.author.slice(0, 1)}</span>
            </div>
            <span className="truncate">{record.author}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span>{record.campus}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="text-ink/40 hover:text-ink transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const RecordModal: React.FC<{ record: Record, onClose: () => void, onAddRecord: () => void, onStamp: () => void, onShare: () => void }> = ({ record, onClose, onAddRecord, onStamp, onShare }) => {
  const [stamped, setStamped] = useState(false);

  const handleStamp = () => {
    setStamped(true);
    onStamp();
    setTimeout(() => setStamped(false), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />
      
      <motion.div 
        layoutId={`card-${record.id}`}
        className="relative w-full max-w-sm bg-[#F4F1EA] border-4 border-ink shadow-[8px_8px_0_rgba(26,26,26,1)] flex flex-col max-h-[90vh] overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-paper border-2 border-ink rounded-full flex items-center justify-center z-10 hover:bg-stamp hover:text-paper hover:border-stamp transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto scrollbar-hide">
          <div className="aspect-square border-b-4 border-ink relative">
            <img src={record.photoUrl} alt={record.storeName} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
            {record.stamps >= 10 && (
              <div className="absolute top-4 right-4 w-14 h-14 border-[4px] border-[#D4AF37] text-[#D4AF37] flex items-center justify-center rounded-sm transform rotate-[8deg] shadow-lg bg-paper/80 backdrop-blur-sm" style={{ boxShadow: 'inset 0 0 6px rgba(212,175,55,0.4)' }}>
                <span className="font-seal text-2xl leading-none" style={{ textShadow: '0 0 1px rgba(212,175,55,0.5)' }}>御膳</span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center border-b-2 border-ink pb-4">
              <h2 className="font-serif font-black text-3xl">{record.storeName}</h2>
              <p className="font-serif text-xs opacity-60 uppercase mt-1 tracking-widest">Origin Food Record</p>
            </div>

            {/* Mock Oracle Section */}
            {record.storeName === '老张拉面' && (
              <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 text-sm font-serif text-ink/80">
                <span className="font-bold text-yellow-600 block mb-1">✨ AI 情报整合</span>
                这家店被 12 位校友标记为 [深夜食堂]，其中 5 位极力推荐隐藏吃法：[加点醋更好吃]。
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 font-serif text-sm">
              <div className="flex flex-col">
                <span className="text-ink/50 text-xs mb-1">预算</span>
                <span className="font-bold border-b border-ink/20 pb-1">{record.budget}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink/50 text-xs mb-1">场景</span>
                <span className="font-bold border-b border-ink/20 pb-1">{record.scene}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink/50 text-xs mb-1">噪声</span>
                <span className="font-bold border-b border-ink/20 pb-1">{record.noise}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink/50 text-xs mb-1">速度</span>
                <span className="font-bold border-b border-ink/20 pb-1">{record.speed}</span>
              </div>
            </div>

            {record.details.length > 0 && (
              <div>
                <span className="text-ink/50 text-xs font-serif mb-2 block">细节标签</span>
                <div className="flex flex-wrap gap-2">
                  {record.details.map(d => (
                     <span key={d} className="px-2 py-1 border-2 border-ink text-xs font-serif font-bold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {record.soulNote && (
              <div className="pt-4 border-t-2 border-ink relative">
                <span className="text-ink/50 text-xs font-serif mb-2 block">灵魂附言</span>
                <p className="font-hand text-3xl leading-relaxed">
                  {record.soulNote}
                </p>
              </div>
            )}
            
            <div className="pt-4 border-t-2 border-ink flex justify-between items-center text-xs font-serif text-ink/50">
              <span>情报员: @{record.author}</span>
              <span>{record.campus}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t-4 border-ink p-4 bg-[#F4F1EA] flex gap-2 relative z-10">
          <button 
            onClick={handleStamp}
            className="flex-1 border-2 border-[#C04829] text-[#C04829] py-3 font-serif font-bold hover:bg-[#C04829]/5 transition-colors relative overflow-hidden flex items-center justify-center gap-2"
          >
            <div className="w-6 h-6 border-[1.5px] border-[#C04829] rounded-sm flex items-center justify-center transform -rotate-6 bg-paper/50 mix-blend-multiply">
              <span className="font-seal text-sm">阅</span>
            </div>
            盖章 ({record.stamps})
            {stamped && (
              <motion.div 
                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: -10 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-multiply"
              >
                <div className="w-16 h-16 border-[3px] border-[#C04829] rounded-sm flex items-center justify-center text-[#C04829] font-seal text-4xl opacity-80 bg-paper/50">
                  阅
                </div>
              </motion.div>
            )}
          </button>
          <button 
            onClick={() => {
              onClose();
              onShare();
            }}
            className="w-12 border-2 border-ink flex items-center justify-center hover:bg-ink/5 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              onClose();
              onAddRecord();
            }}
            className="flex-1 bg-ink text-paper font-serif font-bold py-3 hover:bg-ink/90 transition-colors"
          >
            我也去吃过
          </button>
        </div>
      </motion.div>
    </div>
  );
}
