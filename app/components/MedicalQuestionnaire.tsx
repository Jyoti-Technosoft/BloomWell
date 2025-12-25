'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  CalendarIcon,
  ScaleIcon,
  HeartIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface FormData {
  birthday: string;
  pregnant: string;
  currentlyUsingMedicines: string;
  hasDiabetes: string;
  seenDoctorLastTwoYears: string;
  medicalConditions: string[];
  height: string;
  weight: string;
  targetWeight: string;
  goals: string[];
  allergies: string;
  currentMedications: string;
  additionalInfo: string;
  lastFourSSN: string;
  primaryGoal: string;
  triedWeightLossMethods: string;
  activityLevel: string;
  sleepHours: string;
  stressLevel: string;
  dietaryRestrictions: string[];
}

interface MedicalQuestionnaireProps {
  medicineId: string;
  medicineName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (formData: FormData) => void;
}

const MedicalQuestionnaire: React.FC<MedicalQuestionnaireProps> = ({
  medicineId,
  medicineName,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    birthday: '',
    pregnant: '',
    currentlyUsingMedicines: '',
    hasDiabetes: '',
    seenDoctorLastTwoYears: '',
    medicalConditions: [],
    height: '',
    weight: '',
    targetWeight: '',
    goals: [],
    allergies: '',
    currentMedications: '',
    additionalInfo: '',
    lastFourSSN: '',
    primaryGoal: '',
    triedWeightLossMethods: '',
    activityLevel: '',
    sleepHours: '',
    stressLevel: '',
    dietaryRestrictions: []
  });

  const totalSteps = 14;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    if (field === 'medicalConditions' || field === 'goals' || field === 'dietaryRestrictions') {
      setFormData(prev => ({
        ...prev,
        [field]: checked
          ? [...(prev[field] as string[]), value]
          : (prev[field] as string[]).filter(item => item !== value)
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: return formData.birthday !== '';
      case 1: return formData.primaryGoal !== '';
      case 2: return formData.pregnant !== '';
      case 3: return formData.currentlyUsingMedicines.trim() !== '';
      case 4: return formData.hasDiabetes !== '';
      case 5: return formData.seenDoctorLastTwoYears !== '';
      case 6: return formData.medicalConditions.length > 0;
      case 7: return formData.height !== '' && formData.weight !== '' && formData.targetWeight !== '';
      case 8: return formData.triedWeightLossMethods !== '';
      case 9: return formData.goals.length > 0;
      case 10: return formData.allergies.trim() !== '';
      // Case 11:Additional Info (optional)
      case 12: return formData.activityLevel !== '' && formData.sleepHours !== '' && formData.stressLevel !== '';
      case 13: return formData.dietaryRestrictions.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onComplete(formData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What's your birthday?</h3>
              <p className="text-gray-600">We need to verify your age for medical eligibility</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <HeartIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Goals</h3>
              <p className="text-gray-600">What is your primary goal?</p>
            </div>
            <div className="space-y-3">
              {['Weight Loss', 'Muscle Gain', 'Improved Health', 'Better Sleep', 'Stress Reduction'].map(goal => (
                <label key={goal} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="primaryGoal"
                    value={goal}
                    checked={formData.primaryGoal === goal}
                    onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <HeartIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Are you pregnant, lactating, or trying to get pregnant?</h3>
              <p className="text-gray-600">This helps us determine safe treatment options</p>
            </div>
            <div className="space-y-3">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="pregnant"
                    value={option}
                    checked={formData.pregnant === option}
                    onChange={(e) => handleInputChange('pregnant', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Are you currently using our medicines?</h3>
              <p className="text-gray-600">Please specify which medicines you are currently using</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medicines (please list names or descriptions)
                </label>
                <textarea
                  value={formData.currentlyUsingMedicines}
                  onChange={(e) => handleInputChange('currentlyUsingMedicines', e.target.value)}
                  placeholder="e.g., Semaglutide 1mg, Tirzepatide 5mg, or describe what you're taking..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  If you're not currently using any medicines, please write "None" or "Not currently using any medicines"
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Do you have diabetes?</h3>
              <p className="text-gray-600">This affects medication selection and dosing</p>
            </div>
            <div className="space-y-3">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="hasDiabetes"
                    value={option}
                    checked={formData.hasDiabetes === option}
                    onChange={(e) => handleInputChange('hasDiabetes', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Have you seen a doctor in the last two years?</h3>
              <p className="text-gray-600">Regular medical check-ups are important</p>
            </div>
            <div className="space-y-3">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="seenDoctorLastTwoYears"
                    value={option}
                    checked={formData.seenDoctorLastTwoYears === option}
                    onChange={(e) => handleInputChange('seenDoctorLastTwoYears', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Do you have any of the following medical conditions?</h3>
              <p className="text-gray-600">Select all that apply (select "None" if none apply)</p>
            </div>
            <div className="space-y-3">
              {[
                'High Blood Pressure',
                'High Lipids',
                'High Cholesterol',
                'Obstructive Sleep Apnea',
                'Cardiovascular Disease',
                'Anorexia Nervosa',
                'Bulimia Nervosa',
                'None'
              ].map(condition => (
                <label key={condition} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.medicalConditions.includes(condition)}
                    onChange={(e) => handleCheckboxChange('medicalConditions', condition, e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{condition}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <ScaleIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What is your height and weight?</h3>
              <p className="text-gray-600">This helps us determine appropriate dosing</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="e.g., 175"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="e.g., 70"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                  placeholder="e.g., 65"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Have you tried any weight loss methods before?</h3>
              <p className="text-gray-600">This helps us understand your weight loss history</p>
            </div>
            <div className="space-y-3">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="triedWeightLossMethods"
                    value={option}
                    checked={formData.triedWeightLossMethods === option}
                    onChange={(e) => handleInputChange('triedWeightLossMethods', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 9:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <HeartIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Which of the following apply to you?</h3>
              <p className="text-gray-600">Select all that apply (select "No, none of these apply to me" if none apply)</p>
            </div>
            <div className="space-y-3">
              {[
                'I want to lose fat without losing muscle',
                'I want to decrease fatigue and increase my energy',
                'I\'m interested in supporting my heart health',
                'I\'d like to improve the look and feel of my skin',
                'I\'m concerned about dosing correctly',
                'I need medication that doesn\'t require refrigeration',
                'I\'d like something travel-friendly',
                'No, none of these apply to me'
              ].map(goal => (
                <label key={goal} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal)}
                    onChange={(e) => handleCheckboxChange('goals', goal, e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 10:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Do you have any allergies?</h3>
              <p className="text-gray-600">Please list any allergies you have (medications, food, etc.)</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="e.g., Penicillin, Peanuts, Shellfish, Latex, etc. (Write 'None' if you have no allergies)"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Please include all known allergies, even if they seem minor. If you have no allergies, please write "None".
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 11:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Is there anything else you would like the doctor to know?</h3>
              <p className="text-gray-600">Additional information that might help with your evaluation (optional)</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="e.g., Previous treatments, specific concerns, lifestyle factors, etc."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This field is optional, but any additional information can help our doctors provide better care.
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 12:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lifestyle Information</h3>
              <p className="text-gray-600">Tell us about your daily lifestyle</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select activity level</option>
                  <option value="Sedentary">Sedentary (little or no exercise)</option>
                  <option value="Lightly Active">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="Moderately Active">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="Very Active">Very Active (hard exercise 6-7 days/week)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Hours of Sleep Per Night</label>
                <select
                  value={formData.sleepHours}
                  onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select sleep hours</option>
                  <option value="4">4 hours</option>
                  <option value="5">5 hours</option>
                  <option value="6">6 hours</option>
                  <option value="7">7 hours</option>
                  <option value="8">8 hours</option>
                  <option value="9">9+ hours</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stress Level (1-5)</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Low</span>
                  {[1, 2, 3, 4, 5].map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="stressLevel"
                        value={level.toString()}
                        checked={formData.stressLevel === level.toString()}
                        onChange={(e) => handleInputChange('stressLevel', e.target.value)}
                        className="mr-1"
                      />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                  <span className="text-sm text-gray-600">High</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 13:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dietary Restrictions</h3>
              <p className="text-gray-600">Select all that apply (select "None" if none apply)</p>
            </div>
            <div className="space-y-3">
              {[
                'Vegetarian(No meat or fish)',
                'Vegan(No animal products (meat, dairy, eggs, honey)',
                'Gluten-Free(Avoids wheat, barley, rye, and gluten-containing foods)',
                'Dairy-Free(No milk, cheese, yogurt, or other dairy products)',
                'Nut Allergy(Allergic to peanuts and/or tree nuts)',
                'Ketogenic Diet(Very low-carbohydrate, high-fat diet)',
                'None'
              ].map(restriction => (
                <label key={restriction} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="dietaryRestrictions"
                    value={restriction}
                    checked={formData.dietaryRestrictions.includes(restriction)}
                    onChange={(e) => handleCheckboxChange('dietaryRestrictions', restriction, e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{restriction}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Medical Evaluation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Previous
            </button>
            
            {currentStep === totalSteps - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  validateStep(currentStep)
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Evaluation
                <CheckCircleIcon className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  validateStep(currentStep)
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalQuestionnaire;
