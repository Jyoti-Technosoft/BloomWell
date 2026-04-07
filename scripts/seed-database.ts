import { query } from "../app/lib/postgres";
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

const physicians = [
    {
        id: '1',
        name: 'Dr. Sarah Johnson',
        role: 'Medical Director',
        bio: 'Board-certified physician with over 15 years of experience in hormone therapy and weight management.',
        image: '/doctors/dr-sarah-johnson.jpg',
        education: 'MD, Harvard Medical School',
        experience: '15+ years',
        specialties: ['Hormone Therapy', 'Weight Management', 'Preventive Care'],
        rating: 5,
        review_count: 127,
        consultations_count: 342,
        initial_consultation: 150,
        available_time_slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '2',
        name: 'Dr. Michael Chen',
        role: 'Endocrinologist',
        bio: 'Specializes in hormonal imbalances and metabolic health with a focus on personalized treatment plans.',
        image: '/doctors/dr-michael-chen.jpg',
        education: 'MD, Johns Hopkins University',
        experience: '12+ years',
        specialties: ['Endocrinology', 'Diabetes Care', 'Metabolic Health'],
        rating: 5,
        reviewCount: 89,
        consultationCount: 256,
        initialConsultation: 150,
        available_time_slots: ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '1:30 PM', '2:30 PM', '3:30 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        role: 'Primary Care Physician',
        bio: 'Dedicated to providing comprehensive primary care with emphasis on preventive medicine and chronic disease management.',
        image: '/doctors/dr-emily-rodriguez.jpg',
        education: 'MD, Stanford University',
        experience: '10+ years',
        specialties: ['Primary Care', 'Preventive Medicine', 'Chronic Disease Management'],
        rating: 5,
        reviewCount: 156,
        consultationCount: 412,
        initialConsultation: 150,
        available_time_slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '4',
        name: 'Dr. James Wilson',
        role: 'Cardiologist',
        bio: 'Expert in cardiovascular health with extensive experience in preventive cardiology and heart disease management.',
        image: '/default-profile.jpg',
        education: 'MD, Mayo Clinic College of Medicine',
        experience: '18+ years',
        specialties: ['Cardiology', 'Preventive Cardiology', 'Heart Health'],
        rating: 4,
        reviewCount: 203,
        consultationCount: 523,
        initialConsultation: 150,
        available_time_slots: ['9:00 AM', '10:30 AM', '12:00 PM', '2:30 PM', '4:00 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '5',
        name: 'Dr. Lisa Thompson',
        role: 'Dermatologist',
        bio: 'Specializes in medical and cosmetic dermatology with a focus on skin health and anti-aging treatments.',
        image: '/default-profile.jpg',
        education: 'MD, Columbia University',
        experience: '8+ years',
        specialties: ['Dermatology', 'Cosmetic Procedures', 'Skin Health'],
        rating: 4,
        reviewCount: 78,
        consultationCount: 189,
        initialConsultation: 150,
        available_time_slots: ['8:00 AM', '9:30 AM', '11:30 AM', '1:30 PM', '3:30 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '6',
        name: 'Dr. Robert Martinez',
        role: 'Orthopedic Surgeon',
        bio: 'Expert in orthopedic surgery and sports medicine with extensive experience in joint replacement and trauma care.',
        image: '/default-profile.jpg',
        education: 'MD, UCLA School of Medicine',
        experience: '20+ years',
        specialties: ['Orthopedic Surgery', 'Sports Medicine', 'Joint Replacement'],
        rating: 4,
        reviewCount: 145,
        consultationCount: 387,
        initialConsultation: 150,
        available_time_slots: ['8:00 AM', '9:30 AM', '11:00 AM', '1:30 PM', '3:00 PM', '4:30 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '7',
        name: 'Dr. Amanda Foster',
        role: 'Pediatrician',
        bio: 'Dedicated to providing comprehensive pediatric care from infancy through adolescence with focus on developmental health.',
        image: '/default-profile.jpg',
        education: 'MD, Children\'s Hospital of Philadelphia',
        experience: '7+ years',
        specialties: ['Pediatrics', 'Developmental Health', 'Child Wellness'],
        rating: 4,
        reviewCount: 92,
        consultationCount: 267,
        initialConsultation: 150,
        available_time_slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '8',
        name: 'Dr. David Kim',
        role: 'Neurologist',
        bio: 'Specializes in neurological disorders with expertise in headache management, epilepsy, and neurodegenerative diseases.',
        image: '/default-profile.jpg',
        education: 'MD, Yale School of Medicine',
        experience: '14+ years',
        specialties: ['Neurology', 'Epilepsy', 'Headache Management'],
        rating: 4,
        reviewCount: 118,
        consultationCount: 298,
        initialConsultation: 150,
        available_time_slots: ['10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '9',
        name: 'Dr. Jennifer Brown',
        role: 'Psychiatrist',
        bio: 'Expert in mental health with focus on anxiety, depression, and mood disorders using evidence-based treatments.',
        image: '/default-profile.jpg',
        education: 'MD, NYU School of Medicine',
        experience: '11+ years',
        specialties: ['Psychiatry', 'Mental Health', 'Mood Disorders'],
        rating: 4,
        reviewCount: 167,
        consultationCount: 445,
        initialConsultation: 150,
        available_time_slots: ['11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '10',
        name: 'Dr. Christopher Lee',
        role: 'Gastroenterologist',
        bio: 'Specializes in digestive health with expertise in endoscopic procedures and inflammatory bowel disease management.',
        image: '/default-profile.jpg',
        education: 'MD, University of Pennsylvania',
        experience: '13+ years',
        specialties: ['Gastroenterology', 'Endoscopy', 'Digestive Health'],
        rating: 4,
        reviewCount: 134,
        consultationCount: 312,
        initialConsultation: 150,
        available_time_slots: ['8:30 AM', '10:00 AM', '11:30 AM', '1:30 PM', '3:00 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '11',
        name: 'Dr. Michelle Garcia',
        role: 'Rheumatologist',
        bio: 'Expert in autoimmune diseases and rheumatic conditions with focus on arthritis and systemic inflammatory disorders.',
        image: '/default-profile.jpg',
        education: 'MD, Northwestern University',
        experience: '9+ years',
        specialties: ['Rheumatology', 'Autoimmune Diseases', 'Arthritis'],
        rating: 4,
        reviewCount: 81,
        consultationCount: 198,
        initialConsultation: 150,
        available_time_slots: ['9:30 AM', '11:00 AM', '12:30 PM', '2:30 PM', '4:30 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    },
    {
        id: '12',
        name: 'Dr. Andrew Taylor',
        role: 'Pulmonologist',
        bio: 'Specializes in respiratory health with expertise in asthma, COPD, and sleep medicine.',
        image: '/default-profile.jpg',
        education: 'MD, Duke University School of Medicine',
        experience: '16+ years',
        specialties: ['Pulmonology', 'Sleep Medicine', 'Respiratory Health'],
        rating: 4,
        reviewCount: 109,
        consultationCount: 276,
        initialConsultation: 150,
        available_time_slots: ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'],
        available_dates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26', '2024-01-29', '2024-01-30', '2024-01-31']
    }
];

const medicineDetailsData = {
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
        category: 'weight-loss',
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
        category: 'weight-loss',
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
        category: 'weight-loss',
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
        category: 'weight-loss',
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
        category: 'injectable-therapy',
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
        category: 'injectable-therapy',
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
        category: 'injectable-therapy',
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
        image: '/medicines/semaglutide-tablets.jpg',
        category: 'womens-health',
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
        image: '/medicines/metformin-er.jpg',
        category: 'womens-health',
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
        category: 'womens-health',
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
    }
};

const treatmentsData = {
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
        category: "weight-loss",
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
        category: "weight-loss",
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
        ],
        category: "womens-health"
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
        ],
        category: "injectable-therapy",
    }
};

const dbData = {
    "users": [
        {
            "email": "charmi.jtdev@gmail.com",
            "password": "$2b$10$Qmfe.6SxzSs62JF3n9f/rejgu.XmvT4BP/KP/VGzy8FKWYD9DPB8i",
            "fullName": "Charmi Chauhan",
            "id": "1766490666414",
            "createdAt": "2025-12-23T11:51:06.414Z"
        },
        {
            "email": "mitali.jtdev@gmail.com",
            "password": "$2b$10$FyKxvwSdvytDV6wE6C3X3unT7pzaXf3PSW3KLPOX.4m9/NC/QzFn6",
            "fullName": "Mitali Rana",
            "id": "1766556512106",
            "createdAt": "2025-12-24T06:08:32.106Z"
        },
        {
            "email": "hetal.jtdev@gmail.com",
            "password": "$2b$10$oZt3aSroQ1UhoTT2zLRRS.V/jUqFgtFs44fxnrAeSaQgjeCEcx5Vi",
            "fullName": "Hetal Gandhi",
            "healthcarePurpose": "General wellness",
            "phoneNumber": "+1234567890",
            "dateOfBirth": "1990-01-01",
            "id": "1766710000000",
            "createdAt": "2025-12-25T11:00:00.000Z"
        }
    ],
    "contacts": [
        {
            "name": "Mitali Rana",
            "email": "mitali.jtdev@gmail.com",
            "message": "test",
            "id": "1766555136398",
            "createdAt": "2025-12-24T05:45:36.398Z"
        },
        {
            "name": "Aagam Shah",
            "email": "aagam.jtdev@gmail.com",
            "message": "test",
            "id": "1766555375256",
            "createdAt": "2025-12-24T05:49:35.256Z"
        }
    ],
    "consultations": [
        {
            "userId": "1766490666414",
            "doctorName": "Dr. Emily Rodriguez",
            "doctorSpecialty": "Internal Medicine",
            "date": "2025-12-25",
            "time": "9:00 AM",
            "reason": "test",
            "status": "pending",
            "id": "1766554783629",
            "createdAt": "2025-12-24T05:39:43.629Z"
        },
        {
            "userId": "1766490666414",
            "doctorName": "Dr. Sarah Johnson",
            "doctorSpecialty": "Endocrinology",
            "date": "2025-12-26",
            "time": "9:30 AM",
            "reason": "test",
            "status": "pending",
            "id": "1766554965020",
            "createdAt": "2025-12-24T05:42:45.020Z"
        },
        {
            "userId": "1766556512106",
            "doctorName": "Dr. Sarah Johnson",
            "doctorSpecialty": "Endocrinology",
            "date": "2025-12-26",
            "time": "10:00 AM",
            "reason": "test",
            "status": "pending",
            "id": "1766557374038",
            "createdAt": "2025-12-24T06:22:54.038Z"
        }
    ],
    "evaluations": [
        {
            "id": "1766568715963",
            "userId": "1766490666414",
            "medicineId": "semaglutide-2mg",
            "medicineName": "Semaglutide 2.4mg",
            "responses": {
                "birthday": "2025-12-24",
                "pregnant": "Yes",
                "currentlyUsingMedicines": "test",
                "hasDiabetes": "Yes",
                "seenDoctorLastTwoYears": "Yes",
                "medicalConditions": [
                    "High Blood Pressure"
                ],
                "height": "140",
                "weight": "60",
                "targetWeight": "50",
                "goals": [
                    "I want to lose fat without losing muscle"
                ],
                "allergies": "no",
                "currentMedications": "",
                "additionalInfo": "",
                "lastFourSSN": "5466"
            },
            "status": "pending_review",
            "createdAt": "2025-12-24T09:31:55.963Z",
            "updatedAt": "2025-12-24T09:31:55.963Z"
        },
        {
            "id": "1766570333867",
            "userId": "1766556512106",
            "medicineId": "semaglutide-2mg",
            "medicineName": "Semaglutide 2.4mg",
            "responses": {
                "birthday": "2026-01-11",
                "pregnant": "Yes",
                "currentlyUsingMedicines": "test",
                "hasDiabetes": "No",
                "seenDoctorLastTwoYears": "No",
                "medicalConditions": [
                    "High Lipids"
                ],
                "height": "70",
                "weight": "80",
                "targetWeight": "80",
                "goals": [
                    "I want to lose fat without losing muscle"
                ],
                "allergies": "test",
                "currentMedications": "",
                "additionalInfo": "test",
                "lastFourSSN": "4552"
            },
            "status": "pending_review",
            "createdAt": "2025-12-24T09:58:53.867Z",
            "updatedAt": "2025-12-24T09:58:53.867Z"
        }
    ],
    "reviews": [
        {
            "id": "review-1",
            "name": "John D.",
            "email": "john.doe@email.com",
            "rating": 5,
            "content": "Life-changing experience! The team was professional and caring throughout my weight loss journey.",
            "status": "approved",
            "createdAt": "2023-10-15T00:00:00.000Z"
        },
        {
            "id": "review-2",
            "name": "Sarah M.",
            "email": "sarah.miller@email.com",
            "rating": 5,
            "content": "The hormone therapy has made a significant difference in my energy levels and overall well-being. Highly recommend!",
            "status": "approved",
            "createdAt": "2023-09-28T00:00:00.000Z"
        },
        {
            "id": "review-3",
            "name": "Robert T.",
            "email": "robert.taylor@email.com",
            "rating": 4,
            "content": "Great service and knowledgeable staff. The treatment plan was tailored to my specific needs.",
            "status": "approved",
            "createdAt": "2023-09-10T00:00:00.000Z"
        },
        {
            "id": "review-4",
            "name": "Emily R.",
            "email": "emily.rogers@email.com",
            "rating": 5,
            "content": "I feel like a new person after starting treatment here. The staff is amazing and very supportive.",
            "status": "approved",
            "createdAt": "2023-08-22T00:00:00.000Z"
        }
    ]
};

async function seedDatabase() {
    try {
        console.log("Starting database seeding...");

        await seedPhysicians();
        await seedMedicines();
        await seedTreatments();
        await seedExistingData();

        console.log("Database seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

async function seedPhysicians() {
    console.log("Seeding physicians...");

    for (const physician of physicians) {
        await query(
            `
        INSERT INTO physicians (id, name, role, bio, image, education, experience, specialties, rating, review_count, consultations_count, initial_consultation, available_time_slots, available_dates)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          name = excluded.name,
          role = excluded.role,
          bio = excluded.bio,
          image = excluded.image,
          education = excluded.education,
          experience = excluded.experience,
          specialties = excluded.specialties,
          rating = excluded.rating,
          review_count = excluded.review_count,
          consultations_count = excluded.consultations_count,
          initial_consultation = excluded.initial_consultation,
          available_time_slots = excluded.available_time_slots,
          available_dates = excluded.available_dates,
          updated_at = CURRENT_TIMESTAMP
      `,
            [
                physician.id,
                physician.name,
                physician.role,
                physician.bio,
                physician.image,
                physician.education,
                physician.experience,
                physician.specialties ? physician.specialties.join(', ') : '',
                physician.rating || 0,
                physician.review_count || 0,
                physician.consultations_count || 0,
                physician.initial_consultation || 150,
                physician.available_time_slots ? JSON.stringify(physician.available_time_slots) : '',
                physician.available_dates ? JSON.stringify(physician.available_dates) : ''
            ]
        );
    }

    console.log(`Seeded ${physicians.length} physicians`);
}

async function seedMedicines() {
    console.log("Seeding medicines...");

    const medicineIds = Object.keys(medicineDetailsData) as Array<keyof typeof medicineDetailsData>;

    for (const medicineId of medicineIds) {
        const medicine = medicineDetailsData[medicineId];

        await query(
            `
        INSERT INTO medicines (id, name, description, price, dosage, in_stock, image, category, overview, how_it_works, shipping, support, benefits, side_effects)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          price = excluded.price,
          dosage = excluded.dosage,
          in_stock = excluded.in_stock,
          image = excluded.image,
          category = excluded.category,
          overview = excluded.overview,
          how_it_works = excluded.how_it_works,
          shipping = excluded.shipping,
          support = excluded.support,
          benefits = excluded.benefits,
          side_effects = excluded.side_effects,
          updated_at = CURRENT_TIMESTAMP
      `,
            [
                medicine.id,
                medicine.name,
                medicine.description,
                medicine.price || 0,
                medicine.dosage || '',
                medicine.inStock ? 1 : 0,
                medicine.image || '',
                medicine.category || '',
                medicine.overview || '',
                medicine.howItWorks || '',
                medicine.shipping || '',
                medicine.support || '',
                (medicine.benefits || []).join(', '),
                (medicine.sideEffects || []).join(', ')
            ]
        );
    }

    console.log(`Seeded ${medicineIds.length} medicines`);
}

async function seedTreatments() {
    console.log("Seeding treatments...");

    const treatmentIds = Object.keys(treatmentsData) as Array<keyof typeof treatmentsData>;

    for (const treatmentId of treatmentIds) {
        const treatment = treatmentsData[treatmentId];

        await query(
            `
        INSERT INTO treatments (id, name, description, overview, how_it_works, category, benefits, faqs)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          overview = excluded.overview,
          how_it_works = excluded.how_it_works,
          category = excluded.category,
          benefits = excluded.benefits,
          faqs = excluded.faqs,
          updated_at = CURRENT_TIMESTAMP
      `,
            [
                treatmentId,
                treatment.name,
                treatment.description,
                treatment.overview,
                treatment.howItWorks,
                treatment.category,
                treatment.benefits ? JSON.stringify(treatment.benefits) : '',
                treatment.faqs ? JSON.stringify(treatment.faqs) : ''
            ]
        );
    }

    console.log(`Seeded ${treatmentIds.length} treatments`);
}

async function seedExistingData() {
    console.log("Seeding existing data from db.json...");

    if (dbData.users && dbData.users.length > 0) {
        for (const user of dbData.users) {
            await query(
                `
          INSERT INTO users (id, email, password_hash, full_name, healthcare_purpose, phone_number, date_of_birth, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (email) DO UPDATE SET
            id = excluded.id,
            password_hash = excluded.password_hash,
            full_name = excluded.full_name,
            healthcare_purpose = excluded.healthcare_purpose,
            phone_number = excluded.phone_number,
            date_of_birth = excluded.date_of_birth,
            created_at = excluded.created_at
        `,
                [
                    user.id,
                    user.email,
                    user.password,
                    user.fullName,
                    user.healthcarePurpose || "Not specified",
                    user.phoneNumber || "",
                    user.dateOfBirth || "2000-01-01",
                    user.createdAt
                ]
            );
        }
        console.log(`Seeded ${dbData.users.length} users`);
    }

    if (dbData.contacts && dbData.contacts.length > 0) {
        for (const contact of dbData.contacts) {
            await query(
                `
          INSERT INTO contacts (id, name, email, message, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            message = excluded.message,
            created_at = excluded.created_at
        `,
                [
                    contact.id,
                    contact.name,
                    contact.email,
                    contact.message,
                    contact.createdAt
                ]
            );
        }
        console.log(`Seeded ${dbData.contacts.length} contacts`);
    }

    if (dbData.consultations && dbData.consultations.length > 0) {
        for (const consultation of dbData.consultations) {
            await query(
                `
          INSERT INTO consultations (id, user_id, doctor_name, doctor_specialty, consultation_date, consultation_time, reason, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            user_id = excluded.user_id,
            doctor_name = excluded.doctor_name,
            doctor_specialty = excluded.doctor_specialty,
            consultation_date = excluded.consultation_date,
            consultation_time = excluded.consultation_time,
            reason = excluded.reason,
            status = excluded.status,
            created_at = excluded.created_at
        `,
                [
                    consultation.id,
                    consultation.userId,
                    consultation.doctorName,
                    consultation.doctorSpecialty,
                    consultation.date,
                    consultation.time,
                    consultation.reason,
                    consultation.status,
                    consultation.createdAt
                ]
            );
        }
        console.log(`Seeded ${dbData.consultations.length} consultations`);
    }

    if (dbData.evaluations && dbData.evaluations.length > 0) {
        for (const evaluation of dbData.evaluations) {
            await query(
                `
          INSERT INTO evaluations (id, user_id, medicine_id, medicine_name, responses, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            user_id = excluded.user_id,
            medicine_id = excluded.medicine_id,
            medicine_name = excluded.medicine_name,
            responses = excluded.responses,
            status = excluded.status,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at
        `,
                [
                    evaluation.id,
                    evaluation.userId,
                    evaluation.medicineId,
                    evaluation.medicineName,
                    JSON.stringify(evaluation.responses),
                    evaluation.status,
                    evaluation.createdAt,
                    evaluation.updatedAt
                ]
            );
        }
        console.log(`Seeded ${dbData.evaluations.length} evaluations`);
    }

    if (dbData.reviews && dbData.reviews.length > 0) {
        for (const review of dbData.reviews) {
            await query(
                `
          INSERT INTO reviews (id, name, email, rating, content, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            rating = excluded.rating,
            content = excluded.content,
            status = excluded.status,
            created_at = excluded.created_at
        `,
                [
                    review.id,
                    review.name,
                    review.email,
                    review.rating,
                    review.content,
                    review.status,
                    review.createdAt
                ]
            );
        }
        console.log(`Seeded ${dbData.reviews.length} reviews`);
    }
}

seedDatabase();
