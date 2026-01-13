'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ArrowPathIcon, HeartIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUser } from './context/UserContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    name: 'Personalized Women\'s Care',
    description: 'Tailored wellness plans designed specifically for women\'s unique health needs and lifestyle.',
    icon: HeartIcon,
  },
  {
    name: 'Women\'s Health Experts',
    description: 'Board-certified specialists with years of experience in women\'s health and wellness.',
    icon: UserIcon,
  },
  {
    name: 'Proven Women\'s Results',
    description: 'Thousands of successful women\'s wellness journeys with measurable health outcomes.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Safe & Effective',
    description: 'FDA-approved treatments specifically tested and proven safe for women.',
    icon: ShieldCheckIcon,
  },
];

export default function Home() {
  const { user } = useUser();
  const [physicians, setPhysicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch('/api/physicians?page=1&limit=3');
        const data = await response.json();
        setPhysicians(data.members || []);
      } catch (error) {
        console.error('Error fetching physicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhysicians();
  }, []);
  
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-indigo-50 via-white to-purple-50 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                  <HeartIcon className="w-4 h-4 mr-2" />
                  Trusted by 50,000+ Women
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6"
              >
                Transform Your <span className="text-primary-600">Women's Health</span> Journey
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Empowering women with personalized wellness solutions, from weight management to hormonal balance and overall vitality.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
              >
                <Link 
                  href="/treatments" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-semibold rounded-full text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Explore Treatments
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                {/* <Link 
                  href="/book-consultation" 
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-200 text-base font-semibold rounded-full text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300"
                >
                  Book Consultation
                </Link> */}
              </motion.div>
              
              {/* Inline Stats */}
              <motion.div 
                variants={fadeInUp}
                className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0"
              >
                {[
                  { number: '95%', text: 'Success Rate' },
                  { number: '50K+', text: 'Women Helped' }
                ].map((stat, index) => (
                  <div key={stat.text} className="text-center lg:text-left">
                    <p className="text-3xl font-bold text-indigo-600">{stat.number}</p>
                    <p className="text-sm text-gray-600">{stat.text}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 lg:h-125 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero-image.avif"
                  alt="Woman enjoying healthy lifestyle and wellness"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-purple-700/20" />
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -bottom-8 left-0 right-0">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { number: '15+', text: 'Years Experience', position: 'top-0 left-0' },
                    { number: '24/7', text: 'Women Support', position: 'top-0 right-0' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (index * 0.1) }}
                      className="bg-white p-4 rounded-xl shadow-lg text-center border border-gray-100"
                    >
                      <p className="text-2xl font-bold text-purple-600">{stat.number}</p>
                      <p className="text-sm text-gray-600">{stat.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Your women's health journey to better wellness in three simple steps
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-linear-to-r from-indigo-100 via-purple-100 to-pink-100"></div>
            
            {[
              {
                number: '01',
                title: 'Complete Your Health Profile',
                description: 'Answer questions about your women\'s health, wellness goals, and lifestyle in our secure portal.',
                icon: (
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              },
              {
                number: '02',
                title: 'Get Matched with Women\'s Health Experts',
                description: 'Our specialized physicians will review your case and create a personalized women\'s wellness plan.',
                icon: (
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                number: '03',
                title: 'Start Your Women\'s Wellness Journey',
                description: 'Receive personalized treatments, hormonal support, and ongoing care from our women\'s health team.',
                icon: (
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-400 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                <div className="relative bg-white p-8 rounded-2xl h-full flex flex-col items-center text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors duration-300">
                    <div className="absolute w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {step.number}
                    </div>
                    <div className="relative z-10">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              Why Choose BloomWell?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Our comprehensive approach to women's wellness combines medical expertise with personalized care for your unique health journey.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            >
              Meet Our Medical Team
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Experienced women's health professionals dedicated to your wellness and vitality journey
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              physicians.map((member: any, index: number) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48 bg-linear-to-br from-indigo-500 to-purple-600 overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                    <div className="relative h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                        <UserIcon className="h-12 w-12 text-indigo-600" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-indigo-600">Expert</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {member.specialties.slice(0, 2).map((specialty: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/physicians"
              className="inline-flex items-center px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All Physicians
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-16">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to transform your wellness?</span>
              <span className="block">Start your women's health journey today.</span>
            </h2>
            <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
              Join thousands of women who have achieved their health and wellness goals with our personalized approach.
            </p>
            <div className="mt-8">
              <Link
                href={user ? "/book-consultation" : "/auth/signup"}
                className="px-8 py-4 bg-white text-indigo-600 font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center"
              >
                {user ? "Book Consultation" : "Get Started Now"}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
