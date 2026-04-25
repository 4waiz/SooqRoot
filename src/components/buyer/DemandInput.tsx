import { useState } from 'react';
import { Sparkles, Send, BrainCircuit } from 'lucide-react';
import { Card, CardSub, CardTitle } from '../ui/Card';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { StructuredDemandTable } from './StructuredDemandTable';
import { parseDemandTextWithAI, ParsedDemand } from '../../lib/ai';
import { useTranslation } from '../../i18n/useTranslation';
import { useApp } from '../../context/useApp';
import { Demand, DemandLine } from '../../types';

function mergeDemandLines(existing: DemandLine[], incoming: DemandLine[]): DemandLine[] {
  const merged = existing.map((line) => ({ ...line }));

  for (const line of incoming) {
    const sameLine = merged.find(
      (current) => current.product === line.product && current.unit === line.unit
    );

    if (sameLine) {
      sameLine.qty = Math.round((sameLine.qty + line.qty) * 100) / 100;
      sameLine.deliveryWindow = line.deliveryWindow || sameLine.deliveryWindow;
      sameLine.deliveryWindowAr = line.deliveryWindowAr || sameLine.deliveryWindowAr;
      sameLine.locationPref = line.locationPref || sameLine.locationPref;
      sameLine.locationPrefAr = line.locationPrefAr || sameLine.locationPrefAr;
    } else {
      merged.push(line);
    }
  }

  return merged;
}

export function DemandInput() {
  const { t, language } = useTranslation();
  const { activeBuyerId, addDemand, demands, updateDemand, removeAllocation, setPage } = useApp();
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedDemand | null>(null);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setParsing(true);
    try {
      const result = await parseDemandTextWithAI(text, language);
      setParsed(result);
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = () => {
    if (!parsed || !parsed.lines.length) return;
    const existingDemand = demands
      .filter((d) => d.buyerId === activeBuyerId && d.status !== 'Delivered')
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (existingDemand) {
      updateDemand(existingDemand.id, {
        createdAt: Date.now(),
        rawText: `${existingDemand.rawText}\n${text}`,
        status: 'Structured',
        lines: mergeDemandLines(existingDemand.lines, parsed.lines),
        aiInterpretation: parsed.interpretation,
        aiInterpretationAr: parsed.interpretationAr,
        aiConfidence: parsed.confidence,
      });
      removeAllocation(existingDemand.id);
      setText('');
      setParsed(null);
      setPage('operator');
      return;
    }

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
