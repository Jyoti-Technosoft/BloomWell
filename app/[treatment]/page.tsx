import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

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
    </div>
  );
}
