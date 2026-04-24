import { useApp } from '../context/useApp';
import { dictionaries, TranslationKey } from './translations';

export function useTranslation() {
  const { language } = useApp();
  const dict = dictionaries[language];
  const t = (key: TranslationKey) => dict[key] || key;
  const isRtl = language === 'ar';
  return { t, language, isRtl };
}
