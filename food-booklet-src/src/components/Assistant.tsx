import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { Record, UserProfile } from '../types';

/**
 * 获取安全视口高度（兼容 iOS Safari 地址栏）
 */
function useViewportHeight() {
  const [vh, setVh] = useState(window.innerHeight);
  
  useEffect(() => {
    const update = () => {
      // 优先使用 visualViewport（iOS 键盘弹出时准确）
      const h = window.visualViewport?.height ?? window.innerHeight;
      setVh(h);
    };
    
    update();
    
    // visualViewport resize 在 iOS 键盘弹出/收起时触发
    window.visualViewport?.addEventListener('resize', update);
    window.addEventListener('resize', update);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  
  return vh;
}

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || '';
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

interface AssistantProps {
  records: Record[];
  userProfile: UserProfile;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  isDiagnosis?: boolean;
  isStreaming?: boolean;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 非流式调用百炼 API（兼容所有设备）
 */
async function callDashScope(
  messages: ChatMessage[], 
  temperature = 0.7,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus-latest',
      messages,
      temperature,
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DashScope API error: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  let text = json.choices?.[0]?.message?.content || '';
  // 过滤掉 qwen 的思考标签
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  return text || '抱歉，未能获取到回复。';
}

/**
 * 流式调用百炼 API（SSE）
 * onChunk 会在每次收到新内容时被调用
 * 如果 ReadableStream 不可用则回退到非流式
 */
async function streamDashScope(
  messages: ChatMessage[], 
  onChunk: (text: string) => void,
  temperature = 0.7
): Promise<string> {
  // 30 秒超时
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus-latest',
        messages,
        temperature,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DashScope API error: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    // 部分移动端浏览器不支持 ReadableStream，回退到非流式
    if (!reader) {
      clearTimeout(timeout);
      const result = await callDashScope(messages, temperature);
      onChunk(result);
      return result;
    }
    
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // 按行解析 SSE
      const lines = buffer.split('\n');
      // 最后一个可能是不完整的行，留到下一轮
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;
        
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            // 过滤掉 qwen 的思考标签
            const cleaned = delta.replace(/<think>[\s\S]*?<\/think>/g, '');
            if (cleaned) {
              fullText += cleaned;
              onChunk(fullText);
            }
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
    
    // 处理 buffer 中可能残留的思考标签
    fullText = fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    onChunk(fullText);
    
    return fullText || '抱歉，未能获取到回复。';
  } finally {
    clearTimeout(timeout);
  }
}

export default function Assistant({ records, userProfile }: AssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '你好！我是你的专属司膳。今天想吃点什么？或者告诉我你的预算、心情、场景，我来为你推荐食录里的好去处。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  const vh = useViewportHeight();

  useEffect(() => {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `你是一个贴心的餐厅推荐助手（司膳）。请根据用户的需求，从以下餐厅记录中为他们推荐最合适的餐厅。
如果用户的需求不明确，可以主动询问（如预算、口味、距离等）。
推荐时请带上餐厅的亮点（如标签或灵魂附言）。
语气要像一个懂吃的朋友，自然、热情，带一点文人雅士的幽默感。
回复请简洁精炼，控制在200字以内。不要使用思考过程标签。

可用餐厅数据：
${JSON.stringify(records, null, 2)}`
    };
    chatHistoryRef.current = [systemMessage];
  }, [records]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自动清除错误
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // 流式更新最后一条 model 消息
  const updateLastModelMessage = useCallback((text: string, extra?: Partial<Message>) => {
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
        updated[lastIdx] = { ...updated[lastIdx], text, ...extra };
      }
      return updated;
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    // 先添加一条空的 model 消息用于流式填充
    setMessages(prev => [...prev, { role: 'model', text: '', isStreaming: true }]);

    try {
      chatHistoryRef.current.push({ role: 'user', content: userText });
      
      const fullReply = await streamDashScope(
        chatHistoryRef.current,
        (streamedText) => {
          updateLastModelMessage(streamedText, { isStreaming: true });
        }
      );
      
      // 流式结束，标记完成
      updateLastModelMessage(fullReply, { isStreaming: false });
      chatHistoryRef.current.push({ role: 'assistant', content: fullReply });
    } catch (err) {
      console.error("Chat error:", err);
      const msg = err instanceof Error && err.name === 'AbortError' 
        ? '请求超时了，网络可能不太好，再试一次？' 
        : '抱歉，我刚才走神了，能再说一遍吗？';
      updateLastModelMessage(msg, { isStreaming: false });
      setError('发送失败，请检查网络后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDiagnosis = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: '生成我的饮食性格诊断' }]);

    // 先添加空 model 消息
    setMessages(prev => [...prev, { role: 'model', text: '', isDiagnosis: true, isStreaming: true }]);

    try {
      const userRecords = records.filter(r => r.author === userProfile.name);
      
      if (userRecords.length === 0) {
        updateLastModelMessage('大人，您还未留下任何食录，司膳无从下笔呀。快去记一笔吧！', { isStreaming: false, isDiagnosis: false });
        setIsLoading(false);
        return;
      }

      const prompt = `根据以下用户（${userProfile.name}）的食录，生成一段100字左右的幽默、文风雅致的饮食性格诊断，类似于MBTI或年度报告。
      
      用户食录：
      ${JSON.stringify(userRecords, null, 2)}
      
      格式要求：
      1. 给出一个响亮的称号（如：无辣不欢的DDL战士、深夜碳水狂魔等）
      2. 一段幽默的点评
      3. 结尾盖章定论
      不要使用思考过程标签。`;

      const diagnosisMessages: ChatMessage[] = [
        { role: 'system', content: '你是一个有趣的饮食性格分析师，擅长用文人雅士的笔触做出幽默点评。回复简洁精炼，不要使用思考过程标签。' },
        { role: 'user', content: prompt }
      ];

      const fullReply = await streamDashScope(
        diagnosisMessages, 
        (streamedText) => {
          updateLastModelMessage(streamedText, { isDiagnosis: true, isStreaming: true });
        },
        0.8
      );
      
      updateLastModelMessage(fullReply, { isDiagnosis: true, isStreaming: false });
    } catch (err) {
      console.error("Diagnosis error:", err);
      const msg = err instanceof Error && err.name === 'AbortError' 
        ? '请求超时了，网络可能不太好，稍后再试吧。' 
        : '司膳才疏学浅，暂时无法看透大人的饮食命格，稍后再试吧。';
      updateLastModelMessage(msg, { isStreaming: false, isDiagnosis: false });
      setError('生成失败，请检查网络后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // BottomNav 高度 60px
  const navHeight = 60;

  return (
    <div className="bg-paper text-ink flex flex-col overflow-hidden" style={{ height: `${vh}px` }}>
      {/* Header - 固定顶部，完全不透明防止内容穿透 */}
      <div className="shrink-0 bg-paper border-b-2 border-ink z-20 p-4 text-center relative">
        <h1 className="font-serif font-black text-xl tracking-widest">AI 司膳</h1>
        <p className="font-serif text-[10px] opacity-60 uppercase mt-1 tracking-widest">Your Food Oracle</p>
      </div>

      {/* Chat Messages - 中间可滚动区域 */}
      <div 
        className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
              msg.role === 'user' ? 'bg-ink text-paper border-ink' : 'bg-stamp text-paper border-stamp'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[75%] p-4 font-serif text-sm leading-relaxed relative break-words overflow-hidden ${
              msg.role === 'user' 
                ? 'bg-ink/5 border-2 border-ink/20 rounded-sm' 
                : msg.isDiagnosis 
                  ? 'bg-[#F4F1EA] border-[3px] border-[#C04829]/80 rounded-sm shadow-[4px_4px_0_rgba(192,72,41,0.2)]'
                  : 'bg-[#F4F1EA] border-[3px] border-stamp/80 rounded-sm shadow-[4px_4px_0_rgba(59,77,67,0.2)]'
            }`}>
              {msg.isDiagnosis && (
                <div className="flex items-center gap-1 text-[#C04829] mb-3 border-b-2 border-[#C04829]/20 pb-2 relative z-20">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold tracking-widest text-sm">司膳诊断报告</span>
                </div>
              )}
              <div className="markdown-body prose prose-sm prose-stone relative z-20 break-words overflow-wrap-anywhere">
                {msg.text ? (
                  <Markdown>{msg.text}</Markdown>
                ) : msg.isStreaming ? (
                  <span className="inline-block w-1.5 h-4 bg-stamp/60 animate-pulse" />
                ) : null}
              </div>
              {/* 流式输出时显示光标 */}
              {msg.isStreaming && msg.text && (
                <span className="inline-block w-1.5 h-4 bg-stamp/60 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Toast */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute left-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-[#C04829] text-paper font-serif text-xs rounded-sm"
          style={{ bottom: navHeight + 120 }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Input Area - 固定底部，在 BottomNav 上方 */}
      <div className="shrink-0 bg-paper border-t-2 border-ink p-3 z-30" style={{ marginBottom: `${navHeight}px` }}>
        <div className="max-w-md mx-auto">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
            <button 
              onClick={generateDiagnosis}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-1 px-3 py-2 bg-stamp/10 border border-stamp/30 text-stamp rounded-full font-serif text-xs active:bg-stamp/25 transition-colors disabled:opacity-50"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              <Sparkles className="w-3 h-3" />
              生成饮食性格诊断
            </button>
          </div>
          
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isComposing) handleSend();
              }}
              placeholder="告诉司膳你想吃什么..."
              className="w-full bg-ink/5 border-2 border-ink py-3 pl-4 pr-12 font-serif text-base focus:outline-none focus:border-stamp rounded-full"
              style={{ fontSize: '16px' }}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-10 h-10 bg-stamp text-paper rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-ink/50 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              <Send className="w-4 h-4 -ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
