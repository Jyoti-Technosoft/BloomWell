'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
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
  currentWeightliftingRoutine: string;
  proteinIntake: string;
  workoutFrequency: string;
  healthConcerns: string[];
  sleepIssues: string[];
  stressTriggers: string[];
  stressManagementTechniques: string[];
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
    dietaryRestrictions: [],
    currentWeightliftingRoutine: '',
    proteinIntake: '',
    workoutFrequency: '',
    healthConcerns: [],
    sleepIssues: [],
    stressTriggers: [],
    stressManagementTechniques: []
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [relevantSteps, setRelevantSteps] = useState<number[]>([0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 13]);

  // Simplified effect - only handle component open/close
  useEffect(() => {
    if (isOpen) {
      // Reset when opening
      setCurrentStep(0);
      setErrors({});
      setFormData({
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
        dietaryRestrictions: [],
        currentWeightliftingRoutine: '',
        proteinIntake: '',
        workoutFrequency: '',
        healthConcerns: [],
        sleepIssues: [],
        stressTriggers: [],
        stressManagementTechniques: []
      });
      setRelevantSteps([0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 13]);
    }
  }, [isOpen]);

  // Handle primary goal changes with a simple approach
  const handlePrimaryGoalChange = (goal: string) => {
    setFormData(prev => ({ ...prev, primaryGoal: goal }));
    
    // Update relevant steps based on goal
    const baseSteps = [0, 1, 2, 3, 4, 5];
    const commonSteps = [9, 10, 11, 13];
    
    let goalSpecificSteps: number[] = [];
    switch (goal) {
      case 'Weight Loss':
        goalSpecificSteps = [7, 8];
        break;
      case 'Muscle Gain':
        goalSpecificSteps = [7, 14];
        break;
      case 'Improved Health':
        goalSpecificSteps = [6, 15];
        break;
      case 'Better Sleep':
        goalSpecificSteps = [12, 16];
        break;
      case 'Stress Reduction':
        goalSpecificSteps = [12, 17];
        break;
      default:
        goalSpecificSteps = [7];
    }
    
    setRelevantSteps([...baseSteps, ...goalSpecificSteps, ...commonSteps]);
  };

  const totalSteps = useMemo(() => relevantSteps.length, [relevantSteps]);
  const progress = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    if (field === 'medicalConditions' || field === 'goals' || field === 'dietaryRestrictions' || field === 'healthConcerns' || field === 'sleepIssues' || field === 'stressTriggers' || field === 'stressManagementTechniques') {
      setFormData(prev => ({
        ...prev,
        [field]: checked
          ? [...(prev[field] as string[]), value]
          : (prev[field] as string[]).filter(item => item !== value)
      }));
    }
  };

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const stepNumber = relevantSteps[step];
    
    switch (stepNumber) {
      case 0: 
        if (!formData.birthday) {
          newErrors.birthday = 'Date of birth is required';
        } else {
          const birthDate = new Date(formData.birthday);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();
          const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
          
          if (actualAge < 18) {
            newErrors.birthday = 'You must be at least 18 years old to use this service';
          }
        }
        break;
      case 1: 
        if (!formData.primaryGoal) {
          newErrors.primaryGoal = 'Please select a primary goal';
        }
        break;
      case 2: 
        if (!formData.pregnant) {
          newErrors.pregnant = 'Please select an option';
        }
        break;
      case 3: 
        if (!formData.currentlyUsingMedicines.trim()) {
          newErrors.currentlyUsingMedicines = 'Please provide information about current medicines';
        }
        break;
      case 4: 
        if (!formData.hasDiabetes) {
          newErrors.hasDiabetes = 'Please select an option';
        }
        break;
      case 5: 
        if (!formData.seenDoctorLastTwoYears) {
          newErrors.seenDoctorLastTwoYears = 'Please select an option';
        }
        break;
      case 6: 
        if (formData.medicalConditions.length === 0) {
          newErrors.medicalConditions = 'Please select at least one option';
        }
        break;
      case 7: 
        if (!formData.height || !formData.weight || !formData.targetWeight) {
          if (!formData.height) newErrors.height = 'Height is required';
          if (!formData.weight) newErrors.weight = 'Weight is required';
          if (!formData.targetWeight) newErrors.targetWeight = 'Target weight is required';
        }
        break;
      case 8: 
        if (!formData.triedWeightLossMethods) {
          newErrors.triedWeightLossMethods = 'Please select an option';
        }
        break;
      case 9: 
        if (formData.goals.length === 0) {
          newErrors.goals = 'Please select at least one goal';
        }
        break;
      case 10: 
        if (!formData.allergies.trim()) {
          newErrors.allergies = 'Please provide allergy information';
        }
        break;
      case 11: 
        // Additional Info is optional - always valid
        break;
      case 12: 
        if (!formData.activityLevel || !formData.sleepHours || !formData.stressLevel) {
          if (!formData.activityLevel) newErrors.activityLevel = 'Please select activity level';
          if (!formData.sleepHours) newErrors.sleepLevel = 'Please select sleep hours';
          if (!formData.stressLevel) newErrors.stressLevel = 'Please select stress level';
        }
        break;
      case 13: 
        if (formData.dietaryRestrictions.length === 0) {
          newErrors.dietaryRestrictions = 'Please select at least one option';
        }
        break;
      case 14: 
        if (!formData.currentWeightliftingRoutine.trim() || !formData.workoutFrequency || !formData.proteinIntake) {
          if (!formData.currentWeightliftingRoutine.trim()) newErrors.currentWeightliftingRoutine = 'Please describe your routine';
          if (!formData.workoutFrequency) newErrors.workoutFrequency = 'Please select frequency';
          if (!formData.proteinIntake) newErrors.proteinIntake = 'Please select protein intake';
        }
        break;
      case 15: 
        if (formData.healthConcerns.length === 0) {
          newErrors.healthConcerns = 'Please select at least one concern';
        }
        break;
      case 16: 
        if (formData.sleepIssues.length === 0) {
          newErrors.sleepIssues = 'Please select at least one option';
        }
        break;
      case 17: 
        if (formData.stressTriggers.length === 0 || formData.stressManagementTechniques.length === 0) {
          if (formData.stressTriggers.length === 0) newErrors.stressTriggers = 'Please select at least one trigger';
          if (formData.stressManagementTechniques.length === 0) newErrors.stressManagementTechniques = 'Please select at least one technique';
        }
        break;
      default: 
        return true;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, relevantSteps]);

  const isStepValid = useCallback((step: number): boolean => {
    const stepNumber = relevantSteps[step];

    switch (stepNumber) {
      case 0:
        if (!formData.birthday) return false;
        const birthDate = new Date(formData.birthday);
        const today = new Date();
        const age =
          today.getFullYear() -
          birthDate.getFullYear() -
          (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
        return age >= 18;

      case 1: return formData.primaryGoal !== '';
      case 2: return formData.pregnant !== '';
      case 3: return formData.currentlyUsingMedicines.trim() !== '';
      case 4: return formData.hasDiabetes !== '';
      case 5: return formData.seenDoctorLastTwoYears !== '';
      case 6: return formData.medicalConditions.length > 0;
      case 7: return !!(formData.height && formData.weight && formData.targetWeight);
      case 8: return formData.triedWeightLossMethods !== '';
      case 9: return formData.goals.length > 0;
      case 10: return formData.allergies.trim() !== '';
      case 11: return true;
      case 12: return !!(formData.activityLevel && formData.sleepHours && formData.stressLevel);
      case 13: return formData.dietaryRestrictions.length > 0;
      case 14: return !!(formData.currentWeightliftingRoutine && formData.workoutFrequency && formData.proteinIntake);
      case 15: return formData.healthConcerns.length > 0;
      case 16: return formData.sleepIssues.length > 0;
      case 17: return formData.stressTriggers.length > 0 && formData.stressManagementTechniques.length > 0;
      default: return true;
    }
  }, [formData, relevantSteps]);

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
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

  const renderStep = useCallback(() => {
    const stepNumber = relevantSteps[currentStep];
    
    switch (stepNumber) {
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
                onChange={(e) => {
                  handleInputChange('birthday', e.target.value);
                  if (errors.birthday) {
                    setErrors(prev => ({ ...prev, birthday: '' }));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.birthday ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.birthday && (
                <p className="mt-2 text-sm text-red-600">{errors.birthday}</p>
              )}
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
                    onChange={(e) => {
                      handlePrimaryGoalChange(e.target.value);
                      if (errors.primaryGoal) {
                        setErrors(prev => ({ ...prev, primaryGoal: '' }));
                      }
                    }}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{goal}</span>
                </label>
              ))}
              {errors.primaryGoal && (
                <p className="mt-2 text-sm text-red-600">{errors.primaryGoal}</p>
              )}
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

      case 14:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <ScaleIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Muscle Building Details</h3>
              <p className="text-gray-600">Tell us about your current fitness routine</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Weightlifting Routine</label>
                <textarea
                  value={formData.currentWeightliftingRoutine}
                  onChange={(e) => handleInputChange('currentWeightliftingRoutine', e.target.value)}
                  placeholder="Describe your current workout routine..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workout Frequency</label>
                <select
                  value={formData.workoutFrequency}
                  onChange={(e) => handleInputChange('workoutFrequency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  <option value="1-2 times per week">1-2 times per week</option>
                  <option value="3-4 times per week">3-4 times per week</option>
                  <option value="5-6 times per week">5-6 times per week</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Protein Intake</label>
                <select
                  value={formData.proteinIntake}
                  onChange={(e) => handleInputChange('proteinIntake', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select protein intake</option>
                  <option value="Less than 50g">Less than 50g</option>
                  <option value="50-100g">50-100g</option>
                  <option value="100-150g">100-150g</option>
                  <option value="More than 150g">More than 150g</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 15:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <HeartIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Concerns</h3>
              <p className="text-gray-600">What specific health areas would you like to improve?</p>
            </div>
            <div className="space-y-3">
              {[
                'Energy levels',
                'Immune system',
                'Digestive health',
                'Mental clarity',
                'Heart health',
                'Joint health',
                'Hormonal balance',
                'Overall wellness'
              ].map(concern => (
                <label key={concern} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.healthConcerns.includes(concern)}
                    onChange={(e) => handleCheckboxChange('healthConcerns', concern, e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{concern}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 16:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sleep Issues</h3>
              <p className="text-gray-600">What sleep challenges are you experiencing?</p>
            </div>
            <div className="space-y-3">
              {[
                'Difficulty falling asleep',
                'Waking up frequently',
                'Waking up too early',
                'Not feeling rested',
                'Irregular sleep schedule',
                'Stress-related insomnia',
                'None of the above'
              ].map(issue => (
                <label key={issue} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.sleepIssues.includes(issue)}
                    onChange={(e) => handleCheckboxChange('sleepIssues', issue, e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{issue}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 17:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Stress Management</h3>
              <p className="text-gray-600">Tell us about your stress and coping mechanisms</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What are your main stress triggers?</label>
                <div className="space-y-2">
                  {[
                    'Work pressure',
                    'Family responsibilities',
                    'Financial concerns',
                    'Health issues',
                    'Relationship problems',
                    'Social obligations'
                  ].map(trigger => (
                    <label key={trigger} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.stressTriggers.includes(trigger)}
                        onChange={(e) => handleCheckboxChange('stressTriggers', trigger, e.target.checked)}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{trigger}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current stress management techniques</label>
                <div className="space-y-2">
                  {[
                    'Exercise',
                    'Meditation',
                    'Deep breathing',
                    'Journaling',
                    'Talking with friends',
                    'Professional therapy',
                    'None currently'
                  ].map(technique => (
                    <label key={technique} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.stressManagementTechniques.includes(technique)}
                        onChange={(e) => handleCheckboxChange('stressManagementTechniques', technique, e.target.checked)}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{technique}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  }, [currentStep, formData, errors, handleInputChange, handleCheckboxChange, relevantSteps]);

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
                disabled={!isStepValid(currentStep)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  isStepValid(currentStep)
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
                disabled={!isStepValid(currentStep)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  isStepValid(currentStep)
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
