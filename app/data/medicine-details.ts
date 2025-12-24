// app/data/medicine-details.ts

export interface MedicineDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  dosage: string;
  features: string[];
  inStock: boolean;
  image: string;
  category: string;
  overview: string;
  howItWorks: string;
  benefits: string[];
  sideEffects: string[];
  usageInstructions: string[];
  precautions: string[];
  shipping: string;
  support: string;
}

export const medicineDetailsData: Record<string, MedicineDetails> = {
  // Semaglutide medicines
  'semaglutide-1mg': {
    id: 'semaglutide-1mg',
    name: 'Semaglutide 1mg',
    description: 'Weekly injection for weight management',
    price: 299,
    dosage: '4 x 1mg prefilled pens',
    features: [
      'FDA-approved for weight loss',
      'Self-administered',
      'Includes needles and alcohol swabs'
    ],
    inStock: true,
    image: '/medicines/semaglutide-1mg.jpg',
    category: 'Weight Loss',
    overview: 'Semaglutide 1mg is an FDA-approved medication that helps with weight management by regulating appetite and food intake. This starting dose is perfect for beginners beginning their weight loss journey.',
    howItWorks: 'Semaglutide works by mimicking the GLP-1 hormone, which helps regulate blood sugar levels and slows down digestion. This makes you feel fuller longer and reduces appetite.',
    benefits: [
      'Significant weight loss results',
      'Improved blood sugar control',
      'Reduced risk of weight-related health issues',
      'Once-weekly injection',
      'Clinically proven effectiveness',
      'Medical supervision included'
    ],
    sideEffects: [
      'Nausea (usually temporary)',
      'Decreased appetite',
      'Possible diarrhea',
      'Mild stomach discomfort'
    ],
    usageInstructions: [
      'Administer once weekly on the same day',
      'Inject subcutaneously in abdomen, thigh, or upper arm',
      'Start with 1mg and gradually increase as directed',
      'Store in refrigerator until use'
    ],
    precautions: [
      'Not recommended for pregnant women',
      'Consult doctor if you have pancreatitis history',
      'Monitor for allergic reactions',
      'Keep out of reach of children'
    ],
    shipping: 'Discreet packaging with temperature-controlled shipping to ensure medication quality',
    support: '24/7 medical support, weekly check-ins, and access to our team of healthcare professionals'
  },
  'semaglutide-2mg': {
    id: 'semaglutide-2mg',
    name: 'Semaglutide 2.4mg',
    description: 'Maintenance dose for optimal results',
    price: 399,
    dosage: '4 x 2.4mg prefilled pens',
    features: [
      'Highest available dosage',
      'For continued weight management',
      'Includes needles and alcohol swabs'
    ],
    inStock: true,
    image: '/medicines/semaglutide-2mg.jpg',
    category: 'Weight Loss',
    overview: 'Semaglutide 2.4mg is the maintenance dose for patients who have completed the initial phase and need to continue their weight management journey with optimal results.',
    howItWorks: 'The higher dose provides enhanced GLP-1 receptor activation for greater appetite control and blood sugar regulation.',
    benefits: [
      'Maximum weight loss effectiveness',
      'Sustained appetite control',
      'Improved metabolic health',
      'Long-term weight management',
      'Reduced dosing frequency',
      'Comprehensive medical monitoring'
    ],
    sideEffects: [
      'Initial nausea (usually decreases)',
      'Reduced appetite',
      'Possible constipation',
      'Mild injection site reactions'
    ],
    usageInstructions: [
      'Administer once weekly',
      'Use after completing initial dose escalation',
      'Rotate injection sites',
      'Follow medical supervision guidelines'
    ],
    precautions: [
      'Medical supervision required',
      'Monitor for thyroid tumors',
      'Report severe gastrointestinal symptoms',
      'Regular medical check-ups needed'
    ],
    shipping: 'Temperature-controlled shipping with ice packs and insulated packaging',
    support: 'Enhanced medical monitoring, regular lab tests, and comprehensive care coordination'
  },

  // Tirzepatide medicines
  'tirzepatide-5mg': {
    id: 'tirzepatide-5mg',
    name: 'Tirzepatide 5mg',
    description: 'Dual-action weekly injection',
    price: 349,
    dosage: '4 x 5mg vials',
    features: [
      'For type 2 diabetes and weight loss',
      'Includes supplies',
      'Medical supervision included'
    ],
    inStock: true,
    image: '/medicines/tirzepatide-5mg.jpg',
    category: 'Weight Loss',
    overview: 'Tirzepatide 5mg is a revolutionary dual-action medication that combines GIP and GLP-1 receptor agonism for enhanced weight loss results.',
    howItWorks: 'Tirzepatide works by activating both GIP and GLP-1 receptors, providing a dual-action approach that regulates blood sugar levels and reduces appetite more effectively than single-agonist treatments.',
    benefits: [
      'Dual-action formula',
      'Significant weight loss',
      'Improved A1C levels',
      'Enhanced effectiveness vs single medications',
      'Weekly dosing convenience',
      'Comprehensive medical support'
    ],
    sideEffects: [
      'Nausea (usually decreases over time)',
      'Decreased appetite',
      'Possible vomiting',
      'Mild digestive discomfort'
    ],
    usageInstructions: [
      'Administer once weekly',
      'Inject subcutaneously as directed',
      'Follow gradual dose escalation plan',
      'Maintain consistent schedule'
    ],
    precautions: [
      'Medical supervision required',
      'Monitor blood sugar levels regularly',
      'Report severe side effects immediately',
      'Not for use in pregnancy'
    ],
    shipping: 'Temperature-controlled shipping with ice packs and insulated packaging',
    support: 'Dedicated medical team, regular monitoring, and comprehensive care coordination'
  },
  'tirzepatide-10mg': {
    id: 'tirzepatide-10mg',
    name: 'Tirzepatide 10mg',
    description: 'Higher dosage for better results',
    price: 449,
    dosage: '4 x 10mg vials',
    features: [
      'For type 2 diabetes and weight loss',
      'Enhanced effectiveness',
      'Medical supervision included'
    ],
    inStock: true,
    image: '/medicines/tirzepatide-10mg.jpg',
    category: 'Weight Loss',
    overview: 'Tirzepatide 10mg provides enhanced dual-action receptor activation for patients requiring maximum therapeutic effect.',
    howItWorks: 'Higher dose provides stronger GIP and GLP-1 receptor activation for superior glycemic control and weight management.',
    benefits: [
      'Maximum therapeutic effectiveness',
      'Superior weight loss results',
      'Optimal blood sugar control',
      'Enhanced metabolic benefits',
      'Reduced treatment resistance',
      'Intensive medical oversight'
    ],
    sideEffects: [
      'Initial gastrointestinal effects',
      'Appetite suppression',
      'Possible injection site reactions',
      'Mild fatigue initially'
    ],
    usageInstructions: [
      'Weekly subcutaneous injection',
      'Progress from lower dosage',
      'Strict medical supervision',
      'Regular monitoring required'
    ],
    precautions: [
      'Requires close medical monitoring',
      'Monitor for pancreatitis symptoms',
      'Regular thyroid function tests',
      'Not for patients with certain medical conditions'
    ],
    shipping: 'Premium temperature-controlled shipping with real-time tracking',
    support: 'Intensive medical supervision, bi-weekly check-ins, and comprehensive lab monitoring'
  },

  // Testosterone therapy medicines
  'testo-cypionate': {
    id: 'testo-cypionate',
    name: 'Testosterone Cypionate',
    description: 'Injectable testosterone for hormone therapy',
    price: 199,
    dosage: '10ml vial (200mg/ml)',
    features: [
      'For low testosterone levels',
      'Weekly injections',
      'Medical supervision required'
    ],
    inStock: true,
    image: '/medicines/testo-cypionate.jpg',
    category: 'Hormone Therapy',
    overview: 'Testosterone Cypionate is a long-acting testosterone ester used for hormone replacement therapy in men with clinically low testosterone levels.',
    howItWorks: 'Provides sustained release of testosterone into the bloodstream, restoring normal hormone levels and alleviating symptoms of low testosterone.',
    benefits: [
      'Increased energy levels',
      'Improved muscle mass and strength',
      'Enhanced mood and cognitive function',
      'Better bone density',
      'Improved libido and sexual function',
      'Reduced body fat'
    ],
    sideEffects: [
      'Injection site pain',
      'Acne or oily skin',
      'Increased red blood cell count',
      'Possible mood changes'
    ],
    usageInstructions: [
      'Administer intramuscular injection weekly',
      'Rotate injection sites',
      'Follow prescribed dosage schedule',
      'Regular blood monitoring required'
    ],
    precautions: [
      'Medical supervision essential',
      'Monitor prostate health',
      'Regular blood tests required',
      'Not for patients with certain cancers'
    ],
    shipping: 'Discreet packaging with medical-grade supplies',
    support: 'Regular hormone level monitoring, quarterly check-ups, and comprehensive medical oversight'
  },
  'testo-gel': {
    id: 'testo-gel',
    name: 'Testosterone Gel',
    description: 'Topical testosterone gel',
    price: 249,
    dosage: '30-day supply',
    features: [
      'Easy application',
      'Daily use',
      'Absorbs quickly'
    ],
    inStock: true,
    image: '/medicines/testo-gel.webp',
    category: 'Hormone Therapy',
    overview: 'Testosterone Gel is a convenient topical application method for testosterone replacement therapy, providing steady hormone levels through daily application.',
    howItWorks: 'Absorbs through the skin into the bloodstream, providing consistent testosterone levels throughout the day with minimal peaks and valleys.',
    benefits: [
      'Steady hormone levels',
      'No injections required',
      'Easy daily application',
      'Quick absorption',
      'Minimal skin irritation',
      'Discreet treatment option'
    ],
    sideEffects: [
      'Skin irritation at application site',
      'Possible transfer to others',
      'Mild acne',
      'Increased oil production'
    ],
    usageInstructions: [
      'Apply once daily to clean, dry skin',
      'Allow to dry completely before dressing',
      'Wash hands after application',
      'Avoid skin contact with others'
    ],
    precautions: [
      'Avoid skin-to-skin contact after application',
      'Keep away from children and women',
      'Regular hormone level monitoring',
      'Report any skin reactions'
    ],
    shipping: 'Discreet packaging with application supplies',
    support: 'Monthly hormone monitoring, skin assessments, and comprehensive medical guidance'
  },

  // Erectile dysfunction medicines
  'sildenafil-50mg': {
    id: 'sildenafil-50mg',
    name: 'Sildenafil 50mg',
    description: 'Generic Viagra for ED treatment',
    price: 99,
    dosage: '10 tablets',
    features: [
      '30-60 minutes before activity',
      'Lasts 4-6 hours',
      'Proven effectiveness'
    ],
    inStock: true,
    image: '/medicines/sildenafil-50mg.jpg',
    category: 'ED Treatment',
    overview: 'Sildenafil 50mg is a well-established ED medication that helps men achieve and maintain erections by increasing blood flow to the penis.',
    howItWorks: 'Sildenafil works by relaxing the smooth muscles in the blood vessels of the penis, allowing for increased blood flow when sexually aroused.',
    benefits: [
      'Proven effectiveness',
      'Fast-acting formula',
      'Affordable alternative to brand name',
      'Reliable results',
      'Easy to use',
      'Discreet packaging'
    ],
    sideEffects: [
      'Headache',
      'Flushing',
      'Upset stomach',
      'Nasal congestion',
      'Dizziness'
    ],
    usageInstructions: [
      'Take 30-60 minutes before sexual activity',
      'Can be taken with or without food',
      'Do not take more than once daily',
      'Sexual stimulation required'
    ],
    precautions: [
      'Not for use with nitrates',
      'Consult doctor with heart conditions',
      'Avoid alcohol with medication',
      'Seek immediate help for prolonged erection'
    ],
    shipping: 'Discreet packaging with no indication of contents',
    support: '24/7 medical consultation and discreet customer service'
  },
  'tadalafil-20mg': {
    id: 'tadalafil-20mg',
    name: 'Tadalafil 20mg',
    description: 'Daily or as-needed ED treatment',
    price: 149,
    dosage: '10 tablets',
    features: [
      'Up to 36-hour effectiveness',
      'Daily or as-needed use',
      'Lowest effective dose'
    ],
    inStock: true,
    image: '/medicines/tadalafil-20mg.jpg',
    category: 'ED Treatment',
    overview: 'Tadalafil 20mg offers extended duration of action, providing flexibility for spontaneous sexual activity with longer effectiveness window.',
    howItWorks: 'Relaxes blood vessels and increases blood flow to the penis, with effects lasting up to 36 hours for greater spontaneity.',
    benefits: [
      'Extended effectiveness (up to 36 hours)',
      'Greater spontaneity',
      'Can be taken daily or as needed',
      'Lower side effect profile',
      'Food does not affect absorption',
      'Improved confidence'
    ],
    sideEffects: [
      'Headache',
      'Back pain',
      'Muscle aches',
      'Flushing',
      'Indigestion'
    ],
    usageInstructions: [
      'Take 30 minutes before activity',
      'Can be taken daily at same time',
      'Effects last up to 36 hours',
      'Avoid grapefruit juice'
    ],
    precautions: [
      'Not with nitrates or alpha-blockers',
      'Monitor blood pressure',
      'Limit alcohol consumption',
      'Report vision changes immediately'
    ],
    shipping: 'Discreet packaging with privacy protection',
    support: 'Medical consultation available, dosage guidance, and safety monitoring'
  },

  // Oral ED treatments
  'sildenafil-100mg': {
    id: 'sildenafil-100mg',
    name: 'Sildenafil 100mg',
    description: 'High-strength ED medication',
    price: 129,
    dosage: '10 tablets',
    features: [
      'Maximum strength formula',
      'Works in 30-60 minutes',
      'Lasts 4-6 hours',
      'Discreet delivery'
    ],
    inStock: true,
    image: '/medicines/sildenafil-100mg.jpg',
    category: 'ED Treatment',
    overview: 'Sildenafil 100mg is the maximum strength formulation for men who require higher doses for optimal effectiveness.',
    howItWorks: 'Maximum dose provides enhanced blood flow to the penis for stronger, more reliable erections in men with more severe ED.',
    benefits: [
      'Maximum effectiveness',
      'Stronger erections',
      'Reliable for severe ED',
      'Proven track record',
      'Cost-effective high dose',
      'Fast acting'
    ],
    sideEffects: [
      'Increased likelihood of headache',
      'Facial flushing',
      'Nasal congestion',
      'Visual disturbances (rare)',
      'Digestive issues'
    ],
    usageInstructions: [
      'Take 30-60 minutes before activity',
      'Maximum one dose per day',
      'Take on empty stomach for best results',
      'Avoid high-fat meals'
    ],
    precautions: [
      'Not for first-time users',
      'Medical consultation required',
      'Monitor for severe side effects',
      'Avoid with certain medications'
    ],
    shipping: 'Discreet packaging with enhanced privacy',
    support: 'Enhanced medical monitoring, side effect management, and dosage optimization'
  },
  'tadalafil-daily': {
    id: 'tadalafil-daily',
    name: 'Tadalafil Daily 5mg',
    description: 'Low-dose daily treatment',
    price: 179,
    dosage: '30 tablets',
    features: [
      'Take one daily',
      'Always ready for spontaneity',
      'Steady medication level',
      '30-day supply'
    ],
    inStock: true,
    image: '/medicines/tadalafil-daily.png',
    category: 'ED Treatment',
    overview: 'Tadalafil Daily 5mg provides continuous ED treatment with a low daily dose, eliminating the need to plan for sexual activity.',
    howItWorks: 'Maintains consistent levels of tadalafil in the bloodstream, allowing for spontaneous erections whenever aroused without timing medication.',
    benefits: [
      'Always ready for activity',
      'No planning required',
      'Lower side effects than as-needed doses',
      'Natural sexual experience',
      'Improved relationship quality',
      'Consistent effectiveness'
    ],
    sideEffects: [
      'Mild headache initially',
      'Back pain (usually temporary)',
      'Indigestion',
      'Muscle aches'
    ],
    usageInstructions: [
      'Take one tablet daily at same time',
      'Can be taken with or without food',
      'Effects develop over several days',
      'Consistent timing important'
    ],
    precautions: [
      'Requires consistent daily use',
      'Monitor for persistent side effects',
      'Regular medical check-ups recommended',
      'Not for as-needed use'
    ],
    shipping: 'Monthly discreet delivery with automatic refill options',
    support: 'Monthly check-ins, effectiveness monitoring, and ongoing medical guidance'
  },
  'vardenafil-20mg': {
    id: 'vardenafil-20mg',
    name: 'Vardenafil 20mg',
    description: 'Fast-acting ED medication',
    price: 149,
    dosage: '10 tablets',
    features: [
      'Works in 25-60 minutes',
      'Effective for 4-5 hours',
      'Can be taken with food',
      'Discreet packaging'
    ],
    inStock: true,
    image: '/medicines/vardenafil-20mg.webp',
    category: 'ED Treatment',
    overview: 'Vardenafil 20mg is a fast-acting ED medication known for its quick onset and effectiveness, even when taken with food.',
    howItWorks: 'Potently inhibits PDE5 enzyme, allowing for increased blood flow and rapid onset of erectile function.',
    benefits: [
      'Rapid onset of action',
      'Works with moderate food intake',
      'Strong effectiveness',
      'Lower incidence of visual side effects',
      'Reliable performance',
      'Flexible dosing'
    ],
    sideEffects: [
      'Headache',
      'Flushing',
      'Nasal congestion',
      'Dizziness',
      'Mild nausea'
    ],
    usageInstructions: [
      'Take 25-60 minutes before activity',
      'Can be taken with food',
      'Maximum one dose per day',
      'Avoid excessive alcohol'
    ],
    precautions: [
      'Not with nitrates or certain heart medications',
      'Monitor blood pressure',
      'Report vision changes',
      'Medical history review required'
    ],
    shipping: 'Discreet packaging with rapid delivery options',
    support: 'Fast response medical team, effectiveness monitoring, and dosage guidance'
  },

  // Injectable treatments
  'b12-injection': {
    id: 'b12-injection',
    name: 'Vitamin B12 Injection',
    description: 'Energy and metabolism boost',
    price: 89,
    dosage: '1ml vial (1000mcg/ml)',
    features: [
      'Boosts energy levels',
      'Supports metabolism',
      'Monthly injection',
      'Administered by professional'
    ],
    inStock: true,
    image: '/medicines/b12-injection.avif',
    category: 'Wellness',
    overview: 'Vitamin B12 Injection provides a direct boost of this essential nutrient, supporting energy production, metabolism, and overall wellness.',
    howItWorks: 'Delivers high-dose B12 directly into the bloodstream for maximum absorption, bypassing digestive limitations.',
    benefits: [
      'Increased energy levels',
      'Improved metabolism',
      'Enhanced cognitive function',
      'Better mood',
      'Supports red blood cell formation',
      'Boosts immune system'
    ],
    sideEffects: [
      'Mild injection site discomfort',
      'Temporary redness',
      'Rare allergic reactions',
      'Mild dizziness'
    ],
    usageInstructions: [
      'Administered monthly by healthcare professional',
      'Injection site: upper arm or hip',
      'No special preparation needed',
      'Regular monitoring of B12 levels'
    ],
    precautions: [
      'Medical supervision required',
      'Monitor for allergic reactions',
      'Regular blood tests recommended',
      'Not for certain medical conditions'
    ],
    shipping: 'Professional medical supplies included',
    support: 'Monthly wellness check-ins, B12 level monitoring, and nutritional guidance'
  },
  'glutathione-injection': {
    id: 'glutathione-injection',
    name: 'Glutathione Injection',
    description: 'Powerful antioxidant therapy',
    price: 199,
    dosage: '10ml vial (200mg/ml)',
    features: [
      'Skin brightening',
      'Detoxification support',
      'Immune system boost',
      'Monthly treatment course'
    ],
    inStock: true,
    image: '/medicines/glutathione-injection.jpg',
    category: 'Wellness',
    overview: 'Glutathione Injection delivers the body\'s master antioxidant directly, supporting detoxification, skin health, and immune function.',
    howItWorks: 'Provides high concentrations of reduced glutathione to combat oxidative stress and support cellular detoxification processes.',
    benefits: [
      'Powerful antioxidant protection',
      'Skin brightening and anti-aging',
      'Enhanced detoxification',
      'Immune system support',
      'Improved cellular health',
      'Reduced inflammation'
    ],
    sideEffects: [
      'Mild injection site reactions',
      'Temporary skin lightening',
      'Rare allergic responses',
      'Mild nausea'
    ],
    usageInstructions: [
      'Monthly treatment course',
      'Administered by medical professional',
      'Series of injections recommended',
      'Monitor skin changes'
    ],
    precautions: [
      'Medical supervision essential',
      'Monitor for allergic reactions',
      'Not for pregnant/breastfeeding women',
      'Regular medical assessment required'
    ],
    shipping: 'Medical-grade supplies and cold chain shipping',
    support: 'Monthly skin assessments, antioxidant monitoring, and wellness consultations'
  },
  'lipotropic-injection': {
    id: 'lipotropic-injection',
    name: 'Lipotropic Injection',
    description: 'Fat metabolism support',
    price: 149,
    dosage: '10ml multi-dose vial',
    features: [
      'Supports fat metabolism',
      'Boosts energy',
      'Liver support',
      'Weekly injection'
    ],
    inStock: true,
    image: '/medicines/lipotropic-injection.webp',
    category: 'Wellness',
    overview: 'Lipotropic Injection contains essential nutrients that support fat metabolism, liver function, and energy production for weight management.',
    howItWorks: 'Combines B-vitamins, amino acids, and other compounds that enhance the body\'s ability to metabolize fat and remove toxins.',
    benefits: [
      'Enhanced fat metabolism',
      'Increased energy levels',
      'Liver detoxification support',
      'Improved weight loss results',
      'Better nutrient absorption',
      'Reduced fatigue'
    ],
    sideEffects: [
      'Mild injection site discomfort',
      'Temporary flushing',
      'Increased urination',
      'Mild nausea'
    ],
    usageInstructions: [
      'Weekly injections recommended',
      'Administered by healthcare provider',
      'Combined with diet and exercise',
      'Regular progress monitoring'
    ],
    precautions: [
      'Medical supervision required',
      'Monitor liver function',
      'Not for certain medical conditions',
      'Regular health assessments needed'
    ],
    shipping: 'Complete injection supplies included',
    support: 'Weekly progress tracking, metabolic monitoring, and nutritional counseling'
  }
};

