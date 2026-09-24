import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe2, Map as MapIcon, Maximize2, Minus, Pause, Play, Plus, WifiOff } from 'lucide-react';
import { Buyer, Farm } from '../../types';
import { HEALTH_HEX } from '../ui';
import { useStore } from '../../state/AppStore';
import { allocatable } from '../../lib/engine';
import { buyerPhoto, farmPhoto } from '../../data/media';

/* ============================================================
   SupplyMap, the real, interactive UAE supply network.

   Leaflet over satellite imagery (Esri) or a street basemap
   (CARTO, light or dark to match the theme). Farms sit at their
   real coordinates as photo pins; buyer delivery points as
   photo tiles; every firm commitment is a curved flow with
   produce particles travelling farm → buyer.

   Tiles are the only network dependency: offline, the pins,
   flows and particles still render on a plain canvas and a
   small badge says so.
   ============================================================ */

export interface NetworkLink {
  farmId: string;
  buyerId: string;
  qty: number;
  health: 'healthy' | 'attention' | 'risk';
}

type Basemap = 'satellite' | 'map';

export const CONSOLIDATION_HUB = { name: 'Al Ain consolidation hub', lat: 24.258, lng: 55.694 };

const TILES = {
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  satelliteLabels:
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const ATTRIBUTION = {
  satellite: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
  map: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
};

const BASEMAP_KEY = 'sooqroot:v2:basemap';

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function shortBuyerName(name: string): string {
  const words = name.replace(/^The\s+/i, '').split(' ');
  return name.toLowerCase().startsWith('the ') ? words.slice(0, 2).join(' ') : words[0];
}

/** Quadratic arc between two points, bowed perpendicular to the chord. */
function arc(a: L.LatLngTuple, b: L.LatLngTuple, bend = 0.2, steps = 56): L.LatLngTuple[] {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const cLng = (lng1 + lng2) / 2 - (lat2 - lat1) * bend;
  const cLat = (lat1 + lat2) / 2 + (lng2 - lng1) * bend;
  const pts: L.LatLngTuple[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push([u * u * lat1 + 2 * u * t * cLat + t * t * lat2, u * u * lng1 + 2 * u * t * cLng + t * t * lng2]);
  }
  return pts;
}

function kmBetween(a: L.LatLngTuple, b: L.LatLngTuple): number {
  return L.latLng(a).distanceTo(L.latLng(b)) / 1000;
}

interface Props {
  farms: Farm[];
  buyers: Buyer[];
  links: NetworkLink[];
  height?: number;
  selectedFarmId?: string | null;
  onSelectFarm?: (id: string | null) => void;
  /** Fly in from a wide view on first render. */
  intro?: boolean;
  /** Show the consolidation hub marker. */
  showHub?: boolean;
  /** Stretch to the parent's height instead of using `height`. */
  fill?: boolean;
  className?: string;
}

export function SupplyMap({
  farms,
  buyers,
  links,
  height = 420,
  selectedFarmId,
  onSelectFarm,
  intro,
  showHub = true,
  fill = false,
  className = '',
}: Props) {
  const { theme } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const labelsRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const flowsRef = useRef<{ farmId: string; els: Element[] }[]>([]);
  const tileErrorsRef = useRef(0);

  const [basemap, setBasemap] = useState<Basemap>(() => {
    try {
      return (localStorage.getItem(BASEMAP_KEY) as Basemap) || 'satellite';
    } catch {
      return 'satellite';
    }
  });
  const [flowsOn, setFlowsOn] = useState(true);
  const [offline, setOffline] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selected = selectedFarmId !== undefined ? selectedFarmId : internalSelected;

  const selectFarm = (id: string | null) => {
    if (onSelectFarm) onSelectFarm(id);
    else setInternalSelected(id);
  };
  const selectRef = useRef(selectFarm);
  selectRef.current = selectFarm;

  const bounds = useMemo(() => {
    const pts: L.LatLngTuple[] = [
      ...farms.map((f) => [f.lat, f.lng] as L.LatLngTuple),
      ...buyers.map((b) => [b.lat, b.lng] as L.LatLngTuple),
    ];
    return pts.length ? L.latLngBounds(pts) : L.latLngBounds([[23, 53.5], [25.3, 56]]);
  }, [farms, buyers]);

  const committedByFarm = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of links) m[l.farmId] = (m[l.farmId] ?? 0) + l.qty;
    return m;
  }, [links]);

  /* ---------------- map lifecycle ---------------- */
  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      zoomSnap: 0.25,
      minZoom: 5,
      maxZoom: 17,
    });
    map.attributionControl.setPrefix(false);
    mapRef.current = map;

    if (intro) {
      map.setView(bounds.getCenter(), 6, { animate: false });
      window.setTimeout(() => {
        if (mapRef.current === map) map.flyToBounds(bounds, { padding: [48, 48], duration: 1.6 });
      }, 250);
    } else {
      map.fitBounds(bounds, { padding: [40, 40], animate: false });
    }

    map.on('click', () => selectRef.current(null));

    // Declutter by zoom: small unlabelled pins when zoomed out, full pins close in.
    const applyZoomClass = () => {
      const el = containerRef.current?.parentElement;
      if (!el) return;
      const z = map.getZoom();
      el.classList.toggle('z-far', z < 8.4);
      el.classList.toggle('z-mid', z >= 8.4 && z < 9.6);
    };
    map.on('zoomend', applyZoomClass);
    applyZoomClass();

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      baseRef.current = null;
      labelsRef.current = null;
      markersRef.current.clear();
      flowsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- tiles ---------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      localStorage.setItem(BASEMAP_KEY, basemap);
    } catch {
      /* ignore */
    }
    baseRef.current?.remove();
    labelsRef.current?.remove();
    tileErrorsRef.current = 0;
    setOffline(false);

    const onError = () => {
      tileErrorsRef.current += 1;
      if (tileErrorsRef.current > 6) setOffline(true);
    };

    const base =
      basemap === 'satellite'
        ? L.tileLayer(TILES.satellite, { maxZoom: 17, attribution: ATTRIBUTION.satellite })
        : L.tileLayer(theme === 'dark' ? TILES.dark : TILES.light, {
            subdomains: 'abcd',
            maxZoom: 17,
            attribution: ATTRIBUTION.map,
          });
    base.on('tileerror', onError);
    base.addTo(map);
    baseRef.current = base;

    if (basemap === 'satellite') {
      const labels = L.tileLayer(TILES.satelliteLabels, { maxZoom: 17, opacity: 0.85 });
      labels.addTo(map);
      labelsRef.current = labels;
    }
  }, [basemap, theme]);

  /* ---------------- markers ---------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const created: L.Marker[] = [];

    for (const f of farms) {
      const photo = farmPhoto(f.id, 120, 120) ?? '';
      const available = f.capacity.reduce((s, c) => s + allocatable(c), 0);
      const marker = L.marker([f.lat, f.lng], {
        icon: L.divIcon({
          className: 'sr-pin-wrap',
          iconSize: [46, 46],
          iconAnchor: [23, 23],
          html: `<div class="sr-pin sr-pin--${f.status}" data-farm="${f.id}">
              <span class="sr-pin__halo"></span>
              <span class="sr-pin__photo" style="background-image:url('${photo}')"></span>
              <span class="sr-pin__label">${esc(f.code)}</span>
            </div>`,
        }),
        riseOnHover: true,
        keyboard: true,
        title: f.name,
        alt: f.name,
      });
      marker.bindTooltip(
        `<div class="sr-tip">
          <div class="sr-tip__img" style="background-image:url('${farmPhoto(f.id, 480, 180) ?? ''}')"></div>
          <div class="sr-tip__body">
            <div class="sr-tip__title"><span class="sr-tip__dot" style="background:${HEALTH_HEX[f.status]}"></span>${esc(f.name)}</div>
            <div class="sr-tip__meta">${esc(f.area)} · ${f.distanceKm} km · ${esc(f.growingMethod)}</div>
            <div class="sr-tip__stats">
              <div><b>${(committedByFarm[f.id] ?? 0).toLocaleString()}</b><span>kg in live flows</span></div>
              <div><b>${available.toLocaleString()}</b><span>available</span></div>
              <div><b>${f.fulfilmentRate}%</b><span>fulfilment</span></div>
            </div>
          </div>
        </div>`,
        { className: 'sr-map-tip', direction: 'top', offset: [0, -24], opacity: 1 }
      );
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        selectRef.current(f.id);
      });
      marker.addTo(map);
      markersRef.current.set(f.id, marker);
      created.push(marker);
    }

    for (const b of buyers) {
      const marker = L.marker([b.lat, b.lng], {
        icon: L.divIcon({
          className: 'sr-pin-wrap',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          html: `<div class="sr-buyer">
              <span class="sr-buyer__photo" style="background-image:url('${buyerPhoto(b.id, 100, 100) ?? ''}')"></span>
              <span class="sr-buyer__badge"></span>
              <span class="sr-pin__label sr-pin__label--buyer">${esc(shortBuyerName(b.name))}</span>
            </div>`,
        }),
        riseOnHover: true,
        title: b.name,
        alt: b.name,
      });
      marker.bindTooltip(
        `<div class="sr-tip">
          <div class="sr-tip__img" style="background-image:url('${buyerPhoto(b.id, 480, 180) ?? ''}')"></div>
          <div class="sr-tip__body">
            <div class="sr-tip__title">${esc(b.name)}</div>
            <div class="sr-tip__meta">${esc(b.segment)} · ${esc(b.emirate)} · local target ${b.localTargetPct}%</div>
          </div>
        </div>`,
        { className: 'sr-map-tip', direction: 'top', offset: [0, -20], opacity: 1 }
      );
      marker.addTo(map);
      created.push(marker);
    }

    if (showHub && farms.length > 1) {
      const hub = L.marker([CONSOLIDATION_HUB.lat, CONSOLIDATION_HUB.lng], {
        icon: L.divIcon({
          className: 'sr-pin-wrap',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          html: `<div class="sr-hub"><span></span></div>`,
        }),
        title: CONSOLIDATION_HUB.name,
        zIndexOffset: -100,
      });
      hub.bindTooltip(`<div class="sr-tip sr-tip--small"><div class="sr-tip__body"><div class="sr-tip__title">${CONSOLIDATION_HUB.name}</div><div class="sr-tip__meta">Grading, packing and cold-chain consolidation</div></div></div>`, {
        className: 'sr-map-tip',
        direction: 'top',
        offset: [0, -14],
        opacity: 1,
      });
      hub.addTo(map);
      created.push(hub);
    }

    return () => {
      created.forEach((m) => m.remove());
      markersRef.current.clear();
    };
  }, [farms, buyers, committedByFarm, showHub]);

  /* ---------------- flows + particles ---------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const farmById = new Map(farms.map((f) => [f.id, f]));
    const buyerById = new Map(buyers.map((b) => [b.id, b]));
    const maxQty = Math.max(1, ...links.map((l) => l.qty));
    const layers: L.Polyline[] = [];
    const extras: Element[] = [];
    const registry: { farmId: string; els: Element[] }[] = [];

    links.forEach((l, i) => {
      const f = farmById.get(l.farmId);
      const b = buyerById.get(l.buyerId);
      if (!f || !b) return;
      const a: L.LatLngTuple = [f.lat, f.lng];
      const z: L.LatLngTuple = [b.lat, b.lng];
      const pts = arc(a, z, i % 2 === 0 ? 0.18 : -0.14);
      const weight = 1.5 + (l.qty / maxQty) * 3;
      const color = HEALTH_HEX[l.health];

      const glow = L.polyline(pts, {
        color,
        weight: weight + 6,
        opacity: 0.16,
        interactive: false,
        className: 'sr-flow-glow',
        lineCap: 'round',
      }).addTo(map);
      const line = L.polyline(pts, {
        color,
        weight,
        opacity: 0.92,
        dashArray: '6 10',
        interactive: false,
        className: 'sr-flow',
        lineCap: 'round',
      }).addTo(map);
      layers.push(glow, line);

      const els: Element[] = [];
      const pathEl = line.getElement();
      const glowEl = glow.getElement();
      if (glowEl) els.push(glowEl);
      if (pathEl) {
        els.push(pathEl);
        const id = `sr-flow-${l.farmId}-${l.buyerId}-${i}`;
        pathEl.setAttribute('id', id);
        const svgNS = 'http://www.w3.org/2000/svg';
        const dur = Math.min(9, Math.max(3.2, kmBetween(a, z) / 22));
        const particles = l.qty > maxQty * 0.35 ? 2 : 1;
        for (let p = 0; p < particles; p++) {
          const dot = document.createElementNS(svgNS, 'circle');
          dot.setAttribute('r', String(2.2 + (l.qty / maxQty) * 1.8));
          dot.setAttribute('class', 'sr-particle');
          const motion = document.createElementNS(svgNS, 'animateMotion');
          motion.setAttribute('dur', `${dur.toFixed(2)}s`);
          motion.setAttribute('repeatCount', 'indefinite');
          motion.setAttribute('begin', `-${((i * 0.73 + p * (dur / particles)) % dur).toFixed(2)}s`);
          const mpath = document.createElementNS(svgNS, 'mpath');
          mpath.setAttribute('href', `#${id}`);
          motion.appendChild(mpath);
          dot.appendChild(motion);
          pathEl.parentNode?.appendChild(dot);
          extras.push(dot);
          els.push(dot);
        }
      }
      registry.push({ farmId: l.farmId, els });
    });

    flowsRef.current = registry;

    return () => {
      layers.forEach((layer) => layer.remove());
      extras.forEach((el) => el.remove());
      flowsRef.current = [];
    };
  }, [links, farms, buyers]);

  /* ---------------- selection ---------------- */
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;
    container.classList.toggle('has-selection', Boolean(selected));

    markersRef.current.forEach((marker, id) => {
      marker.getElement()?.querySelector('.sr-pin')?.classList.toggle('is-selected', id === selected);
    });
    for (const flow of flowsRef.current) {
      flow.els.forEach((el) => el.classList.toggle('is-related', flow.farmId === selected));
    }

    if (selected) {
      const farm = farms.find((f) => f.id === selected);
      if (farm) map.flyTo([farm.lat, farm.lng], Math.max(map.getZoom(), 9.5), { duration: 1.1 });
    }
  }, [selected, farms, links]);

  /* ---------------- controls ---------------- */
  const fit = () => mapRef.current?.flyToBounds(bounds, { padding: [48, 48], duration: 1.1 });

  return (
    <div
      className={`sr-map sr-map--${basemap} ${flowsOn ? '' : 'flows-paused'} relative w-full overflow-hidden rounded-xl ${
        fill ? 'h-full min-h-[380px]' : ''
      } ${className}`}
      style={fill ? undefined : { height }}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* basemap switch */}
      <div className="absolute start-3 top-3 z-[500] inline-flex rounded-xl border border-white/40 bg-white/85 p-0.5 shadow-lift backdrop-blur dark:border-charcoal-700 dark:bg-charcoal-900/85">
        {(
          [
            { v: 'satellite', label: 'Satellite', icon: <Globe2 size={13} /> },
            { v: 'map', label: 'Map', icon: <MapIcon size={13} /> },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            onClick={() => setBasemap(o.v)}
            className={`inline-flex items-center gap-1.5 rounded-[0.6rem] px-2.5 py-1.5 text-2xs font-semibold transition ${
              basemap === o.v
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900 dark:text-charcoal-300 dark:hover:text-white'
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>

      {/* zoom + fit + flows */}
      <div className="absolute end-3 top-3 z-[500] flex flex-col overflow-hidden rounded-xl border border-white/40 bg-white/85 shadow-lift backdrop-blur dark:border-charcoal-700 dark:bg-charcoal-900/85">
        <MapButton label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
          <Plus size={15} />
        </MapButton>
        <MapButton label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
          <Minus size={15} />
        </MapButton>
        <MapButton label="Fit whole network" onClick={fit}>
          <Maximize2 size={14} />
        </MapButton>
        <MapButton label={flowsOn ? 'Pause live flows' : 'Play live flows'} onClick={() => setFlowsOn((v) => !v)}>
          {flowsOn ? <Pause size={14} /> : <Play size={14} />}
        </MapButton>
      </div>

      {/* live badge */}
      <div className="pointer-events-none absolute bottom-3 start-3 z-[500] inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-2xs font-semibold text-charcoal-700 shadow-lift backdrop-blur dark:border-charcoal-700 dark:bg-charcoal-900/85 dark:text-charcoal-200">
        {offline ? (
          <>
            <WifiOff size={12} className="text-amber-500" /> Offline, map tiles unavailable
          </>
        ) : (
          <>
            <span className="relative inline-flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 ${flowsOn ? 'animate-ping' : ''}`} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            {links.length} live commitment flows
          </>
        )}
      </div>
    </div>
  );
}

function MapButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center border-b border-charcoal-100 text-charcoal-600 transition last:border-b-0 hover:bg-brand-50 hover:text-brand-700 dark:border-charcoal-800 dark:text-charcoal-300 dark:hover:bg-charcoal-800 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-charcoal-500 dark:text-charcoal-400">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full ring-2" style={{ background: HEALTH_HEX.healthy, boxShadow: `0 0 0 2px ${HEALTH_HEX.healthy}40` }} /> Farm, on track
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: HEALTH_HEX.attention }} /> Farm, attention
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: HEALTH_HEX.risk }} /> Farm, at risk
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-charcoal-800 dark:bg-charcoal-100" /> Buyer delivery point
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-sand-500" /> Consolidation hub
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-px w-5 border-t-2 border-dashed border-brand-500" /> Live flow · dots are produce in transit
      </span>
    </div>
  );
}
