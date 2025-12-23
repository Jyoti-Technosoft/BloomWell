import { notFound } from 'next/navigation';
import Image from 'next/image';
import { physicians } from '../../data/physicians';

export default async function DoctorProfile({
  params,
}: {
  params: Promise<{ doctor: string }>;
}) {
  const { doctor: slug } = await params;

  const doctorData = physicians.find(d =>
    d.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\./g, '') === slug  
  );

  if (!doctorData) {
    notFound();
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-8">
              <div className="h-48 w-48 rounded-full overflow-hidden mx-auto">
                <Image
                  src={doctorData.image}
                  alt={doctorData.name}
                  width={192}
                  height={192}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {doctorData.name}
              </h1>
              <p className="mt-2 text-xl text-indigo-600">
                {doctorData.specialty}
              </p>
              <p className="mt-1 text-gray-500">
                {doctorData.education}
              </p>
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">
                  About Dr. {doctorData.name.split(' ').slice(1).join(' ')}
                </h2>
                <p className="mt-2 text-gray-600">
                  {doctorData.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return physicians.map(doctor => ({
    doctor: doctor.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, ''),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doctor: string }>;
}) {
  const { doctor: slug } = await params;

  const doctor = physicians.find(d =>
    d.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '') === slug
  );

  if (!doctor) {
    return { title: 'Doctor Not Found' };
  }

  return {
    title: `${doctor.name} | ${doctor.specialty}`,
    description: doctor.bio,
  };
}
