export type TranslationKey = keyof typeof en;

export const en = {
  appName: 'SooqRoot',
  appTagline: 'One order. Many farms. Confirmed before harvest.',
  appTaglineAlt: 'SooqRoot helps farmers sell smarter, not alone.',
  appDescription:
    'SooqRoot is an Arabic-first AI-assisted farm-to-market coordination platform that helps buyers place advance produce demand, helps farmers understand what the market needs, pools nearby farms when one farm cannot meet volume alone, and allocates orders before harvest.',
  appExplainer:
    'Most marketplaces wait until produce is already available. SooqRoot moves earlier. It captures demand before harvest, translates buyer requirements, pools farms, and creates confirmed harvest instructions.',

  // Navigation
  nav_landing: 'Overview',
  nav_buyer: 'Buyer',
  nav_farmer: 'Farmer',
  nav_operator: 'Operator',
  nav_validation: 'Field Validation',
  nav_impact: 'Impact',
  nav_business: 'Business Model',
  nav_pitch: 'Pitch Mode',

  // Header
  header_demoActive: 'Demo Data Active',
  header_lightMode: 'Light mode',
  header_darkMode: 'Dark mode',
  header_langSwitch: 'العربية',
  header_role: 'Role',
  role_buyer: 'Buyer',
  role_farmer: 'Farmer',
  role_operator: 'Operator',

  // Landing
  landing_heroEyebrow: 'UAE Agriculture Innovation',
  landing_heroSubtitle:
    'A pre-harvest demand allocation system that turns messy buyer requests into confirmed farm-level harvest commitments — before produce is picked.',
  landing_cta_buyer: 'Enter Demo as Buyer',
  landing_cta_farmer: 'Enter Demo as Farmer',
  landing_cta_operator: 'Enter Demo as Operator',
  landing_feature1_title: 'AI Demand Translator',
  landing_feature1_desc:
    'Turns free-text buyer requests into structured crop, grade, quantity, packaging, and delivery requirements.',
  landing_feature2_title: 'Pooled Supply Network',
  landing_feature2_desc:
    'Many small UAE farms act like one reliable commercial supplier for hotels, restaurants, supermarkets, and caterers.',
  landing_feature3_title: 'Pre-Harvest Allocation',
  landing_feature3_desc:
    'Transparent rule-based engine assigns orders before harvest, with risk scoring and substitute advice.',
  landing_why_title: 'Why SooqRoot',
  landing_why_item1: 'Captures demand before harvest',
  landing_why_item2: 'Reduces post-harvest waste risk',
  landing_why_item3: 'Improves market access for small farms',
  landing_why_item4: 'Delivers transparent fulfillment to buyers',

  // Buyer
  buyer_title: 'Buyer Dashboard',
  buyer_subtitle: 'Al Ain Hotel Group',
  buyer_demandInput_title: 'Weekly Demand Input',
  buyer_demandInput_hint:
    'Write your weekly produce needs in any style. The AI translator will structure it.',
  buyer_demandInput_placeholder:
    'e.g. Need 800kg Grade A tomatoes, 250kg cucumbers, and 120 boxes lettuce for Tuesday morning. Prefer Al Ain farms and 5kg boxes.',
  buyer_translateBtn: 'Translate Demand with AI',
  buyer_translating: 'Translating with AI…',
  buyer_submitBtn: 'Submit Demand to Allocation',
  buyer_interpretation: 'AI interpreted request',
  buyer_confidence: 'Confidence',
  buyer_reasoning: 'Reasoning',
  buyer_structuredTitle: 'Structured Demand',
  buyer_metrics_local: 'Local Sourcing',
  buyer_metrics_matched: 'Matched Demand',
  buyer_metrics_shortfall: 'Shortfall Risk',
  buyer_metrics_farms: 'Farms Involved',
  buyer_metrics_waste: 'Waste Risk Reduced',
  buyer_metrics_status: 'Fulfillment Status',
  buyer_orders_title: 'Your Orders',
  buyer_specCards_title: 'Buyer Spec Cards',
  buyer_specCards_hint:
    'Produce specifications communicated to farmers so harvest matches your kitchen and service needs.',
  buyer_handling: 'Handling notes',
  buyer_substitutes: 'Substitute options',
  buyer_noOrders: 'No orders yet. Translate your demand above to get started.',
  buyer_orderStatus: 'Order Status',

  // Columns
  col_crop: 'Crop',
  col_quantity: 'Quantity',
  col_grade: 'Grade',
  col_packaging: 'Packaging',
  col_delivery: 'Delivery Window',
  col_pref: 'Preference',
  col_buyer: 'Buyer',
  col_farm: 'Farm',
  col_distance: 'Distance',
  col_confidence: 'Confidence',
  col_available: 'Available',
  col_status: 'Status',
  col_actions: 'Actions',

  // Farmer
  farmer_title: 'Farmer Dashboard',
  farmer_selectFarm: 'Select Farm',
  farmer_profile_title: 'Farm Profile',
  farmer_profile_capacity: 'Available Capacity',
  farmer_profile_window: 'Available Harvest Window',
  farmer_supply_title: 'Declare Available Supply',
  farmer_supply_product: 'Product',
  farmer_supply_qty: 'Quantity',
  farmer_supply_harvest: 'Harvest date',
  farmer_supply_grade: 'Grade',
  farmer_supply_confidence: 'Confidence',
  farmer_supply_packaging: 'Packaging available',
  farmer_supply_notes: 'Notes',
  farmer_supply_submit: 'Add to Supply Pool',
  farmer_supply_added: 'Supply added to pool',
  farmer_copilot_title: 'Arabic Farmer Copilot',
  farmer_copilot_hint:
    'Ask the copilot about your harvest, pooling opportunities, packaging, or buyer demand.',
  farmer_copilot_placeholder: 'e.g. I have 300kg tomatoes next week.',
  farmer_copilot_send: 'Ask',
  farmer_copilot_suggestedAction: 'Suggested action',
  farmer_harvest_title: 'Your Harvest Instructions',
  farmer_harvest_empty: 'No harvest instructions yet. Once an allocation is run, your tasks will appear here.',
  farmer_quality_title: 'Quality & Packaging Guide',

  // Operator
  operator_title: 'Operator & Allocation Dashboard',
  operator_demandPool: 'Demand Pool',
  operator_supplyPool: 'Farm Supply Pool',
  operator_runAllocation: 'Run Allocation',
  operator_rerun: 'Re-run',
  operator_allocationResult: 'Allocation Result',
  operator_shortfall: 'Shortfall',
  operator_backups: 'Backup Farms',
  operator_substitutes: 'Substitute Advisor',
  operator_noSubstitutes: 'No substitute needed',
  operator_risk_title: 'AI Fulfillment Risk Score',
  operator_risk_reasons: 'Risk factors',
  operator_risk_mitigations: 'Suggested mitigation',
  operator_risk_low: 'Low',
  operator_risk_medium: 'Medium',
  operator_risk_high: 'High',
  operator_localTracker: 'Local Sourcing Tracker',
  operator_localPct: 'Local Sourcing %',
  operator_localFarms: 'Local Farms Supported',
  operator_matchedBefore: 'Matched Before Harvest',
  operator_wasteRisk: 'Waste Risk Reduced',
  operator_fillRate: 'Order Fill Rate',
  operator_batchPassport: 'Batch Passport',
  operator_openPassport: 'Open Passport',
  operator_advanceStatus: 'Advance Status',
  operator_allocatedLabel: 'Allocated',
  operator_notAllocated: 'Not yet allocated',

  // Batch passport
  passport_title: 'Batch Passport & Traceability',
  passport_batchId: 'Batch ID',
  passport_farm: 'Farm',
  passport_product: 'Product',
  passport_harvestDate: 'Harvest date',
  passport_grade: 'Grade',
  passport_packaging: 'Packaging',
  passport_buyer: 'Buyer',
  passport_status: 'Status',
  passport_origin: 'Origin',
  passport_originUAE: 'United Arab Emirates',
  passport_note: 'Traceability note',
  passport_noteText:
    'This batch is traceable from farm to buyer. Scan to verify origin, grade, handling history and delivery.',
  passport_scan: 'Scan to verify',
  passport_close: 'Close',

  // Statuses
  status_Request: 'Request',
  status_Structured: 'Structured',
  status_Allocated: 'Allocated',
  status_HarvestInstructed: 'Harvest instructed',
  status_Packed: 'Packed',
  status_PickedUp: 'Picked up',
  status_Delivered: 'Delivered',

  // Grades / confidence
  grade_A: 'Grade A',
  grade_B: 'Grade B',
  confidence_Confirmed: 'Confirmed',
  confidence_Probable: 'Probable',
  confidence_Stretch: 'Stretch',

  // Units
  unit_kg: 'kg',
  unit_boxes: 'boxes',
  unit_jars: 'jars',

  // Harvest instructions
  harvest_title: 'Harvest Instruction',
  harvest_prepare: 'Prepare',
  harvest_harvestDay: 'Harvest day',
  harvest_pickup: 'Pickup',
  harvest_buyer: 'Buyer',

  // Quality guide
  quality_veg_title: 'Vegetables',
  quality_veg_items: 'Sort by size|Remove damaged items|Use 5kg standard boxes|Label the batch|Keep shaded and cool',
  quality_fish_title: 'Fish & Aquaculture',
  quality_fish_items: 'Maintain cold chain|Use iced cooler boxes|Check freshness indicators|Avoid bruising|Deliver within 12 hours',
  quality_honey_title: 'Honey',
  quality_honey_items: 'Verify origin|Use labelled jars|Include batch and farm name|Keep sealed and dry|Include authenticity note',

  // Field validation
  validation_title: 'Field Validation: What Local Producers Told Us',
  validation_intro:
    'We spoke with vegetable, fish and honey producers across the UAE. Their concerns share a common pattern.',
  validation_veg_title: 'Vegetable Farmers',
  validation_veg_body:
    'Main pain: uncertain demand before harvest, risk of unsold produce, and unclear buyer requirements for grade, size, color, packaging and delivery timing.',
  validation_fish_title: 'Fish & Aquaculture Producers',
  validation_fish_body:
    'Main pain: freshness, quality handling, timing, and logistics. Reliability of the buyer relationship matters more than just finding any buyer.',
  validation_honey_title: 'Honey Producers',
  validation_honey_body:
    'Main pain: trust, branding, authenticity and traceability. Buyers need confidence in origin and product standards.',
  validation_summary_title: 'Common Pattern',
  validation_summary:
    'Across conversations with vegetable, fish, and honey producers, the same pattern appeared: local producers need confirmed demand, clearer buyer requirements, better aggregation, and stronger trust before the product reaches the market.',
  validation_connect_title: 'How SooqRoot Responds',
  validation_connect:
    'SooqRoot turns buyer demand into clear farm instructions, pools small producers into one reliable source, tracks fulfillment, and improves market access before harvest.',

  // Impact
  impact_title: 'Impact & Investor Dashboard',
  impact_subtitle: 'Early pilot numbers from simulated UAE operations',
  impact_farms: 'Farmers supported',
  impact_buyers: 'Buyer organizations',
  impact_matched: 'Produce matched',
  impact_fillRate: 'Order fill rate',
  impact_local: 'Local sourcing',
  impact_prevented: 'Shortfalls prevented',
  impact_waste: 'Waste risk reduced',
  impact_value: 'Order value (AED)',
  impact_confidence: 'Avg fulfillment confidence',

  // Business model
  business_title: 'Business Model',
  business_bmc: 'Business Model Canvas',
  business_segments: 'Customer Segments',
  business_segments_body:
    'Hotels, restaurants, supermarkets, catering companies, institutional kitchens, fresh produce distributors.',
  business_vp: 'Value Proposition',
  business_vp_body:
    'Confirmed produce before harvest, local sourcing, pooled supply, Arabic-first farmer copilot, traceable batches.',
  business_partners: 'Key Partners',
  business_partners_body:
    'UAE farms & cooperatives, logistics providers, food safety regulators, sustainability initiatives.',
  business_channels: 'Channels',
  business_channels_body:
    'Buyer dashboard, farmer mobile copilot, operator console, direct sales to large buyers.',
  business_revenue: 'Revenue Streams',
  business_revenue_body:
    'Buyer subscriptions · Transaction fee on fulfilled orders · Premium analytics · Enterprise dashboard integration · Premium supplier tools.',
  business_costs: 'Cost Structure',
  business_costs_body:
    'Cloud platform, operations team, logistics coordination, farmer onboarding & training.',
  business_social: 'Societal Benefits',
  business_social_body:
    'Stronger farmer incomes, food security, better buyer trust in local produce.',
  business_env: 'Environmental Benefits',
  business_env_body:
    'Lower post-harvest waste, reduced long-haul imports, better use of regional capacity.',

  // Pitch mode
  pitch_title: 'Pitch Mode',
  pitch_problem_title: 'Problem',
  pitch_problem_body:
    'Small UAE farms cannot reliably supply large buyers alone. Buyers default to imports. Producers face unpredictable demand, unclear specs, and avoidable post-harvest waste.',
  pitch_solution_title: 'Solution',
  pitch_solution_body:
    'SooqRoot pools nearby farms, translates buyer demand with AI, and allocates orders before harvest — so many farms fulfill one order reliably.',
  pitch_how_title: 'How it works',
  pitch_how_body:
    'Buyer submits demand → AI structures it → Operator allocates across farms → Farmers receive harvest instructions → Batches ship with traceable passports.',
  pitch_demo_title: 'Demo scenario',
  pitch_demo_body:
    'Al Ain Hotel Group needs 800kg tomatoes, 250kg cucumbers and 120 boxes lettuce for Tuesday. SooqRoot splits this across Al Akhdar, Desert Leaf and Oasis Fresh before harvest, flags a minor lettuce shortfall and advises spinach as a substitute.',
  pitch_whynow_title: 'Why now',
  pitch_whynow_body:
    'UAE food security strategy, growing local produce ambition, and the urgency of reducing post-harvest waste — combined with mature AI for text parsing and logistics coordination.',
  pitch_model_title: 'Business model',
  pitch_model_body:
    'Buyer subscriptions, transaction fees, premium analytics and enterprise integrations.',
  pitch_impact_title: 'Impact',
  pitch_impact_body:
    'Higher local sourcing, reduced shortfalls, reduced waste risk, better income predictability for farmers.',
  pitch_final_title: 'Final statement',
  pitch_final_body: 'SooqRoot helps farmers sell smarter, not alone.',

  // Shared
  close: 'Close',
  back: 'Back',
  saveChanges: 'Save changes',
  add: 'Add',
  reset: 'Reset demo data',
  resetConfirm: 'This will reset all demo demands and allocations. Continue?',
  empty_default: 'Nothing here yet.',
  footer_rights: '© 2026 SooqRoot — UAE Agriculture Innovation',
} as const;

