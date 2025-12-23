import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface MedicineOption {
  id: string;
  name: string;
  description: string;
  price: number;
  dosage: string;
  features: string[];
  inStock: boolean;
  image: string;
}

// Treatment data - move this to a separate file if it gets large
const treatmentsData: Record<string, any> = {
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
  "testosterone-therapy": {
    name: "Testosterone Therapy",
    description: "Hormone replacement therapy for men with low testosterone levels.",
    overview: "Testosterone therapy can help restore hormone levels in men with clinically low testosterone.",
    benefits: [
      "Increased energy levels",
      "Improved muscle mass",
      "Enhanced mood and cognitive function",
    ],
    howItWorks: "Replenishes testosterone levels through various administration methods.",
    faqs: [
      {
        question: "What are the administration methods?",
        answer: "Injections, gels, patches, and pellets are common methods.",
      },
    ],
  },
  "erectile-dysfunction": {
    name: "Erectile Dysfunction",
    description: "Effective treatments for ED to improve sexual health and performance.",
    overview: "Comprehensive solutions for men experiencing erectile dysfunction.",
    benefits: [
      "Improved sexual performance",
      "Increased confidence",
      "Various treatment options",
    ],
    howItWorks: "Treatments work by increasing blood flow to the penis or addressing underlying causes.",
    faqs: [
      {
        question: "What treatments are available?",
        answer: "Oral medications, injections, and lifestyle changes are common approaches.",
      },
    ],
  },
  "oral-ed-treatments": {
    name: "Oral ED Treatments",
    description: "Effective oral medications for erectile dysfunction management.",
    overview: "Our clinic offers FDA-approved oral medications that help men achieve and maintain erections by increasing blood flow to the penis. These treatments are convenient, effective, and have helped thousands of men improve their sexual health.",
    benefits: [
      "Quick-acting formula (works in 30-60 minutes)",
      "Discreet and easy to use",
      "Proven effectiveness in clinical trials",
      "Multiple dosage options available"
    ],
    howItWorks: "Oral ED medications work by relaxing the smooth muscles in the blood vessels of the penis, allowing for increased blood flow when sexually aroused. This results in firmer and longer-lasting erections. The effects typically last between 4-36 hours depending on the specific medication and dosage.",
    faqs: [
      {
        question: "How quickly do oral ED medications work?",
        answer: "Most oral ED medications take effect within 30-60 minutes after ingestion, though this can vary based on factors like food intake and individual metabolism."
      },
      {
        question: "Are there any side effects?",
        answer: "Common side effects may include headache, flushing, upset stomach, or nasal congestion. These are usually mild and temporary. Our healthcare providers will review your medical history to ensure the safest option for you."
      },
      {
        question: "How do I know which oral ED medication is right for me?",
        answer: "During your consultation, our medical professionals will evaluate your health history and specific needs to recommend the most appropriate treatment option."
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

const medicineOptions: Record<string, MedicineOption[]> = {
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
  'testosterone-therapy': [
    {
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
      image: '/medicines/testo-cypionate.jpg'
    },
    {
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
      image: '/medicines/testo-gel.webp'
    }
  ],
  'erectile-dysfunction': [
    {
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
      image: '/medicines/sildenafil-50mg.jpg'
    },
    {
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
      image: '/medicines/tadalafil-20mg.jpg'
    }
  ],
  'oral-ed-treatments': [
    {
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
      image: '/medicines/sildenafil-100mg.jpg'
    },
    {
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
      image: '/medicines/tadalafil-daily.png'
    },
    {
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
      image: '/medicines/vardenafil-20mg.webp'
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

function MedicineCard({ medicine }: { medicine: MedicineOption }) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
        {medicine.image ? (
          <img 
            src={medicine.image} 
            alt={medicine.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-gray-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{medicine.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{medicine.description}</p>
            <p className="mt-2 text-sm text-gray-600">{medicine.dosage}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">${medicine.price}</p>
            {medicine.inStock ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            )}
          </div>
        </div>
        
        <ul className="mt-4 space-y-2">
          {medicine.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="ml-2 text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(treatmentsData).map((slug) => ({
    treatment: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ treatment: string }>;
}) {
  const { treatment } = await params;

  const treatmentData = treatmentsData[treatment];

  if (!treatmentData) {
    return {
      title: "Treatment Not Found",
      description: "The requested treatment could not be found.",
    };
  }

  return {
    title: `${treatmentData.name} | Your Clinic Name`,
    description: treatmentData.description,
    openGraph: {
      title: `${treatmentData.name} | Your Clinic Name`,
      description: treatmentData.description,
    },
  };
}

export default async function TreatmentPage({
  params,
}: {
  params: Promise<{ treatment: string }>;
}) {
  const { treatment } = await params;

  const treatmentData = treatmentsData[treatment];

  if (!treatmentData) {
    notFound();
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
            {treatmentData.name}
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-indigo-100">
            {treatmentData.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            {/* Overview */}
            <div className="prose prose-indigo lg:max-w-none mb-12">
              <h2>About {treatmentData.name}</h2>
              <p className="text-lg text-gray-600">{treatmentData.overview}</p>
            </div>

            {/* How It Works */}
            <div className="prose prose-indigo lg:max-w-none mb-12">
              <h3>How It Works</h3>
              <p className="text-gray-600">{treatmentData.howItWorks}</p>
            </div>

            {/* Benefits */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Benefits
              </h3>
              <ul className="space-y-4">
                {treatmentData.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-8">
                {treatmentData.faqs.map((faq: any, index: number) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <h4 className="text-lg font-medium text-gray-900">
                      {faq.question}
                    </h4>
                    <p className="mt-2 text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-12 lg:mt-0">
            <div className="bg-indigo-50 rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-medium text-gray-900">
                Ready to get started?
              </h3>
              <p className="mt-2 text-gray-600">
                Schedule a consultation with one of our specialists today to
                learn more about {treatmentData.name}.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Book a Consultation
                </Link>
              </div>
              <div className="mt-4 text-center">
                <a
                  href="tel:+15551234567"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Or call us at (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">  
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Available Medications
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Select your preferred medication and dosage
          </p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medicineOptions[treatment]?.length > 0 ? (
            medicineOptions[treatment].map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No medications currently available for this treatment.</p>
              <div className="mt-6">
                <a
                  href="/contact"
                  className="text-base font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Contact us for availability
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
