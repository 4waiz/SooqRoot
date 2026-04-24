import { useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { Card, CardSub, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { generateFarmerAdviceWithAI } from '../../lib/ai';
import { CopilotMessage, Farm } from '../../types';

export function FarmerCopilot({ farm }: { farm: Farm }) {
  const { t, language } = useTranslation();
  const { demands } = useApp();
  const [msgs, setMsgs] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: CopilotMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      text: input.trim(),
    };
    setMsgs((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    try {
      const r = await generateFarmerAdviceWithAI(userMsg.text, farm, demands, language);
      const botMsg: CopilotMessage = {
        id: `m-${Date.now()}-b`,
        role: 'copilot',
        text: r.text,
        reasoning: r.reasoning,
        suggestedAction: r.suggestedAction,
        confidence: r.confidence,
      };
      setMsgs((prev) => [...prev, botMsg]);
    } finally {
      setThinking(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send();
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{t('farmer_copilot_title')}</CardTitle>
          <CardSub>{t('farmer_copilot_hint')}</CardSub>
        </div>
        <div className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase">AI</span>
        </div>
      </div>

      <div className="mt-4 h-72 overflow-y-auto space-y-3 rounded-xl bg-charcoal-50 dark:bg-charcoal-900/40 p-3">
        {msgs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-sm text-charcoal-400 px-4">
            {t('farmer_copilot_placeholder')}
          </div>
        ) : (
          msgs.map((m) => <Bubble key={m.id} msg={m} />)
        )}
        {thinking ? (
          <div className="flex items-center gap-2 text-charcoal-400 text-sm">
            <Bot size={14} />
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:100ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:200ms]" />
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <div className="flex-1">
          <Input
            placeholder={t('farmer_copilot_placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        <Button onClick={send} disabled={!input.trim()} icon={<Send size={16} />}>
          {t('farmer_copilot_send')}
        </Button>
      </div>
    </Card>
  );
}

function Bubble({ msg }: { msg: CopilotMessage }) {
  const { t } = useTranslation();
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
          <Bot size={14} />
        </div>
      ) : null}
      <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-brand-600 text-white rounded-se-sm'
          : 'bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 rounded-ss-sm'
      }`}>
        <div>{msg.text}</div>
        {!isUser && msg.suggestedAction ? (
          <div className="mt-2 border-t border-charcoal-100 dark:border-charcoal-700 pt-2 text-xs text-charcoal-600 dark:text-charcoal-300 space-y-1">
            <div>
              <span className="font-semibold">{t('farmer_copilot_suggestedAction')}: </span>
              {msg.suggestedAction}
            </div>
            {msg.reasoning ? (
              <div className="opacity-80">
                <span className="font-semibold">{t('buyer_reasoning')}: </span>
                {msg.reasoning}
              </div>
            ) : null}
            {typeof msg.confidence === 'number' ? (
              <div className="opacity-80">
                <span className="font-semibold">{t('buyer_confidence')}: </span>
                {Math.round(msg.confidence * 100)}%
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {isUser ? (
        <div className="w-7 h-7 rounded-full bg-charcoal-800 text-white flex items-center justify-center flex-shrink-0">
          <User size={14} />
        </div>
      ) : null}
    </div>
  );
}
