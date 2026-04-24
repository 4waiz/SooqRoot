import { Check } from 'lucide-react';
import { ORDER_STATUSES, OrderStatus } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';
import { dictionaries } from '../../i18n/translations';

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  const { t, language } = useTranslation();
  const currentIdx = ORDER_STATUSES.indexOf(status);

  return (
    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto py-1">
      {ORDER_STATUSES.map((s, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const key = `status_${s}` as keyof typeof dictionaries.en;
        return (
          <div key={s} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5 min-w-[88px]">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition ${
                  done
                    ? 'bg-brand-600 text-white'
                    : 'bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-400'
                } ${active ? 'ring-4 ring-brand-200 dark:ring-brand-900/40' : ''}`}
              >
                {done ? <Check size={14} /> : idx + 1}
              </div>
              <div
                className={`text-[11px] md:text-xs text-center font-medium leading-tight ${
                  done ? 'text-charcoal-800 dark:text-white' : 'text-charcoal-400'
                }`}
              >
                {t(key)}
              </div>
            </div>
            {idx < ORDER_STATUSES.length - 1 ? (
              <div
                className={`h-0.5 w-5 md:w-8 rounded-full ${
                  idx < currentIdx ? 'bg-brand-500' : 'bg-charcoal-200 dark:bg-charcoal-700'
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
