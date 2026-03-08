import { useState, useMemo, useCallback } from "react";

/* =========================================================
   HAC READINESS INSTRUMENT v5.3  — Dr Sean Kruger, UP EMS
   ========================================================= */

// ── FONTS (injected once) ─────────────────────────────────
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href = "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(FONT_LINK);

// ── THEME ─────────────────────────────────────────────────
const T = {
  navy:   "#002060",
  gold:   "#FEBB30",
  goldD:  "#D4960A",
  blue:   "#0055A4",
  blueL:  "#E8F0FB",
  gray:   "#F5F6FA",
  border: "#DDE3EE",
  text:   "#1A2340",
  muted:  "#6B7A9A",
  green:  "#1A8A5A",
  red:    "#C0392B",
  white:  "#FFFFFF",
};
const S = {
  page: { minHeight:"100vh", background: T.gray, fontFamily:"'DM Sans', sans-serif", color: T.text },
  header: { background: T.navy, color: T.white, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,32,96,.25)" },
  card: { background: T.white, borderRadius:12, padding:"32px", boxShadow:"0 2px 12px rgba(0,32,96,.08)", border:`1px solid ${T.border}` },
  btn: { background: T.navy, color: T.white, border:"none", borderRadius:8, padding:"12px 28px", fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, cursor:"pointer", transition:"all .2s" },
  btnGold: { background: T.gold, color: T.navy, border:"none", borderRadius:8, padding:"12px 28px", fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:700, cursor:"pointer" },
  btnOut: { background:"transparent", color: T.navy, border:`2px solid ${T.navy}`, borderRadius:8, padding:"10px 24px", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" },
  label: { fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color: T.navy, marginBottom:6, display:"block" },
  input: { width:"100%", padding:"10px 14px", border:`1.5px solid ${T.border}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:14, boxSizing:"border-box", outline:"none" },
  badge: { display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, background: T.blueL, color: T.blue },
};

// ── LIKERT DATA ───────────────────────────────────────────
const LIKERT_ITEMS = [
  // DAL
  {num:1,  code:"DAL1",  construct:"Digital AI Literacy",         group:"DAL", text:"I can identify which tasks are appropriate for AI assistance versus where it carries unacceptable risk.", reverse:false},
  {num:2,  code:"DAL2",  construct:"Digital AI Literacy",         group:"DAL", text:"I can select and apply AI tools appropriate for specific tasks — including academic writing, research, and analysis — rather than defaulting to one tool for everything.", reverse:false},
  {num:3,  code:"DAL3",  construct:"Digital AI Literacy",         group:"DAL", text:"I can translate AI-generated outputs into defensible work products by validating key claims before use.", reverse:false},
  {num:4,  code:"DAL4",  construct:"Digital AI Literacy",         group:"DAL", text:"I understand the limitations of AI systems I use, including uncertainty, prompt sensitivity, and context loss.", reverse:false},
  {num:5,  code:"DAL5",  construct:"Digital AI Literacy",         group:"DAL", text:"I can adapt how I use AI tools when task requirements, organisational policies, or available tools change.", reverse:false},
  // ESI
  {num:6,  code:"ESI1",  construct:"Sceptical Intelligence",      group:"ESI", text:"When an AI system provides information, I assess whether the output is supported by credible evidence before accepting it.", reverse:false},
  {num:7,  code:"ESI2",  construct:"Sceptical Intelligence",      group:"ESI", text:"I can recognise when an AI-generated response is high-stakes or poorly evidenced and requires independent verification.", reverse:false},
  {num:8,  code:"ESI3",  construct:"Sceptical Intelligence",      group:"ESI", text:"I check whether the reasoning steps in an AI output are coherent and internally consistent before drawing conclusions.", reverse:false},
  {num:9,  code:"ESI4",  construct:"Sceptical Intelligence",      group:"ESI", text:"I have calibrated my trust in AI systems — I neither over-rely on nor unnecessarily dismiss their outputs.", reverse:false},
  {num:10, code:"ESI5R", construct:"Sceptical Intelligence",      group:"ESI", text:"I generally accept AI outputs without additional verification when the tool I am using is reputable.", reverse:true},
  // CT
  {num:11, code:"CT1",   construct:"Critical Thinking",           group:"CT",  text:"When evaluating a complex problem, I systematically consider multiple perspectives and alternative explanations before deciding.", reverse:false},
  {num:12, code:"CT2",   construct:"Critical Thinking",           group:"CT",  text:"I distinguish between evidence-based conclusions and assumptions or opinions when working through difficult problems.", reverse:false},
  {num:13, code:"CT3",   construct:"Critical Thinking",           group:"CT",  text:"I can identify logical flaws or inconsistencies in arguments, even when the conclusions seem plausible or align with my existing views.", reverse:false},
  {num:14, code:"CT4",   construct:"Critical Thinking",           group:"CT",  text:"I apply a structured analytical approach when evaluating information, regardless of whether the source is an AI system or a human expert.", reverse:false},
  // GAD
  {num:15, code:"GAD1",  construct:"Governance Awareness",        group:"GAD", text:"I understand that responsibility for decisions remains with me even when AI tools contributed to the reasoning process.", reverse:false},
  {num:16, code:"GAD2",  construct:"Governance Awareness",        group:"GAD", text:"I can identify situations in which AI should not be used, or where escalation to a human decision-maker is required.", reverse:false},
  {num:17, code:"GAD3",  construct:"Governance Awareness",        group:"GAD", text:"I follow institutional policies, academic integrity requirements, and acceptable use guidelines for the responsible use of AI in my work or studies.", reverse:false},
  {num:18, code:"GAD4",  construct:"Governance Awareness",        group:"GAD", text:"I document or disclose how AI was used in producing my work, including which tools were used, what was verified, and what uncertainties remain.", reverse:false},
  {num:19, code:"GAD5R", construct:"Governance Awareness",        group:"GAD", text:"Once an AI tool has provided a recommendation or output, I consider the decision-making process to be complete.", reverse:true},
  // IEC
  {num:20, code:"IEC1",  construct:"Institutional Enabling Conditions", group:"IEC", text:"The organisation or institution I work or study in provides adequate digital infrastructure and AI tools for responsible use.", reverse:false},
  {num:21, code:"IEC2",  construct:"Institutional Enabling Conditions", group:"IEC", text:"Training and learning opportunities are available to help me develop competencies for effective human–AI collaboration.", reverse:false},
  {num:22, code:"IEC3",  construct:"Institutional Enabling Conditions", group:"IEC", text:"My organisation or institution has established processes for monitoring and improving how AI is used responsibly.", reverse:false},
  {num:23, code:"IEC4",  construct:"Institutional Enabling Conditions", group:"IEC", text:"My organisation or institution fosters a culture of experimentation and continuous learning around AI technologies.", reverse:false},
  {num:24, code:"IEC5",  construct:"Institutional Enabling Conditions", group:"IEC", text:"I have reliable access to the devices and connectivity needed to engage consistently with AI tools in my work or studies.", reverse:false},
  {num:25, code:"IEC6",  construct:"Institutional Enabling Conditions", group:"IEC", text:"My organisation or institution ensures that data used with AI tools is appropriately governed, classified, and protected.", reverse:false},
  {num:26, code:"IEC7",  construct:"Institutional Enabling Conditions", group:"IEC", text:"I am aware of the policies, legal frameworks, or ethical guidelines that govern how AI should be used in my context.", reverse:false},
  // MV (collected but not scored)
  {num:27, code:"MV1",   construct:"General Adaptability",        group:"MV",  text:"I find it easy to adjust to unexpected changes in my daily routine.", reverse:false},
  {num:28, code:"MV2",   construct:"General Adaptability",        group:"MV",  text:"I feel confident in my ability to handle most challenges I encounter.", reverse:false},
  {num:29, code:"MV3",   construct:"General Adaptability",        group:"MV",  text:"I tend to feel calm under pressure.", reverse:false},
  // AAQ
  {num:30, code:"AAQ1",  construct:"AI Adoption Quality",         group:"AAQ", text:"I use AI tools in a consistent and reliable manner that produces quality outcomes in my work or studies.", reverse:false},
  {num:31, code:"AAQ2",  construct:"AI Adoption Quality",         group:"AAQ", text:"My use of AI tools produces outputs that consistently meet the quality standards required in my professional or academic context.", reverse:false},
  {num:32, code:"AAQ3",  construct:"AI Adoption Quality",         group:"AAQ", text:"My use of AI tools complies with applicable policies, ethical standards, and quality norms.", reverse:false},
  {num:33, code:"AAQ4",  construct:"AI Adoption Quality",         group:"AAQ", text:"I can identify specific, demonstrable ways in which my use of AI tools has improved the quality or efficiency of my work or studies.", reverse:false},
  {num:34, code:"AAQ5",  construct:"AI Adoption Quality",         group:"AAQ", text:"I can identify when my AI-assisted outputs are of acceptable quality and when they require rework before use.", reverse:false},
  // FOWR
  {num:35, code:"FOWR1", construct:"Future of Work Readiness",    group:"FOWR",text:"I am confident that I can continue to perform effectively in my role as AI reshapes the tasks and workflows I engage with.", reverse:false},
  {num:36, code:"FOWR2", construct:"Future of Work Readiness",    group:"FOWR",text:"I understand how AI is changing the decision-making processes and professional responsibilities within my field.", reverse:false},
  {num:37, code:"FOWR3", construct:"Future of Work Readiness",    group:"FOWR",text:"I have the capability to transition to new roles or responsibilities that may emerge as AI takes over certain tasks.", reverse:false},
  {num:38, code:"FOWR4", construct:"Future of Work Readiness",    group:"FOWR",text:"I am prepared to participate productively in AI-mediated work or study environments across different contexts.", reverse:false},
  {num:39, code:"FOWR5", construct:"Future of Work Readiness",    group:"FOWR",text:"I actively update my skills and knowledge to remain relevant as AI capabilities continue to evolve.", reverse:false},
];

// ── SCENARIO DATA ─────────────────────────────────────────
const SCENARIO_DATA = {
  UG: [
    { code:"DAL-CH", title:"The WhatsApp Fact-Check", tier:"ALL", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at knowing when to check whether a statistic from an AI tool is actually correct before using it?",
      text:`🎯 HOOK: It's 11pm, the assignment is due at midnight, and you just need one good statistic for your introduction.

You ask Meta AI on WhatsApp (one of the tools listed in UP's AI Tutoring Brochure) to help with your first-year economics assignment. It responds: "According to Statistics South Africa (2022), youth unemployment in South Africa reached 66.5% in Q3 2022 — the highest youth unemployment rate in the world." UP's tutoring materials remind you to always verify AI responses. Your introduction is almost done. What do you do?

A) Keep it — Stats SA is the official national statistics body, the number sounds plausible, and you're out of time
B) Delete the whole paragraph and write something generic to avoid any risk
C) Open the Stats SA website, find the Quarterly Labour Force Survey for Q3 2022, and check this specific figure before submitting — it takes less than 5 minutes
D) Change "66.5%" to "approximately 65%" so it doesn't look like you copied a specific AI output`,
      rationale:`✅ Option C is correct. Stats SA publishes all its QLFS data publicly — verifying a single figure takes minutes. UP's own tutoring brochure (Tip 3) explicitly states: "Always verify the information provided by the AI." Running out of time is not a reason to submit an unverified claim.\n\n❌ A — Plausibility ≠ accuracy. AI can produce a figure that is close but wrong — "highest in the world" is exactly the kind of superlative claim AI embellishes.\n❌ B — The problem is accuracy, not surface risk. Deleting misses the verification lesson.\n❌ D — Changing the number while knowing it is unverified is worse than the original problem.`},
    { code:"ESI-S1", title:"The Tutorial Survey", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when data from other people needs special handling before you use it with AI tools?",
      text:`🎯 HOOK: Your group project needs data. Your tutorial group was willing to help. Now you have 15 responses — and AI could analyse them in seconds.

For a second-year EMS research methods assignment, your group collected a short survey from 15 classmates about financial stress and study habits. One respondent wrote their name by accident. You want to paste all responses into ChatGPT to identify themes. UP's Lecturer's Guide (§3.8) states that personal and sensitive information must not be uploaded to AI tools. What should you do first?

A) Paste everything — it's just a class assignment, not real research, so POPIA doesn't apply
B) Remove the one name and then paste the rest — that fixes the problem
C) Ask your lecturer or check your assignment brief to confirm whether your ethics guidelines permit using AI to process survey data from your classmates — especially since the survey covers a sensitive topic and one response includes an identifiable name
D) Ask ChatGPT to delete the name from the data before it starts analysing`,
      rationale:`✅ Option C is correct. Even a class-level survey involves collecting data from real people on a sensitive topic. POPIA does not exempt student assignments. UP's §3.8 applies to all AI tool use involving personal data.\n\n❌ A — "Just a class assignment" is the most common way students inadvertently violate data ethics requirements. POPIA applies regardless of purpose.\n❌ B — Removing one name reduces one identifier but does not resolve whether peer data may be uploaded to an external AI platform.\n❌ D — Asking ChatGPT to delete the name does not remove it from any processing or logging that has already occurred.`},
    { code:"ESI-S2", title:"The Law Assignment", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at knowing when to check whether legal references from AI tools are actually correct?",
      text:`🎯 HOOK: Business law assignment. Directors' duties. The Companies Act. ChatGPT sounds completely confident.

For your third-year business law assignment at UP EMS, you ask ChatGPT to explain director obligations. It responds: "In terms of Section 76(3)(b) of the Companies Act 71 of 2008, directors are required to act with the degree of care, skill, and diligence that may reasonably be expected of a person carrying out the same functions in relation to the company." Your lecturer's assignment brief says AI tools may be used as a starting point but all legal references must be verified. What do you do?

A) Use it as stated — the Act number and section reference look specific and official
B) Paraphrase it to avoid exact AI wording, but keep the section reference as it sounds authoritative
C) Locate the Companies Act 71 of 2008 on the Southern African Legal Information Institute (SAFLII) or the official Government Gazette, find Section 76(3)(b), and verify the exact wording and application before citing it in your assignment
D) Ask ChatGPT to double-check the reference and provide a more detailed explanation`,
      rationale:`✅ Option C is correct. Specific section numbers are the highest-risk AI hallucination format. AI frequently invents or misquotes exact legal provisions. SAFLII makes all South African legislation freely available. UP §3.6 requires cross-checking against credible sources.\n\n❌ A — Format-as-accuracy fallacy: a specific section number looks official but may be entirely fabricated.\n❌ B — Cosmetic intervention. Paraphrasing doesn't fix an unverified legal citation.\n❌ D — Circular verification: AI cannot verify its own output.`},
    { code:"ESI-S3", title:"The ClickUP Flag", tier:"TIER3", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at knowing what to do when Turnitin's AI detection flags your submitted assignment?",
      text:`🎯 HOOK: You worked hard on that assignment. Three days later: an email from your lecturer about a Turnitin flag.

You submit a 1,500-word third-year EMS assignment via ClickUP. Three days later you receive an email: Turnitin's AI detection scored your submission at 65%. Your lecturer asks you to come in for a meeting. You did use AI to help draft parts of the assignment, but you significantly rewrote the content. You know from the UP Lecturer's Guide that Turnitin is described as a "smoke alarm, not proof of misconduct." What should you do before the meeting?

A) Delete all digital drafts and working notes so there is no evidence of AI use
B) Submit a pre-emptive written statement denying AI use entirely
C) Gather your working notes, draft history, and any version-tracked documents that demonstrate your writing process — and be prepared to explain transparently how and why you used AI and what you rewrote
D) Ask a classmate to confirm you wrote it yourself to provide a character reference`,
      rationale:`✅ Option C is correct. A Turnitin AI score is explicitly described in UP's §3.9.3 as a "smoke alarm, not proof of misconduct." The meeting is a process, not an accusation. Your job is to demonstrate your process and thinking, not to deny.\n\n❌ A — Destroying evidence of your process makes you look more suspicious, not less.\n❌ B — If you did use AI (even legitimately and with proper rewriting), categorical denial creates an integrity problem.\n❌ D — A character reference from a classmate cannot address the actual concern raised by the submission data.`},
    { code:"ESI-S4", title:"The ClickUP Declaration", tier:"TIER3", answer:"A",
      confidencePrompt:"Before you see this scenario — how confident are you that you know when you are required to submit UP's Generative AI Declaration Form for your assignments?",
      text:`🎯 HOOK: The assignment is submitted. Then you notice: you forgot to attach the AI Declaration Form.

For a third-year EMS module, you used ChatGPT to draft most of your 2,000-word assignment, then rewrote sentences and added your own conclusions. Your lecturer stated in the study guide — and in Week 1 — that students must submit UP's Generative AI Declaration Form (Appendix B) with every assignment. You didn't attach it. You feel the final version is mostly your own work now. What do you do?

A) Contact your lecturer immediately, disclose that you forgot to attach the Declaration Form, and ask about the procedure for late submission of the form — being transparent about how AI was used in your process
B) Say nothing — the final text is substantially yours so there's nothing to declare formally
C) Submit the Declaration Form late without contacting your lecturer, hoping it won't be noticed
D) Ask a friend what they declared for their own assignment and mirror that`,
      rationale:`✅ Option A is correct. The requirement to submit the Declaration Form is independent of how much you rewrote. You used AI, the form is required, it was not submitted — transparency with your lecturer is both an ethical and practical necessity. UP's §3.9.2 requires AI use to be acknowledged.\n\n❌ B — "Substantially my own work now" does not remove the declaration obligation. The requirement is triggered by AI use, not by a threshold of final AI content.\n❌ C — Submitting without disclosure is an error compounded by concealment.\n❌ D — Your declaration must reflect your actual use. Mirroring another student's declaration is academic dishonesty.`},
    { code:"CT-CH", title:"The Lecturer's Claim", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you in your ability to identify when a claim from an authority figure needs to be checked against evidence before you accept it?",
      text:`🎯 HOOK: You like this lecturer. They know their stuff. But something they just said contradicts what you read last week.

In your first-year economics lecture, your lecturer states: "Research has conclusively proven that countries that adopt AI faster will always achieve stronger economic growth. South Africa must therefore prioritise AI investment above all other development priorities." Several students around you take notes. In last week's tutorial, however, you read a TIPS policy brief arguing that AI adoption benefits are highly uneven and depend on institutional readiness. What do you do?

A) Take notes and accept the claim — your lecturer is the expert and has access to research you haven't read
B) Disregard the statement entirely — you found contradictory evidence so the claim must be wrong
C) Note that this claim appears to contradict the TIPS brief from last week, flag it as a contested empirical question, and look up both the specific research your lecturer cited and the TIPS brief to assess what the evidence actually shows
D) Ask the AI on your phone to confirm whether AI adoption always leads to economic growth`,
      rationale:`✅ Option C is correct. "Conclusively proven" and "always achieve" are strong empirical claims that warrant scrutiny regardless of who makes them. Critical thinking requires source-agnostic evaluation — the lecturer's authority does not substitute for evidence.\n\n❌ A — Deferring entirely to authority is the core critical thinking failure this scenario tests.\n❌ B — Contradiction alone does not invalidate either source. Evidence quality and context matter.\n❌ D — Using AI to adjudicate a contested empirical claim is asking an unreliable tool to resolve an evidence dispute.`},
    { code:"GAD-CH", title:"The Group AI Cover-Up", tier:"ALL", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at working out who is responsible when things go wrong in a group project involving AI?",
      text:`🎯 HOOK: Alex's sections were always the best in the group. Now you know why.

Your group submits a major EMS assignment worth 30% of your final mark via ClickUP. During a group debrief, Alex admits they generated all their contributions using AI without telling the group — and without completing the UP AI Declaration Form, which your lecturer required. One of Alex's sections contains a factual error about a company case study that the whole group missed in peer review. Your marker deducts 8 marks for the error and flags that no Declaration Form was submitted. What is the correct position?

A) The group bears no responsibility — Alex acted alone and the group didn't know
B) Alex alone is responsible, but the group should apologise to the marker to minimise penalties
C) The group collectively submitted the assignment, and all members have a shared responsibility for its academic integrity — including ensuring AI use was declared and content was verified, regardless of who produced which section
D) The group should complain formally about Alex's behaviour to avoid the shared penalty`,
      rationale:`✅ Option C is correct. Collective submission means collective responsibility. The group's obligation to verify content and ensure proper AI declaration is not discharged by not knowing that one member used AI. The UP framework places accountability on the submitting entity.\n\n❌ A — Collective submission creates collective accountability regardless of individual knowledge.\n❌ B — An apology does not address the underlying accountability question.\n❌ D — A complaint about Alex may be valid, but it does not remove the group's shared responsibility for what was submitted under all their names.`},
    { code:"IEC-CH", title:"The Missing Green Light", tier:"TIER3", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when confusion about AI rules in your studies reflects an institutional guidance gap rather than your own misunderstanding?",
      text:`🎯 HOOK: Everyone's using AI for the assignment. Some students are declaring it. Some aren't. Nobody knows the actual rule.

In your second-year EMS module, classmates are using various AI tools without any clear guidance from the module coordinator. UP's Lecturer's Guide (§3.9.1) says every assignment should carry a "Permitted AI" statement using a Red/Yellow/Green traffic-light framework. Your assignment brief has no such statement. What do you do?

A) Follow what the majority of students are doing — if most are using AI without declaring it, you probably can too
B) Avoid AI entirely since there is no explicit permission — absence of a green light means it's probably not allowed
C) Email the module coordinator directly, explain that the assignment brief contains no Permitted AI statement as required by the UP Lecturer's Guide, ask for clarification on what is and is not permitted for this assessment, and document the response
D) Check what similar assignments in other modules permit and apply the same rule here`,
      rationale:`✅ Option C is correct. The absence of the required Permitted AI statement is itself a gap in the institutional enabling condition. §3.9.1 places the obligation on module coordinators to communicate this clearly. When they have not, the responsible action is to ask, not to assume.\n\n❌ A — Crowd behaviour is not an authoritative guide to academic integrity requirements.\n❌ B — Absence of guidance means absence of guidance — not a default prohibition. Assuming is as risky as assuming permission.\n❌ D — Different assignments have different requirements. Cross-module inference is not appropriate.`},
  ],

  PG: [
    { code:"DAL-CH", title:"The Perfect Citation", tier:"ALL", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at identifying when AI-generated content in your academic work needs independent verification before use?",
      text:`🎯 HOOK: You're three weeks from submission and your supervisor is waiting for a polished literature review draft.

You use an AI tool to help draft a paragraph. The AI generates: Smith, J., & Nkosi, T. (2021). Digital infrastructure and AI readiness in sub-Saharan Africa. MIS Quarterly, 45(3), 812–839. Plus the statistic: "74% of organisations in sub-Saharan Africa reported digital infrastructure gaps as the primary barrier to AI adoption."

UP's Lecturer's Guide (§3.6) explicitly states: "Verify AI-generated information against credible sources." The formatting looks impeccable. What do you do?

A) Use it as drafted — MIS Quarterly is a top journal, the formatting is perfect, and the statistics support your argument well
B) Rephrase the paragraph in your own words to reduce any AI similarity score before submitting
C) Locate the Smith & Nkosi (2021) paper directly — search MIS Quarterly's archive, read the article, and verify the statistic exists and is stated as the AI claims before including it
D) Ask the AI tool to provide a different citation that makes the same argument`,
      rationale:`✅ Option C is correct. AI tools frequently generate perfectly formatted, entirely fabricated citations. The journal's credibility carries no verification weight — what matters is whether this specific paper exists and whether the statistic appears as stated. UP §3.6 requires cross-checking against credible sources.\n\n❌ A — Source-reputation heuristic: assumes credible journal name = valid citation. Most common DAL failure mode at PG level.\n❌ B — Cosmetic intervention — changing surface presentation without verifying accuracy.\n❌ D — Requests a new, equally unverified citation. You cannot verify an AI output by asking the same AI for an alternative.`},
    { code:"ESI-S1", title:"The Interview Upload", tier:"TIER2+", answer:"B",
      confidencePrompt:"Before you see this scenario — how confident are you at knowing when research data handling requires ethics and consent verification before using AI?",
      text:`🎯 HOOK: You've just finished your tenth interview. The data is rich. Thematic analysis usually takes weeks. What if AI could help?

You have ten semi-structured interview transcripts for your master's research. Participants consented using a standard UP ethics form approved before LLMs were widely used in research. The transcripts include job titles and organisation names. You want to paste them into a free AI tool to accelerate thematic coding. UP §3.8: "Never input sensitive, personal, or confidential information into AI tools." Before you click paste — what needs to be true?

A) Nothing further — you changed participant names to pseudonyms, so POPIA is satisfied
B) Your ethics approval and participant consent documentation must explicitly permit the use of third-party AI tools to process this interview data before you upload anything
C) Nothing — the free-tier AI tool's privacy policy states it does not retain user data after the session ends
D) Your supervisor should informally confirm that AI-assisted analysis is acceptable in your field`,
      rationale:`✅ Option B is correct. Two requirements must both be met: (1) UP ethics approval must cover AI-assisted data processing — most pre-2023 approvals do not; (2) consent forms must have disclosed this use. Job titles and organisation names together can re-identify individuals even without name identifiers.\n\n❌ A — Name pseudonymisation is insufficient when contextual identifiers remain. POPIA applies regardless.\n❌ C — Vendor privacy policies ≠ research ethics compliance. Free-tier tools may use inputs for model training.\n❌ D — Supervisor advice cannot authorise non-compliant data handling. Compliance requires documentation, not informal permission.`},
    { code:"ESI-S2", title:"The Ethics Section", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when AI-generated legal or regulatory references need independent verification?",
      text:`🎯 HOOK: Your ethics application is due tomorrow and the data protection section is the last piece.

You ask an AI assistant to help draft the POPIA compliance section of your faculty ethics application. It responds: "Under Section 18(3) of the Protection of Personal Information Act (POPIA) No. 4 of 2013, researchers conducting academic studies are exempt from certain notification obligations provided the data is anonymised prior to analysis."

UP §3.6 says to verify AI-generated information. This wording sounds official and would complete your application. What do you do?

A) Include it — the Act number and section are specific, and the exemption described sounds legally plausible
B) Remove the specific section reference but keep the general description of anonymisation reducing obligations
C) Access the POPIA Act text directly — available at popia.co.za or the Government Gazette — locate Section 18, read the actual provision, and determine whether this description of the exemption is accurate before submitting it in a formal ethics application
D) Ask the AI to confirm whether its POPIA citation is correct`,
      rationale:`✅ Option C is correct. An incorrect legal claim in an ethics application is not merely a stylistic error — it is a substantive misrepresentation in a formal institutional document. POPIA is freely available. The specific section cited needs to be read and verified, not assumed correct.\n\n❌ A — Specificity does not equal accuracy. AI frequently generates plausible-sounding but incorrect legal provisions.\n❌ B — Partial mitigation: removing the section reference while retaining an unverified legal claim doesn't resolve the core problem.\n❌ D — Circular verification: AI cannot verify its own legal citations.`},
    { code:"ESI-S3", title:"The 78% Flag", tier:"TIER3", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at knowing how to respond appropriately when Turnitin's AI detection flags your submitted work?",
      text:`🎯 HOOK: You spent three weeks on that chapter. Now Turnitin says 78% of it was written by AI.

You submit a master's thesis chapter you wrote yourself over three weeks. You used an AI tool at the end to improve sentence flow. Turnitin's AI detection flags 78% of the content as AI-generated. Your supervisor contacts you. UP §3.9.3 explicitly states: "AI detection tools should serve as 'smoke alarms' rather than proof of misconduct... they signal where closer scrutiny may be warranted, but they do not constitute evidence of policy violation." What is the most appropriate response?

A) Panic and offer to rewrite the entire chapter from scratch immediately
B) Send your supervisor an angry response explaining that Turnitin is inaccurate and the flag should be ignored
C) Respond calmly, acknowledge the flag, explain the role AI played in flow editing, provide your draft history and notes demonstrating the writing process, and engage constructively with your supervisor's review
D) Ask a fellow student to independently read the chapter and confirm it sounds human-written`,
      rationale:`✅ Option C is correct. The flag is a process trigger, not a verdict. Engaging constructively with your evidence is both the professionally appropriate and practically effective response. Your draft history demonstrates your process.\n\n❌ A — Immediate rewriting suggests guilt where due process applies.\n❌ B — A hostile response undermines your credibility regardless of whether the flag is accurate.\n❌ D — Another student's opinion cannot address the supervisory concern, which is about your process, not the text's stylistic appearance.`},
    { code:"ESI-S4", title:"The Journal Submission", tier:"TIER3", answer:"A",
      confidencePrompt:"Before you see this scenario — how confident are you that you understand when AI use in your academic writing requires disclosure to a journal or institution?",
      text:`🎯 HOOK: Four years of doctoral work. Your first sole-authored journal paper. You want it to be perfect — and clean.

You are submitting a journal article derived from your PhD thesis. In the early stages you used an AI tool extensively to generate section outlines and draft initial arguments. Over subsequent months you substantially rewrote every paragraph. The final text reads as your own voice. The journal has no explicit AI disclosure policy. UP's plagiarism declaration — signed on every thesis submission — states that all sources must be disclosed. What do you do?

A) Disclose AI use in the manuscript — in the acknowledgements, methods section, or a data availability statement — explaining the role AI played in early drafts and confirming substantial human revision, even though the journal has no explicit policy
B) No disclosure is needed — you substantially rewrote the AI output and the journal has no policy requiring it
C) Email the journal editor asking whether disclosure is required before you decide
D) Include a footnote that "AI tools were consulted during preparation" without specifying how or to what extent`,
      rationale:`✅ Option A is correct. Your institutional plagiarism declaration requires disclosure of all sources. The absence of a journal-specific policy does not override your institutional obligations. Transparency about AI's role — even in early drafts — is both ethically required and professionally responsible.\n\n❌ B — "Substantially rewrote" does not remove the disclosure obligation. Your UP declaration applies regardless of the journal's policy.\n❌ C — While seeking guidance has merit, disclosure is already required by your existing institutional obligations.\n❌ D — Vague disclosure without specifying the nature and extent of AI use does not meet the transparency standard.`},
    { code:"CT-CH", title:"The Seminar Claim", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you in your ability to evaluate an argument critically, regardless of who is making it?",
      text:`🎯 HOOK: A Nobel-worthy researcher is presenting. The room is nodding. And something doesn't sit right.

A widely respected senior academic presents at a faculty research seminar. They argue — citing several recent publications — that AI will render traditional systematic literature reviews obsolete within five years, making the SLR methodology chapter of a doctoral thesis largely irrelevant. Several experienced colleagues in the room nod in agreement. As a doctoral student currently writing your SLR chapter, what is your analytical response?

A) Accept the claim — the presenter is a recognised expert and has cited recent publications that you haven't read
B) Reject the claim — you're invested in your SLR and the prediction seems extreme
C) Treat this as a contested methodological claim, note the specific publications cited, locate and read them to evaluate whether they actually support this conclusion, and consider what evidence would be needed to assess whether AI can genuinely replace the epistemic functions of an SLR
D) Ask your supervisor whether you should change your methodology chapter in response`,
      rationale:`✅ Option C is correct. Expert authority and audience consensus do not substitute for evidence. The specific publications cited need to be located and assessed on their merits. The claim is contested, not settled.\n\n❌ A — Appeal to authority is the core cognitive bias this scenario tests.\n❌ B — Personal investment is not a basis for rejection. Both the claim and the rejection need to be evidence-driven.\n❌ D — Consulting your supervisor is reasonable, but deferring the epistemic work is not the right first move.`},
    { code:"GAD-CH", title:"The Undisclosed AI Feedback", tier:"ALL", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at identifying where accountability lies when AI is involved in a decision that directly affects you?",
      text:`🎯 HOOK: The feedback on your chapter is detailed, structured, and helpful. Too helpful?

Your supervisor sends feedback on your thesis chapter. The feedback is detailed, covering structure, argument, and literature gaps. You later recognise phrasing patterns characteristic of AI-generated text. Your supervisor confirms they used an AI tool but did not disclose this — presenting the output as their own expert assessment. The AI feedback incorrectly stated that Venkatesh et al. (2003) was absent from your literature review when you had cited it extensively. What is the most appropriate response?

A) Say nothing — the feedback was helpful overall and raising the issue might damage the supervisory relationship
B) Accept all the feedback as valid — if the supervisor approved it, it must reflect their professional judgment
C) Raise with your supervisor that the feedback appears to contain an error — specifically the incorrect claim about Venkatesh et al. — explain that you are concerned about undisclosed AI use in a supervision context, and ask how future feedback will be quality-assured
D) Report the supervisor to the faculty immediately for using AI without disclosure`,
      rationale:`✅ Option C is correct. Undisclosed AI use in supervision is a governance and accountability issue. The specific error demonstrates the risk. Raising the concern constructively — addressing both the error and the disclosure question — is the appropriate response before escalation.\n\n❌ A — Silence accepts an accountability failure and leaves you with unverified feedback in your thesis.\n❌ B — An error that was approved does not become correct by virtue of approval.\n❌ D — Immediate formal reporting before direct engagement is disproportionate at this stage.`},
    { code:"IEC-CH", title:"The Shadow Research Tools", tier:"TIER3", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when patterns of AI use in your environment point to an institutional gap rather than individual choices?",
      text:`🎯 HOOK: Everyone in your cohort is using personal AI accounts for their thesis work. Nobody told them not to. Nobody gave them an alternative.

Most postgraduate students in your cohort — including yourself — routinely upload thesis drafts, interview summaries, and research data to personal free-tier AI accounts because UP has not provided an approved AI tool or guidance for postgraduate research. A fellow student mentions their draft chapter appeared in AI model training based on updated terms of service. What is the most appropriate response?

A) Continue as before — if the university provided no guidance, students cannot be held responsible for tool choices
B) Switch to a different free-tier tool with better privacy terms
C) Escalate this issue to the relevant postgraduate coordinator or research office, document the specific risks you and your cohort have been exposed to due to the absence of institutional guidance, and ask what approved tools and data governance protocols exist or are being developed
D) Ask each student individually to delete their research data from AI tools and warn them about the risks`,
      rationale:`✅ Option C is correct. This is a systemic institutional gap that requires a systemic response. Individual tool-switching does not solve the absence of an approved, governed platform for postgraduate research. The institution has an obligation to provide this.\n\n❌ A — Absence of guidance does not mean absence of risk to your research participants or your data.\n❌ B — Free-tier privacy terms vary, but none constitute a data processing agreement adequate for research ethics compliance.\n❌ D — Individual warning addresses the symptom, not the systemic cause.`},
  ],

  ACADEMIC: [
    { code:"DAL-CH", title:"The Grant Statistic", tier:"ALL", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at identifying when AI-generated content in professional or research documents needs independent source verification?",
      text:`🎯 HOOK: The grant deadline is in 48 hours and your background section still needs a strong data anchor.

You use an AI writing assistant to draft contextual framing for a competitive NRF grant application. The AI produces: "According to the Department of Higher Education and Training's 2023 Annual Report, South African universities collectively graduated 87,000 postgraduate students in 2022, representing a 12% increase over five years." It fits your argument exactly. Your co-applicant says it sounds right. What do you do?

A) Use it — DHET Annual Reports are government primary sources and the figure aligns with what you know about sector trends
B) Rewrite it in your own words so it doesn't look AI-generated, then submit
C) Access the DHET 2023 Annual Report directly — available on the DHET website — and verify this specific figure before it appears in a competitive funding application
D) Ask your co-applicant to double-check it since they work more closely with sector data`,
      rationale:`✅ Option C is correct. AI tools routinely fabricate specific statistics attributed to real, authoritative sources. "Sounds right" and "government source" are not verification. A fabricated government statistic in an NRF application could constitute research misconduct.\n\n❌ A — Source reputation + colleague validation. Neither constitutes independent verification of a specific figure.\n❌ B — Paraphrasing an unverified statistic does not reduce accuracy risk.\n❌ D — Colleague intuition is not document verification. You need the source, not a consensus.`},
    { code:"ESI-S1", title:"The Student Feedback Upload", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when processing institutional data with external AI tools requires data governance verification?",
      text:`🎯 HOOK: End-of-semester evaluations are in. 180 written responses. You have a faculty report due Friday.

You receive anonymous module evaluation results including written student comments. Several contain contextual identifiers: "As a part-time student in the financial sector, I found…" You want to paste the responses into ChatGPT to generate a thematic summary for your faculty module report. UP §3.8 states staff must protect sensitive data from AI training pipelines. What should you consider first?

A) Nothing — it's an anonymous survey, so there's no personal data and POPIA doesn't apply
B) Nothing — you're only generating a summary, not storing the data anywhere
C) Whether your institution's data governance policy and the original survey consent permit third-party AI processing of student feedback data, particularly given that some responses contain quasi-identifying details that could re-identify individuals
D) Whether ChatGPT's summary will be accurate enough to include in a formal faculty report`,
      rationale:`✅ Option C is correct. Student feedback data is institutional data governed by UP's data policies and POPIA. "Anonymous" surveys frequently contain quasi-identifiers. UP §3.8 explicitly prohibits uploading sensitive or confidential institutional information to external AI tools.\n\n❌ A — POPIA applies to any personal information, including indirectly identifiable data. "Anonymous" is a label, not a legal status.\n❌ B — Processing is the regulated activity under POPIA. Generating the summary IS the processing.\n❌ D — Accuracy is a valid operational concern but not the data governance question.`},
    { code:"ESI-S2", title:"The Policy Memo", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when AI-generated references to legislation require independent verification before inclusion in official documents?",
      text:`🎯 HOOK: Your faculty needs a policy memo on AI in postgraduate supervision — and it needs a legal foundation.

You use an AI assistant to help frame the regulatory context for a faculty memo on AI tool use in postgraduate supervision. The AI writes: "In terms of Section 27(1)(b) of the Higher Education Act No. 101 of 1997, universities have a statutory obligation to establish quality assurance systems addressing the responsible use of emerging instructional technologies, including AI tools."

UP §3.6 requires verification of AI-generated information. This framing would strengthen the memo considerably. What do you do?

A) Include it — the HE Act is a real statute and quality assurance obligations are genuinely part of it
B) Rephrase it more generally — remove the section number but keep the obligation framing
C) Access the Higher Education Act No. 101 of 1997 (available via SAFLII or the Government Gazette), locate Section 27(1)(b), and determine whether it actually addresses quality assurance for AI technologies before including this framing in a formal faculty memo
D) Ask a colleague in the law faculty whether the provision sounds correct`,
      rationale:`✅ Option C is correct. Citing a specific statutory section in a formal policy memo creates a legal representation. If the section does not say what the AI claims, the memo contains a false legal claim. AI routinely misquotes or invents legislative provisions.\n\n❌ A — The statute being real does not mean the specific section cited says what the AI claims.\n❌ B — Removing the section number while retaining an unverified legal claim doesn't resolve the problem.\n❌ D — A legal colleague's intuition is not statutory verification.`},
    { code:"ESI-S3", title:"The Student Flag", tier:"TIER3", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at determining what constitutes appropriate evidence when a Turnitin AI detection score flags a student's submission?",
      text:`🎯 HOOK: Turnitin flags one of your strongest students at 71%. You've supervised this student for eight months.

A postgraduate student you know well submits a research proposal that Turnitin flags at 71% AI-generated. The student is a non-native English speaker who has demonstrated strong conceptual understanding in eight months of supervision meetings. UP §3.9.3 states that AI detection tools "should not be used to substantiate allegations of misconduct in the absence of other evidence." What is the appropriate next step?

A) Report the student to the academic integrity committee immediately — 71% is too high to ignore
B) Tell the student informally that you will overlook it this time since you know their capabilities
C) Initiate a structured academic conversation with the student — ask them to explain their research argument, walk through their methodology, and discuss their key sources — using this as additional contextual evidence before making any misconduct determination
D) Ask Turnitin to re-run the analysis to see if the score changes`,
      rationale:`✅ Option C is correct. UP §3.9.3 is explicit: AI detection scores are smoke alarms, not verdicts. A structured viva-style conversation provides actual evidence of understanding and process that the detection score cannot provide. Your eight months of supervisory evidence is also relevant.\n\n❌ A — Immediate reporting based on a detection score alone is precisely what UP policy prohibits.\n❌ B — Informal overlooking bypasses proper process and may not serve the student's long-term interests.\n❌ D — Re-running the same analysis produces the same type of evidence at the same reliability level.`},
    { code:"ESI-S4", title:"The Conference Paper", tier:"TIER3", answer:"A",
      confidencePrompt:"Before you see this scenario — how confident are you that you understand when AI use in preparing research outputs requires formal disclosure?",
      text:`🎯 HOOK: The conference submission system has a question you weren't expecting.

You are submitting a research paper to an international academic conference. You used an AI tool to generate a first draft of the literature review and to structure the argument flow. You spent three weeks revising and substantially expanding the content. The submission portal asks: "Was generative AI used in the preparation of this manuscript?" The final text looks nothing like the AI draft. UP §3.9.2 states: AI tools must be acknowledged. What do you do?

A) Answer "Yes" and provide a brief, accurate description of how AI was used — in generating initial draft content and structure — and confirm the nature of subsequent human revision
B) Answer "No" — the final version is substantially your own and the original AI draft is unrecognisable in the submitted text
C) Skip the question — it's optional and the conference doesn't have an enforcement mechanism
D) Answer "Yes" but only describe the minor stylistic edits, not the initial drafting`,
      rationale:`✅ Option A is correct. AI was used in preparing this manuscript. The question asks about preparation, not final composition. UP §3.9.2 is unambiguous. The extent of subsequent revision does not remove the disclosure obligation — it is the nature of the disclosure.\n\n❌ B — "Unrecognisable in the final text" does not change the fact that AI was used in preparation.\n❌ C — Obligations are not voided by weak enforcement mechanisms.\n❌ D — Selective disclosure that omits the most significant AI use (initial drafting) is materially misleading.`},
    { code:"CT-CH", title:"The Dean's Proposal", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you in your ability to evaluate a strategic proposal on its evidence, even when it has strong senior support in the room?",
      text:`🎯 HOOK: The Dean has the data. The slides are polished. The room is enthusiastic. And you have a concern.

At an EMS faculty strategic planning meeting, the Dean proposes making AI tool proficiency a mandatory admission criterion for all postgraduate programmes by 2026. The proposal includes trend data showing AI adoption in the top 50 global business schools and argues that UP EMS must move quickly to remain competitive. Several senior colleagues express strong support. What is your analytical response?

A) Support the proposal — the Dean has presented data and the competitive rationale is sound
B) Withhold any response — questioning a Dean's proposal in a faculty meeting is professionally risky
C) Raise analytically: ask what evidence exists that AI proficiency at admission predicts postgraduate success, whether this criterion would disproportionately disadvantage students from under-resourced backgrounds (given South Africa's digital divide), and whether "competitiveness" benchmarks from the top 50 global schools are appropriate comparators for UP EMS's specific student population and mission
D) Support the proposal in the meeting and raise concerns in a private email to the Dean afterwards`,
      rationale:`✅ Option C is correct. Strategic proposals with significant equity implications require evidence-based scrutiny regardless of institutional hierarchy. The specific concerns raised — predictive validity, access equity, and comparator appropriateness — are exactly the analytical questions a rigorous academic response requires.\n\n❌ A — The data presented does not address whether AI admission proficiency is a valid or equitable criterion.\n❌ B — Withholding professional analysis in a strategic discussion is a failure of scholarly accountability.\n❌ D — Private email after public approval is less effective and avoids the analytical engagement when it matters most.`},
    { code:"GAD-CH", title:"The AI-Graded Cohort", tier:"ALL", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at identifying where accountability sits when AI tools are involved in consequential institutional decisions?",
      text:`🎯 HOOK: 60 assignments, one week. The AI rubric scoring seemed like a practical solution.

A module coordinator uses AI-assisted rubric scoring to mark 60 postgraduate assignments with minimal human review before releasing marks via ClickUP. Several students submit re-mark requests, showing that penalised elements were clearly present in their submissions and that the AI scoring was inconsistent with the written feedback. UP §3.9.3 states that AI tools are assistants — staff "remain in control of and responsible for all assessment decisions." What is the correct position?

A) The AI tool is responsible for the errors — the coordinator used it in good faith
B) The coordinator bears responsibility only for the cases where students complained — the unchallenged marks are valid by default
C) The module coordinator retains full accountability for all 60 marking decisions, regardless of the tool used, and is obligated to review all assessments where AI-assisted scoring may have produced errors — not only those that were formally contested
D) The AI tool vendor should be notified of the errors so they can improve the system`,
      rationale:`✅ Option C is correct. UP §3.9.3 is explicit: staff remain in control of and responsible for all assessment decisions. AI-assisted marking is a support tool, not a decision-maker. The absence of a complaint is not evidence of accuracy — it may reflect student uncertainty about re-mark processes.\n\n❌ A — Tools do not bear institutional accountability. The person who deployed them does.\n❌ B — Unchallenged decisions may contain errors students didn't notice or didn't pursue. Accountability is not discharge by absence of complaint.\n❌ D — Vendor notification is appropriate but does not discharge the coordinator's accountability to the 60 students.`},
    { code:"IEC-CH", title:"The Assessment Redesign Gap", tier:"TIER3", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at using UP's Module AI Vulnerability Self-Assessment as a genuine governance tool rather than a compliance form?",
      text:`🎯 HOOK: The Module AI Vulnerability Self-Assessment flagged your coursework at 85% AI exposure. You don't know what to do next.

You complete UP's Module AI Vulnerability Self-Assessment (Appendix A of the Lecturer's Guide) for your third-year EMS module. The calculation shows your module has an AI exposure score of 85% — almost all coursework assignments can be substantially completed by a free AI tool. Your examiner reports and assessment plan are due in two weeks. What do you do?

A) Submit the assessment plan unchanged — the Self-Assessment is a compliance exercise and 85% is not a formal threshold that triggers anything
B) Add a statement to the examiner report noting the AI exposure score without changing any assessments
C) Treat the 85% result as a genuine signal, review which specific assessments are driving the high exposure score, consider what redesign options exist (incorporating AI-resistant elements such as situated reflection, oral components, or live application tasks), consult the faculty's assessment guidelines, and submit a revised assessment plan that addresses the identified vulnerability
D) Ask a colleague what their AI exposure score is to benchmark whether 85% is normal`,
      rationale:`✅ Option C is correct. The Module AI Vulnerability Self-Assessment exists to drive genuine assessment redesign, not generate compliance paperwork. An 85% score means 85% of your assessment can be substantially completed without the cognitive engagement the module is designed to develop.\n\n❌ A — The Self-Assessment is explicitly designed as a governance tool. Treating it as compliance-only defeats its purpose.\n❌ B — Noting without acting is compliance theatre.\n❌ D — Benchmarking against peer scores does not resolve the specific vulnerability your module has.`},
  ],

  PROFESSIONAL: [
    { code:"DAL-CH", title:"The HR Vacancy Notice", tier:"ALL", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when AI-generated figures or policy references in official documents need to be verified against the source before use?",
      text:`🎯 HOOK: The post needs to be advertised tomorrow and the HR circular template is confusing.

You work in UP's Human Resources department and use an AI assistant to draft a job vacancy notice for a new administrative position. The AI generates: "According to UP's Remuneration Policy of 2022, the salary band for this post is R380,000–R420,000 per annum (Grade 9), with an annual increment schedule of 6.5% subject to performance evaluation." The framing and format look exactly right for an official UP HR circular. Your manager says it sounds about right. What do you do?

A) Use it — the salary band figure sounds plausible and the AI cited a real UP policy
B) Rewrite it in less specific terms — replace the specific figures with "competitive salary" to avoid citing potentially incorrect figures
C) Access UP's current Remuneration Policy directly via the HR portal and verify that this Grade, salary band, and increment schedule are exactly as stated before publishing a vacancy notice
D) Ask a senior colleague in HR whether they recognise these figures before finalizing`,
      rationale:`✅ Option C is correct. Salary band information published in an official vacancy notice is binding and has legal and compliance implications — incorrect figures could lead to offer rescissions, employment equity challenges, or legal disputes.\n\n❌ A — Source credibility + managerial validation. Neither constitutes independent verification of a specific figure.\n❌ B — Replacing figures with vague language fails the vacancy notice's purpose and still doesn't verify the underlying policy.\n❌ D — A colleague's recognition is not the same as verifying against the actual policy document.`},
    { code:"ESI-S1", title:"The Student Records Request", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when student data handling through AI tools requires specific data governance authorisation?",
      text:`🎯 HOOK: The faculty administrator needs a summary report by 5pm. The data is all there.

You work as a faculty administrator at UP. You receive a request to compile an academic performance summary for 45 first-year students for a faculty at-risk intervention programme. You have the student data from UP's student information system — student numbers, module marks, and personal circumstances notes. You want to paste the records into ChatGPT to generate a structured summary report quickly. UP §3.8 states: "Never input sensitive, personal, or confidential information into AI tools." What should you consider first?

A) Nothing further — you're only generating a report summary, not sharing data externally
B) Nothing further — student numbers, not student names, are what make data personally identifiable, and these records don't have names
C) Whether your faculty's data governance policy and any applicable institutional data processing agreement permit uploading individual student academic records — including module marks and personal circumstances notes — to an external AI platform
D) Whether ChatGPT's summary will be formatted correctly for the faculty intervention report`,
      rationale:`✅ Option C is correct. Student academic records are personal information under POPIA. Personal circumstances notes are potentially sensitive personal information. Uploading them to an external AI tool constitutes data processing that requires specific authorisation.\n\n❌ A — "Only generating a summary" misunderstands POPIA: generating the summary is the processing.\n❌ B — Student numbers are direct identifiers under POPIA. The absence of a full name does not make records non-personal.\n❌ D — Accuracy is a valid operational concern but is not the data governance question.`},
    { code:"ESI-S2", title:"The Financial Aid Letter", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when AI-generated legal or policy references in official student communications need to be verified before sending?",
      text:`🎯 HOOK: The letter needs to go out to 300 students by Friday about the new financial aid policy.

You work in UP's Financial Aid office. You use an AI assistant to draft a student communication about changes to NSFAS bursary conditions. The AI generates: "In terms of Section 9(2)(c) of the National Student Financial Aid Scheme Act 56 of 1999 (as amended), students who fail more than 50% of their registered modules in an academic year automatically forfeit their NSFAS bursary for the following year."

This will go to 300 students. What do you do before sending?

A) Send it — the NSFAS Act is a real statute and the 50% threshold sounds like standard financial aid policy
B) Replace the section reference with "NSFAS policy" to reduce the risk of citing a wrong section
C) Access the NSFAS Act 56 of 1999 and any subsequent amendments (available via the Government Gazette), locate Section 9(2)(c), and verify the forfeiture provision and threshold before sending this to 300 students
D) Ask a colleague in Student Finance whether the NSFAS 50% rule sounds right`,
      rationale:`✅ Option C is correct. An incorrect statutory reference sent to 300 students about their financial aid status creates legal liability and could cause serious harm — students may make decisions based on incorrect information about their bursary conditions.\n\n❌ A — The statute being real does not mean the specific provision exists as stated.\n❌ B — Replacing the section reference while retaining the unverified substantive claim doesn't fix the problem.\n❌ D — Colleague intuition is not legal verification.`},
    { code:"ESI-S3", title:"The Recruitment Flag", tier:"TIER3", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when AI-assisted decision-making tools require human review and documented reasoning before acting on their outputs?",
      text:`🎯 HOOK: The AI screening tool flagged the candidate. The interview panel is meeting in an hour.

You work in UP's HR department managing a recruitment process for 12 academic support posts. The university has piloted an AI screening tool that scores candidate applications. The tool has flagged one candidate as "low suitability" (score: 23/100). Your own review of the same CV suggested a strong match — relevant experience, good qualifications, and a profile consistent with UP's employment equity targets. The interview panel meets in an hour. What do you do?

A) Trust the AI screening tool — it was designed to be objective and your personal impression may be biased
B) Override the AI score and invite the candidate without documenting your reasoning
C) Document both the AI score and your independent assessment, flag the discrepancy explicitly to the panel, ensure the panel makes a human decision with full visibility of both inputs, and confirm that the AI tool's scoring methodology is consistent with the Employment Equity Act and UP's fair selection obligations
D) Ask the AI tool to explain why it scored the candidate low before the panel meets`,
      rationale:`✅ Option C is correct. The Employment Equity Act requires that human decisions in selection are documented and defensible. An AI screening score that conflicts with human review requires explicit human adjudication, documented reasoning, and EEA compliance assessment.\n\n❌ A — AI tools are not inherently objective. Screening algorithms can encode historical bias and must be subject to human oversight in employment decisions.\n❌ B — Overriding without documentation creates an undocumented selection decision that may be challenged.\n❌ D — AI tools cannot provide auditable explanations adequate for EEA compliance purposes.`},
    { code:"ESI-S4", title:"The Internal Newsletter", tier:"TIER3", answer:"A",
      confidencePrompt:"Before you see this scenario — how confident are you that you know when AI use in drafting institutional communications requires honest disclosure to your supervisor?",
      text:`🎯 HOOK: The Communications team needs copy about UP's new AI tutoring tools by end of day.

You work in UP's Communications and Marketing department. You use an AI tool to draft most of an article for UP's internal staff newsletter about the new "My 24/7 Tutor" AI tutoring app. You substantially edited the content and added quotes from interviews you conducted. The final article reads naturally and reflects your editorial judgment. Your editor asks directly: "Did you write this yourself?"

A) Tell your editor honestly that you used an AI tool to draft the initial content and then substantially edited and added original interview quotes — and that this reflects your editorial practice going forward
B) Say yes — you made enough edits and added enough original content for the final version to be genuinely yours
C) Say you "used AI as a research tool" without specifying that it drafted the initial text
D) Ask your editor whether they would like to know about AI tool use before you answer`,
      rationale:`✅ Option A is correct. Your editor asked a direct question. An honest, transparent answer is the only appropriate response. UP §3.4 requires transparency in AI use. The extent of your editing does not change the honest answer to the question asked.\n\n❌ B — "Enough editing" is a rationalisation that avoids the direct question asked.\n❌ C — "Used as a research tool" is a misleading characterisation of using AI to draft the majority of the text.\n❌ D — Asking whether the editor "would like to know" is evasive when asked a direct question.`},
    { code:"CT-CH", title:"The Student Success Dashboard", tier:"TIER2+", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at identifying when AI-powered decision-support tools raise governance and equity concerns that need to be raised before deployment?",
      text:`🎯 HOOK: The new dashboard predicts which students will drop out. The head of department wants to act on it immediately.

Your faculty's Director of Student Success presents a new AI-powered student retention dashboard at a faculty operations meeting. The system uses academic performance data to predict which first-year students are "at risk of dropping out" and recommends proactive intervention. The Director says: "The data speaks for itself — we should contact flagged students immediately to offer support." What is the appropriate analytical response?

A) Support immediate implementation — early intervention is clearly beneficial and the data-driven approach is objective
B) Raise concerns in a private conversation with the Director after the meeting to avoid embarrassment
C) Ask analytically: what is the model's false positive rate (students incorrectly flagged), how were historical data used to train it and might those data encode structural disadvantages, what are the implications of labelling students "at risk" before they have experienced difficulty, and what governance framework governs how the outputs are acted on
D) Ask IT to run the system in parallel for one semester before committing to action`,
      rationale:`✅ Option C is correct. AI-powered student risk tools raise significant equity, accuracy, and governance concerns. Labelling students as "at risk" based on algorithmic prediction can produce self-fulfilling stigma effects, and training data from historically unequal systems can encode structural disadvantage as individual risk.\n\n❌ A — "Data speaks for itself" is precisely the framing that critical thinking requires questioning in algorithmic decision-support contexts.\n❌ B — Raising concerns privately after public endorsement is less effective than raising them analytically in context.\n❌ D — A parallel run addresses accuracy but not the equity and governance questions.`},
    { code:"GAD-CH", title:"The Automated Advisory Email", tier:"ALL", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at identifying where accountability sits when AI-automated communications cause harm to students?",
      text:`🎯 HOOK: The system sent 200 emails before anyone noticed the error.

The student advising office at your faculty sets up an automated AI system to send personalised academic progress emails to 200 second-year students, flagging those with low module scores and suggesting they meet with an advisor. The system runs without individual human review of each email. Several students receive emails incorrectly stating they are at risk of academic exclusion — due to a data sync error, the AI accessed records from the previous year. Students complain formally. Where does accountability sit?

A) With the IT department that set up the data sync — the error originated with the infrastructure
B) With the AI system vendor — their product produced incorrect outputs
C) With the advising office staff who authorised and deployed the automated system without establishing adequate human review, data verification, and error-correction protocols — accountability for the harm to students is institutional and cannot be delegated to a vendor or IT team
D) With no individual — automated systems are inherently difficult to attribute and errors should be treated as system failures`,
      rationale:`✅ Option C is correct. The advising office authorised the deployment of an automated system with student-facing consequences without adequate human oversight. UP's framework and general professional standards require that automated systems affecting individual students have verification and review protocols.\n\n❌ A — The IT team may have contributed to the technical error, but the decision to deploy without oversight sits with the advising office.\n❌ B — Vendor accountability is limited to their product's specified functionality. Deployment decisions are institutional.\n❌ D — "System failure" framing is used to avoid accountability. Institutional decisions have institutional owners.`},
    { code:"IEC-CH", title:"The Admin AI Gap", tier:"TIER3", answer:"C",
      confidencePrompt:"Before you see this scenario — how confident are you at recognising when patterns of AI use across your team point to an institutional governance gap that needs to be raised formally?",
      text:`🎯 HOOK: Everyone in the admin team is using personal ChatGPT accounts for work tasks. IT has not provided anything.

You work in UP's faculty administration team. Over the past semester, you and six colleagues have started using personal ChatGPT accounts to handle student-facing tasks: drafting correspondence, summarising application files, and generating FAQ responses. No formal guidance has been issued. A colleague mentions they used ChatGPT to summarise a student's medical certificate and academic history to help process a deferral application. What should you do?

A) Continue as before — the work is getting done efficiently and no one has complained
B) Stop using AI personally and advise your colleagues to do the same, but take no further action
C) Escalate formally to your faculty manager and the relevant data governance or IT governance function, documenting the specific AI use cases and data types involved, and requesting urgent guidance on approved tools, data classification standards, and a policy on AI use in administrative functions — stopping the use of personal accounts for processing student data in the interim
D) Ask colleagues to use AI only for non-student tasks going forward, without formal escalation`,
      rationale:`✅ Option C is correct. Processing a student's medical certificate and academic history through a personal ChatGPT account is a serious POPIA violation. This is not a matter of individual choice — it is a systemic governance gap that requires formal escalation and urgent institutional response.\n\n❌ A — Efficiency and absence of complaints do not establish data governance compliance.\n❌ B — Stopping personal AI use without formal escalation leaves the systemic problem unaddressed and may not prevent colleagues from continuing.\n❌ D — An informal boundary without formal guidance cannot be enforced and does not address the data already processed.`},
  ]
};

