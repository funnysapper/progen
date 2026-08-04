import 'dotenv/config';
import prisma from '../src/config/prisma';

// The questions shown to the user when they pick this template. The frontend
// renders these dynamically; answers are injected into the prompt at generation.
const JOB_PROPOSAL_FIELDS = [
  {
    key: 'availability',
    label: 'When can you start?',
    type: 'text',
    required: false,
    placeholder: "e.g. Immediately, or 2 weeks' notice",
  },
  {
    key: 'motivation',
    label: 'Why do you want to work at this company specifically?',
    type: 'textarea',
    required: false,
    placeholder: 'What draws you to them? (leave blank to let the AI infer from the job description)',
  },
  {
    key: 'highlight',
    label: 'Any achievement you especially want emphasized?',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. Cut API latency by 40%, led a team of 5',
  },
  {
    key: 'approach',
    label: 'Briefly, how would you approach this role?',
    type: 'textarea',
    required: false,
    placeholder: 'Leave blank to let the AI suggest a professional approach',
  },
];

// The "specialized prompt". {{...}} placeholders are filled by the AI service
// with the user's real data (resume, job description, and their answers).
const JOB_PROPOSAL_TEMPLATE = `You are an expert career coach and professional proposal writer who has helped
candidates win competitive roles. Write a polished, tailored job proposal that {{candidateName}}
can send to {{companyName}} for the {{jobTitle}} role.

TONE: Write in a {{tone}} tone.
- Professional = formal, precise, businesslike.
- Balanced = warm but still professional.
- Friendly = approachable and conversational, while staying credible.

STRICT RULES:
- Use ONLY the real information provided below. Never invent employers, degrees, metrics, dates,
  availability, or rates that are not supported by the resume or the additional information.
- Be specific and concrete. Avoid clichés, filler, and repetition — do NOT reuse stock phrases
  like "I am excited about the opportunity" more than once.
- Vary your sentence structure. Sound like a capable human professional, not a generated template.
- If a detail for a section was not provided, keep that part brief rather than padding it.

CANDIDATE RESUME / BACKGROUND:
{{resumeText}}

TARGET ROLE: {{jobTitle}} at {{companyName}}

JOB DESCRIPTION:
{{jobDescription}}

ADDITIONAL INFORMATION FROM THE CANDIDATE:
{{additionalInfo}}

Write the proposal in these five sections, each with a clear Markdown heading:
1. **Introduction** — who the candidate is and why they are a strong fit, in 2-3 crisp sentences.
2. **Understanding Your Needs** — show genuine understanding of {{companyName}}'s needs and this role, drawn from the job description.
3. **My Qualifications** — map the candidate's concrete skills, experience and achievements (from the resume) to the job's key requirements. Use 3-5 tight bullet points.
4. **Proposed Approach** — a specific, credible plan for succeeding in the role. Use the candidate's stated approach if given; otherwise propose one grounded in the job description.
5. **Closing** — a confident, concise close with clear next steps. Mention availability ONLY if the candidate provided it.

Aim for approximately {{length}} words (a little over or under is fine), sharp and free of fluff. Output only the proposal, in Markdown.`;

async function main() {
  const existing = await prisma.promptTemplate.findFirst({
    where: { promptType: 'JOB_PROPOSAL', active: true },
    orderBy: { version: 'desc' },
  });

  if (existing) {
    const updated = await prisma.promptTemplate.update({
      where: { id: existing.id },
      data: { templateText: JOB_PROPOSAL_TEMPLATE, fields: JOB_PROPOSAL_FIELDS },
    });
    console.log(`Updated JOB_PROPOSAL template (v${updated.version}, id: ${updated.id}).`);
    return;
  }

  const created = await prisma.promptTemplate.create({
    data: {
      name: 'Job Proposal Generator',
      promptType: 'JOB_PROPOSAL',
      templateText: JOB_PROPOSAL_TEMPLATE,
      fields: JOB_PROPOSAL_FIELDS,
      active: true,
      version: 1,
    },
  });
  console.log(`Seeded JOB_PROPOSAL template v${created.version} (id: ${created.id}).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
