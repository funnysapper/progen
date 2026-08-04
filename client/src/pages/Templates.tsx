import { useNavigate } from 'react-router-dom';
import { TopNav } from '../components/TopNav';
import { Button } from '../components/ui';
import s from './templates.module.css';

// The Job Proposal card is the real, working template. The rest are honest
// "Coming soon" placeholders (kept for a lively, complete-looking gallery).
const CARDS = [
  {
    key: 'job',
    title: 'Job Proposal',
    tag: 'Proposal',
    text: 'A tailored, 5-section proposal built from your CV and the job.',
    gradient: 'linear-gradient(135deg, #ff7a18, #af002d)',
    real: true,
  },
  {
    key: 'web',
    title: 'Web design bid',
    tag: 'Proposal',
    text: 'Redesign pitches — clean, fast, and conversion-focused.',
    gradient: 'linear-gradient(135deg, #f7971e, #ffd200)',
    real: false,
  },
  {
    key: 'cover',
    title: 'Cover letter',
    tag: 'Cover letter',
    text: 'A classic application letter aligned to the role.',
    gradient: 'linear-gradient(135deg, #d7d2cc, #a7a3a0)',
    real: false,
  },
  {
    key: 'dev',
    title: 'Dev proposal',
    tag: 'Proposal',
    text: 'A robust, well-tested solution within your timeline.',
    gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    real: false,
  },
  {
    key: 'mkt',
    title: 'Marketing bid',
    tag: 'Freelance bid',
    text: 'Campaign goals matched to work you have shipped.',
    gradient: 'linear-gradient(135deg, #5f0a87, #a4508b)',
    real: false,
  },
  {
    key: 'gen',
    title: 'General',
    tag: 'Proposal',
    text: 'A short note on why you would be a strong fit.',
    gradient: 'linear-gradient(135deg, #232526, #414345)',
    real: false,
  },
];

export default function Templates() {
  const navigate = useNavigate();

  return (
    <div className={s.page}>
      <TopNav />
      <div className={s.container}>
        <h1 className={s.h1}>Templates</h1>
        <p className={s.lead}>Load a starting point straight into the generator.</p>

        <div className={s.grid}>
          {CARDS.map((c) => (
            <div className={s.card} key={c.key}>
              <div className={s.thumb} style={{ background: c.gradient }} />
              <div className={s.body}>
                <div className={s.head}>
                  <h3>{c.title}</h3>
                  <span className={`${s.tag} ${c.real ? '' : s.soonTag}`}>
                    {c.real ? c.tag : 'Coming soon'}
                  </span>
                </div>
                <p>{c.text}</p>
                {c.real ? (
                  <Button variant="secondary" onClick={() => navigate('/app')}>
                    Use this template
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    Coming soon
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
