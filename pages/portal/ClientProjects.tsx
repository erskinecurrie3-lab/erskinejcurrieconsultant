import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Folder, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate?: string;
  consultant: string;
  nextMilestone: string;
}

export default function ClientProjects() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Simulate loading projects
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          name: 'Church Growth Strategy',
          description: 'Comprehensive plan for expanding congregation and community outreach',
          status: 'active',
          progress: 65,
          startDate: '2024-01-15',
          consultant: 'Erskine J Currie',
          nextMilestone: 'Community Survey Analysis - Due Feb 20'
        },
        {
          id: '2',
          name: 'Worship Service Enhancement',
          description: 'Improving worship experience through music, technology, and engagement',
          status: 'active',
          progress: 40,
          startDate: '2024-02-01',
          consultant: 'Erskine J Currie',
          nextMilestone: 'Audio System Evaluation - Due Feb 25'
        },
        {
          id: '3',
          name: 'Leadership Development Program',
          description: 'Training program for church leaders and ministry coordinators',
          status: 'completed',
          progress: 100,
          startDate: '2023-10-01',
          endDate: '2024-01-10',
          consultant: 'Erskine J Currie',
          nextMilestone: 'Project Completed'
        }
      ]);
      setLoading(false);
    }, 500);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>Please sign in to view your projects</CardDescription>
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any }> = {
      active: { variant: 'default', icon: Clock },
      completed: { variant: 'secondary', icon: CheckCircle },
      'on-hold': { variant: 'outline', icon: AlertCircle }
    };
    const config = variants[status] || variants.active;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">My Projects</h1>
            <p className="text-gray-600">
              Track your consulting projects and milestones
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
                <Folder className="h-4 w-4 text-[#F4E2A3]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{activeProjects.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{completedProjects.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Progress</CardTitle>
                <Calendar className="h-4 w-4 text-[#F4E2A3]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">
                  {activeProjects.length > 0 
                    ? Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Tabs */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Projects ({activeProjects.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
              <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {loading ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Loading projects...
                  </CardContent>
                </Card>
              ) : activeProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No active projects</p>
                    <Button 
                      onClick={() => navigate('/booking')}
                      className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                    >
                      Book a Consultation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activeProjects.map(project => (
                  <Card key={project.id} className="border-2 border-gray-200 hover:border-[#F4E2A3] transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-black mb-2">{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-black">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Consultant</p>
                          <p className="font-medium text-black">{project.consultant}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Start Date</p>
                          <p className="font-medium text-black">
                            {new Date(project.startDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#F4E2A3] bg-opacity-20 border-l-4 border-[#F4E2A3] p-4 rounded">
                        <p className="text-sm font-medium text-black mb-1">Next Milestone</p>
                        <p className="text-sm text-gray-700">{project.nextMilestone}</p>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
                          View Details
                        </Button>
                        <Button className="flex-1 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                          Contact Consultant
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {completedProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    No completed projects yet
                  </CardContent>
                </Card>
              ) : (
                completedProjects.map(project => (
                  <Card key={project.id} className="border-2 border-gray-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-black mb-2">{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Start Date</p>
                          <p className="font-medium text-black">
                            {new Date(project.startDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Completion Date</p>
                          <p className="font-medium text-black">
                            {project.endDate && new Date(project.endDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Consultant</p>
                          <p className="font-medium text-black">{project.consultant}</p>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
                        View Project Summary
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              {projects.map(project => (
                <Card key={project.id} className="border-2 border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-black mb-2">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Started: {new Date(project.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <Button variant="outline" size="sm" className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}