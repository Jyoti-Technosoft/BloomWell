"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type FormData = {
  // Step 1: Personal Information
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  fullName: string;
  password: string;
  confirmPassword: string;

  // Step 2: Medical Information
  currentMedications: string;
  medicalConditions: string;
  allergies: string;
  height: string;
  weight: string;

  // Step 3: Health Goals
  primaryGoal: string;
  targetWeight?: string;
  timeline?: string;
  haveYouTriedWeightLossBefore: boolean;
  previousWeightLossMethods?: string;

  // Step 4: Lifestyle
  activityLevel:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active";
  sleepHours: number;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  dietaryRestrictions: string[];

  // Step 5: Review
  agreeTerms: boolean;
};

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    trigger
  } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, color: 'bg-gray-200' });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Handle form submission
      console.log(data);
      // Redirect to success page or dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
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

  const validatePhone = (value: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!value) return "Phone number is required";
    if (!phoneRegex.test(value))
      return "Please enter a valid 10-digit phone number";
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

  const prevStep = () => setStep(step - 1);

  const nextStep = async () => {
    let isValid = true;
    const fields = getValues();
    
    // Trigger validation for all fields in the current step
    switch (step) {
      case 1:
        await trigger([
          'fullName', 
          'email', 
          'phoneNumber',
          'dateOfBirth', 
          'gender',
          'password',
          'confirmPassword'
        ]);
        isValid = Boolean(
          fields.fullName &&
          fields.email &&
          fields.phoneNumber &&
          fields.dateOfBirth &&
          fields.gender &&
          fields.password &&
          fields.confirmPassword
        );
        break;
        
      case 2:
        await trigger(['height', 'weight']);
        isValid = Boolean(fields.height && fields.weight);
        break;
        
      case 3:
        await trigger(['primaryGoal']);
        isValid = Boolean(fields.primaryGoal);
        break;
        
      case 4:
        await trigger(['activityLevel', 'sleepHours', 'stressLevel']);
        isValid = Boolean(
          fields.activityLevel && 
          fields.sleepHours && 
          fields.stressLevel
        );
        break;
    }
    // Only proceed to next step if all validations pass
    if (isValid && step < 5) {
      setStep(step + 1);
    }
  };

  useEffect(() => {
    if (watch('password')) {
      const strength = getPasswordStrength(watch('password'));
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ strength: 0, color: 'bg-gray-200' });
    }
  }, [watch('password')]);

  const renderStep = () => {
    const inputClassName = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-3 pr-10";
    const selectClassName = "block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-base sm:leading-6 h-9";

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
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

              <div>
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
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">+1</span>
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      validate: validatePhone,
                    })}
                    className={`${inputClassName} pl-10`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
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
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  {...register("gender", { required: "Gender is required" })}
                  className={selectClassName}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.gender.message}
                  </p>
                )}
              </div>

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
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength.strength}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password strength: {getPasswordStrengthLabel(passwordStrength.strength)}
                  </p>
                </div>
              </div>
              {/* Confirm Password Field */}
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Medical Information
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="currentMedications"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Medications
                </label>
                <textarea
                  id="currentMedications"
                  rows={3}
                  {...register("currentMedications")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="List all current medications, including dosages"
                />
              </div>

              <div>
                <label
                  htmlFor="medicalConditions"
                  className="block text-sm font-medium text-gray-700"
                >
                  Medical Conditions
                </label>
                <textarea
                  id="medicalConditions"
                  rows={3}
                  {...register("medicalConditions")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="List any medical conditions you have been diagnosed with"
                />
              </div>

              <div>
                <label
                  htmlFor="allergies"
                  className="block text-sm font-medium text-gray-700"
                >
                  Allergies
                </label>
                <input
                  type="text"
                  id="allergies"
                  {...register("allergies")}
                  className={inputClassName}
                  // className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="List any allergies (medications, food, etc.)"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="height"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    {...register("height", {
                      required: "Height is required",
                      min: 100,
                      max: 250,
                    })}
                    className={inputClassName}
                  />
                  {errors.height && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.height.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    step="0.1"
                    {...register("weight", {
                      required: "Weight is required",
                      min: 30,
                      max: 300,
                    })}
                    className={inputClassName}
                  />
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.weight.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Health Goals</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary Goal
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    "Weight Loss",
                    "Muscle Gain",
                    "Improved Health",
                    "Better Sleep",
                    "Stress Reduction",
                  ].map((goal) => (
                    <div key={goal} className="flex items-center">
                      <input
                        id={`goal-${goal}`}
                        type="radio"
                        value={goal}
                        {...register("primaryGoal", {
                          required: "Please select a primary goal",
                        })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`goal-${goal}`}
                        className="ml-3 block text-sm text-gray-700"
                      >
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.primaryGoal && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.primaryGoal.message}
                  </p>
                )}
              </div>

              {watch("primaryGoal") === "Weight Loss" && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="targetWeight"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      id="targetWeight"
                      step="0.1"
                      {...register("targetWeight")}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="timeline"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Goal Timeline (weeks)
                    </label>
                    <input
                      type="number"
                      id="timeline"
                      {...register("timeline")}
                      className={inputClassName}
                    />
                  </div>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700">
                Have you tried any weight loss methods before?
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...register("haveYouTriedWeightLossBefore")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="false"
                    {...register("haveYouTriedWeightLossBefore")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>

              {watch("haveYouTriedWeightLossBefore") === true && (
                <div>
                  <label
                    htmlFor="previousWeightLossMethods"
                    className="block text-sm font-medium text-gray-700"
                  >
                    What methods have you tried before?
                  </label>
                  <textarea
                    id="previousWeightLossMethods"
                    rows={3}
                    {...register("previousWeightLossMethods")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Please describe any weight loss methods you've tried in the past"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Lifestyle Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activity Level
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    {
                      value: "sedentary",
                      label: "Sedentary (little or no exercise)",
                    },
                    {
                      value: "lightly_active",
                      label: "Lightly Active (light exercise 1-3 days/week)",
                    },
                    {
                      value: "moderately_active",
                      label:
                        "Moderately Active (moderate exercise 3-5 days/week)",
                    },
                    {
                      value: "very_active",
                      label: "Very Active (hard exercise 6-7 days/week)",
                    },
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center">
                      <input
                        id={`activity-${value}`}
                        type="radio"
                        value={value}
                        {...register("activityLevel", {
                          required: "Please select your activity level",
                        })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`activity-${value}`}
                        className="ml-3 block text-sm text-gray-700"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.activityLevel && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.activityLevel.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sleepHours"
                  className="block text-sm font-medium text-gray-700"
                >
                  Average Hours of Sleep Per Night
                </label>
                <select
                  id="sleepHours"
                  {...register("sleepHours", {
                    required: "Please select your average sleep hours",
                  })}
                  className={selectClassName}
                >
                  <option value="">Select hours</option>
                  {Array.from({ length: 12 }, (_, i) => i + 4).map((hours) => (
                    <option key={hours} value={hours}>
                      {hours} {hours === 1 ? "hour" : "hours"}
                    </option>
                  ))}
                </select>
                {errors.sleepHours && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sleepHours.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stress Level (1-5)
                </label>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Low</span>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className="flex flex-col items-center">
                      <input
                        type="radio"
                        id={`stress-${level}`}
                        value={level}
                        {...register("stressLevel", {
                          required: "Please select your stress level",
                        })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`stress-${level}`}
                        className="mt-1 text-xs text-gray-700"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                  <span className="text-sm text-gray-500">High</span>
                </div>
                {errors.stressLevel && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stressLevel.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dietary Restrictions
                </label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Vegetarian",
                    "Vegan",
                    "Gluten-Free",
                    "Dairy-Free",
                    "Nut Allergy",
                    "Keto",
                    "Paleo",
                    "Halal",
                    "Kosher",
                    "None",
                  ].map((restriction) => (
                    <div key={restriction} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`diet-${restriction}`}
                        value={restriction}
                        {...register("dietaryRestrictions")}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`diet-${restriction}`}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {restriction}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Review Your Information
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("fullName")}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("email")}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Phone Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("phoneNumber")}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(watch("dateOfBirth")).toLocaleDateString()}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {watch("gender")?.replace(/_/g, " ")}
                  </dd>
                </div>
              </dl>

              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">
                Medical Information
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Current Medications
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("currentMedications") || "None provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Medical Conditions
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("medicalConditions") || "None provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Allergies
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("allergies") || "None"}
                  </dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Height
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {watch("height")} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Weight
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {watch("weight")} kg
                    </dd>
                  </div>
                </div>
              </dl>

              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">
                Health Goals
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Primary Goal
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("primaryGoal")}
                  </dd>
                </div>
                {watch("targetWeight") && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Target Weight
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {watch("targetWeight")} kg
                    </dd>
                  </div>
                )}
                {watch("timeline") && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Timeline
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {watch("timeline")} weeks
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Tried Weight Loss Before
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("haveYouTriedWeightLossBefore") === true
                      ? "Yes"
                      : "No"}
                  </dd>
                </div>
                {watch("haveYouTriedWeightLossBefore") === true && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Previous Methods Tried
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {watch("previousWeightLossMethods")}
                    </dd>
                  </div>
                )}
              </dl>

              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">
                Lifestyle
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Activity Level
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {watch("activityLevel")?.replace(/_/g, " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Average Sleep
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("sleepHours")} hours/night
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Stress Level
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("stressLevel")}/5
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Dietary Restrictions
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {watch("dietaryRestrictions")?.length > 0
                      ? watch("dietaryRestrictions").join(", ")
                      : "None"}
                  </dd>
                </div>
              </dl>
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
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-indigo-600 hover:text-indigo-500"
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Get Started</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete the following steps to create your personalized health plan
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Progress Steps */}
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step === stepNumber
                        ? "bg-indigo-600 text-white"
                        : step > stepNumber
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > stepNumber ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      step === stepNumber ? "text-indigo-600" : "text-gray-500"
                    }`}
                  >
                    {stepNumber === 1 && "Personal"}
                    {stepNumber === 2 && "Medical"}
                    {stepNumber === 3 && "Goals"}
                    {stepNumber === 4 && "Lifestyle"}
                    {stepNumber === 5 && "Review"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 sm:p-6">
            {renderStep()}

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </button>
              ) : (
                <div></div>
              )}
              {/* Empty div to push the Next button to the right */}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
