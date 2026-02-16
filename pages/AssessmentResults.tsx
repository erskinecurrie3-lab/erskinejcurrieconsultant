import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { client } from '@/lib/api';
import type { Assessment } from '@/lib/types';
import { toast } from 'sonner';

const categories = [
  { id: 'worship', name: 'Worship Excellence', color: '#F4E2A3' },
  { id: 'leadership', name: 'Leadership Health', color: '#000000' },
  { id: 'discipleship', name: 'Discipleship Systems', color: '#666666' },
  { id: 'outreach', name: 'Outreach & Evangelism', color: '#F4E2A3' },
  { id: 'systems', name: 'Operational Systems', color: '#333333' }
];

export default function AssessmentResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadAssessment();
    }
  }, [id]);

  const loadAssessment = async () => {
    try {
      const response = await client.entities.assessments.get({ id: id! });
      const data = response.data;
      setAssessment(data);

      // Parse recommendations JSON
      if (data.recommendations) {
        try {
          const parsed = JSON.parse(data.recommendations);
          if (parsed.categoryScores) {
            setCategoryScores(parsed.categoryScores);
          }
          if (parsed.recommendations) {
            setRecommendations(parsed.recommendations);
          }
        } catch (e) {
          console.error('Failed to parse recommendations:', e);
        }
      }
      setError(null);
    } catch (error: any) {
      console.error('Failed to load assessment:', error);
      const errorMsg = error?.data?.detail || error?.message || 'Failed to load assessment results';
      setError(errorMsg);
      
      // Show user-friendly error message
      if (error?.status === 404) {
        toast.error('Assessment not found. It may have been deleted or you may not have access to it.');
      } else if (error?.status === 401 || error?.status === 403) {
        toast.error('Please sign in to view assessment results');
      } else {
        toast.error('Failed to load assessment results');
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-[#F4E2A3]';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return CheckCircle;
    if (score >= 50) return TrendingUp;
    return AlertCircle;
  };

  const handleExportPDF = () => {
    toast.info('PDF export feature coming soon');
    // In production, this would generate a branded PDF report
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle>Assessment Not Found</CardTitle>
              <CardDescription>
                {error === 'Assessments not found' 
                  ? "The assessment you're looking for doesn't exist or you don't have access to it."
                  : error || "The assessment you're looking for doesn't exist."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => navigate('/client/assessments')}
                className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
              >
                View My Assessments
              </Button>
              <Button 
                asChild
                variant="outline"
                className="w-full border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
              >
                <Link to="/assessment">Take New Assessment</Link>
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
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/client/assessments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Assessment Results</h1>
              <p className="text-gray-600">Your comprehensive church health evaluation</p>
            </div>
            <Button onClick={handleExportPDF} className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8 border-4 border-[#F4E2A3]">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(assessment.score)}`}>
                {assessment.score}
              </div>
              <div className="text-2xl font-semibold text-black mb-2">
                {getScoreLabel(assessment.score)}
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your overall church health score indicates {assessment.score >= 70 ? 'strong' : 'developing'} ministry foundations. 
                Review the detailed breakdown below for specific areas of focus.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {categories.map((category) => {
            const score = categoryScores[category.id] || 0;
            const Icon = getScoreIcon(score);
            
            return (
              <Card key={category.id} className="border-2 hover:border-[#F4E2A3] transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className={`h-6 w-6 mr-3 ${getScoreColor(score)}`} />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={score} className="h-3 mb-2" />
                  <p className="text-sm text-gray-600">
                    {getScoreLabel(score)} - {score >= 70 ? 'Keep up the great work!' : 'Opportunity for growth'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-black">Personalized Recommendations</CardTitle>
            <CardDescription>
              Based on your assessment, here are specific areas to focus on for ministry growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="w-8 h-8 bg-[#F4E2A3] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-black font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 flex-1">{rec}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No specific recommendations available for this assessment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-black text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-[#F4E2A3]">Ready to Take Action?</CardTitle>
            <CardDescription className="text-gray-300">
              Schedule a consultation to discuss your results and create a customized growth plan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
              <Link to="/booking">Schedule Consultation</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-[#F4E2A3] text-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
              <Link to="/assessment">Retake Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}