// ── HELPERS ──────────────────────────────────────────────
function parseScenario(text) {
  const parts = text.split(/\n(?=[A-D]\))/);
  if (parts.length < 2) return { body: text, options: [] };
  const body = parts[0].trim();
  const options = parts.slice(1).map(o => {
    const m = o.match(/^([A-D])\)\s*([\s\S]*)/);
    return m ? { label: m[1], text: m[2].trim() } : null;
  }).filter(Boolean);
  return { body, options };
}

function getScore(raw, reverse) {
  const v = parseInt(raw);
  return reverse ? 6 - v : v;
}

function computeConstructScores(responses) {
  const r = responses;
  const mean = (...codes) => {
    const vals = codes.map(c => {
      const item = LIKERT_ITEMS.find(i => i.code === c);
      return getScore(r[c], item?.reverse || false);
    }).filter(v => !isNaN(v));
    return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
  };
  return {
    DAL:  mean("DAL1","DAL2","DAL3","DAL4","DAL5"),
    ESI:  mean("ESI1","ESI2","ESI3","ESI4","ESI5R"),
    CT:   mean("CT1","CT2","CT3","CT4"),
    GAD:  mean("GAD1","GAD2","GAD3","GAD4","GAD5R"),
    IEC:  mean("IEC1","IEC2","IEC3","IEC4","IEC5","IEC6","IEC7"),
    AAQ:  mean("AAQ1","AAQ2","AAQ3","AAQ4","AAQ5"),
    FOWR: mean("FOWR1","FOWR2","FOWR3","FOWR4","FOWR5"),
  };
}

