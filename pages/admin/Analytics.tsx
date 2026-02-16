import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Activity, Eye, MousePointer, Clock } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Analytics</h1>
        <p className="text-gray-600">Track performance metrics and user engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-[#F4E2A3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-[#F4E2A3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">12,543</div>
            <p className="text-xs text-green-600 mt-1">+12.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Visitors</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">3,842</div>
            <p className="text-xs text-green-600 mt-1">+8.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">4m 32s</div>
            <p className="text-xs text-gray-500 mt-1">Time on site</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">3.8%</div>
            <p className="text-xs text-green-600 mt-1">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="bg-white border-2 border-gray-200">
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { source: 'Organic Search', visits: 5234, percentage: 42 },
                  { source: 'Direct', visits: 3821, percentage: 30 },
                  { source: 'Social Media', visits: 2156, percentage: 17 },
                  { source: 'Referral', visits: 1332, percentage: 11 }
                ].map((item) => (
                  <div key={item.source}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.source}</span>
                      <span className="text-sm font-bold text-black">{item.visits.toLocaleString()} visits</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Most visited pages on your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { page: '/services', views: 4521, bounce: '32%' },
                  { page: '/events', views: 3842, bounce: '28%' },
                  { page: '/resources', views: 2934, bounce: '35%' },
                  { page: '/booking', views: 2156, bounce: '15%' }
                ].map((item) => (
                  <div key={item.page} className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-black">{item.page}</p>
                      <p className="text-sm text-gray-500">Bounce Rate: {item.bounce}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-black">{item.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Goal Completion</CardTitle>
              <CardDescription>Track progress towards your objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { goal: 'Consultation Bookings', current: 42, target: 50, percentage: 84 },
                  { goal: 'Newsletter Signups', current: 156, target: 200, percentage: 78 },
                  { goal: 'Resource Downloads', current: 234, target: 300, percentage: 78 },
                  { goal: 'Event Registrations', current: 89, target: 100, percentage: 89 }
                ].map((item) => (
                  <div key={item.goal}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-black">{item.goal}</span>
                      <span className="text-sm text-gray-600">{item.current} / {item.target}</span>
                    </div>
                    <Progress value={item.percentage} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">{item.percentage}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}