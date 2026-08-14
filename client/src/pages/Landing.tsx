import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { TopNav } from '../components/TopNav';
import { ICON_JOB, ICON_QUESTIONS, ICON_TONE, ICON_SEND } from '../components/featureIcons';
import s from './landing.module.css';

const STEPS = [
  { n: 1, title: 'Tell us the job description', text: 'From the post you saw — any format.' },
  { n: 2, title: 'Answer a few smart questions', text: 'Quick prompts to tailor your proposal.' },
  { n: 3, title: 'Click generate', text: 'Your proposal is ready in seconds.' },
];

const FEATURES = [
  { icon: ICON_JOB, title: 'Tell us the job', text: 'Drop in any job description — no formatting needed.' },
  { icon: ICON_QUESTIONS, title: 'Answer smart questions', text: 'A few optional prompts to tailor the result.' },
  { icon: ICON_TONE, title: 'Pick your tone', text: 'Professional, balanced, or friendly — your call.' },
  { icon: ICON_SEND, title: 'Copy & send', text: 'Copy the text or download a polished PDF.' },
];

// One real template + honest "Coming soon" cards to fill the section.
const REAL_TEMPLATE = {
  tag: 'Proposal',
  title: 'Job Proposal',
  text: 'A tailored, 5-section proposal built from your CV and the job.',
};
const SOON_TEMPLATES = [
  { tag: 'Cover letter', title: 'Cover letter', text: 'A classic application letter aligned to the role.' },
  { tag: 'Freelance bid', title: 'Freelance bid', text: 'A persuasive pitch for gigs and contracts.' },
];

export default function Landing() {
  const navigate = useNavigate();

  // Anyone can try the generator; sign-up is only needed to download or save.
  const startPrimary = () => navigate('/app');
  const scrollToTemplates = () =>
    document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className={s.page}>
      <TopNav />

      {/* Hero */}
      <header className={`${s.hero} ${s.section}`}>
        <div className={s.heroGrid}>
          <div className={s.heroLeft}>
            <h1>
              Write the <span className={s.hi}>perfect</span> proposal in seconds
            </h1>
            <div className={s.steps}>
              {STEPS.map((step) => (
                <div className={s.step} key={step.n}>
                  <div className={s.stepNum}>{step.n}</div>
                  <div className={s.stepText}>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.heroCtas}>
              <Button variant="primary" onClick={startPrimary}>
                Start free generation
              </Button>
              <Button variant="secondary" onClick={scrollToTemplates}>
                See templates
              </Button>
            </div>
          </div>

          {/* Static product preview (non-interactive) */}
          <div className={s.preview} aria-hidden="true">
            <div className={s.previewHead}>
              Generate <em>proposal</em>
            </div>
            <div className={s.previewBox}>
              Senior React developer needed for a 3-month contract rebuilding our checkout flow…
            </div>
            <div className={s.chips}>
              <span className={`${s.chip} ${s.chipAccent}`}>Adjust tone</span>
              <span className={s.chip}>Proposal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className={`${s.block} ${s.blockAlt}`}>
        <div className={s.section}>
          <h2 className={s.h2}>Everything you need</h2>
          <p className={s.lead}>Built for freelancers and job seekers.</p>
          <div className={s.features}>
            {FEATURES.map((f) => (
              <div className={s.feature} key={f.title}>
                <div className={s.featureIcon} dangerouslySetInnerHTML={{ __html: f.icon }} />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className={s.block} id="templates">
        <div className={s.section}>
          <h2 className={s.h2}>Start from a template</h2>
          <p className={s.lead}>Pick a starting point and generate right away.</p>
          <div className={s.templates}>
            <div className={s.tCard}>
              <span className={s.tTag}>{REAL_TEMPLATE.tag}</span>
              <h3>{REAL_TEMPLATE.title}</h3>
              <p>{REAL_TEMPLATE.text}</p>
              <Button variant="primary" onClick={startPrimary}>
                Use this template
              </Button>
            </div>
            {SOON_TEMPLATES.map((t) => (
              <div className={`${s.tCard} ${s.tCardSoon}`} key={t.title}>
                <span className={`${s.tTag} ${s.soonTag}`}>Coming soon</span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <Button variant="secondary" disabled>
                  Coming soon
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <p>
          © 2026 <strong>ProGen</strong> — free to use. Made for freelancers &amp; job seekers.
        </p>
      </footer>
    </div>
  );
}
