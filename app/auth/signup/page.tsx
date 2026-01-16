"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { validatePhoneNumber, getCountryPhoneConfig, getSupportedCountries } from '../../lib/phoneValidation';

type FormData = {
  // Personal Information
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  healthcarePurpose: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Medical Information
  emergencyPhone: string;
  allergies: string;
  medications: string;
  medicalHistory: string;
};

const SignUp = () => {
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
  const [phone, setPhone] = useState<string>('');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [phoneError, setPhoneError] = useState<string>('');

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      
      // Manual validation check since React Hook Form might not be blocking properly
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      // Check birthdate validation
      if (isNaN(birthDate.getTime())) {
        setError('Date of birth format is invalid');
        return;
      }
      
      if (age < 13) {
        setError('You must be at least 13 years old');
        return;
      }
      
      if (age > 120) {
        setError('Please enter a valid date of birth');
        return;
      }
      // Check emergency phone validation
      if (data.emergencyPhone) {
        const emergencyPhoneValidation = validatePhoneNumber(emergencyPhone, selectedCountry);
        if (!emergencyPhoneValidation.isValid) {
          setError('Invalid emergency phone number format');
          return;
        }
      }
      
      // Validate phone number based on selected country
      const phoneValidation = validatePhoneNumber(phone, selectedCountry);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || 'Invalid phone number');
        return;
      }
      
      const submitData = {
        ...data,
        phoneNumber: phone || '',
        emergencyPhone: emergencyPhone || '',
      };
      
      // Remove confirmPassword from the data before sending to the server
      const { confirmPassword, ...userData } = submitData;
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sign up failed');
      }
      // After successful signup, sign the user in
      const signInResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        credentials: 'include',
      });
      if (!signInResponse.ok) {
        const errorData = await signInResponse.json();
        throw new Error(errorData.error || 'Sign up failed');
      }
      // Redirect to dashboard or callback URL
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/auth/signin?registered=true`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value))
      return "Must contain at least one uppercase letter";
    if (!/[a-z]/.test(value))
      return "Must contain at least one lowercase letter";
    if (!/[0-9]/.test(value)) return "Must contain at least one number";
    return true;
  };

  function getPasswordStrengthLabel(strength: number): string {
    if (strength < 20) return "Very Weak";
    if (strength < 40) return "Weak";
    if (strength < 60) return "Moderate";
    if (strength < 80) return "Strong";
    return "Very Strong";
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: 'bg-gray-200' };
    
    let strength = 0;
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    // Calculate strength score (0-100)
    if (hasMinLength) strength += 20;
    if (hasUppercase) strength += 20;
    if (hasLowercase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;
    // Determine color based on strength
    let color;
    if (strength <= 20) color = 'bg-red-500';
    else if (strength <= 40) color = 'bg-orange-500';
    else if (strength <= 60) color = 'bg-yellow-500';
    else if (strength <= 80) color = 'bg-blue-500';
    else color = 'bg-green-500';
    return { strength, color };
  };

  
  useEffect(() => {
    if (watch('password')) {
      const strength = getPasswordStrength(watch('password'));
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ strength: 0, color: 'bg-gray-200' });
    }
  }, [watch('password')]);

  const inputClassName = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-3 pr-10";
  const selectClassName = "block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-base sm:leading-6 h-9";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us to start your personalized health journey
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
              <h3 className="text-sm font-medium text-blue-800">Welcome to our women's healthcare platform</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>We provide comprehensive healthcare services for women and support for their families. Whether you're seeking care for yourself or supporting a loved one, we're here to help.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-8 sm:p-8">

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    {...register("fullName", {
                      required: "Full name is required",
                    })}
                    className={inputClassName}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className={inputClassName}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              <div className="sm:col-span-2">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <select
                        value={selectedCountry}
                        onChange={(e) => {
                          const country = e.target.value as string;
                          setSelectedCountry(country);
                          setPhoneError(''); // Clear error when country changes
                          setPhone('');
                        }}
                        className="block w-full sm:w-auto rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        {getSupportedCountries().map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name} ({country.code})
                          </option>
                        ))}
                      </select>
                      <div className="flex-1">
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry={selectedCountry as any}
                          value={phone}
                          onChange={(value) => {
                            setPhone(value || '');
                            setPhoneError('');
                          }}
                          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder={`Enter phone number for ${getCountryPhoneConfig(selectedCountry)?.name || 'your country'}`}
                        />
                      </div>
                    </div>
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-600">
                        {phoneError}
                      </p>
                    )}
                    {!phoneError && selectedCountry && (
                      <p className="mt-1 text-xs text-gray-500">
                        Expected format: {getCountryPhoneConfig(selectedCountry)?.format || 'International format (+XX XXX...)'}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    {...register("dateOfBirth", {
                      required: "Date of birth is required",
                      validate: {
                        validDate: (value) => {
                          if (!value) return "Date of birth is required";
                          const birthDate = new Date(value);
                          const today = new Date();
                          const age = today.getFullYear() - birthDate.getFullYear();
                          if (isNaN(birthDate.getTime())) {
                            return "Invalid date format";
                          }
                          if (age < 13) {
                            return "You must be at least 13 years old";
                          }
                          if (age > 120) {
                            return "Please enter a valid date of birth";
                          }
                          return true;
                        }
                      }
                    })}
                    className={inputClassName}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="healthcarePurpose"
                    className="block text-sm font-medium text-gray-700"
                  >
                    I am seeking
                  </label>
                  <select
                    id="healthcarePurpose"
                    {...register("healthcarePurpose", { required: "Please select your purpose" })}
                    className={selectClassName}
                  >
                    <option value="">Select your purpose</option>
                    <option value="seeking_care">I am seeking care</option>
                    <option value="caregiver_parent">Caregiver/parent</option>
                  </select>
                  {errors.healthcarePurpose && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.healthcarePurpose.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <h2 className="text-2xl font-bold text-gray-900">
                Address Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    {...register("address")}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    {...register("city")}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    {...register("state")}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    {...register("zipCode")}
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Medical Information */}
              <h2 className="text-2xl font-bold text-gray-900">
                Medical Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="emergencyPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Emergency Contact Phone
                  </label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry={selectedCountry as any}
                    value={emergencyPhone}
                    onChange={(value) => setEmergencyPhone(value || '')}
                    className={inputClassName}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.emergencyPhone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyPhone.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="allergies"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Allergies
                  </label>
                  <textarea
                    id="allergies"
                    rows={3}
                    {...register("allergies")}
                    className={inputClassName}
                    placeholder="List any known allergies..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="medications"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Medications
                  </label>
                  <textarea
                    id="medications"
                    rows={3}
                    {...register("medications")}
                    className={inputClassName}
                    placeholder="List current medications..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="medicalHistory"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    rows={4}
                    {...register("medicalHistory")}
                    className={inputClassName}
                    placeholder="Relevant medical history..."
                  />
                </div>
              </div>

              {/* Password Section */}
              <h2 className="text-2xl font-bold text-gray-900">
                Security
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      {...register("password", {
                        required: "Password is required",
                        validate: validatePassword,
                      })}
                      className={inputClassName}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${passwordStrength.strength}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password strength: {getPasswordStrengthLabel(passwordStrength.strength)}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === watch("password") || "Passwords do not match",
                      })}
                      className={inputClassName}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeTerms"
                      type="checkbox"
                      {...register("agreeTerms", {
                        required: "You must agree to the terms to continue",
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="agreeTerms"
                      className="font-medium text-gray-700"
                    >
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-indigo-600 hover:text-indigo-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-indigo-600 hover:text-indigo-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </a>
                    </label>
                    {errors.agreeTerms && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.agreeTerms.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </div>

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
          </form>

          {isSuccess && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Registration successful! Redirecting to sign in...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
