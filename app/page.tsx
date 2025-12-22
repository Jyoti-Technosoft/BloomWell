'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="text-center"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              <span className="block text-indigo-600">Personalized</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 h-[100px]">
                Weight Management
              </span>
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Get affordable, personalized care from the comfort of your home. Our board-certified doctors make weight management accessible to every woman.
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-4 bg-white text-indigo-600 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
              How It Works
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Start your journey in 3 simple steps
            </p>
          </motion.div>

          <div className="mt-16 grid gap-10 md:grid-cols-3 lg:gap-10">
            {[
              {
                icon: '📝',
                title: 'Complete Your Profile',
                description: 'Share your health history and weight loss goals in our secure online platform.'
              },
              {
                icon: '👩‍⚕️',
                title: 'Meet Your Provider',
                description: 'Connect with a board-certified healthcare provider via secure video consultation.'
              },
              {
                icon: '💊',
                title: 'Receive Your Plan',
                description: 'Get a personalized treatment plan with FDA-approved medications delivered to your door.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={item}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl mb-6 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  <span className="text-indigo-600">0{index + 1}.</span> {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to transform your life?</span>
            <span className="block">Start your journey today.</span>
          </h2>
          <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
            Join thousands of women who have achieved their weight loss goals with our personalized approach.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-indigo-600 font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center"
            >
              Get Started Now
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
