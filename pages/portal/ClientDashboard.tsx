import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderOpen, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  CheckCircle,
  Upload,
  Download,
  Send,
  Calendar
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { client } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Church, Project, Assessment, Message } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [church, setChurch] = useState<Church | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadClientData();
    }
  }, [authLoading, user]);

  const loadClientData = async () => {
    try {
      const [churchesResponse, projectsResponse, assessmentsResponse, messagesResponse] = await Promise.all([
        client.entities.churches.query({ limit: 1 }),
        client.entities.projects.query({ sort: '-created_at', limit: 20 }),
        client.entities.assessments.query({ sort: '-created_at', limit: 10 }),
        client.entities.messages.query({ sort: '-created_at', limit: 50 })
      ]);
      
      if (churchesResponse.data.items.length > 0) {
        setChurch(churchesResponse.data.items[0]);
      }
      setProjects(projectsResponse.data.items);
      setAssessments(assessmentsResponse.data.items);
      setMessages(messagesResponse.data.items);
    } catch (error) {
      console.error('Failed to load client data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActiveProjects = () => {
    return projects.filter(p => p.status === 'in_progress' || p.status === 'planning');
  };

  const getCompletedProjects = () => {
    return projects.filter(p => p.status === 'completed');
  };

  const getUnreadMessages = () => {
    return messages.filter(m => !m.read && m.sender_type === 'admin');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to access your church portal.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome, {church?.name || 'Church Leader'}
          </h1>
          <p className="text-gray-600">Track your projects, access resources, and stay connected with your consultant.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-[#F4E2A3]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-[#F4E2A3]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{getActiveProjects().length}</div>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{getCompletedProjects().length}</div>
              <p className="text-xs text-gray-500 mt-1">Projects finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Assessments</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{assessments.length}</div>
              <p className="text-xs text-gray-500 mt-1">Completed evaluations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{getUnreadMessages().length}</div>
              <p className="text-xs text-gray-500 mt-1">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-white border-2 border-gray-200">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No projects yet"
                description="Your projects will appear here once your consultant creates them."
              />
            ) : (
              <div className="space-y-6">
                {projects.map((project) => (
                  <Card key={project.id} className="border-2 hover:border-[#F4E2A3] transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-black">{project.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {project.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <StatusBadge status={project.status} type="project" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-black">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Timeline */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {project.start_date && (
                          <div>
                            <span className="text-gray-600">Start Date:</span>
                            <p className="font-medium text-black">
                              {format(new Date(project.start_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        )}
                        {project.end_date && (
                          <div>
                            <span className="text-gray-600">Target Date:</span>
                            <p className="font-medium text-black">
                              {format(new Date(project.end_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                          View Details
                        </Button>
                        <Button variant="outline" className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
                          <FileText className="h-4 w-4 mr-2" />
                          Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            {assessments.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No assessments yet"
                description="Complete assessments will appear here with scores and recommendations."
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {assessments.map((assessment) => (
                  <Card key={assessment.id} className="border-2 hover:border-[#F4E2A3] transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-black">{assessment.title}</CardTitle>
                          <CardDescription className="capitalize">{assessment.category}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-[#F4E2A3]">{assessment.score}</div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {assessment.recommendations && (
                        <div>
                          <h4 className="font-semibold text-black mb-2">Recommendations:</h4>
                          <p className="text-sm text-gray-600">{assessment.recommendations}</p>
                        </div>
                      )}
                      {assessment.completed_at && (
                        <div className="text-xs text-gray-500 pt-3 border-t">
                          Completed {format(new Date(assessment.completed_at), 'MMM d, yyyy')}
                        </div>
                      )}
                      <Button className="w-full bg-black text-[#F4E2A3] hover:bg-gray-900">
                        View Full Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shared Documents</CardTitle>
                    <CardDescription>Access contracts, resources, and project files</CardDescription>
                  </div>
                  <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={FileText}
                  title="No documents yet"
                  description="Shared documents and contracts will appear here."
                  actionLabel="Upload Document"
                  onAction={() => toast.info('File upload coming soon')}
                />

                {/* DocuSign Integration Section */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-[#F4E2A3]">
                  <div className="flex items-start">
                    <FileText className="h-6 w-6 text-[#F4E2A3] mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-2">Contract Signing</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Sign your consulting agreement securely with DocuSign. You'll receive an email when documents are ready for signature.
                      </p>
                      <Button variant="outline" className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
                        View Pending Signatures
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>Communicate with your consultant</CardDescription>
                  </div>
                  <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                    <Send className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="No messages yet"
                    description="Start a conversation with your consultant."
                    actionLabel="Send Message"
                    onAction={() => toast.info('Messaging feature coming soon')}
                  />
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 rounded-lg border-2 ${
                          !message.read && message.sender_type === 'admin'
                            ? 'border-[#F4E2A3] bg-[#F4E2A3]/10' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              message.sender_type === 'admin' ? 'bg-[#F4E2A3]' : 'bg-gray-300'
                            }`}>
                              <span className="text-black font-semibold text-sm">
                                {message.sender_type === 'admin' ? 'EC' : 'You'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-black">
                                {message.sender_type === 'admin' ? 'Erskine Currie' : church?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          {!message.read && message.sender_type === 'admin' && (
                            <span className="text-xs bg-[#F4E2A3] text-black px-2 py-1 rounded font-medium">
                              New
                            </span>
                          )}
                        </div>
                        {message.subject && (
                          <h4 className="font-semibold text-black mb-1">{message.subject}</h4>
                        )}
                        <p className="text-gray-700">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}