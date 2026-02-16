import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/api';
import { toast } from 'sonner';

interface AssessmentRecord {
  id: string;
  date: string;
  overallScore: number;
  category: string;
  recommendations: number;
}

export default function ClientAssessments() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadAssessments();
  }, [user]);

  const loadAssessments = async () => {
    try {
      // Try to fetch real assessments from backend
      const response = await client.entities.assessments.query({
        query: {},
        sort: '-created_at',
        limit: 100
      });

      if (response.data.items && response.data.items.length > 0) {
        // Map backend data to frontend format
        const mappedAssessments = response.data.items.map((item: any) => ({
          id: item.id.toString(),
          date: item.completed_at || item.created_at,
          overallScore: item.score,
          category: item.category,
          recommendations: item.recommendations ? JSON.parse(item.recommendations).recommendations?.length || 0 : 0
        }));
        setAssessments(mappedAssessments);
      } else {
        // No assessments found - show empty state
        setAssessments([]);
      }
    } catch (error: any) {
      console.error('Failed to load assessments:', error);
      // If error is not authentication related, show empty state
      if (error?.status !== 401 && error?.status !== 403) {
        setAssessments([]);
      } else {
        toast.error('Failed to load assessments');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>Please sign in to view your assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={login} className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Thriving': 'default',
      'Developing': 'secondary',
      'Emerging': 'outline'
    };
    return <Badge variant={variants[category] || 'outline'}>{category}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Church Health Assessments</h1>
            <p className="text-gray-600">
              Track your church's health and growth over time
            </p>
          </div>

          {/* Take New Assessment CTA */}
          <Card className="border-2 border-[#F4E2A3] bg-gradient-to-r from-white to-[#F4E2A3] bg-opacity-10 mb-8">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-black mb-2">Ready for a New Assessment?</h2>
                  <p className="text-gray-700">
                    Take the 25-question church health assessment to get personalized recommendations 
                    and track your ministry's progress.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/assessment')}
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
                >
                  Start Assessment
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
                <ClipboardList className="h-4 w-4 text-[#F4E2A3]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{assessments.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Latest Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#F4E2A3]" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${assessments.length > 0 ? getScoreColor(assessments[0].overallScore) : 'text-gray-400'}`}>
                  {assessments.length > 0 ? `${assessments[0].overallScore}%` : 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Last Assessment</CardTitle>
                <Calendar className="h-4 w-4 text-[#F4E2A3]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">
                  {assessments.length > 0 
                    ? new Date(assessments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessment History */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Assessment History</h2>
            
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Loading assessments...
                </CardContent>
              </Card>
            ) : assessments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No assessments taken yet</p>
                  <Button 
                    onClick={() => navigate('/assessment')}
                    className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                  >
                    Take Your First Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              assessments.map((assessment, index) => (
                <Card key={assessment.id} className="border-2 border-gray-200 hover:border-[#F4E2A3] transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-black">
                            Assessment #{assessments.length - index}
                          </CardTitle>
                          {getCategoryBadge(assessment.category)}
                        </div>
                        <CardDescription>
                          Completed on {new Date(assessment.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                          {assessment.overallScore}%
                        </div>
                        <p className="text-sm text-gray-600">Overall Score</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Recommendations Generated</span>
                      <span className="font-medium text-black">{assessment.recommendations} items</span>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        asChild
                        variant="outline" 
                        className="flex-1 border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
                      >
                        <Link to={`/assessment/results/${assessment.id}`}>
                          View Full Report
                        </Link>
                      </Button>
                      <Button 
                        onClick={() => navigate('/assessment')}
                        className="flex-1 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                      >
                        Retake Assessment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Info Section */}
          <Card className="mt-8 border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl text-black">About Church Health Assessments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Our comprehensive 25-question assessment evaluates your church across five critical areas:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#F4E2A3] mr-2">•</span>
                  <span><strong>Spiritual Vitality:</strong> Prayer life, worship, and spiritual growth</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4E2A3] mr-2">•</span>
                  <span><strong>Leadership Health:</strong> Vision, decision-making, and team dynamics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4E2A3] mr-2">•</span>
                  <span><strong>Community Engagement:</strong> Outreach, service, and local impact</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4E2A3] mr-2">•</span>
                  <span><strong>Discipleship:</strong> Member growth, small groups, and mentoring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#F4E2A3] mr-2">•</span>
                  <span><strong>Operational Excellence:</strong> Administration, finances, and facilities</span>
                </li>
              </ul>
              <p className="text-gray-700">
                We recommend taking the assessment every 3-6 months to track progress and identify areas for improvement.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}