function getLabel(score) {
  if (score === null) return "–";
  if (score >= 4.0) return "High";
  if (score >= 3.0) return "Moderate-High";
  if (score >= 2.5) return "Moderate";
  return "Developing";
}

function getLevelColor(score) {
  if (score >= 4.0) return T.green;
  if (score >= 3.0) return T.blue;
  if (score >= 2.5) return T.gold;
  return T.red;
}

function getScenariosForTier(population, confidence) {
  const all = SCENARIO_DATA[population] || [];
  const tier = confidence <= 2 ? 1 : confidence === 3 ? 2 : 3;
  return all.filter(s => {
    if (s.tier === "ALL") return true;
    if (s.tier === "TIER2+" && tier >= 2) return true;
    if (s.tier === "TIER3" && tier >= 3) return true;
    return false;
  });
}

function getFocusAreas(scores, scenarioResults) {
  const areas = [];
  const constructs = [
    { key:"DAL",  label:"Digital AI Literacy",         advice:"Focus on verifying AI outputs, understanding tool limitations, and selecting appropriate AI tools for different tasks." },
    { key:"ESI",  label:"Sceptical Intelligence",       advice:"Practise calibrated trust — neither over-relying on nor dismissing AI outputs. Always verify high-stakes claims independently." },
    { key:"CT",   label:"Critical Thinking",            advice:"Practise source-agnostic analysis: evaluate claims on evidence quality, not the authority or confidence of the source." },
    { key:"GAD",  label:"Governance & Accountability",  advice:"Deepen your understanding of UP's AI policies (§3.6–§3.9.3), POPIA obligations, and your personal accountability for AI-assisted decisions." },
    { key:"IEC",  label:"Institutional Conditions",     advice:"Engage with your institution's AI governance structures. When guidance is missing, escalate rather than assume." },
    { key:"AAQ",  label:"AI Adoption Quality",          advice:"Build consistent verification routines and ensure your AI-assisted outputs meet quality standards before use." },
    { key:"FOWR", label:"Future of Work Readiness",     advice:"Invest in continuous upskilling. Identify how AI is reshaping roles in your field and build transition-ready competencies." },
  ];

  for (const c of constructs) {
    const s = scores[c.key];
    if (s !== null && s < 3.5) {
      areas.push({ ...c, score: s });
    }
  }

  // Check scenario performance
  const incorrect = scenarioResults.filter(r => !r.correct);
  if (incorrect.length > 0) {
    const codes = [...new Set(incorrect.map(r => r.code.split("-")[0]))];
    for (const code of codes) {
      const existing = areas.find(a => a.key === code);
      if (!existing) {
        const c = constructs.find(x => x.key === code);
        if (c) areas.push({ ...c, score: scores[code], flaggedByScenario: true });
      }
    }
  }

  return areas.sort((a,b) => (a.score||5) - (b.score||5));
}

