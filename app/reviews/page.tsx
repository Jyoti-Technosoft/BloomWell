import { StarIcon } from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const reviews = [
  {
    id: 1,
    name: 'John D.',
    rating: 5,
    content:
      'Life-changing experience! The team was professional and caring throughout my weight loss journey.',
    date: '2023-10-15',
  },
  {
    id: 2,
    name: 'Sarah M.',
    rating: 5,
    content:
      'The hormone therapy has made a significant difference in my energy levels and overall well-being. Highly recommend!',
    date: '2023-09-28',
  },
  {
    id: 3,
    name: 'Robert T.',
    rating: 4,
    content:
      'Great service and knowledgeable staff. The treatment plan was tailored to my specific needs.',
    date: '2023-09-10',
  },
  {
    id: 4,
    name: 'Emily R.',
    rating: 5,
    content:
      'I feel like a new person after starting treatment here. The staff is amazing and very supportive.',
    date: '2023-08-22',
  },
];

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

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          className={`h-5 w-5 ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
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
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="pt-6 border-t border-gray-200"
                    >
                      <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                        <div className="-mt-6">
                          <div className="flex items-center justify-between">
                            <ReviewStars rating={review.rating} />
                            <p className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString(
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
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