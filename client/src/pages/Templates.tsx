import { TopNav } from '../components/TopNav';
import { TemplateCards } from '../components/TemplateCards';
import s from './templates.module.css';

export default function Templates() {
  return (
    <div className={s.page}>
      <TopNav />
      <div className={s.container}>
        <h1 className={s.h1}>Templates</h1>
        <p className={s.lead}>Load a starting point straight into the generator.</p>
        <TemplateCards />
      </div>
    </div>
  );
}
