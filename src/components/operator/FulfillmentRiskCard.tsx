import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { RiskScore } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';

export function FulfillmentRiskCard({ risk }: { risk: RiskScore }) {
  const { t, language } = useTranslation();
  const tone = risk.level === 'High' ? 'rose' : risk.level === 'Medium' ? 'amber' : 'emerald';
  const Icon = risk.level === 'High' ? AlertCircle : risk.level === 'Medium' ? AlertTriangle : ShieldCheck;
  const label =
    risk.level === 'High'
      ? t('operator_risk_high')
      : risk.level === 'Medium'
      ? t('operator_risk_medium')
      : t('operator_risk_low');
  const reasons = language === 'ar' ? risk.reasonsAr : risk.reasons;
  const mitigations = language === 'ar' ? risk.mitigationsAr : risk.mitigations;

  return (
    <div className="rounded-2xl border border-charcoal-100 dark:border-charcoal-700 p-4 bg-gradient-to-br from-white to-brand-50/30 dark:from-charcoal-800 dark:to-charcoal-900">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-charcoal-600 dark:text-charcoal-300" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-300">
              {t('operator_risk_title')}
            </div>
            <div className="text-lg font-bold text-charcoal-900 dark:text-white">
              {label}
            </div>
          </div>
        </div>
        <Badge tone={tone}>
          {label} · {risk.score}
        </Badge>
      </div>

      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-bold uppercase text-charcoal-500 dark:text-charcoal-300 mb-1">
            {t('operator_risk_reasons')}
          </div>
          <ul className="text-sm space-y-1 text-charcoal-800 dark:text-charcoal-100">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase text-charcoal-500 dark:text-charcoal-300 mb-1">
            {t('operator_risk_mitigations')}
          </div>
          <ul className="text-sm space-y-1 text-charcoal-800 dark:text-charcoal-100">
            {mitigations.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
