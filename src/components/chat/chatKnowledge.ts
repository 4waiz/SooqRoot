import type { Language } from '../../types';

export interface ChatEntry {
  id: string;
  keywords: string[];
  keywordsAr: string[];
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
  followUps?: string[];
}

export const CHAT_KNOWLEDGE: ChatEntry[] = [
  {
    id: 'what-is-sooqroot',
    keywords: ['what', 'sooqroot', 'platform', 'about', 'do', 'is'],
    keywordsAr: ['ما', 'هو', 'سوق', 'روت', 'منصة', 'تعمل'],
    question: {
      en: 'What is SooqRoot?',
      ar: 'ما هو سوق روت؟',
    },
    answer: {
      en: 'SooqRoot is an Arabic-first, AI-assisted coordination platform for UAE agriculture. Buyers submit advance demand in plain language, our AI structures it, and we pool nearby farms to fulfill the order before harvest — so produce is grown to confirmed orders, not guessed-at markets.',
      ar: 'سوق روت منصة تنسيق زراعية ذكية تعتمد العربية أولاً للإمارات. يقدّم المشترون طلباتهم بلغة عادية، يُهيكلها الذكاء الاصطناعي، ثم نجمع المزارع القريبة لتلبية الطلب قبل الحصاد — حتى يُزرع المنتج وفق طلبات مؤكدة لا تخمينات.',
    },
    followUps: ['how-it-works', 'pricing', 'who-for'],
  },
  {
    id: 'how-it-works',
    keywords: ['how', 'work', 'works', 'process', 'flow', 'step'],
    keywordsAr: ['كيف', 'يعمل', 'الخطوات', 'العملية'],
    question: { en: 'How does it work?', ar: 'كيف تعمل المنصة؟' },
    answer: {
      en: 'Four steps. (1) A buyer types weekly needs in any style. (2) Our AI translates it into structured specs — crop, grade, quantity, packaging, delivery window. (3) The operator pools nearby farms and allocates the order before harvest. (4) Each farmer gets a clear harvest instruction with batch tracking from field to buyer.',
      ar: 'أربع خطوات. (1) يكتب المشتري احتياجه الأسبوعي بأي صيغة. (2) يُترجم الذكاء الاصطناعي ذلك إلى مواصفات مُهيكلة — محصول، جودة، كمية، تغليف، وقت تسليم. (3) يجمع المشغّل المزارع القريبة ويُخصّص الطلب قبل الحصاد. (4) يستلم كل مزارع تعليمات حصاد واضحة مع تتبع للدفعة من الحقل إلى المشتري.',
    },
    followUps: ['ai-scan', 'farmer-onboard'],
  },
  {
    id: 'who-for',
    keywords: ['who', 'for', 'use', 'using', 'customer', 'audience'],
    keywordsAr: ['لمن', 'الفئة', 'المستخدم'],
    question: { en: 'Who is SooqRoot for?', ar: 'لمن يصلح سوق روت؟' },
    answer: {
      en: 'Three sides. Buyers (hotels, restaurants, caterers, supermarkets, institutional kitchens). Farmers (small and mid producers of vegetables, fish, honey). Operators (logistics teams that allocate demand and supervise fulfillment).',
      ar: 'ثلاث فئات. المشترون (الفنادق، المطاعم، شركات التموين، الأسواق، المطابخ المؤسسية). المزارعون (المنتجون الصغار والمتوسطون للخضروات والأسماك والعسل). المشغّلون (فرق اللوجستيات التي تُخصّص الطلب وتُشرف على التنفيذ).',
    },
    followUps: ['farmer-onboard', 'buyer-signup'],
  },
  {
    id: 'pricing',
    keywords: ['price', 'pricing', 'cost', 'fee', 'subscription', 'pay', 'how much'],
    keywordsAr: ['سعر', 'تكلفة', 'رسوم', 'اشتراك', 'كم'],
    question: { en: 'How much does it cost?', ar: 'كم تكلفة الاستخدام؟' },
    answer: {
      en: 'Farmers join free during the pilot. Buyers pay a monthly subscription based on order volume, plus a small transaction fee on fulfilled orders. Enterprise integrations and advanced analytics are billed separately. Pricing for the UAE pilot starts at AED 0 for the first 60 days.',
      ar: 'المزارعون يشاركون مجاناً خلال المرحلة التجريبية. يدفع المشترون اشتراكاً شهرياً يعتمد على حجم الطلبات، إضافة إلى عمولة معاملات بسيطة على الطلبات المنفّذة. التكاملات المؤسسية والتحليلات المتقدّمة تُحاسب بشكل منفصل. تبدأ الأسعار في المرحلة التجريبية الإماراتية من 0 درهم لأول 60 يوماً.',
    },
    followUps: ['buyer-signup', 'who-for'],
  },
  {
    id: 'farmer-onboard',
    keywords: ['farmer', 'farm', 'join', 'onboard', 'register', 'sign up', 'small'],
    keywordsAr: ['مزارع', 'مزرعة', 'انضمام', 'تسجيل', 'صغير'],
    question: { en: 'How do farmers join?', ar: 'كيف ينضم المزارع؟' },
    answer: {
      en: 'A farmer registers their farm profile (location, crops, capacity, harvest windows) in 5 minutes. They then receive Arabic-first harvest instructions whenever a buyer order matches them. Small farms are pooled with neighbors so they can fill larger orders together.',
      ar: 'يسجّل المزارع ملف مزرعته (الموقع، المحاصيل، السعة، نوافذ الحصاد) خلال 5 دقائق. ثم يستلم تعليمات حصاد بالعربية كلما طابق طلب المشتري مزرعته. تُجمع المزارع الصغيرة مع جيرانها لتلبية الطلبات الكبيرة معاً.',
    },
    followUps: ['ai-scan', 'pooling'],
  },
  {
    id: 'buyer-signup',
    keywords: ['buyer', 'order', 'submit', 'place', 'request', 'demand'],
    keywordsAr: ['مشتري', 'طلب', 'تقديم', 'إرسال'],
    question: { en: 'How do buyers place orders?', ar: 'كيف يقدّم المشتري طلبه؟' },
    answer: {
      en: 'Just type. "Need 800kg Grade A tomatoes, 250kg cucumbers, 120 boxes lettuce for Tuesday morning." Our AI parses crop, grade, quantity, packaging, delivery and confidence — then sends it to allocation. You can edit the structured version before submitting.',
      ar: 'اكتب فقط. "نحتاج 800 كجم طماطم جودة أ، و250 كجم خيار، و120 صندوق خس لصباح الثلاثاء." يحلّل الذكاء الاصطناعي المحصول والجودة والكمية والتغليف والتسليم ودرجة الثقة — ثم يُرسل الطلب للتخصيص. يمكنك تعديل النسخة المُهيكلة قبل الإرسال.',
    },
    followUps: ['how-it-works', 'pricing'],
  },
  {
    id: 'pooling',
    keywords: ['pool', 'pooling', 'multiple', 'small', 'together', 'combine', 'aggregate'],
    keywordsAr: ['تجميع', 'مجمع', 'عدة', 'مزارع', 'صغيرة', 'دمج'],
    question: {
      en: 'What if one farm cannot fill the order alone?',
      ar: 'ماذا لو لم تستطع مزرعة واحدة تلبية الطلب وحدها؟',
    },
    answer: {
      en: "That's the core idea. SooqRoot splits a buyer order across the closest farms with matching capacity, grade, and harvest window. Each farm gets a partial commitment they can confidently deliver. The buyer still sees one order, one delivery, one invoice.",
      ar: 'هذه هي الفكرة الأساسية. يقسّم سوق روت طلب المشتري بين أقرب المزارع التي تطابق السعة والجودة ونافذة الحصاد. تستلم كل مزرعة التزاماً جزئياً تستطيع تنفيذه بثقة. يرى المشتري طلباً واحداً، وتسليماً واحداً، وفاتورة واحدة.',
    },
    followUps: ['traceability', 'farmer-onboard'],
  },
  {
    id: 'ai-scan',
    keywords: ['scan', 'ai', 'pest', 'disease', 'quality', 'photo', 'camera', 'image', 'vision'],
    keywordsAr: ['فحص', 'ذكاء', 'آفة', 'مرض', 'جودة', 'صورة', 'كاميرا', 'رؤية'],
    question: {
      en: 'What can the AI scan do?',
      ar: 'ما الذي يقوم به فحص الذكاء الاصطناعي؟',
    },
    answer: {
      en: 'Two scans for farmers. (1) Pest & Disease — snap a leaf or fruit and the model flags early signs of pests, fungal infection, or nutrient stress. (2) Quality & Grade — estimate grade, color uniformity, size consistency, and packing readiness against buyer specs. Both work from upload or live camera.',
      ar: 'فحصان للمزارع. (1) الآفات والأمراض — التقط صورة لورقة أو ثمرة ليُنبّهك النموذج إلى علامات مبكرة للآفات أو الإصابات الفطرية أو نقص العناصر. (2) الجودة والدرجة — تقدير الدرجة وانتظام اللون وتجانس الحجم والجاهزية للتعبئة وفق مواصفات المشتري. الفحصان يعملان بالرفع أو الكاميرا المباشرة.',
    },
    followUps: ['farmer-onboard', 'languages'],
  },
  {
    id: 'languages',
    keywords: ['language', 'arabic', 'english', 'bilingual', 'translate', 'rtl'],
    keywordsAr: ['لغة', 'عربية', 'إنجليزية', 'ثنائي', 'ترجمة'],
    question: {
      en: 'Which languages are supported?',
      ar: 'ما هي اللغات المدعومة؟',
    },
    answer: {
      en: 'Arabic and English, with full right-to-left layout for Arabic. Farmers receive harvest instructions in their preferred language; buyers can submit demand in either. The AI translator handles mixed Arabic-English text too.',
      ar: 'العربية والإنجليزية، مع دعم كامل للاتجاه من اليمين لليسار للعربية. يستلم المزارعون تعليمات الحصاد بلغتهم المفضّلة، ويستطيع المشترون تقديم الطلب بأي منهما. يتعامل المُترجم الذكي مع النصوص المختلطة عربية-إنجليزية أيضاً.',
    },
    followUps: ['who-for'],
  },
  {
    id: 'traceability',
    keywords: ['trace', 'traceability', 'track', 'origin', 'passport', 'batch', 'verify'],
    keywordsAr: ['تتبع', 'منشأ', 'جواز', 'دفعة', 'تحقق'],
    question: {
      en: 'Is produce traceable from farm to buyer?',
      ar: 'هل يمكن تتبع المنتج من المزرعة إلى المشتري؟',
    },
    answer: {
      en: "Yes. Every batch gets a passport with farm of origin, harvest date, grade, packaging, handler log, and delivery status. Buyers scan a code to verify origin and the full handling history — useful for HACCP and food-safety audits.",
      ar: 'نعم. كل دفعة تحصل على جواز يضم مزرعة المنشأ، تاريخ الحصاد، الجودة، التغليف، سجل التعامل، وحالة التسليم. يمسح المشتري رمزاً للتحقق من المنشأ وكامل سجل التعامل — مفيد لتدقيقات HACCP وسلامة الغذاء.',
    },
    followUps: ['ai-scan', 'pooling'],
  },
  {
    id: 'demo',
    keywords: ['demo', 'try', 'test', 'preview', 'pilot'],
    keywordsAr: ['تجربة', 'عرض', 'اختبار', 'تجريبي'],
    question: {
      en: 'Can I try a demo right now?',
      ar: 'هل يمكنني تجربة العرض الآن؟',
    },
    answer: {
      en: 'You\'re inside it. Use the role switcher in the header to enter as Buyer, Farmer, or Operator. All data is sample data; the AI calls are live. Hit the "Reset demo data" button anytime to start fresh.',
      ar: 'أنت بداخل العرض الآن. استخدم محوّل الأدوار في الترويسة للدخول كمشتري أو مزارع أو مشغّل. كل البيانات بيانات نموذجية، واستدعاءات الذكاء الاصطناعي حقيقية. اضغط زر "إعادة ضبط بيانات العرض" في أي وقت للبدء من جديد.',
    },
    followUps: ['how-it-works', 'pricing'],
  },
  {
    id: 'contact',
    keywords: ['contact', 'support', 'email', 'help', 'reach', 'team', 'human'],
    keywordsAr: ['تواصل', 'دعم', 'بريد', 'مساعدة', 'فريق'],
    question: { en: 'How do I contact the team?', ar: 'كيف أتواصل مع الفريق؟' },
    answer: {
      en: 'Email hello@sooqroot.ae or use this chat — questions left here go to a human within one business day. For pilot onboarding (UAE only right now), mention your business and produce category.',
      ar: 'راسلنا على hello@sooqroot.ae أو استخدم هذه المحادثة — تُحوَّل الأسئلة هنا إلى شخص خلال يوم عمل واحد. للانضمام إلى المرحلة التجريبية (الإمارات حالياً فقط)، اذكر اسم نشاطك وفئة المنتج.',
    },
  },
  {
    id: 'food-safety',
    keywords: ['safety', 'haccp', 'certification', 'compliance', 'standard', 'audit'],
    keywordsAr: ['سلامة', 'شهادة', 'امتثال', 'معايير', 'تدقيق'],
    question: {
      en: 'How do you handle food safety and certification?',
      ar: 'كيف تتعاملون مع سلامة الغذاء والشهادات؟',
    },
    answer: {
      en: 'Each farm profile lists active certifications (organic, GAP, ESMA-aligned). The batch passport carries that metadata into the buyer\'s receiving log, so audits trace back to the originating farm and harvest date in one click.',
      ar: 'كل ملف مزرعة يعرض الشهادات السارية (عضوي، GAP، متوافق مع ESMA). جواز الدفعة يحمل هذه البيانات إلى سجل استلام المشتري، حتى تعود التدقيقات إلى المزرعة الأصلية وتاريخ الحصاد بضغطة واحدة.',
    },
    followUps: ['traceability'],
  },
];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'do', 'does', 'i', 'you', 'we', 'me', 'my',
  'your', 'how', 'what', 'why', 'when', 'where', 'can', 'to', 'of', 'and',
  'or', 'in', 'on', 'for', 'it', 'this', 'that',
]);
const STOPWORDS_AR = new Set(['من', 'في', 'على', 'إلى', 'هل', 'هي', 'هو']);