export const ar: Record<keyof typeof en, string> = {
  appName: 'سوق روت',
  appTagline: 'طلب واحد. عدة مزارع. تأكيد قبل الحصاد.',
  appTaglineAlt: 'سوق روت يساعد المزارعين على البيع بذكاء، وليس بمفردهم.',
  appDescription:
    'سوق روت منصة تنسيق زراعية ذكية تعتمد العربية أولاً، تساعد المشترين على تقديم طلبات الإنتاج مسبقاً، وتُعين المزارعين على فهم احتياجات السوق، وتجمع المزارع القريبة عند عجز أي منها عن تلبية الكمية منفردة، ثم تُخصّص الطلبات قبل موعد الحصاد.',
  appExplainer:
    'معظم المنصات تنتظر حتى يتوفّر المنتج. سوق روت يتحرك مبكراً: يلتقط الطلب قبل الحصاد، ويُترجم متطلبات المشترين، ويجمع المزارع، وينتج تعليمات حصاد مؤكدة.',

  nav_landing: 'نظرة عامة',
  nav_buyer: 'المشتري',
  nav_farmer: 'المزارع',
  nav_operator: 'المشغّل',
  nav_validation: 'التحقق الميداني',
  nav_impact: 'الأثر',
  nav_business: 'نموذج العمل',
  nav_pitch: 'وضع التقديم',

  header_demoActive: 'بيانات عرض نشطة',
  header_lightMode: 'الوضع الفاتح',
  header_darkMode: 'الوضع الداكن',
  header_langSwitch: 'English',
  header_role: 'الدور',
  role_buyer: 'مشتري',
  role_farmer: 'مزارع',
  role_operator: 'مشغّل',

  landing_heroEyebrow: 'ابتكار زراعي إماراتي',
  landing_heroSubtitle:
    'نظام تخصيص طلبات ما قبل الحصاد يُحوّل طلبات المشترين غير المنظمة إلى التزامات حصاد مؤكدة على مستوى كل مزرعة — قبل قطف المنتج.',
  landing_cta_buyer: 'دخول العرض كمشتري',
  landing_cta_farmer: 'دخول العرض كمزارع',
  landing_cta_operator: 'دخول العرض كمشغّل',
  landing_feature1_title: 'مُترجم الطلب بالذكاء الاصطناعي',
  landing_feature1_desc:
    'يُحوّل طلبات المشترين النصية إلى متطلبات مُهيكلة: محصول، جودة، كمية، تغليف، وموعد تسليم.',
  landing_feature2_title: 'شبكة إمداد مجمّعة',
  landing_feature2_desc:
    'مزارع إماراتية صغيرة تعمل كمورّد تجاري موثوق واحد للفنادق والمطاعم والأسواق وشركات التموين.',
  landing_feature3_title: 'تخصيص ما قبل الحصاد',
  landing_feature3_desc:
    'محرّك قواعد شفاف يُوزّع الطلبات قبل الحصاد مع تقييم للمخاطر واقتراحات بدائل.',
  landing_why_title: 'لماذا سوق روت',
  landing_why_item1: 'يلتقط الطلب قبل الحصاد',
  landing_why_item2: 'يقلّل مخاطر الفاقد بعد الحصاد',
  landing_why_item3: 'يحسّن وصول المزارع الصغيرة إلى السوق',
  landing_why_item4: 'يوفّر تنفيذاً شفافاً للمشتري',

  buyer_title: 'لوحة المشتري',
  buyer_subtitle: 'مجموعة فنادق العين',
  buyer_demandInput_title: 'إدخال الطلب الأسبوعي',
  buyer_demandInput_hint:
    'اكتب احتياجك الأسبوعي من المنتجات بأي صيغة. سيقوم المُترجم الذكي بتنظيمه.',
  buyer_demandInput_placeholder:
    'مثال: نحتاج 800 كجم طماطم جودة أ، و250 كجم خيار، و120 صندوق خس لصباح الثلاثاء. نفضّل مزارع العين وصناديق 5 كجم.',
  buyer_translateBtn: 'ترجم الطلب بالذكاء الاصطناعي',
  buyer_translating: 'جارٍ الترجمة بالذكاء الاصطناعي…',
  buyer_submitBtn: 'إرسال الطلب إلى التخصيص',
  buyer_interpretation: 'تفسير الذكاء الاصطناعي',
  buyer_confidence: 'درجة الثقة',
  buyer_reasoning: 'التعليل',
  buyer_structuredTitle: 'الطلب المُهيكل',
  buyer_metrics_local: 'نسبة المصدر المحلي',
  buyer_metrics_matched: 'الطلب المُلبّى',
  buyer_metrics_shortfall: 'خطر النقص',
  buyer_metrics_farms: 'المزارع المشاركة',
  buyer_metrics_waste: 'تقليل مخاطر الفاقد',
  buyer_metrics_status: 'حالة التنفيذ',
  buyer_orders_title: 'طلباتك',
  buyer_specCards_title: 'بطاقات مواصفات المشتري',
  buyer_specCards_hint:
    'مواصفات المنتج التي تُبلَّغ للمزارعين ليطابق الحصاد احتياجات مطبخك وخدمتك.',
  buyer_handling: 'ملاحظات التعامل',
  buyer_substitutes: 'خيارات البديل',
  buyer_noOrders: 'لا توجد طلبات بعد. قم بترجمة طلبك أعلاه للبدء.',
  buyer_orderStatus: 'حالة الطلب',

  col_crop: 'المحصول',
  col_quantity: 'الكمية',
  col_grade: 'الجودة',
  col_packaging: 'التغليف',
  col_delivery: 'موعد التسليم',
  col_pref: 'التفضيل',
  col_buyer: 'المشتري',
  col_farm: 'المزرعة',
  col_distance: 'المسافة',
  col_confidence: 'درجة الثقة',
  col_available: 'المتاح',
  col_status: 'الحالة',
  col_actions: 'الإجراءات',

  farmer_title: 'لوحة المزارع',
  farmer_selectFarm: 'اختر المزرعة',
  farmer_profile_title: 'ملف المزرعة',
  farmer_profile_capacity: 'السعة المتاحة',
  farmer_profile_window: 'نافذة الحصاد المتاحة',
  farmer_supply_title: 'إعلان الإمداد المتاح',
  farmer_supply_product: 'المنتج',
  farmer_supply_qty: 'الكمية',
  farmer_supply_harvest: 'تاريخ الحصاد',
  farmer_supply_grade: 'الجودة',
  farmer_supply_confidence: 'درجة الثقة',
  farmer_supply_packaging: 'التغليف المتاح',
  farmer_supply_notes: 'ملاحظات',
  farmer_supply_submit: 'إضافة إلى مجمّع الإمداد',
  farmer_supply_added: 'تمت إضافة الإمداد',
  farmer_copilot_title: 'مساعد المزارع بالعربية',
  farmer_copilot_hint:
    'اسأل المساعد عن الحصاد، فرص التجميع، التغليف، أو طلبات المشترين.',
  farmer_copilot_placeholder: 'مثال: عندي 300 كجم طماطم الأسبوع القادم.',
  farmer_copilot_send: 'اسأل',
  farmer_copilot_suggestedAction: 'الإجراء المقترح',
  farmer_harvest_title: 'تعليمات الحصاد الخاصة بك',
  farmer_harvest_empty: 'لا توجد تعليمات حصاد بعد. بعد إجراء التخصيص ستظهر مهامك هنا.',
  farmer_quality_title: 'دليل الجودة والتغليف',

  operator_title: 'لوحة المشغّل والتخصيص',
  operator_demandPool: 'مجمّع الطلب',
  operator_supplyPool: 'مجمّع إمداد المزارع',
  operator_runAllocation: 'تشغيل التخصيص',
  operator_rerun: 'إعادة التشغيل',
  operator_allocationResult: 'نتيجة التخصيص',
  operator_shortfall: 'النقص',
  operator_backups: 'المزارع الاحتياطية',
  operator_substitutes: 'مستشار البدائل',
  operator_noSubstitutes: 'لا حاجة لبديل',
  operator_risk_title: 'درجة مخاطر التنفيذ بالذكاء الاصطناعي',
  operator_risk_reasons: 'عوامل الخطر',
  operator_risk_mitigations: 'إجراءات التخفيف المقترحة',
  operator_risk_low: 'منخفض',
  operator_risk_medium: 'متوسط',
  operator_risk_high: 'مرتفع',
  operator_localTracker: 'مؤشر المصدر المحلي',
  operator_localPct: 'نسبة المصدر المحلي',
  operator_localFarms: 'المزارع المحلية المدعومة',
  operator_matchedBefore: 'طلبات مُلبّاة قبل الحصاد',
  operator_wasteRisk: 'تقليل مخاطر الفاقد',
  operator_fillRate: 'نسبة تلبية الطلبات',
  operator_batchPassport: 'جواز الدفعة',
  operator_openPassport: 'فتح الجواز',
  operator_advanceStatus: 'تقدّم الحالة',
  operator_allocatedLabel: 'مُخصّص',
  operator_notAllocated: 'لم يُخصّص بعد',

  passport_title: 'جواز الدفعة والتتبع',
  passport_batchId: 'معرّف الدفعة',
  passport_farm: 'المزرعة',
  passport_product: 'المنتج',
  passport_harvestDate: 'تاريخ الحصاد',
  passport_grade: 'الجودة',
  passport_packaging: 'التغليف',
  passport_buyer: 'المشتري',
  passport_status: 'الحالة',
  passport_origin: 'المنشأ',
  passport_originUAE: 'الإمارات العربية المتحدة',
  passport_note: 'ملاحظة التتبّع',
  passport_noteText:
    'هذه الدفعة قابلة للتتبع من المزرعة إلى المشتري. امسح الرمز للتحقق من المنشأ والجودة وسجل التعامل والتسليم.',
  passport_scan: 'امسح للتحقق',
  passport_close: 'إغلاق',

  status_Request: 'طلب',
  status_Structured: 'مُهيكل',
  status_Allocated: 'مُخصّص',
  status_HarvestInstructed: 'تعليمات حصاد',
  status_Packed: 'مُعبّأ',
  status_PickedUp: 'تم الاستلام',
  status_Delivered: 'تم التسليم',

  grade_A: 'جودة أ',
  grade_B: 'جودة ب',
  confidence_Confirmed: 'مؤكّد',
  confidence_Probable: 'محتمل',
  confidence_Stretch: 'طموح',

  unit_kg: 'كجم',
  unit_boxes: 'صناديق',
  unit_jars: 'برطمانات',

  harvest_title: 'تعليمات الحصاد',
  harvest_prepare: 'جهّز',
  harvest_harvestDay: 'يوم الحصاد',
  harvest_pickup: 'الاستلام',
  harvest_buyer: 'المشتري',

  quality_veg_title: 'الخضروات',
  quality_veg_items: 'فرز حسب الحجم|إزالة التالف|استخدام صناديق 5 كجم قياسية|وسم الدفعة|حفظها في الظل وبدرجة حرارة معتدلة',
  quality_fish_title: 'الأسماك والاستزراع',
  quality_fish_items: 'الحفاظ على سلسلة التبريد|استخدام صناديق مبردة بالثلج|التحقق من مؤشرات الطزاجة|تجنّب الرضوض|التسليم خلال 12 ساعة',
  quality_honey_title: 'العسل',
  quality_honey_items: 'التحقق من المنشأ|استخدام برطمانات موسومة|تضمين اسم الدفعة والمزرعة|حفظ محكم وجاف|إرفاق شهادة أصالة',

  validation_title: 'التحقق الميداني: ماذا قال لنا المنتجون المحليون',
  validation_intro:
    'تحدثنا مع منتجي الخضروات والأسماك والعسل في الإمارات. لاحظنا نمطاً مشتركاً في المخاوف.',
  validation_veg_title: 'مزارعو الخضروات',
  validation_veg_body:
    'الألم الرئيسي: عدم وضوح الطلب قبل الحصاد، وخطر عدم بيع المنتج، وعدم وضوح متطلبات المشتري من حيث الجودة والحجم واللون والتغليف وموعد التسليم.',
  validation_fish_title: 'منتجو الأسماك والاستزراع',
  validation_fish_body:
    'الألم الرئيسي: الطزاجة، وجودة التعامل، والتوقيت، واللوجستيات. الموثوقية أهم من مجرد إيجاد مشتري.',
  validation_honey_title: 'منتجو العسل',
  validation_honey_body:
    'الألم الرئيسي: الثقة، والهوية التجارية، والأصالة، وإمكانية التتبّع. يحتاج المشترون إلى يقين بالمنشأ والمعايير.',
  validation_summary_title: 'النمط المشترك',
  validation_summary:
    'من خلال حواراتنا مع منتجي الخضروات والأسماك والعسل ظهر نمط واحد: المنتجون المحليون يحتاجون إلى طلب مؤكد، ومتطلبات أوضح من المشترين، وتجميع أفضل، وثقة أقوى قبل وصول المنتج إلى السوق.',
  validation_connect_title: 'كيف يستجيب سوق روت',
  validation_connect:
    'سوق روت يُحوّل طلب المشتري إلى تعليمات مزرعية واضحة، ويجمع المنتجين الصغار في مورّد موثوق واحد، ويتتبع التنفيذ، ويحسّن الوصول إلى السوق قبل الحصاد.',

  impact_title: 'لوحة الأثر والمستثمر',
  impact_subtitle: 'أرقام أولية من عمليات محاكاة في الإمارات',
  impact_farms: 'المزارعون المدعومون',
  impact_buyers: 'مؤسسات المشترين',
  impact_matched: 'المنتجات المُطابَقة',
  impact_fillRate: 'نسبة تلبية الطلبات',
  impact_local: 'المصدر المحلي',
  impact_prevented: 'نقص تم تفاديه',
  impact_waste: 'تقليل مخاطر الفاقد',
  impact_value: 'قيمة الطلبات (درهم)',
  impact_confidence: 'متوسط ثقة التنفيذ',

  business_title: 'نموذج العمل',
  business_bmc: 'لوحة نموذج العمل',
  business_segments: 'شرائح العملاء',
  business_segments_body:
    'الفنادق، المطاعم، الأسواق، شركات التموين، المطابخ المؤسسية، موزّعو المنتجات الطازجة.',
  business_vp: 'عرض القيمة',
  business_vp_body:
    'منتج مؤكد قبل الحصاد، مصدر محلي، إمداد مجمّع، مساعد مزارع بالعربية أولاً، دفعات قابلة للتتبع.',
  business_partners: 'الشركاء الرئيسيون',
  business_partners_body:
    'مزارع وتعاونيات إماراتية، مزوّدو اللوجستيات، جهات سلامة الغذاء، مبادرات الاستدامة.',
  business_channels: 'القنوات',
  business_channels_body:
    'لوحة المشتري، مساعد المزارع على الجوال، وحدة تحكم المشغّل، مبيعات مباشرة للمشترين الكبار.',
  business_revenue: 'مصادر الإيراد',
  business_revenue_body:
    'اشتراكات المشترين · عمولة معاملات على الطلبات المنفّذة · تحليلات متقدّمة · تكامل لوحات المؤسسات · أدوات مزوّد متميّزة.',
  business_costs: 'هيكل التكلفة',
  business_costs_body:
    'منصّة سحابية، فريق عمليات، تنسيق لوجستي، تأهيل وتدريب المزارعين.',
  business_social: 'الفوائد المجتمعية',
  business_social_body: 'دخل أقوى للمزارعين، أمن غذائي، ثقة أعلى للمشتري في المنتج المحلي.',
  business_env: 'الفوائد البيئية',
  business_env_body: 'تقليل الفاقد بعد الحصاد، تقليل الاستيراد بعيد المسافة، استثمار أفضل للطاقة الإنتاجية المحلية.',

  pitch_title: 'وضع التقديم',
  pitch_problem_title: 'المشكلة',
  pitch_problem_body:
    'المزارع الإماراتية الصغيرة لا تستطيع وحدها تزويد المشترين الكبار بثقة. المشترون يلجؤون للاستيراد. المنتجون يواجهون طلباً غير مستقر ومواصفات غير واضحة وفاقداً قابلاً للتفادي.',
  pitch_solution_title: 'الحل',
  pitch_solution_body:
    'سوق روت يجمع المزارع القريبة، ويُترجم طلب المشتري بالذكاء الاصطناعي، ويخصص الطلبات قبل الحصاد — فتُلبّي عدة مزارع طلباً واحداً بموثوقية.',
  pitch_how_title: 'آلية العمل',
  pitch_how_body:
    'المشتري يُقدّم طلبه ← الذكاء الاصطناعي يُهيكله ← المشغّل يُخصّصه بين المزارع ← المزارعون يستلمون تعليمات الحصاد ← الدفعات تُشحن بجواز قابل للتتبع.',
  pitch_demo_title: 'سيناريو العرض',
  pitch_demo_body:
    'مجموعة فنادق العين تحتاج 800 كجم طماطم و250 كجم خيار و120 صندوق خس للثلاثاء. يُوزّعها سوق روت قبل الحصاد بين الأخضر وورق الصحراء والواحة الطازجة، ويُحدد نقصاً طفيفاً في الخس ويقترح السبانخ كبديل.',
  pitch_whynow_title: 'لماذا الآن',
  pitch_whynow_body:
    'استراتيجية الأمن الغذائي الإماراتية، وتطلعات نمو المنتج المحلي، وضرورة تقليل الفاقد — مع نضج الذكاء الاصطناعي في معالجة النصوص وتنسيق اللوجستيات.',
  pitch_model_title: 'نموذج العمل',
  pitch_model_body:
    'اشتراكات مشترين، عمولات معاملات، تحليلات متقدّمة، وتكامل للمؤسسات.',
  pitch_impact_title: 'الأثر',
  pitch_impact_body:
    'مصدر محلي أعلى، نقص أقل، فاقد أقل، ثبات أعلى في دخل المزارع.',
  pitch_final_title: 'الخلاصة',
  pitch_final_body: 'سوق روت يساعد المزارعين على البيع بذكاء، وليس بمفردهم.',

  close: 'إغلاق',
  back: 'رجوع',
  saveChanges: 'حفظ التغييرات',
  add: 'إضافة',
  reset: 'إعادة ضبط بيانات العرض',
  resetConfirm: 'سيؤدي هذا إلى إعادة ضبط جميع الطلبات والتخصيصات التجريبية. هل تريد المتابعة؟',
  empty_default: 'لا توجد عناصر بعد.',
  footer_rights: '© 2026 سوق روت — ابتكار زراعي إماراتي',
};

export const dictionaries = { en, ar };
