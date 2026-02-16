import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Mail,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { client } from '@/lib/api';
import type { Resource, ResourceDownload, Lead } from '@/lib/types';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, parseISO, startOfDay } from 'date-fns';

const COLORS = ['#F4E2A3', '#1a1a1a', '#6366f1', '#22c55e', '#ef4444', '#f97316'];

export default function ResourceAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [downloads, setDownloads] = useState<ResourceDownload[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      const [downloadsRes, resourcesRes, leadsRes] = await Promise.all([
        client.entities.resource_downloads.queryAll({
          sort: '-download_timestamp',
          limit: 2000,
        }),
        client.entities.resources.query({
          sort: '-downloads',
          limit: 200,
        }),
        client.entities.leads.query({
          query: { source: 'resource_download' },
          limit: 500,
        }),
      ]);

      setDownloads(downloadsRes.data.items);
      setResources(resourcesRes.data.items);
      setLeads(leadsRes.data.items);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Download trends over the last 30 days
  const trendData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const day = format(subDays(new Date(), i), 'yyyy-MM-dd');
      days[day] = 0;
    }

    downloads.forEach((d) => {
      if (d.download_timestamp) {
        try {
          const day = format(startOfDay(parseISO(d.download_timestamp)), 'yyyy-MM-dd');
          if (days[day] !== undefined) {
            days[day]++;
          }
        } catch {
          // skip invalid dates
        }
      }
    });

    return Object.entries(days).map(([date, count]) => ({
      date: format(parseISO(date), 'MMM d'),
      downloads: count,
    }));
  }, [downloads]);

  // Top 5 most downloaded resources
  const topResources = useMemo(() => {
    return [...resources]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 5)
      .map((r) => ({
        name: r.title.length > 30 ? r.title.substring(0, 30) + '...' : r.title,
        fullTitle: r.title,
        downloads: r.downloads || 0,
        category: r.category,
      }));
  }, [resources]);

  // Downloads by category
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    resources.forEach((r) => {
      catMap[r.category] = (catMap[r.category] || 0) + (r.downloads || 0);
    });
    return Object.entries(catMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [resources]);

  // Gated conversion metrics
  const gatedDownloads = downloads.filter((d) => d.source === 'gated').length;
  const directDownloads = downloads.filter((d) => d.source === 'direct').length;
  const resourceLeads = leads.length;
  const conversionRate =
    gatedDownloads > 0 ? Math.round((resourceLeads / gatedDownloads) * 100) : 0;

  // Source breakdown for pie chart
  const sourceData = [
    { name: 'Direct', value: directDownloads },
    { name: 'Gated', value: gatedDownloads },
  ];

  // Total downloads
  const totalDownloads = resources.reduce((sum, r) => sum + (r.downloads || 0), 0);

  // Unique downloaders
  const uniqueEmails = new Set(downloads.map((d) => d.user_email)).size;

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
            <CardDescription>Please sign in to access analytics.</CardDescription>
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
        <h1 className="text-3xl font-bold text-black mb-2">Resource Analytics</h1>
        <p className="text-gray-600">Track download trends, popular resources, and lead conversion</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-2 border-[#F4E2A3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-[#F4E2A3]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Downloaders</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{uniqueEmails}</div>
            <p className="text-xs text-gray-500 mt-1">Unique emails</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gated Leads</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{resourceLeads}</div>
            <p className="text-xs text-gray-500 mt-1">From resource downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#F4E2A3]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{conversionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Gated → Lead</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Download Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-black flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#F4E2A3]" />
              Download Trends (Last 30 Days)
            </CardTitle>
            <CardDescription>Daily download activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    interval={4}
                    stroke="#9ca3af"
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="downloads"
                    stroke="#F4E2A3"
                    strokeWidth={2}
                    dot={{ fill: '#F4E2A3', r: 3 }}
                    activeDot={{ r: 6, fill: '#F4E2A3' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-black flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#F4E2A3]" />
              Most Popular Resources
            </CardTitle>
            <CardDescription>Top 5 by download count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topResources} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={140}
                    stroke="#9ca3af"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number, _name: string, props: { payload: { fullTitle: string } }) => [
                      value,
                      props.payload.fullTitle,
                    ]}
                  />
                  <Bar dataKey="downloads" fill="#F4E2A3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Downloads by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-black">Downloads by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-black">Download Sources</CardTitle>
            <CardDescription>Direct vs Gated downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#F4E2A3" />
                    <Cell fill="#1a1a1a" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F4E2A3]" />
                <span className="text-sm text-gray-600">Direct ({directDownloads})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
                <span className="text-sm text-gray-600">Gated ({gatedDownloads})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Downloads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-black">Recent Downloads</CardTitle>
            <CardDescription>Latest download activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {downloads.slice(0, 10).map((dl) => (
                <div key={dl.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#F4E2A3] rounded-full flex items-center justify-center flex-shrink-0">
                    <Download className="h-3 w-3 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">{dl.resource_title}</p>
                    <p className="text-xs text-gray-500">{dl.user_email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      dl.source === 'gated'
                        ? 'border-green-300 text-green-700 text-xs'
                        : 'border-gray-300 text-gray-600 text-xs'
                    }
                  >
                    {dl.source}
                  </Badge>
                </div>
              ))}
              {downloads.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No downloads recorded yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}