// ── COMPONENTS ────────────────────────────────────────────
function ScoreBar({ label, score, code }) {
  const pct = score ? ((score-1)/4)*100 : 0;
  const color = getLevelColor(score);
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:14, fontWeight:600, color: T.text }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:700, color }}>
          {score ? score.toFixed(2) : "–"} / 5.00 &nbsp;
          <span style={{ fontSize:11, fontWeight:500, opacity:.8 }}>({getLabel(score)})</span>
        </span>
      </div>
      <div style={{ background: T.border, borderRadius:8, height:10, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, background:color, height:"100%", borderRadius:8, transition:"width .6s" }} />
      </div>
    </div>
  );
}

function LikertScale({ value, onChange, small }) {
  const labels = ["Strongly\nDisagree","Disagree","Neutral","Agree","Strongly\nAgree"];
  return (
    <div style={{ display:"flex", gap: small ? 6 : 10, justifyContent:"center", flexWrap:"wrap" }}>
      {[1,2,3,4,5].map(v => (
        <button key={v} onClick={()=>onChange(v)} style={{
          width: small ? 52 : 62, padding: small?"8px 4px":"10px 4px",
          border: value===v ? `2px solid ${T.navy}` : `1.5px solid ${T.border}`,
          borderRadius:8, background: value===v ? T.navy : T.white,
          color: value===v ? T.white : T.text,
          fontFamily:"'DM Sans',sans-serif", fontSize:small?11:12,
          cursor:"pointer", transition:"all .15s", textAlign:"center",
          fontWeight: value===v ? 700 : 400
        }}>
          <div style={{ fontSize: small ? 16 : 18, fontWeight:700 }}>{v}</div>
          <div style={{ fontSize:10, lineHeight:1.2, marginTop:2, whiteSpace:"pre-line", color: value===v ? "rgba(255,255,255,.8)" : T.muted }}>{labels[v-1]}</div>
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ current, total, label }) {
  const pct = (current/total)*100;
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:12, color: T.muted, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:12, color: T.muted }}>{current}/{total}</span>
      </div>
      <div style={{ background: T.border, borderRadius:8, height:6 }}>
        <div style={{ width:`${pct}%`, background: T.gold, height:"100%", borderRadius:8, transition:"width .4s" }} />
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
export default function HACInstrument() {
  const [phase, setPhase] = useState("consent");
  const [consentGiven, setConsentGiven] = useState(false);
  const [demo, setDemo] = useState({ population:"", faculty:"", yearOrTenure:"", ageGroup:"", aiFrequency:"", primaryTool:"" });
  const [likert, setLikert] = useState({});
  const [likertPage, setLikertPage] = useState(0);
  const [overallConf, setOverallConf] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [scenIdx, setScenIdx] = useState(0);
  const [scenPhase, setScenPhase] = useState("confidence"); // confidence | answering | feedback
  const [scenarioConf, setScenarioConf] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [scenResults, setScenResults] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Likert items paged by construct group
  const GROUPS = ["DAL","ESI","CT","GAD","IEC","MV","AAQ","FOWR"];
  const PAGES = GROUPS.map(g => LIKERT_ITEMS.filter(i => i.group === g));
  const currentPage = PAGES[likertPage];
  const totalLikertItems = LIKERT_ITEMS.length;
  const answeredLikert = Object.keys(likert).length;

  const scores = useMemo(() => computeConstructScores(likert), [likert]);
  const focusAreas = useMemo(() => getFocusAreas(scores, scenResults), [scores, scenResults]);
  const ebsScore = scenResults.filter(r => ["ESI-S1","ESI-S2","ESI-S3","ESI-S4"].some(c => r.code.startsWith(c.split("-")[0]) && r.code.includes("S"))).reduce((a,r) => a + (r.correct?1:0), 0);
  const totalEbs = scenResults.filter(r => r.code.includes("S")).length;

  function startScenarios(population, confidence) {
    const s = getScenariosForTier(population, confidence);
    setScenarios(s);
    setScenIdx(0);
    setScenPhase("confidence");
    setScenarioConf(null);
    setSelectedOption(null);
    setPhase("scenarios");
  }

  function handleLikertAnswer(code, val) {
    setLikert(prev => ({...prev, [code]: val}));
  }

  function canAdvanceLikertPage() {
    return currentPage.every(item => likert[item.code] !== undefined);
  }

  function advanceLikertPage() {
    if (likertPage < PAGES.length - 1) {
      setLikertPage(p => p+1);
    } else {
      setPhase("confidence");
    }
  }

  function submitScenario() {
    const s = scenarios[scenIdx];
    const correct = selectedOption === s.answer;
    setScenResults(prev => [...prev, {
      code: s.code, title: s.title, confidenceRating: scenarioConf,
      selectedOption, correct, correctAnswer: s.answer
    }]);
    setScenPhase("feedback");
  }

  function nextScenario() {
    if (scenIdx < scenarios.length - 1) {
      setScenIdx(i=>i+1);
      setScenPhase("confidence");
      setScenarioConf(null);
      setSelectedOption(null);
    } else {
      setPhase("report");
    }
  }

  function buildEmailBody() {
    const pop = demo.population;
    const s = scores;
    let body = `HAC READINESS INSTRUMENT v5.3 — PERSONAL REPORT\n`;
    body += `Population: ${pop} | Faculty: ${demo.faculty || "–"}\n`;
    body += `Date: ${new Date().toLocaleDateString("en-ZA")}\n\n`;
    body += `--- CONSTRUCT SCORES ---\n`;
    const constructLabels = {DAL:"Digital AI Literacy",ESI:"Sceptical Intelligence",CT:"Critical Thinking",GAD:"Governance Awareness",IEC:"Institutional Conditions",AAQ:"AI Adoption Quality",FOWR:"Future of Work Readiness"};
    for (const [k,label] of Object.entries(constructLabels)) {
      body += `${label}: ${s[k]?.toFixed(2)||"–"}/5.00 (${getLabel(s[k])})\n`;
    }
    body += `\n--- SCENARIO PERFORMANCE ---\n`;
    body += `Scenarios completed: ${scenResults.length}\n`;
    body += `Correct responses: ${scenResults.filter(r=>r.correct).length}/${scenResults.length}\n`;
    if (totalEbs > 0) body += `Epistemic Behaviour Score (EBS): ${ebsScore}/${totalEbs}\n`;
    body += `\n--- KEY FOCUS AREAS ---\n`;
    for (const a of focusAreas.slice(0,3)) {
      body += `• ${a.label}: ${a.advice}\n`;
    }
    body += `\nGenerated by HAC Instrument v5.3 — University of Pretoria, Dept of Informatics, EMS`;
    return body;
  }

  function sendEmail() {
    const body = encodeURIComponent(buildEmailBody());
    const subject = encodeURIComponent("HAC Readiness Instrument v5.3 — My Results");
    window.open(`mailto:${emailInput}?subject=${subject}&body=${body}`);
    setEmailSent(true);
  }

  // ── PHASE RENDERS ─────────────────────────────────────

  // CONSENT
  if (phase === "consent") return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, fontWeight:700, letterSpacing:.3 }}>HAC Readiness Instrument</div>
          <div style={{ fontSize:12, opacity:.75, marginTop:2 }}>University of Pretoria · Dept of Informatics, EMS</div>
        </div>
        <div style={{ fontSize:12, opacity:.7, textAlign:"right" }}>v5.3 · Dr Sean Kruger</div>
      </div>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"48px 24px" }}>
        <div style={S.card}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ width:64, height:64, background: T.blueL, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28 }}>🤖</div>
            <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:28, fontWeight:700, color: T.navy, margin:0 }}>Human–AI Collaboration Readiness</h1>
            <p style={{ fontSize:15, color: T.muted, marginTop:8, maxWidth:520, margin:"8px auto 0" }}>
              This instrument measures your readiness to collaborate effectively and responsibly with AI tools in your academic or professional context at the University of Pretoria.
            </p>
          </div>

          <div style={{ background: T.blueL, border:`1px solid ${T.border}`, borderRadius:10, padding:20, marginBottom:24 }}>
            <div style={{ fontWeight:700, color: T.navy, marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
              <span>📋</span> Informed Consent
            </div>
            <p style={{ fontSize:14, color: T.text, lineHeight:1.65, margin:0 }}>
              Before proceeding, please read the full participant information and consent documentation. Your participation is voluntary and your responses will be used for research purposes in accordance with UP's ethics guidelines and POPIA.
            </p>
            <a href="https://docs.google.com/document/d/1zWRBsf4oJ6Uhw0bv3WRYsL4nsAjv-Lu3/edit?usp=sharing" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:12, color: T.blue, fontWeight:700, fontSize:14, textDecoration:"none", borderBottom:`2px solid ${T.gold}` }}>
              📄 Read the Participant Information & Consent Form →
            </a>
          </div>

          <div style={{ background:"#FFFBF0", border:`1px solid ${T.gold}`, borderRadius:10, padding:16, marginBottom:28, fontSize:13, color:"#5A4A00" }}>
            <strong>ℹ What this involves:</strong> The instrument takes approximately 20–30 minutes. It includes 41 attitude statements (Likert scale), a confidence calibration question, and a set of scenario-based questions tailored to your role. At the end you will receive a personalised readiness profile.
          </div>

          <label style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", marginBottom:24 }}>
            <input type="checkbox" checked={consentGiven} onChange={e=>setConsentGiven(e.target.checked)}
              style={{ marginTop:3, width:18, height:18, accentColor: T.navy, flexShrink:0 }} />
            <span style={{ fontSize:14, lineHeight:1.6, color: T.text }}>
              I have read the participant information sheet, I am 18 years of age or older, I consent to participate in this study, and I understand that I may withdraw at any time without consequence.
            </span>
          </label>

          <button disabled={!consentGiven} onClick={()=>setPhase("demographics")} style={{
            ...S.btnGold, width:"100%", padding:14, fontSize:16,
            opacity: consentGiven ? 1 : .4, cursor: consentGiven ? "pointer" : "not-allowed"
          }}>
            Begin Instrument →
          </button>
        </div>
      </div>
    </div>
  );

  // DEMOGRAPHICS
  if (phase === "demographics") {
    const canProceed = demo.population && demo.faculty && demo.aiFrequency;
    return (
      <div style={S.page}>
        <div style={S.header}>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, fontWeight:700 }}>HAC Readiness Instrument</div>
          <div style={{ ...S.badge, background:"rgba(255,255,255,.15)", color: T.white }}>Section 0 of 3 — Demographics</div>
        </div>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px" }}>
          <div style={S.card}>
            <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:22, color: T.navy, marginTop:0 }}>About You</h2>
            <p style={{ fontSize:14, color: T.muted, marginBottom:28 }}>Your demographic profile determines which scenario set you receive. All responses are confidential.</p>

            <div style={{ marginBottom:22 }}>
              <label style={S.label}>Role / Population *</label>
              {["Undergraduate Student","Postgraduate Student (Honours/Masters/PhD)","Academic Staff","Professional Staff"].map(opt => {
                const key = opt.startsWith("Undergraduate") ? "UG" : opt.startsWith("Postgraduate") ? "PG" : opt.startsWith("Academic") ? "ACADEMIC" : "PROFESSIONAL";
                return (
                  <label key={opt} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, border:`1.5px solid ${demo.population===key ? T.navy : T.border}`, marginBottom:8, cursor:"pointer", background: demo.population===key ? T.blueL : T.white }}>
                    <input type="radio" name="population" value={key} checked={demo.population===key} onChange={()=>setDemo(d=>({...d,population:key}))} style={{ accentColor: T.navy }} />
                    <span style={{ fontSize:14, fontWeight: demo.population===key ? 600 : 400 }}>{opt}</span>
                  </label>
                );
              })}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:22 }}>
              <div>
                <label style={S.label}>Faculty / Department *</label>
                <select value={demo.faculty} onChange={e=>setDemo(d=>({...d,faculty:e.target.value}))} style={{...S.input, background: T.white}}>
                  <option value="">Select...</option>
                  {["EMS (Economic & Management Sciences)","Engineering, Built Environment & IT","Education","Health Sciences","Humanities","Law","Natural & Agricultural Sciences","Theology & Religion","Veterinary Science","Other"].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>{demo.population?.includes("UG")||demo.population?.includes("PG") ? "Year of Study" : "Years at UP"}</label>
                <select value={demo.yearOrTenure} onChange={e=>setDemo(d=>({...d,yearOrTenure:e.target.value}))} style={{...S.input, background: T.white}}>
                  <option value="">Select...</option>
                  {(demo.population?.includes("ACADEMIC")||demo.population?.includes("PROFESSIONAL")
                    ? ["Less than 1 year","1–3 years","4–7 years","8–15 years","More than 15 years"]
                    : ["1st year","2nd year","3rd year","Honours","Masters","PhD","Other"]
                  ).map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Age Group</label>
                <select value={demo.ageGroup} onChange={e=>setDemo(d=>({...d,ageGroup:e.target.value}))} style={{...S.input, background: T.white}}>
                  <option value="">Select...</option>
                  {["Under 21","21–25","26–30","31–40","41–50","51–60","Over 60"].map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>AI Tool Usage Frequency *</label>
                <select value={demo.aiFrequency} onChange={e=>setDemo(d=>({...d,aiFrequency:e.target.value}))} style={{...S.input, background: T.white}}>
                  <option value="">Select...</option>
                  {["Never / I don't use AI tools","Rarely (a few times a year)","Occasionally (monthly)","Regularly (weekly)","Daily or near-daily"].map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:28 }}>
              <label style={S.label}>Primary AI Tool You Use Most Often</label>
              <select value={demo.primaryTool} onChange={e=>setDemo(d=>({...d,primaryTool:e.target.value}))} style={{...S.input, background: T.white}}>
                <option value="">Select...</option>
                {["ChatGPT (OpenAI)","Claude (Anthropic)","Gemini (Google)","Meta AI (WhatsApp)","Microsoft Copilot","Perplexity","My 24/7 Tutor (UP)","Other","I don't use AI tools"].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <button disabled={!canProceed} onClick={()=>setPhase("likert")} style={{
              ...S.btnGold, width:"100%", padding:14, fontSize:16,
              opacity: canProceed ? 1 : .4, cursor: canProceed ? "pointer" : "not-allowed"
            }}>
              Continue to Attitude Statements →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LIKERT
  if (phase === "likert") {
    const GROUP_INFO = {
      DAL:  { label:"Digital AI Literacy", icon:"🔍", desc:"How you select, apply, and validate AI tools" },
      ESI:  { label:"Sceptical Intelligence", icon:"🧐", desc:"How you evaluate and calibrate trust in AI outputs" },
      CT:   { label:"Critical Thinking", icon:"🧠", desc:"Your analytical reasoning approach" },
      GAD:  { label:"Governance & Accountability", icon:"⚖️", desc:"Your awareness of AI policies and decision responsibility" },
      IEC:  { label:"Institutional Enabling Conditions", icon:"🏛️", desc:"Your institution's AI support infrastructure" },
      MV:   { label:"General Adaptability", icon:"🌀", desc:"Your general flexibility (contextual measure)" },
      AAQ:  { label:"AI Adoption Quality", icon:"✅", desc:"Quality and compliance of your AI use" },
      FOWR: { label:"Future of Work Readiness", icon:"🚀", desc:"Your readiness for AI-transformed work environments" },
    };
    const group = currentPage[0].group;
    const info = GROUP_INFO[group];
    const pageAnswered = currentPage.filter(i => likert[i.code] !== undefined).length;
    const overallDone = PAGES.slice(0, likertPage).reduce((a,p)=>a+p.length,0) + pageAnswered;

    return (
      <div style={S.page}>
        <div style={S.header}>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, fontWeight:700 }}>Section 1 — Attitude Statements</div>
          <div style={{ fontSize:13, opacity:.8 }}>{overallDone}/{totalLikertItems} answered</div>
        </div>
        <div style={{ maxWidth:740, margin:"0 auto", padding:"32px 24px" }}>
          <ProgressBar current={overallDone} total={totalLikertItems} label={`Likert Battery Progress`} />

          <div style={{ ...S.card, marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
              <span style={{ fontSize:28 }}>{info.icon}</span>
              <div>
                <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, fontWeight:700, color: T.navy }}>{info.label}</div>
                <div style={{ fontSize:13, color: T.muted }}>{info.desc}</div>
              </div>
            </div>
          </div>

          <div style={{ ...S.card, marginBottom:16, padding:16 }}>
            <div style={{ fontSize:12, color: T.muted, textAlign:"center", fontStyle:"italic" }}>
              Scale: 1 = Strongly Disagree &nbsp;·&nbsp; 2 = Disagree &nbsp;·&nbsp; 3 = Neutral &nbsp;·&nbsp; 4 = Agree &nbsp;·&nbsp; 5 = Strongly Agree
            </div>
          </div>

          {currentPage.map((item, idx) => (
            <div key={item.code} style={{ ...S.card, marginBottom:16 }}>
              <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                <div style={{ minWidth:28, height:28, borderRadius:"50%", background: T.blueL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color: T.navy }}>{item.num}</div>
                <p style={{ fontSize:15, lineHeight:1.6, margin:0, color: T.text }}>{item.text}</p>
              </div>
              <LikertScale value={likert[item.code]} onChange={v=>handleLikertAnswer(item.code, v)} />
            </div>
          ))}

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
            <button onClick={()=>setLikertPage(p=>Math.max(0,p-1))} disabled={likertPage===0} style={{...S.btnOut, opacity:likertPage===0?.4:1}}>← Back</button>
            <span style={{ fontSize:13, color: T.muted }}>Page {likertPage+1} of {PAGES.length}</span>
            <button disabled={!canAdvanceLikertPage()} onClick={advanceLikertPage} style={{
              ...S.btnGold, opacity: canAdvanceLikertPage() ? 1 : .4, cursor: canAdvanceLikertPage() ? "pointer" : "not-allowed"
            }}>
              {likertPage < PAGES.length-1 ? "Next →" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CONFIDENCE CALIBRATION
  if (phase === "confidence") return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, fontWeight:700 }}>Section 2 — Confidence Calibration</div>
      </div>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"48px 24px" }}>
        <div style={S.card}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
            <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, color: T.navy, marginTop:0 }}>Before the Scenarios</h2>
            <p style={{ fontSize:15, color: T.muted, maxWidth:500, margin:"8px auto 0" }}>
              The following question will determine which scenario set you receive. Please answer honestly — there is no right or wrong answer here.
            </p>
          </div>

          <div style={{ background: T.blueL, borderRadius:10, padding:24, marginBottom:28 }}>
            <p style={{ fontSize:16, fontWeight:600, color: T.navy, textAlign:"center", lineHeight:1.5, margin:0 }}>
              Overall, how confident are you in your ability to use AI tools responsibly and effectively in your academic or professional work at UP?
            </p>
          </div>

          <LikertScale value={overallConf} onChange={setOverallConf} />

          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, paddingTop:4 }}>
            <span style={{ fontSize:12, color: T.muted }}>1 = Not at all confident</span>
            <span style={{ fontSize:12, color: T.muted }}>5 = Extremely confident</span>
          </div>

          {overallConf && (
            <div style={{ marginTop:20, padding:14, background:"#F0F8F0", borderRadius:8, border:`1px solid ${T.green}`, fontSize:14, color: T.green }}>
              {overallConf <= 2 ? "✓ You'll receive 2 foundational scenarios tailored to your role." :
               overallConf === 3 ? "✓ You'll receive 5 scenarios across key AI competency areas." :
               "✓ You'll receive the full set of 8 scenarios — all constructs covered."}
            </div>
          )}

          <button disabled={!overallConf} onClick={()=>startScenarios(demo.population, overallConf)} style={{
            ...S.btnGold, width:"100%", marginTop:24, padding:14, fontSize:16,
            opacity: overallConf ? 1 : .4, cursor: overallConf ? "pointer" : "not-allowed"
          }}>
            Begin Scenarios →
          </button>
        </div>
      </div>
    </div>
  );

  // SCENARIOS
  if (phase === "scenarios") {
    const s = scenarios[scenIdx];
    if (!s) { setPhase("report"); return null; }
    const { body, options } = parseScenario(s.text);

    return (
      <div style={S.page}>
        <div style={S.header}>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, fontWeight:700 }}>Section 3 — Scenarios</div>
          <div style={{ fontSize:13, opacity:.8 }}>Scenario {scenIdx+1} of {scenarios.length}</div>
        </div>
        <div style={{ maxWidth:740, margin:"0 auto", padding:"32px 24px" }}>
          <ProgressBar current={scenIdx} total={scenarios.length} label="Scenario Progress" />

          {/* CONFIDENCE PROMPT PHASE */}
          {scenPhase === "confidence" && (
            <div style={S.card}>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
                <span style={{ fontSize:24 }}>🤔</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color: T.muted, textTransform:"uppercase", letterSpacing:.8 }}>Confidence Check — Before You Proceed</div>
                  <div style={{ fontSize:13, color: T.muted, marginTop:2 }}>{s.code} · {s.title}</div>
                </div>
              </div>
              <p style={{ fontSize:16, fontWeight:600, color: T.navy, lineHeight:1.5 }}>{s.confidencePrompt}</p>
              <p style={{ fontSize:13, color: T.muted, marginBottom:20 }}>(1 = Not at all confident &nbsp;·&nbsp; 5 = Very confident)</p>
              <LikertScale value={scenarioConf} onChange={setScenarioConf} />
              <button disabled={!scenarioConf} onClick={()=>setScenPhase("answering")} style={{
                ...S.btnGold, width:"100%", marginTop:24, padding:12,
                opacity: scenarioConf ? 1 : .4, cursor: scenarioConf ? "pointer" : "not-allowed"
              }}>
                View Scenario →
              </button>
            </div>
          )}

          {/* ANSWERING PHASE */}
          {scenPhase === "answering" && (
            <div>
              <div style={S.card}>
                <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                  <span style={{ ...S.badge }}>{s.code}</span>
                  <span style={{ fontSize:14, fontWeight:700, color: T.navy }}>{s.title}</span>
                </div>
                <div style={{ fontSize:15, lineHeight:1.7, color: T.text, whiteSpace:"pre-line" }}>{body}</div>
              </div>
              <div style={{ marginTop:16 }}>
                {options.map(opt => (
                  <button key={opt.label} onClick={()=>setSelectedOption(opt.label)} style={{
                    display:"block", width:"100%", textAlign:"left", padding:"14px 18px",
                    marginBottom:10, border: selectedOption===opt.label ? `2px solid ${T.navy}` : `1.5px solid ${T.border}`,
                    borderRadius:10, background: selectedOption===opt.label ? T.blueL : T.white,
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.5,
                    color: T.text, transition:"all .15s"
                  }}>
                    <strong style={{ color: T.navy }}>{opt.label})</strong> {opt.text}
                  </button>
                ))}
              </div>
              <button disabled={!selectedOption} onClick={submitScenario} style={{
                ...S.btn, width:"100%", marginTop:8, padding:14,
                opacity: selectedOption ? 1 : .4, cursor: selectedOption ? "pointer" : "not-allowed"
              }}>
                Submit Answer →
              </button>
            </div>
          )}

          {/* FEEDBACK PHASE */}
          {scenPhase === "feedback" && (() => {
            const r = scenResults[scenResults.length-1];
            const isCorrect = r?.correct;
            return (
              <div>
                <div style={{ ...S.card, border:`2px solid ${isCorrect ? T.green : T.red}`, marginBottom:16 }}>
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16 }}>
                    <span style={{ fontSize:28 }}>{isCorrect ? "✅" : "❌"}</span>
                    <div>
                      <div style={{ fontSize:16, fontWeight:700, color: isCorrect ? T.green : T.red }}>
                        {isCorrect ? "Correct — well reasoned!" : `Incorrect — correct answer was Option ${s.answer}`}
                      </div>
                      <div style={{ fontSize:13, color: T.muted, marginTop:2 }}>
                        Your confidence: {scenarioConf}/5 · Your answer: Option {selectedOption}
                      </div>
                    </div>
                  </div>
                  <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:16, fontSize:14, lineHeight:1.65, whiteSpace:"pre-line", color: T.text }}>
                    {s.rationale}
                  </div>
                </div>
                <button onClick={nextScenario} style={{ ...S.btnGold, width:"100%", padding:14, fontSize:16 }}>
                  {scenIdx < scenarios.length-1 ? "Next Scenario →" : "View Your Report →"}
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // REPORT
  if (phase === "report") {
    const correct = scenResults.filter(r=>r.correct).length;
    const total = scenResults.length;
    const popLabel = {"UG":"Undergraduate Student","PG":"Postgraduate Student","ACADEMIC":"Academic Staff","PROFESSIONAL":"Professional Staff"}[demo.population] || demo.population;
    const overallMean = Object.values(scores).filter(v=>v!==null).reduce((a,b)=>a+b,0) / Object.values(scores).filter(v=>v!==null).length;

    const constructData = [
      { key:"DAL",  label:"Digital AI Literacy",          abbr:"DAL" },
      { key:"ESI",  label:"Sceptical Intelligence",        abbr:"ESI" },
      { key:"CT",   label:"Critical Thinking",             abbr:"CT"  },
      { key:"GAD",  label:"Governance Awareness",          abbr:"GAD" },
      { key:"IEC",  label:"Institutional Conditions",      abbr:"IEC" },
      { key:"AAQ",  label:"AI Adoption Quality",           abbr:"AAQ" },
      { key:"FOWR", label:"Future of Work Readiness",      abbr:"FOWR"},
    ];

    return (
      <div style={S.page}>
        <div style={S.header}>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, fontWeight:700 }}>HAC Readiness Report</div>
          <div style={{ fontSize:13, opacity:.8 }}>{new Date().toLocaleDateString("en-ZA")}</div>
        </div>
        <div style={{ maxWidth:780, margin:"0 auto", padding:"32px 24px" }}>

          {/* Hero summary */}
          <div style={{ ...S.card, background: T.navy, color: T.white, marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
              <div>
                <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontWeight:700 }}>Your Readiness Profile</div>
                <div style={{ opacity:.8, marginTop:4 }}>{popLabel} · {demo.faculty || "University of Pretoria"}</div>
              </div>
              <div style={{ textAlign:"center", background:"rgba(255,255,255,.12)", padding:"16px 24px", borderRadius:12 }}>
                <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:40, fontWeight:700, color: T.gold }}>{overallMean.toFixed(2)}</div>
                <div style={{ fontSize:12, opacity:.8, marginTop:2 }}>Overall Score / 5.00</div>
                <div style={{ fontSize:13, fontWeight:700, marginTop:4, color: T.gold }}>{getLabel(overallMean)}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:20 }}>
              <div style={{ background:"rgba(255,255,255,.1)", borderRadius:8, padding:"12px 16px", textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:700 }}>{total}</div>
                <div style={{ fontSize:12, opacity:.75 }}>Scenarios Completed</div>
              </div>
              <div style={{ background:"rgba(255,255,255,.1)", borderRadius:8, padding:"12px 16px", textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:700, color: T.gold }}>{correct}/{total}</div>
                <div style={{ fontSize:12, opacity:.75 }}>Correct Responses</div>
              </div>
              <div style={{ background:"rgba(255,255,255,.1)", borderRadius:8, padding:"12px 16px", textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:700 }}>{Math.round((correct/Math.max(total,1))*100)}%</div>
                <div style={{ fontSize:12, opacity:.75 }}>Accuracy Rate</div>
              </div>
            </div>
          </div>

          {/* Construct scores */}
          <div style={{ ...S.card, marginBottom:20 }}>
            <h3 style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, color: T.navy, marginTop:0 }}>Construct Readiness Scores</h3>
            <p style={{ fontSize:13, color: T.muted, marginBottom:20 }}>Scale: 1 = Strongly Disagree → 5 = Strongly Agree. Reverse-coded items adjusted.</p>
            {constructData.map(c => <ScoreBar key={c.key} label={c.label} score={scores[c.key]} code={c.key} />)}
          </div>

          {/* Scenario performance */}
          {scenResults.length > 0 && (
            <div style={{ ...S.card, marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, color: T.navy, marginTop:0 }}>Scenario Performance</h3>
              <div style={{ display:"grid", gap:10 }}>
                {scenResults.map((r, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:8, background: r.correct ? "#F0FFF5" : "#FFF5F5", border:`1px solid ${r.correct ? "#B8E6C8" : "#F5C6C6"}` }}>
                    <span style={{ fontSize:18 }}>{r.correct ? "✅" : "❌"}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color: T.text }}>{r.title}</div>
                      <div style={{ fontSize:12, color: T.muted }}>
                        {r.code} · Confidence: {r.confidenceRating}/5 · Answer: {r.selectedOption} 
                        {!r.correct && <span style={{ color: T.red }}> (Correct: {r.correctAnswer})</span>}
                      </div>
                    </div>
                    {(() => {
                      const gap = r.confidenceRating - (r.correct ? 5 : 0);
                      const gapLabel = gap > 0 ? `Overconfident (+${gap})` : gap < 0 ? `Underconfident (${gap})` : "Calibrated";
                      const gapColor = gap > 1 ? T.red : gap < -1 ? T.gold : T.green;
                      return <span style={{ fontSize:12, fontWeight:600, color: gapColor }}>{gapLabel}</span>;
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Focus areas */}
          {focusAreas.length > 0 && (
            <div style={{ ...S.card, marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, color: T.navy, marginTop:0 }}>🔭 Key Areas for Future Focus</h3>
              <p style={{ fontSize:13, color: T.muted, marginBottom:16 }}>Based on your scores and scenario performance, the following areas present the greatest development opportunity:</p>
              {focusAreas.slice(0,5).map((a, i) => (
                <div key={a.key} style={{ padding:"16px 20px", borderRadius:10, marginBottom:12, border:`1.5px solid ${T.border}`, background: T.gray }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background: T.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color: T.navy }}>{i+1}</div>
                    <div style={{ fontWeight:700, fontSize:15, color: T.navy }}>{a.label}</div>
                    {a.score && <span style={{ marginLeft:"auto", fontSize:13, fontWeight:600, color: getLevelColor(a.score) }}>{a.score?.toFixed(2)}/5.00</span>}
                  </div>
                  <p style={{ fontSize:14, lineHeight:1.65, color: T.text, margin:0 }}>{a.advice}</p>
                </div>
              ))}
            </div>
          )}

          {/* Policy anchors */}
          <div style={{ ...S.card, marginBottom:20, background:"#FFFBF0", border:`1px solid ${T.gold}` }}>
            <h3 style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, color: T.navy, marginTop:0 }}>📌 Key UP Policy References</h3>
            <div style={{ fontSize:13, lineHeight:1.8, color: T.text }}>
              {[
                ["§3.6","Always verify AI-generated information against credible sources before use"],
                ["§3.7","Use AI as a springboard, not a final authority — model critical thinking"],
                ["§3.8","Never input sensitive, personal, or confidential information into AI tools"],
                ["§3.9.1","All assignments must carry a Permitted AI statement (Red/Yellow/Green framework)"],
                ["§3.9.2","AI tool use must be acknowledged in academic and professional work"],
                ["§3.9.3","Turnitin AI scores are 'smoke alarms', not proof of misconduct — human oversight required"],
                ["POPIA","Processing personal data through external AI tools requires specific authorisation and consent"],
              ].map(([ref, desc]) => (
                <div key={ref} style={{ display:"flex", gap:12, marginBottom:6 }}>
                  <span style={{ fontWeight:700, color: T.navy, minWidth:60 }}>{ref}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email report */}
          <div style={{ ...S.card, marginBottom:20 }}>
            <h3 style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, color: T.navy, marginTop:0 }}>📧 Email This Report</h3>
            <p style={{ fontSize:14, color: T.muted, marginBottom:16 }}>Enter your email address to receive a summary of your results.</p>
            <div style={{ display:"flex", gap:10 }}>
              <input type="email" placeholder="your.email@up.ac.za" value={emailInput} onChange={e=>setEmailInput(e.target.value)}
                style={{ ...S.input, flex:1 }} />
              <button onClick={sendEmail} disabled={!emailInput || emailSent} style={{
                ...S.btnGold, whiteSpace:"nowrap", opacity: emailInput && !emailSent ? 1 : .5
              }}>
                {emailSent ? "✓ Opened" : "Send →"}
              </button>
            </div>
            {emailSent && <p style={{ fontSize:13, color: T.green, marginTop:8 }}>✓ Your email client has been opened with the report. Check your Drafts if it didn't send automatically.</p>}
          </div>

          {/* Restart */}
          <div style={{ textAlign:"center", padding:"16px 0 32px" }}>
            <button onClick={()=>{ setPhase("consent"); setLikert({}); setLikertPage(0); setScenResults([]); setOverallConf(null); setDemo({population:"",faculty:"",yearOrTenure:"",ageGroup:"",aiFrequency:"",primaryTool:""}); setEmailSent(false); setEmailInput(""); }} style={S.btnOut}>
              ↺ Restart Instrument
            </button>
            <p style={{ fontSize:12, color: T.muted, marginTop:12 }}>HAC Readiness Instrument v5.3 · Dr Sean Kruger · University of Pretoria, EMS</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
