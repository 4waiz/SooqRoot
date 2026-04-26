import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X, Bot, User, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import {
  CHAT_KNOWLEDGE,
  ChatEntry,
  findBestAnswer,
  getEntryById,
  getStarterQuestions,
} from './chatKnowledge';

type ChatRole = 'user' | 'bot';
interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  followUps?: string[];
  isFallback?: boolean;
}

export function LiveChat() {
  const { t, language, isRtl } = useTranslation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: 'greet',
          role: 'bot',
          text: t('chat_greeting'),
          followUps: getStarterQuestions(language).map((e) => e.id),
        },
      ]);
    }
  }, [open, messages.length, t, language]);

  useEffect(() => {
    if (open) setUnread(false);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    setMessages([]);
  }, [language]);

  const askEntry = (entry: ChatEntry) => {
    pushUser(entry.question[language]);
    respondWithEntry(entry);
  };

  const pushUser = (text: string) => {
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, role: 'user', text },
    ]);
  };

  const respondWithEntry = (entry: ChatEntry) => {
    setTyping(true);
    const delay = 500 + Math.min(1400, entry.answer[language].length * 8);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'bot',
          text: entry.answer[language],
          followUps: entry.followUps,
        },
      ]);
      setTyping(false);
    }, delay);
  };

  const respondFallback = () => {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'bot',
          text: t('chat_fallback'),
          followUps: getStarterQuestions(language).map((e) => e.id),
          isFallback: true,
        },
      ]);
      setTyping(false);
    }, 700);
  };

  const onSend = () => {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput('');
    const match = findBestAnswer(text, language);
    if (match) respondWithEntry(match.entry);
    else respondFallback();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSend();
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t('chat_open')}
          className={`fixed bottom-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 shadow-glow transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-charcoal-900 ${
            isRtl ? 'left-5' : 'right-5'
          }`}
        >
          <span className="relative">
            <MessageCircle size={20} />
            {unread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-charcoal-900 animate-pulse" />
            )}
          </span>
          <span className="text-sm font-semibold hidden sm:inline">{t('chat_open')}</span>
        </button>
      )}

      {open && (
        <div
          className={`fixed bottom-5 z-40 w-[calc(100vw-2.5rem)] sm:w-[400px] max-w-[400px] sr-card p-0 overflow-hidden flex flex-col animate-in ${
            isRtl ? 'left-5' : 'right-5'
          }`}
          style={{ maxHeight: 'min(640px, calc(100vh - 2.5rem))' }}
        >
          {/* Header */}
          <div className="bg-brand-gradient text-white px-4 py-3.5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Bot size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold leading-tight">{t('chat_title')}</div>
              <div className="text-[11px] text-white/80 mt-0.5 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {t('chat_subtitle')}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-charcoal-50/50 dark:bg-charcoal-900/40"
          >
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                msg={m}
                onPick={(id) => {
                  const entry = getEntryById(id);
                  if (entry) askEntry(entry);
                }}
              />
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 rounded-2xl rounded-ss-sm px-3 py-2.5 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-charcoal-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-charcoal-400 animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-charcoal-400 animate-bounce [animation-delay:240ms]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions strip */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 border-t border-charcoal-100 dark:border-charcoal-700 pt-2 bg-white/70 dark:bg-charcoal-900/40">
              <div className="text-[10px] uppercase tracking-wide font-bold text-charcoal-400 mb-1.5 inline-flex items-center gap-1">
                <Sparkles size={10} />
                {t('chat_suggested')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CHAT_KNOWLEDGE.slice(0, 6).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => askEntry(e)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-200 hover:bg-brand-100 dark:hover:bg-brand-900/50 border border-brand-100 dark:border-brand-900/50 transition-colors"
                  >
                    {e.question[language]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="px-3 py-3 border-t border-charcoal-100 dark:border-charcoal-700 bg-white dark:bg-charcoal-800">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t('chat_placeholder')}
                className="flex-1 rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-charcoal-50 dark:bg-charcoal-900/50 px-3.5 py-2.5 text-sm text-charcoal-800 dark:text-charcoal-100 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              />
              <button
                onClick={onSend}
                disabled={!input.trim()}
                aria-label={t('chat_send')}
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 text-white w-10 h-10 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} className={isRtl ? 'flip-on-rtl' : ''} />
              </button>
            </div>
            <div className="text-[10px] text-charcoal-400 mt-1.5 px-1 leading-tight">
              {t('chat_disclaimer')}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChatBubble({
  msg,
  onPick,
}: {
  msg: ChatMessage;
  onPick: (id: string) => void;
}) {
  const { language, isRtl } = useTranslation();
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
          <Bot size={14} />
        </div>
      )}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-brand-600 text-white rounded-se-sm'
              : 'bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 text-charcoal-800 dark:text-charcoal-100 rounded-ss-sm'
          }`}
        >
          {msg.text}
        </div>
        {!isUser && msg.followUps && msg.followUps.length > 0 && (
          <div className="flex flex-col gap-1.5 max-w-full">
            {msg.followUps
              .map((id) => getEntryById(id))
              .filter((e): e is ChatEntry => Boolean(e))
              .map((e) => (
                <button
                  key={e.id}
                  onClick={() => onPick(e.id)}
                  className="group inline-flex items-center justify-between gap-2 text-[12px] font-medium text-brand-700 dark:text-brand-200 bg-brand-50/80 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-100 dark:border-brand-900/40 rounded-xl px-3 py-1.5 transition-colors text-start"
                >
                  <span className="truncate">{e.question[language]}</span>
                  <ChevronRight
                    size={12}
                    className={`flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ${
                      isRtl ? 'flip-on-rtl' : ''
                    }`}
                  />
                </button>
              ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-charcoal-800 dark:bg-charcoal-700 text-white flex items-center justify-center flex-shrink-0">
          <User size={14} />
        </div>
      )}
    </div>
  );
}
