import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, ErrorNote, Field, Input, Textarea } from '../components/ui';
import { templatesApi, proposalsApi, type Template, type ProposalResult } from '../api/endpoints';
import { ApiError, apiDownload } from '../api/client';
import { renderMarkdown } from '../lib/markdown';
import s from './workspace.module.css';

export default function Workspace() {
  const { logout } = useAuth();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [cvMode, setCvMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [result, setResult] = useState<ProposalResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    templatesApi
      .list()
      .then((list) => {
        setTemplates(list);
        if (list[0]) setTemplateId(list[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load templates'));
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId),
    [templates, templateId]
  );

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setCopied(false);

    if (cvMode === 'upload' && !file) return setError('Please choose a CV file, or switch to "Paste text".');
    if (cvMode === 'paste' && resumeText.trim().length < 30)
      return setError('Please paste your CV text (at least 30 characters).');

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
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function onCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function onDownloadPdf() {
    if (!result) return;
    const blob = await apiDownload(`/api/proposals/${result.requestId}/pdf`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${result.requestId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={s.page}>
      <div className={s.topbar}>
        <span className={s.logo}>ProGen</span>
        <Button variant="secondary" onClick={() => logout()}>
          Log out
        </Button>
      </div>

      <div className={s.container}>
        {/* Left: the form */}
        <Card>
          <h2 className={s.h2}>Generate a proposal</h2>
          <p className={s.sub}>Add your CV, the job, and a few details — we'll do the rest.</p>

          <form onSubmit={onGenerate}>
            {error && <ErrorNote>{error}</ErrorNote>}
            <div style={{ height: error ? 14 : 0 }} />

            <Field label="Template">
              <select
                className={s.select}
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className={s.row}>
              <Field label="Job title">
                <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Backend Engineer" required />
              </Field>
              <Field label="Company">
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." required />
              </Field>
            </div>

            <Field label="Job description" hint="Paste the full job posting.">
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="We're looking for..."
                required
                minLength={30}
                rows={5}
              />
            </Field>

            <div className={s.sectionTitle}>Your CV</div>
            <div className={s.toggle}>
              <button type="button" className={cvMode === 'upload' ? s.active : ''} onClick={() => setCvMode('upload')}>
                Upload file
              </button>
              <button type="button" className={cvMode === 'paste' ? s.active : ''} onClick={() => setCvMode('paste')}>
                Paste text
              </button>
            </div>

            {cvMode === 'upload' ? (
              <Field label="CV file (PDF or DOCX)">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </Field>
            ) : (
              <Field label="CV text">
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your CV / résumé here..."
                  rows={6}
                />
              </Field>
            )}

            {selectedTemplate && selectedTemplate.fields.length > 0 && (
              <>
                <div className={s.sectionTitle}>A few smart questions (optional)</div>
                {selectedTemplate.fields.map((f) => (
                  <Field key={f.key} label={f.label} hint={f.required ? 'Required' : undefined}>
                    {f.type === 'textarea' ? (
                      <Textarea
                        value={answers[f.key] ?? ''}
                        placeholder={f.placeholder}
                        onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                      />
                    ) : (
                      <Input
                        value={answers[f.key] ?? ''}
                        placeholder={f.placeholder}
                        onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                      />
                    )}
                  </Field>
                ))}
              </>
            )}

            <div style={{ height: 6 }} />
            <Button type="submit" variant="accent" block loading={loading}>
              {loading ? 'Generating…' : 'Generate proposal'}
            </Button>
          </form>
        </Card>

        {/* Right: the result */}
        <Card>
          <h2 className={s.h2}>Your proposal</h2>
          <p className={s.sub}>Copy it into your application, or download a polished PDF.</p>

          {result ? (
            <>
              <div className={s.actions}>
                <Button variant="secondary" onClick={onCopy}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </Button>
                <Button variant="secondary" onClick={onDownloadPdf}>
                  Download PDF
                </Button>
              </div>
              <div
                className={s.result}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(result.proposal) }}
              />
            </>
          ) : (
            <div className={s.empty}>
              {loading
                ? 'Talking to the AI… this takes a few seconds.'
                : 'Your generated proposal will appear here.'}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
