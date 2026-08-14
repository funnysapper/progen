import { useEffect, useRef, useState } from 'react';
import s from './pillselect.module.css';

// A pill that opens a slider popover for choosing the proposal length.
export function LengthSlider({
  value,
  onChange,
  min = 100,
  max = 600,
  step = 50,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className={s.wrap} ref={ref}>
      <button type="button" className={s.pill} onClick={() => setOpen((o) => !o)}>
        Length: {value} words
        <span className={s.caret}>▾</span>
      </button>
      {open && (
        <div className={`${s.menu} ${s.sliderMenu}`}>
          <div className={s.sliderMarks}>
            <span>{min}</span>
            <span>{Math.round((min + max) / 2)}</span>
            <span>{max}</span>
          </div>
          <input
            type="range"
            className={s.slider}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <div className={s.sliderValue}>{value} words</div>
        </div>
      )}
    </div>
  );
}
