import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Target,
  BookOpen,
  Award,
  Music,
  Heart,
  Users,
  Briefcase
} from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Welcome', icon: Heart },
  { id: 2, title: 'Personal Info', icon: User },
  { id: 3, title: 'Your Role', icon: Briefcase },
  { id: 4, title: 'Goals', icon: Target },
  { id: 5, title: 'Experience', icon: Music },
  { id: 6, title: 'Assessment', icon: BookOpen },
  { id: 7, title: 'Complete', icon: Award },
];

const ROLES = [
  {
    id: 'participant',
    title: 'Participant',
    description: 'I want to learn and grow in worship ministry',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'mentor',
    title: 'Mentor',
    description: 'I want to guide and mentor worship leaders',
    icon: Users,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'pastor',
    title: 'Pastor',
    description: 'I oversee worship ministry in my church',
    icon: Heart,
    color: 'bg-purple-100 text-purple-700'
  }
];

const GOALS = [
  'Improve worship leading skills',
  'Learn music theory',
  'Build a worship team',
  'Grow spiritually',
  'Learn sound engineering',
  'Develop leadership skills',
  'Learn new instruments',
  'Songwriting & composition'
];

const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    question: 'How many years of worship ministry experience do you have?',
    options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years']
  },
  {
    id: 2,
    question: 'What is your primary instrument or skill?',
    options: ['Vocals', 'Guitar', 'Keys/Piano', 'Other']
  },
  {
    id: 3,
    question: 'How often do you lead or participate in worship?',
    options: ['Rarely', 'Monthly', 'Weekly', 'Multiple times a week']
  },
  {
    id: 4,
    question: 'What is your comfort level with leading a team?',
    options: ['Not comfortable', 'Somewhat comfortable', 'Comfortable', 'Very comfortable']
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    church: '',
    role: '',
    goals: [] as string[],
    assessmentAnswers: {} as Record<number, string>
  });
  const [submitting, setSubmitting] = useState(false);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleAssessmentAnswer = (questionId: number, answer: string) => {
    setFormData(prev => ({
      ...prev,
      assessmentAnswers: {
        ...prev.assessmentAnswers,
        [questionId]: answer
      }
    }));
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const assessmentScore = Object.keys(formData.assessmentAnswers).length * 25;

      await client.entities.user_onboarding.create({
        data: {
          role: formData.role,
          goals: formData.goals.join(', '),
          assessment_score: assessmentScore,
          is_completed: true,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      });

      toast.success('Onboarding completed successfully!');

      // Navigate based on role
      switch (formData.role) {
        case 'mentor':
          navigate('/lms/mentor/overview');
          break;
        case 'pastor':
          navigate('/lms/pastor');
          break;
        case 'participant':
        default:
          navigate('/lms/participant/dashboard');
          break;
      }
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
      case 3:
        return formData.role !== '';
      case 4:
        return formData.goals.length > 0;
      case 6:
        return Object.keys(formData.assessmentAnswers).length === ASSESSMENT_QUESTIONS.length;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-2">
          <CardContent className="p-8">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-[#F4E2A3] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-black" />
                </div>
                <h1 className="text-3xl font-bold text-black mb-4">
                  Welcome to WBC Training
                </h1>
                <p className="text-gray-600 text-lg mb-2">
                  We're excited to have you join our worship community.
                </p>
                <p className="text-gray-500">
                  Let's get you set up with a personalized learning experience.
                </p>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-6">Tell us about yourself</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Church (Optional)</label>
                    <Input
                      value={formData.church}
                      onChange={(e) => setFormData({ ...formData, church: e.target.value })}
                      placeholder="Enter your church name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Role Selection - NO ADMIN */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">What's your role?</h2>
                <p className="text-gray-600 mb-6">Select the role that best describes you</p>
                <div className="grid gap-4">
                  {ROLES.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.role === role.id
                          ? 'border-[#F4E2A3] bg-[#F4E2A3] bg-opacity-10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role.color}`}>
                          <role.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">{role.title}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        {formData.role === role.id && (
                          <CheckCircle className="h-6 w-6 text-[#F4E2A3] ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Goals */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">What are your goals?</h2>
                <p className="text-gray-600 mb-6">Select all that apply</p>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`p-3 rounded-lg border-2 text-sm text-left transition-all ${
                        formData.goals.includes(goal)
                          ? 'border-[#F4E2A3] bg-[#F4E2A3] bg-opacity-10 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {formData.goals.includes(goal) && (
                          <CheckCircle className="h-4 w-4 text-[#F4E2A3] flex-shrink-0" />
                        )}
                        <span>{goal}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Experience */}
            {currentStep === 5 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Music className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-black mb-4">
                  Let's assess your experience
                </h2>
                <p className="text-gray-600">
                  Answer a few quick questions so we can recommend the best courses for you.
                </p>
              </div>
            )}

            {/* Step 6: Assessment */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-6">Quick Assessment</h2>
                <div className="space-y-6">
                  {ASSESSMENT_QUESTIONS.map(q => (
                    <div key={q.id}>
                      <p className="font-medium mb-3">{q.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map(option => (
                          <button
                            key={option}
                            onClick={() => handleAssessmentAnswer(q.id, option)}
                            className={`p-3 rounded-lg border-2 text-sm transition-all ${
                              formData.assessmentAnswers[q.id] === option
                                ? 'border-[#F4E2A3] bg-[#F4E2A3] bg-opacity-10 font-medium'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Complete */}
            {currentStep === 7 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-black mb-4">
                  You're all set!
                </h2>
                <p className="text-gray-600 mb-2">
                  Your personalized learning path is ready.
                </p>
                <p className="text-gray-500 text-sm">
                  Click "Get Started" to begin your journey.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={submitting}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {submitting ? 'Setting up...' : 'Get Started'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}