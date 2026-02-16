import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/api';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  category: string;
  weight: number;
}

const assessmentQuestions: Question[] = [
  // Worship Questions (20%)
  { id: 'w1', text: 'Our worship services consistently engage and inspire the congregation', category: 'worship', weight: 1 },
  { id: 'w2', text: 'We have a well-trained and spiritually mature worship team', category: 'worship', weight: 1 },
  { id: 'w3', text: 'Our worship planning process is intentional and collaborative', category: 'worship', weight: 1 },
  { id: 'w4', text: 'We regularly evaluate and improve our worship experiences', category: 'worship', weight: 1 },
  { id: 'w5', text: 'Our worship integrates well with the overall service flow', category: 'worship', weight: 1 },
  
  // Leadership Questions (25%)
  { id: 'l1', text: 'Our church has clear vision and mission statements that guide decisions', category: 'leadership', weight: 1.25 },
  { id: 'l2', text: 'Leadership roles and responsibilities are well-defined', category: 'leadership', weight: 1.25 },
  { id: 'l3', text: 'We have a healthy leadership development pipeline', category: 'leadership', weight: 1.25 },
  { id: 'l4', text: 'Decision-making processes are transparent and effective', category: 'leadership', weight: 1.25 },
  { id: 'l5', text: 'Our leaders receive ongoing training and support', category: 'leadership', weight: 1.25 },
  
  // Discipleship Questions (20%)
  { id: 'd1', text: 'We have clear pathways for spiritual growth and maturity', category: 'discipleship', weight: 1 },
  { id: 'd2', text: 'Small groups or discipleship programs are thriving', category: 'discipleship', weight: 1 },
  { id: 'd3', text: 'Members are actively engaged in Bible study and prayer', category: 'discipleship', weight: 1 },
  { id: 'd4', text: 'We track and celebrate spiritual growth milestones', category: 'discipleship', weight: 1 },
  { id: 'd5', text: 'Mentorship and accountability relationships are common', category: 'discipleship', weight: 1 },
  
  // Outreach Questions (20%)
  { id: 'o1', text: 'We have an active and effective evangelism strategy', category: 'outreach', weight: 1 },
  { id: 'o2', text: 'Our church regularly serves the local community', category: 'outreach', weight: 1 },
  { id: 'o3', text: 'We see consistent growth through new conversions', category: 'outreach', weight: 1 },
  { id: 'o4', text: 'Members are equipped and confident to share their faith', category: 'outreach', weight: 1 },
  { id: 'o5', text: 'We have strong partnerships with community organizations', category: 'outreach', weight: 1 },
  
  // Systems Questions (15%)
  { id: 's1', text: 'Our administrative and operational systems run smoothly', category: 'systems', weight: 0.75 },
  { id: 's2', text: 'Financial management and reporting are healthy and transparent', category: 'systems', weight: 0.75 },
  { id: 's3', text: 'Communication systems effectively reach our congregation', category: 'systems', weight: 0.75 },
  { id: 's4', text: 'We have clear processes for welcoming and integrating newcomers', category: 'systems', weight: 0.75 },
  { id: 's5', text: 'Technology is leveraged effectively for ministry', category: 'systems', weight: 0.75 }
];

const categories = [
  { id: 'worship', name: 'Worship Excellence', weight: 0.20 },
  { id: 'leadership', name: 'Leadership Health', weight: 0.25 },
  { id: 'discipleship', name: 'Discipleship Systems', weight: 0.20 },
  { id: 'outreach', name: 'Outreach & Evangelism', weight: 0.20 },
  { id: 'systems', name: 'Operational Systems', weight: 0.15 }
];

export default function Assessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const currentCategory = categories[currentStep];
  const categoryQuestions = assessmentQuestions.filter(q => q.category === currentCategory.id);
  const totalSteps = categories.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isStepComplete = () => {
    return categoryQuestions.every(q => answers[q.id] !== undefined);
  };

  const calculateScores = () => {
    const categoryScores: Record<string, number> = {};
    
    categories.forEach(category => {
      const catQuestions = assessmentQuestions.filter(q => q.category === category.id);
      const totalPoints = catQuestions.reduce((sum, q) => sum + (answers[q.id] || 0) * q.weight, 0);
      const maxPoints = catQuestions.reduce((sum, q) => sum + 5 * q.weight, 0);
      categoryScores[category.id] = Math.round((totalPoints / maxPoints) * 100);
    });

    const overallScore = categories.reduce((sum, cat) => {
      return sum + (categoryScores[cat.id] * cat.weight);
    }, 0);

    return {
      overall: Math.round(overallScore),
      categories: categoryScores
    };
  };

  const handleNext = () => {
    if (!isStepComplete()) {
      toast.error('Please answer all questions before continuing');
      return;
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveProgress = async () => {
    if (!user) {
      toast.error('Please sign in to save your progress');
      return;
    }

    setSaving(true);
    try {
      const scores = calculateScores();
      await client.entities.assessments.create({
        data: {
          title: 'Church Health Assessment (In Progress)',
          category: 'comprehensive',
          score: scores.overall,
          recommendations: JSON.stringify(answers),
          completed_at: null
        }
      });
      toast.success('Progress saved successfully');
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast.error('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to submit your assessment');
      return;
    }

    setSaving(true);
    try {
      const scores = calculateScores();
      const recommendations = generateRecommendations(scores);
      
      const result = await client.entities.assessments.create({
        data: {
          title: 'Church Health Assessment',
          category: 'comprehensive',
          score: scores.overall,
          recommendations: JSON.stringify({
            answers,
            categoryScores: scores.categories,
            recommendations
          }),
          completed_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      });

      toast.success('Assessment completed successfully!');
      navigate(`/assessment/results/${result.data.id}`);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSaving(false);
    }
  };

  const generateRecommendations = (scores: { overall: number; categories: Record<string, number> }) => {
    const recommendations: string[] = [];
    
    Object.entries(scores.categories).forEach(([categoryId, score]) => {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      if (score < 50) {
        recommendations.push(`${category.name}: Critical attention needed. Consider immediate consultation.`);
      } else if (score < 70) {
        recommendations.push(`${category.name}: Room for improvement. Focus on building stronger foundations.`);
      } else if (score < 85) {
        recommendations.push(`${category.name}: Good foundation. Optimize systems for greater impact.`);
      } else {
        recommendations.push(`${category.name}: Excellent! Maintain momentum and share best practices.`);
      }
    });

    return recommendations;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>Please sign in to take the church assessment.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Church Health Assessment</h1>
          <p className="text-gray-600">
            Answer honestly to receive personalized recommendations for your ministry
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 border-2 border-[#F4E2A3]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Section {currentStep + 1} of {totalSteps}: {currentCategory.name}
              </span>
              <span className="text-sm font-bold text-black">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-black">{currentCategory.name}</CardTitle>
            <CardDescription>
              Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {categoryQuestions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <Label className="text-base font-medium text-black">
                  {index + 1}. {question.text}
                </Label>
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex items-center space-x-2 flex-1">
                      <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                      <Label 
                        htmlFor={`${question.id}-${value}`}
                        className="cursor-pointer text-sm"
                      >
                        {value === 1 && 'Strongly Disagree'}
                        {value === 2 && 'Disagree'}
                        {value === 3 && 'Neutral'}
                        {value === 4 && 'Agree'}
                        {value === 5 && 'Strongly Agree'}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSaveProgress}
            disabled={saving}
            className="border-gray-300 hover:bg-gray-100"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepComplete() || saving}
            className="flex-1 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
          >
            {currentStep === totalSteps - 1 ? 'Complete Assessment' : 'Next Section'}
            {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}