import React, { useState, useRef } from 'react';
import { Camera, MapPin, ChevronLeft, ImagePlus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Record } from '../types';

interface InputFormProps {
  onSubmit: (record: Omit<Record, 'id' | 'stamps' | 'createdAt' | 'author' | 'campus'>) => void;
  onBack: () => void;
  prefillStoreName?: string;
}

const BUDGET_OPTIONS = ['吃土 (15↓)', '便饭 (15-30)', '小聚 (30-50)', '挥霍 (50↑)'];
const SCENE_OPTIONS = ['独行侠', '双人行', '宿舍团建'];
const NOISE_OPTIONS = ['死寂 (i人)', '低语 (聊天)', '沸腾 (烟火)'];
const SPEED_OPTIONS = ['极限 (赶早八)', '正常 (悠哉)', '极慢 (需耐心)'];
const DETAIL_OPTIONS = ['插座友好', '有猫/狗', '现炒现做', '量极大', '深夜食堂', '有露台'];

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80';

export default function InputForm({ onSubmit, onBack, prefillStoreName }: InputFormProps) {
  const [storeName, setStoreName] = useState(prefillStoreName || '');
  const [budget, setBudget] = useState('');
  const [scene, setScene] = useState('');
  const [noise, setNoise] = useState('');
  const [speed, setSpeed] = useState('');
  const [details, setDetails] = useState<string[]>([]);
  const [soulNote, setSoulNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDetailToggle = (detail: string) => {
    setDetails(prev => 
      prev.includes(detail) ? prev.filter(d => d !== detail) : [...prev, detail]
    );
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 限制 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('图片不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAutoFill = () => {
    setStoreName('老张拉面');
    setBudget('便饭 (15-30)');
    setScene('独行侠');
    setNoise('低语 (聊天)');
    setSpeed('正常 (悠哉)');
    setDetails(['现炒现做', '深夜食堂']);
    setSoulNote('汤头很浓郁，加点醋更好吃。');
    // 预填一张示例图
    setPhotoPreview('https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80');
  };

  const handleSubmit = () => {
    if (!storeName || !budget || !scene || !noise || !speed) {
      alert('请完成必填项 (店名及核心量表)');
      return;
    }
    
    setIsSubmitting(true);
    
    // Parse values to match the short format used in Feed & mockData
    const parsedBudget = budget.match(/\((.*?)\)/)?.[1] || budget;
    const parsedScene = scene.replace('侠', '').replace('行', '').replace('宿舍', '');
    const parsedNoise = noise.split(' ')[0];
    const parsedSpeed = speed.split(' ')[0];

    // Simulate network delay and paper fold animation
    setTimeout(() => {
      onSubmit({
        storeName,
        budget: parsedBudget,
        scene: parsedScene,
        noise: parsedNoise,
        speed: parsedSpeed,
        details,
        photoUrl: photoPreview || DEFAULT_PHOTO,
        soulNote,
      });
      setIsSubmitting(false);
    }, 1500);
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-paper flex flex-col items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-ink border-t-stamp rounded-full mb-4"
        />
        <p className="font-serif text-ink tracking-widest">封存中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink pb-24 relative">
      {/* Header */}
      <div className="sticky top-0 bg-paper/90 backdrop-blur-sm border-b-4 border-ink z-10 p-4 text-center flex items-center justify-center">
        <button onClick={onBack} className="absolute left-4 p-2 text-ink/60 hover:text-ink transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-serif font-black text-2xl tracking-widest">原点食录</h1>
          <p className="font-serif text-xs opacity-60 uppercase mt-1 tracking-widest">Origin Food Record</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-10">

        {/* 演示预填 - 醒目版 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={handleAutoFill} 
            className="w-full py-3 px-4 bg-[#C04829]/10 border-2 border-dashed border-[#C04829]/50 rounded-sm flex items-center justify-center gap-2 hover:bg-[#C04829]/20 active:scale-[0.98] transition-all group"
          >
            <span className="text-[#C04829] font-serif font-bold text-sm tracking-widest group-hover:tracking-[0.4em] transition-all">
              ✦ 点此一键预填演示数据 ✦
            </span>
          </button>
        </motion.div>

        {/* 01. 店名标定 */}
        <section className="bg-[#F4F1EA] p-6 border-[3px] border-ink/80 rounded-sm shadow-[4px_4px_0_rgba(26,26,26,0.1)] relative">
          <div className="border-b-[3px] border-ink mb-6 pb-2 flex items-end relative z-10">
            <span className="font-seal text-2xl text-[#C04829] mr-3 leading-none">壹</span>
            <span className="font-bold tracking-widest text-lg">店名标定</span>
          </div>
          <div className="relative z-10">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/50" />
            <input 
              type="text" 
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Search..."
              className="w-full bg-paper/50 border-2 border-ink py-3 pl-10 pr-4 font-serif font-bold text-base focus:outline-none focus:border-[#C04829] transition-colors"
              style={{ fontSize: '16px' }}
            />
          </div>
        </section>

        {/* 02. 拍照存证 */}
        <section className="bg-[#F4F1EA] p-6 border-[3px] border-ink/80 rounded-sm shadow-[4px_4px_0_rgba(26,26,26,0.1)] relative">
          <div className="border-b-[3px] border-ink mb-6 pb-2 flex items-end relative z-10">
            <span className="font-seal text-2xl text-[#C04829] mr-3 leading-none">壹·</span>
            <span className="font-bold tracking-widest text-lg">拍照存证</span>
            <span className="ml-auto text-xs text-ink/40 font-serif">选填</span>
          </div>

          <div className="relative z-10">
            {photoPreview ? (
              <div className="relative group">
                <img 
                  src={photoPreview} 
                  alt="食物照片" 
                  className="w-full h-48 object-cover border-2 border-ink grayscale-[10%] contrast-110"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 w-8 h-8 bg-paper/90 border-2 border-ink rounded-full flex items-center justify-center hover:bg-[#C04829] hover:text-paper hover:border-[#C04829] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-paper/90 border-2 border-ink font-serif text-xs font-bold flex items-center gap-1.5 hover:bg-ink hover:text-paper transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  重拍
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-ink/40 bg-paper/30 flex flex-col items-center justify-center gap-3 hover:border-[#C04829] hover:bg-[#C04829]/5 transition-colors active:scale-[0.98] group"
              >
                <div className="w-14 h-14 border-2 border-ink/30 rounded-full flex items-center justify-center group-hover:border-[#C04829] group-hover:text-[#C04829] transition-colors">
                  <ImagePlus className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <p className="font-serif text-sm font-bold text-ink/60 group-hover:text-[#C04829] transition-colors">点击上传美食照片</p>
                  <p className="font-serif text-[10px] text-ink/40 mt-1">拍下这份烟火气</p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
        </section>

        {/* 03. 核心量表 */}
        <section className="bg-[#F4F1EA] p-6 border-[3px] border-ink/80 rounded-sm shadow-[4px_4px_0_rgba(26,26,26,0.1)] relative">
          <div className="border-b-[3px] border-ink mb-8 pb-2 flex items-end relative z-10">
            <span className="font-seal text-2xl text-[#C04829] mr-3 leading-none">贰</span>
            <span className="font-bold tracking-widest text-lg">核心量表</span>
          </div>
          
          <div className="space-y-4 relative z-10">
            <ScaleRow label="预算" options={BUDGET_OPTIONS} selected={budget} onChange={setBudget} />
            <ScaleRow label="场景" options={SCENE_OPTIONS} selected={scene} onChange={setScene} />
            <ScaleRow label="噪声" options={NOISE_OPTIONS} selected={noise} onChange={setNoise} />
            <ScaleRow label="速度" options={SPEED_OPTIONS} selected={speed} onChange={setSpeed} />
          </div>
        </section>

        {/* 04. 细节勾选 */}
        <section className="bg-[#F4F1EA] p-6 border-[3px] border-ink/80 rounded-sm shadow-[4px_4px_0_rgba(26,26,26,0.1)] relative">
          <div className="border-b-[3px] border-ink mb-6 pb-2 flex items-end relative z-10">
            <span className="font-seal text-2xl text-[#C04829] mr-3 leading-none">叁</span>
            <span className="font-bold tracking-widest text-lg">细节勾选</span>
          </div>
          
          <div className="grid grid-cols-2 gap-5 relative z-10">
            {DETAIL_OPTIONS.map(opt => {
              const isSelected = details.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => handleDetailToggle(opt)}
                  className="flex items-center text-left group"
                >
                  <div className={`w-6 h-6 border-[2.5px] flex items-center justify-center mr-3 transition-colors ${
                    isSelected ? 'border-[#C04829] text-[#C04829] bg-paper/50' : 'border-ink group-hover:border-ink/60 bg-paper/30'
                  }`}>
                    {isSelected && <span className="font-seal text-lg leading-none mt-1">✓</span>}
                  </div>
                  <span className={`font-serif text-sm ${isSelected ? 'font-bold text-[#C04829]' : ''}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 05. 灵魂附言 */}
        <section className="bg-[#F4F1EA] p-6 border-[3px] border-ink/80 rounded-sm shadow-[4px_4px_0_rgba(26,26,26,0.1)] relative">
          <div className="border-b-[3px] border-ink mb-6 pb-2 flex items-end relative z-10">
            <span className="font-seal text-2xl text-[#C04829] mr-3 leading-none">肆</span>
            <span className="font-bold tracking-widest text-lg">老饕秘籍</span>
          </div>
          
          <div className="relative z-10">
            <textarea
              value={soulNote}
              onChange={(e) => setSoulNote(e.target.value.slice(0, 50))}
              placeholder="例如：吃到最后留一口汤，找老板加个煎蛋捣碎拌着吃绝了..."
              className="w-full h-32 bg-transparent border-none resize-none focus:outline-none font-hand text-2xl leading-relaxed p-2"
              style={{
                backgroundImage: 'linear-gradient(transparent, transparent 31px, rgba(26,26,26,0.2) 31px, rgba(26,26,26,0.2) 32px)',
                backgroundSize: '100% 32px',
                lineHeight: '32px',
                fontSize: '16px'
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs font-serif text-ink/40">
              {soulNote.length}/50
            </div>
          </div>
        </section>

        {/* Quote Footer */}
        <div className="text-center pt-8 pb-12 opacity-50 relative z-10">
          <p className="font-hand text-2xl mb-2">凡事不可苟且，而于饮食尤甚。</p>
          <p className="font-serif text-xs tracking-widest">—— 清 · 袁枚《随园食单》</p>
        </div>

      </div>

      {/* 06. 递交誓言 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-paper via-paper to-transparent z-20">
        <div className="max-w-md mx-auto relative">
          <button 
            onClick={handleSubmit}
            className="w-full bg-[#C04829] text-paper font-serif font-black tracking-[0.5em] py-4 text-lg shadow-[0_4px_0_#8A331D] active:shadow-[0_0px_0_#8A331D] active:translate-y-1 transition-all border-2 border-[#8A331D] rounded-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            递交食录
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for artisanal style rows
const ScaleRow: React.FC<{ 
  label: string, 
  options: string[], 
  selected: string, 
  onChange: (val: string) => void
}> = ({ 
  label, 
  options, 
  selected, 
  onChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-4 bg-[#C04829]"></div>
        <span className="font-serif font-bold tracking-widest text-sm">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(50);
                onChange(opt);
              }}
              className={`relative px-4 py-2 font-serif text-sm transition-all border-2 ${
                isSelected ? 'text-[#C04829] font-bold border-[#C04829] bg-paper/80 shadow-[2px_2px_0_rgba(192,72,41,0.2)]' : 'text-ink/70 hover:text-ink border-ink/20 bg-paper/30 hover:bg-paper/50'
              }`}
              style={{ borderRadius: '2px 8px 3px 6px / 6px 3px 8px 2px' }}
            >
              {isSelected && (
                <motion.div 
                  layoutId={`scale-bg-${label}`}
                  className="absolute inset-0 bg-[#C04829]/5 pointer-events-none"
                  style={{ borderRadius: '2px 8px 3px 6px / 6px 3px 8px 2px' }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <span className="relative z-10">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
