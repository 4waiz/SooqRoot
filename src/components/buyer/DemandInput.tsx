import { useState } from 'react';
import { Sparkles, Send, BrainCircuit } from 'lucide-react';
import { Card, CardSub, CardTitle } from '../ui/Card';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { StructuredDemandTable } from './StructuredDemandTable';
import { parseDemandText, ParsedDemand } from '../../lib/ai';
import { useTranslation } from '../../i18n/useTranslation';
import { useApp } from '../../context/useApp';
import { Demand } from '../../types';

export function DemandInput() {
  const { t, language } = useTranslation();
  const { activeBuyerId, addDemand, setPage } = useApp();
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedDemand | null>(null);

  const handleTranslate = () => {
    if (!text.trim()) return;
    setParsing(true);
    // Simulate AI thinking so the UI feels real
    setTimeout(() => {
      const result = parseDemandText(text, language);
      setParsed(result);
      setParsing(false);
    }, 650);
  };

  const handleSubmit = () => {
    if (!parsed || !parsed.lines.length) return;
    const demand: Demand = {
      id: `demand-${Date.now()}`,
      buyerId: activeBuyerId,
      createdAt: Date.now(),
      rawText: text,
      status: 'Structured',
      lines: parsed.lines,
      aiInterpretation: parsed.interpretation,
      aiInterpretationAr: parsed.interpretationAr,
      aiConfidence: parsed.confidence,
    };
    addDemand(demand);
    setText('');
    setParsed(null);
    setPage('operator');
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <CardTitle>{t('buyer_demandInput_title')}</CardTitle>
          <CardSub>{t('buyer_demandInput_hint')}</CardSub>
        </div>
      </div>

      <Textarea
        className="mt-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('buyer_demandInput_placeholder')}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          onClick={handleTranslate}
          disabled={parsing || !text.trim()}
          icon={<Sparkles size={16} />}
        >
          {parsing ? t('buyer_translating') : t('buyer_translateBtn')}
        </Button>
        {parsed && parsed.lines.length > 0 ? (
          <Button
            onClick={handleSubmit}
            variant="secondary"
            icon={<Send size={16} />}
          >
            {t('buyer_submitBtn')}
          </Button>
        ) : null}
      </div>

      {parsed ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-900/40 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-200">
              <BrainCircuit size={14} />
              {t('buyer_interpretation')}
              <span className="ms-auto">
                {t('buyer_confidence')}: {Math.round(parsed.confidence * 100)}%
              </span>
            </div>
            <p className="mt-2 text-sm text-charcoal-800 dark:text-charcoal-100 leading-relaxed">
              {language === 'ar' ? parsed.interpretationAr : parsed.interpretation}
            </p>
          </div>

          {parsed.lines.length > 0 ? (
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-300 mb-2">
                {t('buyer_structuredTitle')}
              </div>
              <StructuredDemandTable lines={parsed.lines} />
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
