import type { ReactNode } from 'react';

type AustraliaSilhouetteProps = {
  children?: ReactNode;
  zoneTones?: Partial<Record<MapZone, ZoneTone>>;
};

type MapZone = 'wa' | 'nt' | 'sa' | 'qld' | 'nsw' | 'vic' | 'tas';
type ZoneTone = 'low' | 'medium' | 'high';

export function AustraliaSilhouette({ children, zoneTones = {} }: AustraliaSilhouetteProps) {
  return (
    <div className="australia-map-shape australia-svg-map">
      <svg
        aria-label="Illustrative Australia map silhouette"
        className="australia-map-svg"
        role="img"
        viewBox="0 0 640 420"
      >
        <defs>
          <linearGradient id="australiaLandGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#9fce61" />
            <stop offset="55%" stopColor="#4f9a58" />
            <stop offset="100%" stopColor="#2e6f4b" />
          </linearGradient>
          <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          className="map-coast-glow"
          d="M73 205 96 137 161 93 249 72 354 80 450 112 535 190 555 271 498 331 402 365 300 353 198 377 102 323 57 259Z"
        />
        <path
          className="map-land-base"
          d="M73 205 96 137 161 93 249 72 354 80 450 112 535 190 555 271 498 331 402 365 300 353 198 377 102 323 57 259Z"
        />
        <path className={zoneClass('wa', zoneTones)} d="M73 205 96 137 161 93 232 79 246 218 198 377 102 323 57 259Z" />
        <path className={zoneClass('nt', zoneTones)} d="M232 79 354 80 361 186 246 218Z" />
        <path className={zoneClass('sa', zoneTones)} d="M246 218 361 186 407 291 300 353 198 377Z" />
        <path className={zoneClass('qld', zoneTones)} d="M354 80 450 112 535 190 489 247 361 186Z" />
        <path className={zoneClass('nsw', zoneTones)} d="M407 291 489 247 555 271 498 331 402 365Z" />
        <path className={zoneClass('vic', zoneTones)} d="M300 353 402 365 363 391 291 386Z" />
        <path className={zoneClass('tas', zoneTones)} d="M405 396 446 389 459 413 418 424Z" />
        <path className="map-coast-line" d="M73 205 96 137 161 93 249 72 354 80 450 112 535 190 555 271 498 331 402 365 363 391 291 386 300 353 198 377 102 323 57 259Z" />
      </svg>
      {children}
    </div>
  );
}

function zoneClass(zone: MapZone, tones: Partial<Record<MapZone, ZoneTone>>) {
  return `map-zone map-${zone} tone-${tones[zone] ?? 'low'}`;
}
