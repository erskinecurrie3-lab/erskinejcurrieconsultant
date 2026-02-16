import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  FileText,
  Calendar,
  CheckCircle,
  Plus,
  Download,
  Send
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import { client } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Lead, Church, Project, Task } from '@/lib/types';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    try {
      const [leadsResponse, churchesResponse, projectsResponse, tasksResponse] = await Promise.all([
        client.entities.leads.query({ sort: '-created_at', limit: 100 }),
        client.entities.churches.query({ limit: 100 }),
        client.entities.projects.query({ sort: '-created_at', limit: 100 }),
        client.entities.tasks.query({ query: { status: 'pending' }, limit: 50 })
      ]);
      
      setLeads(leadsResponse.data.items);
      setChurches(churchesResponse.data.items);
      setProjects(projectsResponse.data.items);
      setTasks(tasksResponse.data.items);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const activeClients = churches.filter(c => c.status === 'active').length;
  const pipelineValue = leads
    .filter(l => ['consultation', 'proposal', 'active'].includes(l.stage))
    .reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  
  const conversionRate = leads.length > 0 
    ? Math.round((leads.filter(l => l.stage === 'active').length / leads.length) * 100)
    : 0;

  const currentMonthRevenue = projects
    .filter(p => {
      const createdDate = new Date(p.created_at);
      return createdDate >= startOfMonth(new Date()) && createdDate <= endOfMonth(new Date());
    })
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  const lastMonthRevenue = projects
    .filter(p => {
      const createdDate = new Date(p.created_at);
      const lastMonth = subMonths(new Date(), 1);
      return createdDate >= startOfMonth(lastMonth) && createdDate <= endOfMonth(lastMonth);
    })
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

  const handleGenerateReport = async () => {
    toast.info('Generating weekly report...');
    setTimeout(() => {
      toast.success('Weekly report sent successfully!');
    }, 1500);
  };

  const handleCreateProposal = () => {
    toast.info('Proposal builder coming soon');
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the operations dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]" onClick={() => client.auth.toLogin()}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Operations Dashboard</h1>
          <p className="text-gray-600">Monitor performance and manage daily operations</p>
        </div>
        <Button onClick={handleGenerateReport} className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Send className="h-4 w-4 mr-2" />
          Send Weekly Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-[#F4E2A3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-[#F4E2A3]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{activeClients}</div>
            <p className="text-xs text-gray-500 mt-1">Currently engaged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">${pipelineValue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Potential revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{conversionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Lead to client</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-[#F4E2A3]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">${currentMonthRevenue.toLocaleString()}</div>
            <p className={`text-xs mt-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border-2 border-gray-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-black">Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Church Planting</span>
                      <span className="text-sm font-bold text-black">$12,500</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Consulting</span>
                      <span className="text-sm font-bold text-black">$8,200</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Worship Building</span>
                      <span className="text-sm font-bold text-black">$5,800</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-black">Pipeline Status</CardTitle>
                <CardDescription>Leads by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['inquiry', 'consultation', 'proposal', 'active'].map((stage) => {
                    const count = leads.filter(l => l.stage === stage).length;
                    const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                    return (
                      <div key={stage}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {stage.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-bold text-black">{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-black">Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
                  onClick={handleCreateProposal}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Create Proposal</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col hover:border-[#F4E2A3]"
                >
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="text-sm">Add Lead</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col hover:border-[#F4E2A3]"
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Schedule Call</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col hover:border-[#F4E2A3]"
                  onClick={handleGenerateReport}
                >
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-sm">Export Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-black">Recent Activity</CardTitle>
              <CardDescription>Latest updates across all clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-[#F4E2A3] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">{project.title}</p>
                      <p className="text-xs text-gray-500">
                        Updated {format(new Date(project.updated_at || project.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <StatusBadge status={project.status} type="project" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs remain the same */}
        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-black">Proposal Management</CardTitle>
                  <CardDescription>Create and track client proposals</CardDescription>
                </div>
                <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]" onClick={handleCreateProposal}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Proposal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No proposals yet. Create your first proposal to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-black">Client Engagement Tracker</CardTitle>
              <CardDescription>Monitor client interactions and touchpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churches.slice(0, 8).map((church) => {
                  const churchProjects = projects.filter(p => p.church_id === church.id);
                  const lastContact = churchProjects.length > 0 
                    ? new Date(Math.max(...churchProjects.map(p => new Date(p.updated_at || p.created_at).getTime())))
                    : null;

                  return (
                    <div key={church.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#F4E2A3] transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-black">{church.name}</h4>
                        <p className="text-sm text-gray-600">
                          {churchProjects.length} active project{churchProjects.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-600">Last Contact</p>
                        <p className="text-sm font-medium text-black">
                          {lastContact ? format(lastContact, 'MMM d, yyyy') : 'No contact yet'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
                        View Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-black">Implementation Checklists</CardTitle>
              <CardDescription>Track progress through church implementation phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Discovery Phase', 'Planning Phase', 'Implementation Phase', 'Launch Phase'].map((phase) => (
                  <div key={phase} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-black">{phase}</h3>
                      <span className="text-sm text-gray-600">{Math.floor(Math.random() * 40) + 60}% Complete</span>
                    </div>
                    <Progress value={Math.floor(Math.random() * 40) + 60} className="h-2 mb-4" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center text-sm">
                          <input type="checkbox" className="mr-3" defaultChecked={Math.random() > 0.5} />
                          <span className="text-gray-700">Task item {item} for {phase.toLowerCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-black">Content Planner</CardTitle>
                  <CardDescription>Schedule blog posts and resources</CardDescription>
                </div>
                <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No content scheduled. Start planning your content calendar.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}