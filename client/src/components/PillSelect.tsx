import { useEffect, useRef, useState } from 'react';
import s from './pillselect.module.css';

export interface PillOption {
  value: string;
  label: string;
}

// A small custom dropdown styled as a pill. Unlike a native <select>, its menu
// always opens directly below the button, so it can't "hang over" the control.
export function PillSelect({
  prefix,
  value,
  options,
  onChange,
}: {
  prefix: string;
  value: string;
  options: PillOption[];
  onChange: (value: string) => void;
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

  const current = options.find((o) => o.value === value)?.label ?? '—';

  return (
    <div className={s.wrap} ref={ref}>
      <button type="button" className={s.pill} onClick={() => setOpen((o) => !o)}>
        {prefix}: {current}
        <span className={s.caret}>▾</span>
      </button>
      {open && (
        <div className={s.menu}>
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              className={`${s.option} ${o.value === value ? s.optionActive : ''}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
