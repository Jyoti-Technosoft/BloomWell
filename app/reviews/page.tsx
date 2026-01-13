'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    id: 1,
    question: 'What treatments do you offer?',
    answer:
      'We offer a range of treatments including weight management, hormone replacement therapy, and specialized treatments for various conditions. Visit our Treatments page for more details.',
  },
  {
    id: 2,
    question: 'How do I know if I need hormone therapy?',
    answer:
      'Common signs include fatigue, weight gain, low libido, and mood changes. We recommend scheduling a consultation for a full evaluation.',
  },
  {
    id: 3,
    question: 'Are the treatments covered by insurance?',
    answer:
      'Coverage varies by insurance provider and plan. Our team will work with you to understand your benefits and provide transparent pricing.',
  },
  {
    id: 4,
    question: 'How soon will I see results?',
    answer:
      'Results vary depending on the treatment and individual factors. Many patients report feeling improvements within weeks, with optimal results typically seen after a few months.',
  },
  {
    id: 5,
    question: 'What safety measures are in place?',
    answer:
      'Your safety is our top priority. All treatments are administered by licensed healthcare professionals following strict medical protocols.',
  },
];

function ReviewStars({ rating, interactive = false, onRatingChange }: { rating: number; interactive?: boolean; onRatingChange?: (rating: number) => void }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onRatingChange?.(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          <StarIcon
            className={`h-5 w-5 ${
              i <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    content: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?page=${page}&limit=6`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchReviews(newPage);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Review submitted successfully!');
        setFormData({ name: '', email: '', rating: 5, content: '' });
        setShowForm(false);
        fetchReviews(1);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
            Patient Testimonials
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-indigo-100">
            Hear from our patients about their experiences with our treatments
            and care.
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-5 sm:space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-500">
              Real stories from people who have experienced our care.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Patient Reviews</h3>
                  {!showForm &&
                    <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Write a Review
                  </button>}
                </div>

                {showForm && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Share Your Experience</h4>
                    
                    {message && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                        {message}
                      </div>
                    )}

                    {error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email (optional)
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating *
                        </label>
                        <ReviewStars
                          rating={formData.rating}
                          interactive
                          onRatingChange={(rating) => setFormData({ ...formData, rating })}
                        />
                      </div>

                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                          Your Review *
                        </label>
                        <textarea
                          id="content"
                          required
                          rows={4}
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Share your experience with our treatments and care..."
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                          onClick={() => setShowForm(false)}
                          className="inline-flex items-center px-4 py-2 mx-2 border border-transparent text-sm font-medium rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-500">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="pt-6 border-t border-gray-200"
                        >
                          <div className="flow-root bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <ReviewStars rating={review.rating} />
                              <p className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  }
                                )}
                              </p>
                            </div>
                            <p className="mt-4 text-base text-gray-700">
                              {review.content}
                            </p>
                            <p className="mt-3 text-sm font-medium text-gray-900">
                              {review.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8 flex justify-center items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={!pagination.hasPrev}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        <div className="flex space-x-1">
                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                pageNum === pagination.page
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={!pagination.hasNext}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                    
                    {/* Review Count */}
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Showing {reviews.length} of {pagination.total} reviews
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4">
          <div className="lg:max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                Have questions? We're here to help.
              </p>
            </div>

            <div className="mt-12">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
                {faqs.map((faq) => (
                  <div key={faq.id} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        <QuestionMarkCircleIcon
                          className="h-6 w-6"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                        {faq.question}
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Contact Us
                </a>
              </div>
              <p className="mt-3 text-base text-gray-500">
                Can't find what you're looking for?{' '}
                <a
                  href="mailto:info@yourclinic.com"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Email us
                </a>{' '}
                and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}