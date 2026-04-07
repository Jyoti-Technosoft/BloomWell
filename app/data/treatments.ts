export interface MedicineOption {
  id: string;
  name: string;
  description: string;
  price: number;
  dosage: string;
  features: string[];
  inStock: boolean;
  image: string;
}

export interface TreatmentData {
  name: string;
  description: string;
  overview: string;
  benefits: string[];
  howItWorks: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const treatmentsData: Record<string, TreatmentData> = {
  semaglutide: {
    name: "Semaglutide",
    description: "Advanced GLP-1 medication for sustainable weight management and blood sugar control.",
    overview: "Semaglutide is an FDA-approved medication that helps with weight management by regulating appetite and food intake.",
    benefits: [
      "Significant weight loss results",
      "Improved blood sugar control",
      "Reduced risk of weight-related health issues",
      "Once-weekly injection",
    ],
    howItWorks: "Semaglutide works by mimicking the GLP-1 hormone, which helps regulate blood sugar levels and slows down digestion.",
    faqs: [
      {
        question: "How is Semaglutide administered?",
        answer: "Administered as a once-weekly subcutaneous injection.",
      },
    ],
  },
  tirzepatide: {
    name: "Tirzepatide",
    description: "Dual GIP and GLP-1 receptor agonist for significant weight loss.",
    overview: "Tirzepatide is a novel medication that combines the benefits of GIP and GLP-1 receptor agonism.",
    benefits: [
      "Dual-action formula",
      "Significant weight loss",
      "Improved A1C levels",
    ],
    howItWorks: "Works by activating both GIP and GLP-1 receptors to regulate blood sugar and reduce appetite.",
    faqs: [
      {
        question: "How does Tirzepatide work?",
        answer: "It activates both GIP and GLP-1 receptors for enhanced effects.",
      },
    ],
  },
  "womens-health": {
    name: "Women's Health",
    description: "Specialized treatments for women's overall health, fitness, and weight management.",
    overview: "Our women's health program focuses on comprehensive care including weight management, hormonal balance, metabolic health, and overall wellness with treatments specifically designed for women's unique health needs.",
    benefits: [
      "Specialized for women's health needs",
      "Hormonal balance support",
      "Weight management solutions",
      "Metabolic health improvement",
      "Personalized treatment plans"
    ],
    howItWorks: "Our women's health treatments work by addressing specific female health concerns including hormonal fluctuations, metabolic differences, and weight management challenges that are unique to women.",
    faqs: [
      {
        question: "Are these treatments safe for women?",
        answer: "Yes, all our women's health treatments are FDA-approved and prescribed based on your individual health assessment and needs."
      },
      {
        question: "Can I take these during my menstrual cycle?",
        answer: "Most treatments can be taken throughout your menstrual cycle, but your healthcare provider will give you specific guidance based on your treatment plan."
      },
      {
        question: "How quickly will I see results?",
        answer: "Results vary by treatment and individual, but most women begin to see improvements within 4-8 weeks of starting treatment."
      }
    ]
  },
  "injectable-treatments": {
    name: "Injectable Treatments",
    description: "Advanced injectable therapies for various health and wellness needs.",
    overview: "Our clinic offers a range of injectable treatments including vitamin therapy, peptide therapy, and specialized medications. These treatments are administered by our medical professionals to ensure safety and effectiveness.",
    benefits: [
      "Direct delivery for maximum absorption",
      "Customizable treatment plans",
      "Administered by medical professionals",
      "Can be combined with other therapies"
    ],
    howItWorks: "Injectable treatments deliver vitamins, minerals, and medications directly into the bloodstream or muscle tissue, bypassing the digestive system for maximum absorption. This method allows for higher concentrations of active ingredients to reach target areas more effectively than oral supplements.",
    faqs: [
      {
        question: "What conditions can injectable treatments help with?",
        answer: "Injectable therapies can support energy levels, immune function, weight management, hormone balance, and overall wellness. Specific treatments are available for various health concerns."
      },
      {
        question: "How often are treatments needed?",
        answer: "Frequency varies based on the specific treatment and individual needs. Some therapies may be administered weekly, while others might be monthly. Your provider will create a personalized schedule."
      },
      {
        question: "Are there any side effects?",
        answer: "Most patients experience minimal side effects, which may include mild soreness at the injection site. Our medical team will discuss all potential risks and benefits during your consultation."
      }
    ]
  }
};

export const medicineOptions: Record<string, MedicineOption[]> = {
  'semaglutide': [
    {
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
      image: '/medicines/semaglutide-1mg.jpg'
    },
    {
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
      image: '/medicines/semaglutide-2mg.jpg'
    }
  ],
  'tirzepatide': [
    {
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
      image: '/medicines/tirzepatide-5mg.jpg'
    },
    {
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
      image: '/medicines/tirzepatide-10mg.jpg'
    }
  ],
  'womens-health': [
    {
      id: 'semaglutide-tablets',
      name: 'Semaglutide Tablets 3mg',
      description: 'Oral semaglutide for weight management',
      price: 329,
      dosage: '30 tablets',
      features: [
        'Oral administration',
        'Once-daily dosing',
        'FDA-approved for weight loss',
        'Convenient tablet form'
      ],
      inStock: true,
      image: '/medicines/semaglutide-tablets.jpg'
    },
    {
      id: 'metformin-er',
      name: 'Metformin Extended Release',
      description: 'Weight management and metabolic support',
      price: 89,
      dosage: '60 tablets (500mg)',
      features: [
        'Extended release formula',
        'Supports weight loss',
        'Improves insulin sensitivity',
        'Minimal side effects'
      ],
      inStock: true,
      image: '/medicines/metformin-er.jpg'
    },
    {
      id: 'ozempic-injection',
      name: 'Ozempic Injection',
      description: 'Weekly semaglutide injection',
      price: 379,
      dosage: '4 x 0.5mg prefilled pens',
      features: [
        'Brand name semaglutide',
        'Weekly injection',
        'Proven weight loss results',
        'Includes supplies'
      ],
      inStock: true,
      image: '/medicines/ozempic-injection.jpg'
    }
  ],
  'injectable-treatments': [
    {
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
      image: '/medicines/b12-injection.avif'
    },
    {
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
      image: '/medicines/glutathione-injection.jpg'
    },
    {
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
      image: '/medicines/lipotropic-injection.webp'
    }
  ]
};