// Function to determine treatment category from medicine ID
export const getTreatmentCategory = (medicineId: string): string => {
  const categoryMap: Record<string, string> = {
    // Semaglutide medicines
    'semaglutide-1mg': 'semaglutide',
    'semaglutide-2mg': 'semaglutide',
    
    // Tirzepatide medicines
    'tirzepatide-5mg': 'tirzepatide',
    'tirzepatide-10mg': 'tirzepatide',
    
    // Testosterone therapy medicines
    'testo-cypionate': 'testosterone-therapy',
    'testo-gel': 'testosterone-therapy',
    
    // Erectile dysfunction medicines
    'sildenafil-50mg': 'erectile-dysfunction',
    'tadalafil-20mg': 'erectile-dysfunction',
    
    // Oral ED treatments
    'sildenafil-100mg': 'oral-ed-treatments',
    'tadalafil-daily': 'oral-ed-treatments',
    'vardenafil-20mg': 'oral-ed-treatments',
    
    // Injectable treatments
    'b12-injection': 'injectable-treatments',
    'glutathione-injection': 'injectable-treatments',
    'lipotropic-injection': 'injectable-treatments'
  };
  
  return categoryMap[medicineId] || 'treatments';
};

// Function to get medicine details by ID
export const getMedicineDetails = (medicineId: string): MedicineDetails | null => {
  return medicineDetailsData[medicineId] || null;
};
