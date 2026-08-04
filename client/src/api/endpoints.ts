import { api } from './client';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface Template {
  id: string;
  name: string;
  promptType: string;
  version: number;
  fields: TemplateField[];
}

export interface ProposalResult {
  requestId: string;
  status: string;
  proposal: string;
  responseId: string;
  reused?: boolean;
}

export interface ProposalListItem {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  aiResponse: { id: string; generatedText: string } | null;
  jobDescription?: { title: string; company: string } | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api('/api/auth/register', { method: 'POST', body: { name, email, password }, auth: false }),
  me: (): Promise<UserProfile> => api('/api/auth/me'),
  // login responds with { tokens: {...} }
  login: (email: string, password: string): Promise<{ tokens: Tokens }> =>
    api('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  google: (idToken: string): Promise<Tokens> =>
    api('/api/auth/googleSignUp', { method: 'POST', body: { idToken }, auth: false }),
  logout: (refreshToken: string) =>
    api('/api/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }),
};

export const templatesApi = {
  list: (): Promise<Template[]> => api('/api/templates'),
  get: (id: string): Promise<Template> => api(`/api/templates/${id}`),
};

export const TONES = ['Professional', 'Balanced', 'Friendly'] as const;
export type Tone = (typeof TONES)[number];

export const LENGTHS = [200, 300, 500] as const;

export interface GenerateAllArgs {
  file?: File | null;
  resumeText?: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  templateId?: string;
  answers?: Record<string, string>;
  tone?: Tone;
  length?: number;
  force?: boolean;
}

export const proposalsApi = {
  generateAll: (args: GenerateAllArgs): Promise<ProposalResult> => {
    const form = new FormData();
    if (args.file) form.append('file', args.file);
    if (args.resumeText) form.append('resumeText', args.resumeText);
    form.append('jobTitle', args.jobTitle);
    form.append('company', args.company);
    form.append('jobDescription', args.jobDescription);
    if (args.templateId) form.append('templateId', args.templateId);
    if (args.answers) form.append('answers', JSON.stringify(args.answers));
    if (args.tone) form.append('tone', args.tone);
    if (args.length) form.append('length', String(args.length));
    if (args.force) form.append('force', 'true');
    return api('/api/proposals/generate', { method: 'POST', body: form });
  },
  list: (): Promise<ProposalListItem[]> => api('/api/proposals'),
  get: (id: string) => api(`/api/proposals/${id}`),
  remove: (id: string) => api(`/api/proposals/${id}`, { method: 'DELETE' }),
};
