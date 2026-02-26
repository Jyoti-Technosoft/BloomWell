"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  
  // Professional Information
  specialization: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiryDate: string;
  npiNumber: string;
  deaNumber: string;
  professionalBio: string;
  
  // Practice Information
  consultationFee: string;
  languages: string[];
  hospitalAffiliations: string[];
  
  // Terms
  agreeTerms: boolean;
  agreeHipaa: boolean;
}

const specializations = [
  "Obstetrics & Gynecology",
  "Family Medicine", 
  "Internal Medicine",
  "Pediatrics",
  "Psychiatry",
  "Dermatology"
];

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const languages = [
  "English", "Spanish", "French", "German", "Chinese", "Hindi", "Arabic", "Portuguese"
];

export default function DoctorRegister() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, color: 'bg-gray-200' });
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [hospitalInput, setHospitalInput] = useState('');
  const [hospitalAffiliations, setHospitalAffiliations] = useState<string[]>([]);

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    if (password) {
      const strength = getPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ strength: 0, color: 'bg-gray-200' });
    }
  }, [password]);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: 'bg-gray-200' };
    
    let strength = 0;
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (hasMinLength) strength += 20;
    if (hasUppercase) strength += 20;
    if (hasLowercase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;

    let color;
    if (strength <= 20) color = 'bg-red-500';
    else if (strength <= 40) color = 'bg-orange-500';
    else if (strength <= 60) color = 'bg-yellow-500';
    else if (strength <= 80) color = 'bg-blue-500';
    else color = 'bg-green-500';

    return { strength, color };
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const addHospital = () => {
    if (hospitalInput.trim() && !hospitalAffiliations.includes(hospitalInput.trim())) {
      setHospitalAffiliations(prev => [...prev, hospitalInput.trim()]);
      setHospitalInput('');
    }
  };

  const removeHospital = (hospital: string) => {
    setHospitalAffiliations(prev => prev.filter(h => h !== hospital));
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      
      const submitData = {
        ...data,
        languages: selectedLanguages,
        hospitalAffiliations: hospitalAffiliations
      };

      const response = await fetch('/api/doctor/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();
      setIsSuccess(true);
      
      setTimeout(() => {
        router.push('/doctor/auth/signin?message=registration-success');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const inputClassName = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Join BloomWell as a Healthcare Provider</h1>
          <p className="mt-2 text-sm text-gray-600">
            Connect with patients and provide quality healthcare services
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Professional Healthcare Provider Registration</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>This registration is for licensed healthcare providers only. Your credentials will be verified before you can start seeing patients.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg">
          <div className="px-4 py-8 sm:p-8 space-y-8">
            
            {/* Personal Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...register("firstName", { required: "First name is required" })}
                    className={inputClassName}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...register("lastName", { required: "Last name is required" })}
                    className={inputClassName}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className={inputClassName}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    {...register("phoneNumber", { required: "Phone number is required" })}
                    className={inputClassName}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      {...register("password", { 
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters"
                        }
                      })}
                      className={`${inputClassName} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password strength: {passwordStrength.strength < 20 ? "Very Weak" : 
                                     passwordStrength.strength < 40 ? "Weak" :
                                     passwordStrength.strength < 60 ? "Moderate" :
                                     passwordStrength.strength < 80 ? "Strong" : "Very Strong"}
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      {...register("confirmPassword", { 
                        required: "Please confirm your password",
                        validate: value => value === password || "Passwords do not match"
                      })}
                      className={`${inputClassName} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                    Specialization *
                  </label>
                  <select
                    id="specialization"
                    {...register("specialization", { required: "Specialization is required" })}
                    className={`${inputClassName} h-10`}
                  >
                    <option value="">Select your specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                    Medical License Number *
                  </label>
                  <input
                    type="text"
                    id="licenseNumber"
                    {...register("licenseNumber", { required: "License number is required" })}
                    className={inputClassName}
                  />
                  {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="licenseState" className="block text-sm font-medium text-gray-700">
                    License State *
                  </label>
                  <select
                    id="licenseState"
                    {...register("licenseState", { required: "License state is required" })}
                    className={`${inputClassName} h-10`}
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.licenseState && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseState.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700">
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    id="licenseExpiryDate"
                    {...register("licenseExpiryDate", { required: "License expiry date is required" })}
                    className={inputClassName}
                  />
                  {errors.licenseExpiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseExpiryDate.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="npiNumber" className="block text-sm font-medium text-gray-700">
                    NPI Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="npiNumber"
                    {...register("npiNumber")}
                    className={inputClassName}
                    placeholder="National Provider Identifier"
                  />
                </div>

                <div>
                  <label htmlFor="deaNumber" className="block text-sm font-medium text-gray-700">
                    DEA Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="deaNumber"
                    {...register("deaNumber")}
                    className={inputClassName}
                    placeholder="Drug Enforcement Administration number"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="professionalBio" className="block text-sm font-medium text-gray-700">
                    Professional Bio
                  </label>
                  <textarea
                    id="professionalBio"
                    rows={4}
                    {...register("professionalBio")}
                    className={inputClassName}
                    placeholder="Brief professional background and areas of expertise..."
                  />
                </div>

                <div>
                  <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                    Standard Consultation Fee (USD)
                  </label>
                  <input
                    type="number"
                    id="consultationFee"
                    step="0.01"
                    {...register("consultationFee")}
                    className={inputClassName}
                    placeholder="150.00"
                  />
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Languages Spoken</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {languages.map(language => (
                  <label key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language)}
                      onChange={() => handleLanguageToggle(language)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{language}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hospital Affiliations */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Hospital Affiliations</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={hospitalInput}
                  onChange={(e) => setHospitalInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHospital())}
                  className={`${inputClassName} flex-1`}
                  placeholder="Enter hospital name and press Enter"
                />
                <button
                  type="button"
                  onClick={addHospital}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {hospitalAffiliations.map((hospital, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {hospital}
                    <button
                      type="button"
                      onClick={() => removeHospital(hospital)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms & Compliance</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    {...register("agreeTerms", { required: "You must agree to the terms of service" })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                      I agree to the{" "}
                      <Link href="/terms" className="text-indigo-600 hover:text-indigo-500" target="_blank">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500" target="_blank">
                        Privacy Policy
                      </Link>
                    </label>
                    {errors.agreeTerms && (
                      <p className="mt-1 text-sm text-red-600">{errors.agreeTerms.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    id="agreeHipaa"
                    type="checkbox"
                    {...register("agreeHipaa", { required: "You must agree to HIPAA compliance" })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeHipaa" className="font-medium text-gray-700">
                      I agree to comply with{" "}
                      <Link href="/hipaa" className="text-indigo-600 hover:text-indigo-500" target="_blank">
                        HIPAA regulations
                      </Link>{" "}
                      and maintain patient confidentiality
                    </label>
                    {errors.agreeHipaa && (
                      <p className="mt-1 text-sm text-red-600">{errors.agreeHipaa.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Account..." : "Create Healthcare Provider Account"}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Display */}
            {isSuccess && (
              <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Registration successful! Your profile is pending verification. You will be redirected to the login page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/doctor/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
