import { useEffect, useMemo, useState } from 'react';
import { TopNav } from '../components/TopNav';
import { HistorySidebar } from '../components/HistorySidebar';
import { useToast } from '../components/toast';
import { Button, Input, Textarea } from '../components/ui';
import {
  templatesApi,
  proposalsApi,
  TONES,
  LENGTHS,
  type Template,
  type Tone,
  type ProposalListItem,
} from '../api/endpoints';
import { ApiError, apiDownload } from '../api/client';
import { renderMarkdown } from '../lib/markdown';
import s from './workspace.module.css';

type Step = 1 | 2 | 3;
const STEP_LABELS = ['Job details', 'Questions', 'Proposal'];

export default function Workspace() {
  const toast = useToast();

  const [step, setStep] = useState<Step>(1);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [cvMode, setCvMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<Tone>('Professional');
  const [length, setLength] = useState<number>(300);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [proposalText, setProposalText] = useState('');
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 860 : true
  );
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    templatesApi
      .list()
      .then((list) => {
        setTemplates(list);
        if (list[0]) setTemplateId(list[0].id);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load templates'));
  }, [toast]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId),
    [templates, templateId]
  );

  const hasCv = cvMode === 'upload' ? !!file : resumeText.trim().length >= 30;
  const step1Valid =
    jobTitle.trim().length >= 2 && company.trim().length >= 1 && jobDescription.trim().length >= 30 && hasCv;

  function goToQuestions() {
    if (!jobTitle.trim() || !company.trim()) return toast.error('Please add the job title and company.');
    if (jobDescription.trim().length < 30) return toast.error('Job description needs at least 30 characters.');
    if (!hasCv) return toast.error('Please add your CV — upload a file or paste the text.');
    setStep(2);
  }

  async function runGeneration(force = false) {
    setLoading(true);
    try {
      const res = await proposalsApi.generateAll({
        file: cvMode === 'upload' ? file : null,
        resumeText: cvMode === 'paste' ? resumeText : undefined,
        jobTitle,
        company,
        jobDescription,
        templateId: templateId || undefined,
        answers,
        tone,
        length,
        force,
      });
      setProposalText(res.proposal);
      setProposalId(res.requestId);
      setEditing(false);
      setHistoryKey((k) => k + 1);
      setStep(3);
      if (res.reused) {
        toast.info('You already have a proposal for this CV and job — showing it. Use Regenerate for a fresh one.');
      } else {
        toast.success(force ? 'Proposal regenerated!' : 'Proposal generated!');
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  function onSelectHistory(item: ProposalListItem) {
    if (!item.aiResponse) return;
    setProposalText(item.aiResponse.generatedText);
    setProposalId(item.id);
    setEditing(false);
    setStep(3);
  }

  async function onCopy() {
    await navigator.clipboard.writeText(proposalText);
    toast.success('Copied to clipboard');
  }

  async function onDownload() {
    if (!proposalId) return;
    try {
      const blob = await apiDownload(`/api/proposals/${proposalId}/pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${proposalId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Download failed');
    }
  }

  const wordCount = proposalText.trim() ? proposalText.trim().split(/\s+/).length : 0;

  return (
    <div className={s.page}>
      <TopNav onToggleSidebar={() => setSidebarOpen((o) => !o)} />

      <div className={s.body}>
        {sidebarOpen && (
          <HistorySidebar
            key={historyKey}
            onSelect={onSelectHistory}
            onDeleted={(id) => {
              if (proposalId === id) {
                setProposalText('');
                setProposalId(null);
                setStep(1);
              }
            }}
          />
        )}

        <div className={s.main}>
          {/* progress tabs */}
          <div className={s.tabs}>
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`${s.tab} ${step === i + 1 ? s.tabActive : ''}`}>
                {label}
              </span>
            ))}
          </div>
          <div className={s.progressTrack}>
            <div className={s.progressFill} style={{ width: `${(step / 3) * 100}%` }} />
          </div>

          {/* ---------- Step 1: Job details ---------- */}
          {step === 1 && (
            <>
              <h1 className={s.heading}>
                Generate <em>proposal</em>
              </h1>

              <div className={s.jobCard}>
                <div className={s.row}>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title" />
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
                </div>
                <textarea
                  className={s.jobTextarea}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  maxLength={5000}
                />
                <div className={s.jobFoot}>
                  <span className={s.charCount}>{jobDescription.length} characters</span>
                </div>
              </div>

              <div className={s.label}>Your CV</div>
              <div className={s.cvToggle}>
                <button type="button" className={cvMode === 'upload' ? s.active : ''} onClick={() => setCvMode('upload')}>
                  Upload file
                </button>
                <button type="button" className={cvMode === 'paste' ? s.active : ''} onClick={() => setCvMode('paste')}>
                  Paste text
                </button>
              </div>
              <div className={s.cvBox}>
                {cvMode === 'upload' ? (
                  <div>
                    <label className={s.fileBtn}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                      {file ? 'Change file' : 'Upload PDF or DOCX'}
                      <input type="file" accept=".pdf,.docx" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    </label>
                    {file && (
                      <span className={s.fileName}>
                        {file.name}
                        <button type="button" className={s.fileClear} onClick={() => setFile(null)} aria-label="Remove file">
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your CV / résumé here..."
                    rows={5}
                  />
                )}
              </div>

              <div className={s.prefLabel}>Preference</div>
              <div className={s.prefs}>
                <select className={s.pill} value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      Tone: {t}
                    </option>
                  ))}
                </select>
                <select className={s.pill} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      Type: {t.name}
                    </option>
                  ))}
                </select>
                <select className={s.pill} value={length} onChange={(e) => setLength(Number(e.target.value))}>
                  {LENGTHS.map((n) => (
                    <option key={n} value={n}>
                      Length: {n} words
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
                <button className={s.nextBtn} onClick={goToQuestions} disabled={!step1Valid} aria-label="Next">
                  →
                </button>
              </div>
            </>
          )}

          {/* ---------- Step 2: Questions ---------- */}
          {step === 2 && (
            <>
              <button className={s.back} onClick={() => setStep(1)}>
                ← Back
              </button>
              <h2 className={s.stepHeading}>A few smart questions</h2>
              <p className={s.stepSub}>All optional — better answers make a sharper proposal.</p>

              <div className={s.questions}>
                {(selectedTemplate?.fields ?? []).map((f) => (
                  <div className={s.qCard} key={f.key}>
                    <div className={s.qLabel}>{f.label}</div>
                    {f.placeholder && <div className={s.qHint}>{f.placeholder}</div>}
                    {f.type === 'textarea' ? (
                      <Textarea
                        value={answers[f.key] ?? ''}
                        onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                      />
                    ) : (
                      <Input
                        value={answers[f.key] ?? ''}
                        onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                {(selectedTemplate?.fields ?? []).length === 0 && (
                  <p className={s.stepSub}>No questions for this template — just generate.</p>
                )}
              </div>

              <Button variant="accent" block loading={loading} onClick={() => runGeneration(false)}>
                {loading ? 'Generating…' : 'Generate proposal'}
              </Button>
            </>
          )}

          {/* ---------- Step 3: Proposal ---------- */}
          {step === 3 && (
            <>
              <button className={s.back} onClick={() => setStep(2)}>
                ← Back
              </button>

              <div className={s.summary}>
                <div className={s.summaryTitle}>Job description</div>
                <div className={s.summaryText}>{jobDescription || '—'}</div>
              </div>
              <div className={s.chips}>
                <span className={s.chip}>Type: {selectedTemplate?.name ?? 'Proposal'}</span>
                <span className={s.chip}>Target: {length} words</span>
                <span className={s.chip}>Tone: {tone}</span>
              </div>

              <div className={s.proposalCard}>
                <div className={s.toolbar}>
                  <span className={s.wordCount}>{wordCount} words</span>
                  <button className={s.toolBtn} onClick={() => setEditing((e) => !e)}>
                    {editing ? 'Done' : 'Edit'}
                  </button>
                  <button className={s.toolBtn} onClick={onCopy}>
                    Copy
                  </button>
                  <button className={s.toolBtn} onClick={() => runGeneration(true)} disabled={loading}>
                    {loading ? 'Regenerating…' : 'Regenerate'}
                  </button>
                  <button className={s.toolBtn} onClick={onDownload}>
                    Download
                  </button>
                  <button className={`${s.toolBtn} ${s.toolBtnPrimary}`} onClick={() => toast.success('Saved to history')}>
                    Save
                  </button>
                </div>

                {editing ? (
                  <textarea
                    className={s.editArea}
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                  />
                ) : (
                  <div className={s.proposalBody} dangerouslySetInnerHTML={{ __html: renderMarkdown(proposalText) }} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
