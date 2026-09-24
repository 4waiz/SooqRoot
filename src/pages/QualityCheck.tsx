import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  ImageUp,
  Info,
  RefreshCw,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataRow,
  PageHeader,
  Progress,
  Select,
} from '../components/ui';
import { Avatar } from '../components/ui/Photo';
import { CountUp } from '../components/ui/Motion';
import { PRODUCTS, getProduct } from '../data/products';
import { productPhoto } from '../data/media';
import { analyseImageData, gradeFromStats, QualityResult } from '../lib/qualityCheck';
import { formatTime, relativeTime } from '../lib/metrics';

type Phase = 'idle' | 'camera' | 'captured' | 'analysing' | 'done';

interface CheckRecord {
  id: string;
  result: QualityResult;
  thumb: string;
  farmId: string;
  batchRef: string;
}

const STEPS = [
  'Reading frame',
  'Sampling colour across the pack',
  'Scoring uniformity and blemish',
  'Matching against the grade band',
];

export function QualityCheck() {
  const { farms, orders, pushActivity } = useStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [result, setResult] = useState<QualityResult | null>(null);
  const [history, setHistory] = useState<CheckRecord[]>([]);
  const [logged, setLogged] = useState(false);

  const [productId, setProductId] = useState('p-tomato');
  const [farmId, setFarmId] = useState(farms[0]?.id ?? '');
  const [batchRef, setBatchRef] = useState(
    orders.find((o) => o.allocations.length)?.allocations[0]?.batchId ?? 'SR-2610-AK-004-01'
  );

  const product = getProduct(productId);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stopCamera();
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [stopCamera]
  );

  const startCamera = async () => {
    setError(null);
    setResult(null);
    setShot(null);
    setLogged(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setPhase('camera');
      // The <video> mounts with the phase change, so attach on the next frame.
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      }, 0);
    } catch (e) {
      const name = (e as DOMException)?.name;
      setError(
        name === 'NotAllowedError'
          ? 'Camera permission was blocked. Allow camera access in the browser, or upload a photo instead.'
          : name === 'NotFoundError'
            ? 'No camera was found on this device. Upload a photo instead.'
            : 'The camera could not be opened here. Upload a photo instead.'
      );
      setPhase('idle');
    }
  };

  const analyse = (source: CanvasImageSource, w: number, h: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const side = Math.min(w, h);
    const size = 480;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    // Centre-crop to a square so framing does not skew the statistics.
    ctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size);
    setShot(canvas.toDataURL('image/jpeg', 0.82));

    const data = ctx.getImageData(0, 0, size, size);
    setPhase('analysing');
    setStep(0);
    timers.current.forEach((t) => window.clearTimeout(t));
    STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStep(i + 1), 380 * (i + 1)));
    });
    timers.current.push(
      window.setTimeout(
        () => {
          const stats = analyseImageData(data);
          const r = gradeFromStats(stats, productId);
          setResult(r);
          setPhase('done');
          setHistory((prev) =>
            [
              { id: `qc-${Date.now()}`, result: r, thumb: canvas.toDataURL('image/jpeg', 0.5), farmId, batchRef },
              ...prev,
            ].slice(0, 6)
          );
        },
        380 * STEPS.length + 320
      )
    );
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    analyse(video, video.videoWidth, video.videoHeight);
    stopCamera();
  };

  const onFile = (file?: File) => {
    if (!file) return;
    setError(null);
    setLogged(false);
    const img = new Image();
    img.onload = () => analyse(img, img.naturalWidth, img.naturalHeight);
    img.onerror = () => setError('That file could not be read as an image.');
    img.src = URL.createObjectURL(file);
  };

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    stopCamera();
    setPhase('idle');
    setResult(null);
    setShot(null);
    setError(null);
    setLogged(false);
  };

  const logToBatch = () => {
    if (!result) return;
    const farm = farms.find((f) => f.id === farmId);
    pushActivity({
      kind: 'exception',
      title: `Quality check logged, Grade ${result.grade} on ${product.name}`,
      detail: `${batchRef} · score ${result.score}/100 · ${farm?.name ?? 'farm'} · simulated grading`,
      actor: 'Awaiz Ahmed',
    });
    setLogged(true);
  };

  const gradeTone = result?.grade === 'A' ? 'emerald' : result?.grade === 'B' ? 'amber' : 'rose';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Quality Check"
        subtitle="Photograph a sample at the packhouse and get an instant grade read against the buyer's contracted band."
        actions={
          <Badge tone="sand" icon={<Info size={12} />}>
            Simulated grading
          </Badge>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-sand-200 bg-sand-50 p-4 dark:border-sand-600 dark:bg-sand-600/15">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-sand-600 dark:text-sand-300" />
        <p className="text-2xs leading-relaxed text-charcoal-600 dark:text-charcoal-300">
          <span className="font-bold text-charcoal-800 dark:text-charcoal-100">How this demo works.</span>{' '}
          The photo never leaves your device. SooqRoot reads real colour statistics out of the frame
          mean hue, saturation, brightness spread and dark-patch share, and maps them onto a grading
          report with fixed thresholds. It is a <span className="font-semibold">simulation for demonstration</span>,
          not a trained agronomy model, so treat the grade as illustrative.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* ---------------- Capture ---------------- */}
        <Card padded={false} className="overflow-hidden">
          <div className="p-5 pb-4">
            <CardHeader
              title="Sample capture"
              subtitle="Fill the frame with the produce, in even light"
              icon={<Camera size={16} />}
            />
          </div>

          <div className="relative mx-3 overflow-hidden rounded-xl bg-charcoal-950" style={{ aspectRatio: '4 / 3' }}>
            {phase === 'camera' ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-white/50" />
                <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-2xs font-semibold text-white/85 drop-shadow">
                  Fill the frame with one layer of produce
                </div>
              </>
            ) : shot ? (
              <>
                <img src={shot} alt="Captured sample" className="h-full w-full object-cover" />
                {phase === 'analysing' ? (
                  <div className="absolute inset-0 bg-charcoal-950/35 backdrop-blur-[1px]">
                    <div className="sr-scanline" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                      <ScanLine size={26} className="animate-pulse" />
                      <div className="text-xs font-semibold">Analysing sample</div>
                      <div className="mt-1 w-48 space-y-1">
                        {STEPS.map((s, i) => (
                          <div
                            key={s}
                            className={`flex items-center gap-1.5 text-[10px] transition-opacity ${
                              i < step ? 'opacity-100' : 'opacity-40'
                            }`}
                          >
                            {i < step ? (
                              <CheckCircle2 size={10} />
                            ) : (
                              <span className="h-2.5 w-2.5 rounded-full border border-current" />
                            )}
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Camera size={24} />
                </span>
                <p className="text-xs font-semibold text-white/90">
                  Take a photo of the sample, or upload one
                </p>
                <p className="max-w-xs text-[11px] leading-relaxed text-white/60">
                  On a phone this opens the rear camera. Nothing is uploaded, the frame is analysed
                  in the browser.
                </p>
              </div>
            )}
          </div>

          {error ? (
            <div className="mx-3 mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-2xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
              <CameraOff size={13} className="mt-0.5 shrink-0" />
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 p-3">
            {phase === 'camera' ? (
              <>
                <Button className="flex-1" icon={<Camera size={15} />} onClick={capture}>
                  Capture sample
                </Button>
                <Button variant="secondary" onClick={reset}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="flex-1"
                  icon={<Camera size={15} />}
                  onClick={startCamera}
                  loading={phase === 'analysing'}
                >
                  {shot ? 'Retake photo' : 'Open camera'}
                </Button>
                <Button
                  variant="secondary"
                  icon={<ImageUp size={15} />}
                  onClick={() => fileRef.current?.click()}
                >
                  Upload
                </Button>
                {shot ? (
                  <Button variant="ghost" icon={<RefreshCw size={15} />} onClick={reset}>
                    Clear
                  </Button>
                ) : null}
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          <div className="grid gap-3 border-t border-charcoal-100 p-4 dark:border-charcoal-800 sm:grid-cols-3">
            <Select label="Crop" value={productId} onChange={(e) => setProductId(e.target.value)}>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select label="Farm" value={farmId} onChange={(e) => setFarmId(e.target.value)}>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
            <Select label="Batch" value={batchRef} onChange={(e) => setBatchRef(e.target.value)}>
              {Array.from(
                new Set(orders.flatMap((o) => o.allocations.map((a) => a.batchId)))
              )
                .slice(0, 24)
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </Select>
          </div>
        </Card>

        {/* ---------------- Result ---------------- */}
        <div className="min-w-0 space-y-4">
          {result ? (
            <Card className="animate-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={productPhoto(productId, 96, 96)}
                    alt={product.name}
                    size={44}
                    tint={product.color}
                    fallback={product.emoji}
                  />
                  <div>
                    <div className="sr-h3">{product.name}</div>
                    <div className="font-mono text-2xs text-charcoal-400">{batchRef}</div>
                  </div>
                </div>
                <Badge tone={gradeTone}>Grade {result.grade}</Badge>
              </div>

              <div className="mt-4 flex items-end gap-4">
                <div>
                  <div className="sr-eyebrow">Quality index</div>
                  <div className="sr-num text-[2.5rem] leading-none">
                    <CountUp value={result.score} />
                    <span className="ms-1 text-base font-semibold text-charcoal-400">/100</span>
                  </div>
                </div>
                <div className="flex-1 pb-1">
                  <Progress
                    value={result.score}
                    tone={result.score >= 78 ? 'healthy' : result.score >= 58 ? 'attention' : 'risk'}
                  />
                  <div className="mt-1.5 flex justify-between text-2xs text-charcoal-400">
                    <span>Grade confidence {result.gradeConfidence}%</span>
                    <span>Photo quality {result.imageQuality}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {result.findings.map((f) => (
                  <div key={f.key}>
                    <div className="flex items-center justify-between text-2xs">
                      <span className="font-semibold text-charcoal-700 dark:text-charcoal-200">{f.label}</span>
                      <span className="font-bold tabular-nums">{f.score}</span>
                    </div>
                    <Progress
                      value={f.score}
                      tone={f.score >= 75 ? 'healthy' : f.score >= 55 ? 'attention' : 'risk'}
                      height="h-1.5"
                      className="mt-1"
                    />
                    <div className="mt-1 text-[10px] leading-relaxed text-charcoal-400">{f.detail}</div>
                  </div>
                ))}
              </div>

              {result.defects.length ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-900/25">
                  <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    <AlertTriangle size={12} /> Flags
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {result.defects.map((d) => (
                      <li key={d} className="text-2xs leading-relaxed text-charcoal-700 dark:text-charcoal-200">
                        · {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-2xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/25 dark:text-emerald-200">
                  <ShieldCheck size={14} /> No flags raised on this sample.
                </div>
              )}

              <div className="mt-4">
                <DataRow
                  label="Estimated shelf life"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Timer size={12} /> {result.shelfLifeDays} days
                    </span>
                  }
                />
                <DataRow label="Packing" value={result.packing} />
                <DataRow label="Checked" value={formatTime(result.capturedAt)} />
              </div>

              <p className="mt-3 rounded-xl bg-canvas-soft p-3 text-2xs leading-relaxed text-charcoal-600 dark:bg-charcoal-950 dark:text-charcoal-300">
                {result.recommendation}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="flex-1"
                  icon={<Send size={14} />}
                  onClick={logToBatch}
                  disabled={logged}
                >
                  {logged ? 'Logged to batch' : 'Log to batch'}
                </Button>
                {result.grade !== 'A' ? (
                  <Link to="/exceptions" className="sr-btn-secondary text-xs">
                    Raise exception
                  </Link>
                ) : null}
              </div>
              <p className="mt-2 text-center text-[10px] text-charcoal-400">
                Simulated result · demo data
              </p>
            </Card>
          ) : (
            <Card>
              <CardHeader
                title="Grade report"
                subtitle="Capture a sample to produce a report"
                icon={<ScanLine size={16} />}
              />
              <div className="mt-4 space-y-2">
                {['Colour development', 'Colour uniformity', 'Ripeness intensity', 'Blemish and bruising', 'Surface consistency'].map(
                  (label) => (
                    <div key={label}>
                      <div className="text-2xs font-semibold text-charcoal-400">{label}</div>
                      <div className="mt-1 h-1.5 rounded-full bg-charcoal-100 dark:bg-charcoal-800" />
                    </div>
                  )
                )}
              </div>
              <p className="mt-4 text-2xs leading-relaxed text-charcoal-400">
                The report scores five signals from the photo, maps them to the contracted grade band,
                and estimates remaining shelf life for {product.name.toLowerCase()}.
              </p>
            </Card>
          )}

          {history.length ? (
            <Card padded={false}>
              <div className="p-5 pb-2">
                <CardHeader title="Recent checks" subtitle="This session" icon={<Clock size={16} />} />
              </div>
              <div className="space-y-1 px-3 pb-3">
                {history.map((h) => {
                  const p = getProduct(h.result.productId);
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-canvas-soft dark:hover:bg-charcoal-800"
                    >
                      <img src={h.thumb} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-charcoal-800 dark:text-charcoal-100">
                          {p.name} · Grade {h.result.grade}
                        </div>
                        <div className="truncate text-2xs text-charcoal-400">
                          {h.batchRef} · {relativeTime(h.result.capturedAt, new Date())}
                        </div>
                      </div>
                      <span className="sr-num text-sm">{h.result.score}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
