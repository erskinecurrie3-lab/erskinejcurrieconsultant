import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Filter, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock,
  Phone,
  Mail,
  Building2
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { client } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Lead, Task } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CRM() {
  const { user, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      const [leadsResponse, tasksResponse] = await Promise.all([
        client.entities.leads.query({ sort: '-created_at', limit: 100 }),
        client.entities.tasks.query({ 
          query: { status: 'pending' },
          sort: 'due_date',
          limit: 50 
        })
      ]);
      
      setLeads(leadsResponse.data.items);
      setTasks(tasksResponse.data.items);
    } catch (error) {
      console.error('Failed to load CRM data:', error);
      toast.error('Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  const getStageCount = (stage: string) => {
    return leads.filter(l => l.stage === stage).length;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.church_name && lead.church_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStage = selectedStage === 'all' || lead.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  const stages = [
    { value: 'all', label: 'All Leads', count: leads.length },
    { value: 'inquiry', label: 'Inquiry', count: getStageCount('inquiry') },
    { value: 'consultation', label: 'Consultation', count: getStageCount('consultation') },
    { value: 'proposal', label: 'Proposal', count: getStageCount('proposal') },
    { value: 'active', label: 'Active', count: getStageCount('active') },
    { value: 'completed', label: 'Completed', count: getStageCount('completed') }
  ];

  const getLeadScore = (lead: Lead) => {
    return lead.score || 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-[#F4E2A3]';
    if (score >= 40) return 'text-orange-600';
    return 'text-gray-600';
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
            <CardDescription>Please sign in to access the CRM dashboard.</CardDescription>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">CRM Dashboard</h1>
        <p className="text-gray-600">Manage leads, track progress, and grow your ministry impact</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-[#F4E2A3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-[#F4E2A3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{leads.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Consultation</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{getStageCount('consultation')}</div>
            <p className="text-xs text-gray-500 mt-1">Scheduled calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{getStageCount('active')}</div>
            <p className="text-xs text-gray-500 mt-1">Current engagements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{tasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">Action items</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="bg-white border-2 border-gray-200">
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* Pipeline View */}
        <TabsContent value="pipeline" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, email, or church..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>

          {/* Stage Filters */}
          <div className="flex flex-wrap gap-2">
            {stages.map((stage) => (
              <Button
                key={stage.value}
                variant={selectedStage === stage.value ? 'default' : 'outline'}
                onClick={() => setSelectedStage(stage.value)}
                className={selectedStage === stage.value ? 'bg-black text-[#F4E2A3]' : 'hover:border-[#F4E2A3]'}
                size="sm"
              >
                {stage.label} ({stage.count})
              </Button>
            ))}
          </div>

          {/* Leads Grid */}
          {filteredLeads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No leads found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow border-2 hover:border-[#F4E2A3]">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-black">{lead.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {lead.church_name || 'No church specified'}
                        </CardDescription>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(getLeadScore(lead))}`}>
                        {getLeadScore(lead)}
                      </div>
                    </div>
                    <StatusBadge status={lead.stage} type="lead" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-[#F4E2A3]" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-[#F4E2A3]" />
                          {lead.phone}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Building2 className="h-4 w-4 mr-2 text-[#F4E2A3]" />
                        {lead.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>

                    {lead.tags && (
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.split(',').map((tag, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t text-xs text-gray-500">
                      Added {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </div>

                    <Button className="w-full bg-black text-[#F4E2A3] hover:bg-gray-900" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>Complete list of leads with detailed information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-[#F4E2A3]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Church</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Stage</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-4 py-3">
                          <div className="font-medium text-black">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{lead.church_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {lead.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.stage} type="lead" />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${getScoreColor(getLeadScore(lead))}`}>
                            {getLeadScore(lead)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 capitalize">{lead.source}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {format(new Date(lead.created_at), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks View */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Tasks</CardTitle>
                  <CardDescription>Action items and follow-ups</CardDescription>
                </div>
                <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No pending tasks"
                  description="All caught up! Create a new task to get started."
                />
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-[#F4E2A3] transition-colors">
                      <input type="checkbox" className="mt-1 mr-4" />
                      <div className="flex-1">
                        <h4 className="font-medium text-black">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {task.due_date && (
                            <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                          )}
                          <span className="capitalize">Priority: {task.priority}</span>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}