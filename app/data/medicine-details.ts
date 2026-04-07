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

  // Women's Health Medications
  'semaglutide-tablets': {
    id: 'semaglutide-tablets',
    name: 'Semaglutide Tablets 3mg',
    description: 'Oral semaglutide for weight management',
    price: 329,
    dosage: '30 tablets (3mg each)',
    features: [
      'Oral administration',
      'Once-daily dosing',
      'FDA-approved for weight loss',
      'Convenient tablet form',
      'No injections required'
    ],
    inStock: true,
    image: '/medicines/semaglutide-tablets-3mg.jpg',
    category: 'Women\'s Health',
    overview: 'Semaglutide Tablets offer the same powerful weight management benefits as injectable semaglutide in a convenient oral form. Perfect for women who prefer pills over injections.',
    howItWorks: 'Oral semaglutide works by activating GLP-1 receptors to regulate appetite and blood sugar levels, helping you feel fuller longer and reduce food intake.',
    benefits: [
      'Convenient oral administration',
      'Significant weight loss results',
      'Improved blood sugar control',
      'Reduced appetite and cravings',
      'Once-daily dosing schedule',
      'No injection discomfort'
    ],
    sideEffects: [
      'Nausea (usually temporary)',
      'Decreased appetite',
      'Possible digestive discomfort',
      'Mild stomach upset'
    ],
    usageInstructions: [
      'Take once daily with water',
      'Take 30 minutes before first meal',
      'Start with low dose and gradually increase',
      'Consistent daily timing recommended'
    ],
    precautions: [
      'Not recommended for pregnant women',
      'Consult doctor if you have kidney problems',
      'Monitor for digestive side effects',
      'Keep out of reach of children'
    ],
    shipping: 'Discreet packaging with moisture-protected materials to ensure tablet quality',
    support: '24/7 medical support, weekly check-ins, and nutritional guidance for optimal results'
  },
  'metformin-er': {
    id: 'metformin-er',
    name: 'Metformin Extended Release',
    description: 'Weight management and metabolic support',
    price: 89,
    dosage: '60 tablets (500mg)',
    features: [
      'Extended release formula',
      'Supports weight loss',
      'Improves insulin sensitivity',
      'Minimal side effects',
      'Well-established safety profile'
    ],
    inStock: true,
    image: '/medicines/metformin-500mg.png',
    category: 'Women\'s Health',
    overview: 'Metformin Extended Release is a trusted medication that supports weight management and metabolic health, particularly beneficial for women with insulin resistance or PCOS.',
    howItWorks: 'Metformin improves insulin sensitivity and reduces glucose production in the liver, helping to regulate blood sugar levels and support weight management.',
    benefits: [
      'Improved insulin sensitivity',
      'Supports weight management',
      'Reduces sugar cravings',
      'Helps regulate menstrual cycles',
      'Minimal gastrointestinal side effects',
      'Once-daily dosing'
    ],
    sideEffects: [
      'Mild digestive discomfort (usually temporary)',
      'Reduced appetite',
      'Possible vitamin B12 deficiency with long-term use',
      'Rare lactic acidosis risk'
    ],
    usageInstructions: [
      'Take once daily with evening meal',
      'Swallow whole, do not crush',
      'Stay hydrated throughout the day',
      'Regular monitoring of blood sugar levels'
    ],
    precautions: [
      'Not for patients with kidney disease',
      'Monitor for lactic acidosis symptoms',
      'Regular B12 level monitoring recommended',
      'Avoid excessive alcohol consumption'
    ],
    shipping: 'Standard packaging with moisture protection',
    support: 'Monthly metabolic monitoring, nutritional counseling, and regular health assessments'
  },
  'ozempic-injection': {
    id: 'ozempic-injection',
    name: 'Ozempic Injection',
    description: 'Weekly semaglutide injection',
    price: 379,
    dosage: '4 x 0.5mg prefilled pens',
    features: [
      'Brand name semaglutide',
      'Weekly injection',
      'Proven weight loss results',
      'Includes supplies',
      'Easy-to-use pen injector'
    ],
    inStock: true,
    image: '/medicines/ozempic-injection.jpg',
    category: 'Women\'s Health',
    overview: 'Ozempic is the brand name version of semaglutide, offering proven weight management and blood sugar control in a convenient weekly injection.',
    howItWorks: 'Ozempic activates GLP-1 receptors to regulate appetite, slow digestion, and improve blood sugar control, leading to sustainable weight loss.',
    benefits: [
      'Brand name quality and reliability',
      'Once-weekly injection convenience',
      'Significant weight loss results',
      'Improved glycemic control',
      'Easy-to-use pen delivery system',
      'Comprehensive medical supervision'
    ],
    sideEffects: [
      'Initial nausea (usually decreases)',
      'Decreased appetite',
      'Possible injection site reactions',
      'Mild digestive discomfort'
    ],
    usageInstructions: [
      'Administer once weekly on same day',
      'Inject subcutaneously in abdomen, thigh, or upper arm',
      'Start with 0.25mg and gradually increase',
      'Rotate injection sites to prevent irritation'
    ],
    precautions: [
      'Not recommended during pregnancy',
      'Monitor for thyroid tumor symptoms',
      'Report severe gastrointestinal issues',
      'Regular medical check-ups required'
    ],
    shipping: 'Temperature-controlled shipping with ice packs and insulated packaging',
    support: 'Weekly progress monitoring, dose adjustment guidance, and comprehensive medical oversight'
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

    // Women's Health Medications
    'semaglutide-tablets': 'womens-health',
    'metformin-er': 'womens-health',
    'ozempic-injection': 'womens-health',

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
