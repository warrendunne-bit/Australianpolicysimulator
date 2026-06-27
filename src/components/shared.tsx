import { useState } from 'react';
import type { ReactNode } from 'react';
import { formatNumber } from './formatters';

export type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  valueFormatter?: (value: number) => string;
  onChange: (value: number) => void;
};

export function PolicyCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="policy-card">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="assumptions">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <aside className="info-box">
      <p>{children}</p>
    </aside>
  );
}

export function MetricStrip({ items }: { items: [string, string][] }) {
  return (
    <div className="metric-strip">
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ExplanationList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="assumptions explanation-panel">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      className="disclosure-section section-block"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary>
        <span>{title}</span>
      </summary>
      <div className="disclosure-content">{children}</div>
    </details>
  );
}

export function ImpactCell({ value }: { value: number }) {
  const width = Math.min(100, Math.abs(value));
  const label = value > 5 ? 'Positive' : value < -5 ? 'Drag' : 'Low';

  return (
    <div className={value < 0 ? 'impact-cell is-negative' : 'impact-cell'}>
      <span>{label}</span>
      <strong>{value.toFixed(0)}</strong>
      <em style={{ width: `${width}%` }} />
    </div>
  );
}

export function MovementBadge({ movement }: { movement: number }) {
  const label =
    movement > 0.05 ? `+${movement.toFixed(1)}` : movement < -0.05 ? movement.toFixed(1) : '0.0';

  return (
    <strong className={movement < 0 ? 'movement-badge is-negative' : 'movement-badge'}>
      {label}
    </strong>
  );
}

export function Meter({ value }: { value: number }) {
  return (
    <div className="meter">
      <span style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

export function PolicySlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  valueFormatter = formatNumber,
  onChange,
}: SliderProps) {
  return (
    <label className="slider-block">
      <span className="slider-header">
        <span>{label}</span>
        <strong>{valueFormatter(value)}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="slider-footer">
        <span>{valueFormatter(min)}</span>
        <span>{unit}</span>
        <span>{valueFormatter(max)}</span>
      </span>
    </label>
  );
}