export interface MatchResult {
  entry: ChatEntry;
  score: number;
}

export function findBestAnswer(query: string, language: Language): MatchResult | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;
  const tokens = normalized
    .split(/[\s,?!.؟،]+/)
    .filter(Boolean)
    .filter((t) => (language === 'ar' ? !STOPWORDS_AR.has(t) : !STOPWORDS.has(t)));

  let best: MatchResult | null = null;
  for (const entry of CHAT_KNOWLEDGE) {
    const keys = language === 'ar' ? entry.keywordsAr : entry.keywords;
    let score = 0;
    for (const t of tokens) {
      for (const k of keys) {
        const kl = k.toLowerCase();
        if (kl === t) score += 3;
        else if (kl.includes(t) || t.includes(kl)) score += 1.5;
      }
    }
    const q = entry.question[language].toLowerCase();
    for (const t of tokens) {
      if (t.length > 2 && q.includes(t)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  if (!best || best.score < 2) return null;
  return best;
}

export function getEntryById(id: string): ChatEntry | undefined {
  return CHAT_KNOWLEDGE.find((e) => e.id === id);
}

export function getStarterQuestions(_language: Language, count = 4): ChatEntry[] {
  const ids = ['what-is-sooqroot', 'how-it-works', 'ai-scan', 'pricing'];
  return ids
    .map((id) => getEntryById(id))
    .filter((e): e is ChatEntry => Boolean(e))
    .slice(0, count);
}
