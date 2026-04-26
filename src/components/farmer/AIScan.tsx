import { useEffect, useRef, useState } from 'react';
import {
  Bug,
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ScanLine,
  ShieldCheck,
  Leaf,
  ImageIcon,
  X,
} from 'lucide-react';
import { Card, CardSub, CardTitle } from '../ui/Card';
import { useTranslation } from '../../i18n/useTranslation';

type ScanType = 'pest' | 'quality';

interface ImageMetrics {
  brightness: number;
  greenRatio: number;
  yellowBrownRatio: number;
  colorVariance: number;
  edgeDensity: number;
  blurriness: number;
}

interface PestResult {
  type: 'pest';
  diagnosis: { en: string; ar: string };
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  recommendation: { en: string; ar: string };
  signals: { en: string; ar: string }[];
}

interface QualityResult {
  type: 'quality';
  grade: 'A' | 'B' | 'C';
  confidence: number;
  color: number;
  size: number;
  defects: number;
  marketReady: boolean;
  recommendation: { en: string; ar: string };
  signals: { en: string; ar: string }[];
}

type ScanResult = PestResult | QualityResult;

export function AIScan() {
  const { t, language } = useTranslation();
  const [active, setActive] = useState<ScanType>('pest');

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            <Sparkles size={14} />
            AI Vision
          </div>
          <CardTitle className="mt-1">{t('scan_section_title')}</CardTitle>
          <CardSub>{t('scan_section_subtitle')}</CardSub>
        </div>
        <div className="inline-flex rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-charcoal-50 dark:bg-charcoal-900/40 p-1 self-start">
          <TabButton active={active === 'pest'} onClick={() => setActive('pest')}>
            <Bug size={14} />
            <span>{language === 'ar' ? 'آفات' : 'Pest'}</span>
          </TabButton>
          <TabButton active={active === 'quality'} onClick={() => setActive('quality')}>
            <ShieldCheck size={14} />
            <span>{language === 'ar' ? 'جودة' : 'Quality'}</span>
          </TabButton>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-4">
        <ScanPanel type="pest" highlighted={active === 'pest'} />
        <ScanPanel type="quality" highlighted={active === 'quality'} />
      </div>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? 'bg-white dark:bg-charcoal-800 text-brand-700 dark:text-brand-200 shadow-sm'
          : 'text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-800 dark:hover:text-charcoal-200'
      }`}
    >
      {children}
    </button>
  );
}

function ScanPanel({ type, highlighted }: { type: ScanType; highlighted: boolean }) {
  const { t, language, isRtl } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const openCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      setImageDataUrl(null);
      setResult(null);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 30);
    } catch {
      setCameraError(true);
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    const w = v.videoWidth || 640;
    const h = v.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    setImageDataUrl(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
    setResult(null);
  };

  const onFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(typeof reader.result === 'string' ? reader.result : null);
      setResult(null);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onFile(e.dataTransfer.files?.[0]);
  };

  const reset = () => {
    setImageDataUrl(null);
    setResult(null);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyze = async () => {
    if (!imageDataUrl) return;
    setAnalyzing(true);
    setResult(null);
    setProgress(0);

    const start = performance.now();
    const targetDuration = 1900 + Math.random() * 800;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(99, (elapsed / targetDuration) * 100);
      setProgress(pct);
      if (pct < 99) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    try {
      const metrics = await computeImageMetrics(imageDataUrl);
      const remaining = Math.max(400, targetDuration - (performance.now() - start));
      await new Promise((r) => setTimeout(r, remaining));
      const final = type === 'pest' ? buildPestResult(metrics) : buildQualityResult(metrics);
      setResult(final);
      setProgress(100);
    } finally {
      cancelAnimationFrame(raf);
      setAnalyzing(false);
    }
  };

  const headerIcon = type === 'pest' ? <Bug size={18} /> : <ShieldCheck size={18} />;
  const headerTitle = type === 'pest' ? t('scan_pest_title') : t('scan_quality_title');
  const headerDesc = type === 'pest' ? t('scan_pest_desc') : t('scan_quality_desc');
  const accent =
    type === 'pest'
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200';

  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-charcoal-800 transition-all ${
        highlighted
          ? 'border-brand-200 dark:border-brand-900/60 shadow-soft'
          : 'border-charcoal-100 dark:border-charcoal-700'
      }`}
    >
      <div className="px-5 pt-5 pb-3 flex items-start gap-3">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${accent}`}>
          {headerIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-charcoal-900 dark:text-white">{headerTitle}</h4>
            <span className="text-[10px] font-bold uppercase tracking-wide text-charcoal-400 bg-charcoal-100 dark:bg-charcoal-700 dark:text-charcoal-300 px-1.5 py-0.5 rounded">
              {t('scan_demoBadge')}
            </span>
          </div>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1 leading-relaxed">
            {headerDesc}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Stage */}
        <div
          className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
              : 'border-charcoal-200 dark:border-charcoal-700 bg-charcoal-50 dark:bg-charcoal-900/40'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => {
            if (!imageDataUrl && !cameraOn) fileInputRef.current?.click();
          }}
          role={!imageDataUrl && !cameraOn ? 'button' : undefined}
        >
          {cameraOn && (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Scanner overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/70 rounded-lg" />
                <div className="absolute inset-x-4 top-4 h-px bg-brand-400 shadow-[0_0_12px_2px_rgba(46,194,126,0.7)] animate-scanline" />
                <div className="absolute top-3 start-3 inline-flex items-center gap-1.5 bg-black/60 text-white text-[10px] font-semibold uppercase px-2 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  LIVE
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stopCamera();
                }}
                aria-label={t('close')}
                className="absolute top-3 end-3 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </>
          )}

          {!cameraOn && imageDataUrl && (
            <>
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img
                src={imageDataUrl}
                alt="captured sample"
                className="w-full h-full object-cover"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-charcoal-900/30 backdrop-blur-[1px]">
                  <div className="absolute inset-x-0 top-0 h-px bg-brand-400 shadow-[0_0_12px_2px_rgba(46,194,126,0.9)] animate-scanline" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Loader2 size={28} className="animate-spin" />
                    <div className="mt-3 text-sm font-semibold">{t('scan_analyzing')}</div>
                    <div className="mt-2 w-44 h-1.5 rounded-full bg-white/25 overflow-hidden">
                      <div
                        className="h-full bg-brand-400 transition-[width] duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {!analyzing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  aria-label={t('close')}
                  className="absolute top-3 end-3 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              )}
            </>
          )}

          {!cameraOn && !imageDataUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-charcoal-400">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 flex items-center justify-center text-charcoal-400 shadow-sm">
                <ImageIcon size={24} />
              </div>
              <div className="mt-3 text-sm font-semibold text-charcoal-600 dark:text-charcoal-300">
                {t('scan_dropHint')}
              </div>
              <div className="mt-1 text-[11px] text-charcoal-400">JPG · PNG · HEIC · &lt; 10 MB</div>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-300">
            <AlertTriangle size={12} />
            {t('scan_cameraDenied')}
          </div>
        )}

        {/* Action row */}
        <div className="mt-3 flex flex-wrap gap-2">
          {!cameraOn && !imageDataUrl && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-charcoal-800 text-charcoal-800 dark:text-charcoal-100 border border-charcoal-200 dark:border-charcoal-700 px-3 py-2 text-xs font-semibold hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors"
              >
                <Upload size={14} />
                {t('scan_upload')}
              </button>
              <button
                onClick={openCamera}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white px-3 py-2 text-xs font-semibold hover:bg-brand-700 shadow-soft transition-colors"
              >
                <Camera size={14} />
                {t('scan_camera')}
              </button>
            </>
          )}
          {cameraOn && (
            <button
              onClick={capture}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white px-3 py-2 text-xs font-semibold hover:bg-brand-700 shadow-soft transition-colors"
            >
              <ScanLine size={14} />
              {t('scan_capture')}
            </button>
          )}
          {imageDataUrl && !analyzing && !result && (
            <>
              <button
                onClick={analyze}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white px-3 py-2 text-xs font-semibold hover:bg-brand-700 shadow-soft transition-colors"
              >
                <Sparkles size={14} className={isRtl ? 'flip-on-rtl' : ''} />
                {t('scan_analyze')}
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 border border-charcoal-200 dark:border-charcoal-700 px-3 py-2 text-xs font-semibold hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors"
              >
                <RefreshCw size={14} />
                {t('scan_retake')}
              </button>
            </>
          )}
          {result && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 border border-charcoal-200 dark:border-charcoal-700 px-3 py-2 text-xs font-semibold hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors"
            >
              <RefreshCw size={14} />
              {t('scan_close')}
            </button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4 rounded-xl border border-charcoal-100 dark:border-charcoal-700 bg-charcoal-50/50 dark:bg-charcoal-900/40 p-4 animate-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center">
                <Leaf size={14} />
              </div>
              <div className="text-sm font-bold text-charcoal-900 dark:text-white">
                {t('scan_resultTitle')}
              </div>
              <div className="ms-auto text-[10px] font-bold uppercase tracking-wide text-charcoal-400">
                {t('scan_confidence')}: {Math.round(result.confidence * 100)}%
              </div>
            </div>
            {result.type === 'pest' ? (
              <PestView r={result} />
            ) : (
              <QualityView r={result} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PestView({ r }: { r: PestResult }) {
  const { t, language } = useTranslation();
  const sevColor =
    r.severity === 'low'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
      : r.severity === 'medium'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200';
  const sevLabel =
    r.severity === 'low'
      ? t('scan_severity_low')
      : r.severity === 'medium'
      ? t('scan_severity_medium')
      : t('scan_severity_high');

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div className="text-sm font-semibold text-charcoal-900 dark:text-white flex-1">
          {r.diagnosis[language]}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${sevColor}`}>
          {r.severity === 'low' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
          {t('scan_severity')}: {sevLabel}
        </span>
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wide mb-1">
          {language === 'ar' ? 'إشارات بصرية' : 'Visual signals'}
        </div>
        <ul className="space-y-1">
          {r.signals.map((s, i) => (
            <li key={i} className="text-xs text-charcoal-700 dark:text-charcoal-200 flex items-start gap-1.5">
              <span className="mt-1 w-1 h-1 rounded-full bg-brand-500 flex-shrink-0" />
              <span>{s[language]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 p-3">
        <div className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300 tracking-wide">
          {t('scan_recommendation')}
        </div>
        <div className="mt-1 text-xs leading-relaxed text-charcoal-800 dark:text-charcoal-100">
          {r.recommendation[language]}
        </div>
      </div>
    </div>
  );
}

function QualityView({ r }: { r: QualityResult }) {
  const { t, language } = useTranslation();
  const gradeColor =
    r.grade === 'A'
      ? 'bg-emerald-600 text-white'
      : r.grade === 'B'
      ? 'bg-amber-500 text-white'
      : 'bg-rose-500 text-white';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-extrabold ${gradeColor}`}>
          {r.grade}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wide">
            {t('scan_grade')}
          </div>
          <div className="text-sm font-semibold text-charcoal-900 dark:text-white">
            {r.marketReady
              ? language === 'ar'
                ? 'جاهز للتسليم للمشتري'
                : 'Ready for buyer delivery'
              : language === 'ar'
              ? 'يحتاج فرز إضافي قبل التسليم'
              : 'Needs additional sorting before delivery'}
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
            r.marketReady
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
          }`}
        >
          {r.marketReady ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
          {t('scan_marketReady')}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label={t('scan_color')} value={r.color} />
        <Metric label={t('scan_size')} value={r.size} />
        <Metric label={t('scan_defects')} value={1 - r.defects} invert />
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wide mb-1">
          {language === 'ar' ? 'إشارات بصرية' : 'Visual signals'}
        </div>
        <ul className="space-y-1">
          {r.signals.map((s, i) => (
            <li key={i} className="text-xs text-charcoal-700 dark:text-charcoal-200 flex items-start gap-1.5">
              <span className="mt-1 w-1 h-1 rounded-full bg-brand-500 flex-shrink-0" />
              <span>{s[language]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 p-3">
        <div className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300 tracking-wide">
          {t('scan_recommendation')}
        </div>
        <div className="mt-1 text-xs leading-relaxed text-charcoal-800 dark:text-charcoal-100">
          {r.recommendation[language]}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const pct = Math.round(value * 100);
  const display = invert ? 100 - pct : pct;
  const tone =
    display >= 80
      ? 'bg-emerald-500'
      : display >= 60
      ? 'bg-brand-500'
      : display >= 40
      ? 'bg-amber-500'
      : 'bg-rose-500';
  return (
    <div className="rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal-100 dark:border-charcoal-700 p-2.5">
      <div className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wide truncate">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-charcoal-100 dark:bg-charcoal-700 overflow-hidden">
          <div className={`h-full ${tone}`} style={{ width: `${display}%` }} />
        </div>
        <div className="text-xs font-bold text-charcoal-800 dark:text-charcoal-100 tabular-nums">
          {display}
        </div>
      </div>
    </div>
  );
}

// ────────────── Real image analysis ──────────────

async function computeImageMetrics(dataUrl: string): Promise<ImageMetrics> {
  const img = await loadImage(dataUrl);
  const TARGET = 160;
  const ratio = Math.min(TARGET / img.width, TARGET / img.height, 1);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      brightness: 0.5,
      greenRatio: 0.3,
      yellowBrownRatio: 0.2,
      colorVariance: 0.3,
      edgeDensity: 0.3,
      blurriness: 0.3,
    };
  }
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let totalLum = 0;
  let greenPx = 0;
  let yellowBrownPx = 0;
  let lumSum = 0;
  let lumSumSq = 0;
  const lums: number[] = new Array(w * h);
  const N = w * h;

  for (let i = 0; i < N; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lums[i] = lum;
    totalLum += lum;
    lumSum += lum;
    lumSumSq += lum * lum;
    if (g > r + 12 && g > b + 6) greenPx++;
    if (r > 110 && g > 70 && b < 110 && Math.abs(r - g) < 80) yellowBrownPx++;
  }

  const brightness = totalLum / N / 255;
  const greenRatio = greenPx / N;
  const yellowBrownRatio = yellowBrownPx / N;
  const mean = lumSum / N;
  const variance = lumSumSq / N - mean * mean;
  const colorVariance = Math.min(1, variance / 5000);

  // Edge density via simple horizontal+vertical luminance diff
  let edgeSum = 0;
  let blurAcc = 0;
  let blurCount = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const dx = Math.abs(lums[idx + 1] - lums[idx - 1]);
      const dy = Math.abs(lums[idx + w] - lums[idx - w]);
      const e = dx + dy;
      edgeSum += e;
      // Laplacian-ish for blur
      const lap = Math.abs(
        4 * lums[idx] - lums[idx - 1] - lums[idx + 1] - lums[idx - w] - lums[idx + w]
      );
      blurAcc += lap;
      blurCount++;
    }
  }
  const edgeDensity = Math.min(1, edgeSum / (N * 80));
  const lapMean = blurAcc / Math.max(1, blurCount);
  const blurriness = 1 - Math.min(1, lapMean / 30);

  return { brightness, greenRatio, yellowBrownRatio, colorVariance, edgeDensity, blurriness };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function buildPestResult(m: ImageMetrics): PestResult {
  const stress = clamp01(
    m.yellowBrownRatio * 1.6 + (1 - m.greenRatio) * 0.4 - m.brightness * 0.1
  );
  const spotLikelihood = clamp01(m.edgeDensity * 0.8 + m.colorVariance * 0.3);
  const overall = clamp01(stress * 0.65 + spotLikelihood * 0.35);

  let severity: 'low' | 'medium' | 'high';
  if (overall < 0.32) severity = 'low';
  else if (overall < 0.6) severity = 'medium';
  else severity = 'high';

  let diagnosis: { en: string; ar: string };
  let recommendation: { en: string; ar: string };
  const signals: { en: string; ar: string }[] = [];

  if (severity === 'low') {
    diagnosis = {
      en: 'Foliage looks healthy — no immediate pest pressure detected.',
      ar: 'الأوراق تبدو سليمة — لا توجد إصابة آفات واضحة في الوقت الحالي.',
    };
    recommendation = {
      en: 'Maintain current irrigation and monitor weekly. Re-scan after the next watering cycle.',
      ar: 'حافظ على نظام الري الحالي مع مراقبة أسبوعية. أعد الفحص بعد دورة الري القادمة.',
    };
  } else if (severity === 'medium') {
    diagnosis = {
      en: 'Early stress markers present — likely mild pest activity or nutrient imbalance.',
      ar: 'ظهور علامات إجهاد مبكرة — يُرجَّح نشاط آفات بسيط أو خلل في العناصر الغذائية.',
    };
    recommendation = {
      en: 'Inspect the underside of leaves for whiteflies or aphids within 48 hours. Apply neem-based spray at sunset and re-scan in 5 days.',
      ar: 'افحص الجهة السفلية من الأوراق بحثاً عن الذبابة البيضاء أو المن خلال 48 ساعة. رشّ مستحلب النيم عند الغروب وأعد الفحص بعد 5 أيام.',
    };
  } else {
    diagnosis = {
      en: 'Significant discoloration and spotting detected — likely fungal infection or active infestation.',
      ar: 'تغيّر لون واضح وبقع ملحوظة — يُرجَّح إصابة فطرية أو غزو حشري نشط.',
    };
    recommendation = {
      en: 'Isolate affected plants immediately, prune visibly damaged leaves, and consult an agronomist. Avoid harvesting from this area for 7 days.',
      ar: 'اعزل النباتات المصابة فوراً، قلّم الأوراق المتضررة بوضوح، واستشر مهندساً زراعياً. تجنّب الحصاد من هذه المنطقة لمدة 7 أيام.',
    };
  }

  if (m.yellowBrownRatio > 0.18) {
    signals.push({
      en: `Yellow/brown pixels ${(m.yellowBrownRatio * 100).toFixed(0)}% of frame — suggests chlorosis or rust spots.`,
      ar: `بكسلات صفراء/بنية تشكّل ${(m.yellowBrownRatio * 100).toFixed(0)}% من الإطار — تشير إلى اصفرار أو بقع صدأ.`,
    });
  }
  if (m.greenRatio < 0.25) {
    signals.push({
      en: 'Low green dominance — leaf canopy may be thinning or off-color.',
      ar: 'هيمنة منخفضة للون الأخضر — قد يكون الغطاء الورقي رقيقاً أو متغيّر اللون.',
    });
  }
  if (m.edgeDensity > 0.45) {
    signals.push({
      en: 'High edge density — possible bite marks or surface lesions.',
      ar: 'كثافة حواف عالية — احتمال آثار قضم أو تقرحات سطحية.',
    });
  }
  if (m.blurriness > 0.55) {
    signals.push({
      en: 'Image is slightly soft — consider re-capturing at 30 cm distance for higher confidence.',
      ar: 'الصورة ضبابية بعض الشيء — يُفضّل إعادة الالتقاط من مسافة 30 سم لرفع الثقة.',
    });
  }
  if (signals.length === 0) {
    signals.push({
      en: 'Color, texture, and edge profiles within healthy range.',
      ar: 'اللون والملمس وملامح الحواف ضمن النطاق الصحي.',
    });
  }

  const confidence = clamp(0.62 + (1 - m.blurriness) * 0.3 + (Math.abs(overall - 0.5) * 0.15), 0.6, 0.97);

  return {
    type: 'pest',
    diagnosis,
    severity,
    confidence,
    recommendation,
    signals,
  };
}

function buildQualityResult(m: ImageMetrics): QualityResult {
  const colorUniformity = clamp(1 - m.colorVariance, 0.3, 0.99);
  const sizeConsistency = clamp(1 - m.edgeDensity * 0.6, 0.4, 0.98);
  const defects = clamp(m.yellowBrownRatio * 0.9 + m.edgeDensity * 0.25 - m.greenRatio * 0.1, 0.02, 0.6);

  const score = clamp(
    colorUniformity * 0.45 + sizeConsistency * 0.3 + (1 - defects) * 0.25,
    0.3,
    0.99
  );

  let grade: 'A' | 'B' | 'C';
  if (score >= 0.78) grade = 'A';
  else if (score >= 0.6) grade = 'B';
  else grade = 'C';

  const marketReady = grade !== 'C' && m.blurriness < 0.6;

  let recommendation: { en: string; ar: string };
  if (grade === 'A') {
    recommendation = {
      en: 'Pack into 5 kg branded boxes and dispatch on the next pickup window. Eligible for premium hotel orders.',
      ar: 'عبّئ في صناديق 5 كجم تحمل اسم المزرعة وأرسل في موعد الاستلام القادم. مؤهّل لطلبات الفنادق المتميزة.',
    };
  } else if (grade === 'B') {
    recommendation = {
      en: 'Sort out smaller items, repack the rest, and offer to caterers or restaurants. Avoid premium specs.',
      ar: 'افرز الحبات الأصغر، أعد تعبئة الباقي، وقدّمه لشركات التموين أو المطاعم. تجنّب المواصفات المتميزة.',
    };
  } else {
    recommendation = {
      en: 'Use for processing, juicing, or local market sales. Not suitable for fresh hotel/restaurant delivery.',
      ar: 'استخدمه للتصنيع أو العصر أو البيع في السوق المحلي. غير مناسب للتسليم الطازج للفنادق/المطاعم.',
    };
  }

  const signals: { en: string; ar: string }[] = [];
  if (colorUniformity > 0.8) {
    signals.push({
      en: `Strong color uniformity (${Math.round(colorUniformity * 100)}%) across the batch.`,
      ar: `انتظام لوني قوي (${Math.round(colorUniformity * 100)}%) عبر الدفعة.`,
    });
  } else {
    signals.push({
      en: 'Mixed coloration — consider sorting by ripeness before packing.',
      ar: 'تباين لوني — يُفضَّل الفرز حسب درجة النضج قبل التعبئة.',
    });
  }
  if (defects > 0.18) {
    signals.push({
      en: `Surface blemishes detected on ~${Math.round(defects * 100)}% of the surface area.`,
      ar: `بقع سطحية على ما يقارب ${Math.round(defects * 100)}% من المساحة.`,
    });
  }
  if (sizeConsistency > 0.75) {
    signals.push({
      en: 'Items appear well-calibrated in size — minimal sorting required.',
      ar: 'الحبات متجانسة الحجم — يحتاج الفرز جهداً قليلاً.',
    });
  }
  if (m.blurriness > 0.55) {
    signals.push({
      en: 'Slight blur reduced confidence — re-capture under stronger light for a sharper grade.',
      ar: 'ضبابية خفيفة قلّلت الثقة — أعد الالتقاط تحت إضاءة أقوى للحصول على درجة أدق.',
    });
  }

  const confidence = clamp(0.65 + (1 - m.blurriness) * 0.28 + score * 0.1, 0.6, 0.97);

  return {
    type: 'quality',
    grade,
    confidence,
    color: colorUniformity,
    size: sizeConsistency,
    defects,
    marketReady,
    recommendation,
    signals,
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function clamp01(v: number) {
  return clamp(v, 0, 1);
}
