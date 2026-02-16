import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ExecutiveDashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Executive Dashboard</h1>
        <p className="text-gray-600">High-level program metrics and insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-[#F4E2A3]" />
            Executive Insights
          </CardTitle>
          <CardDescription>Strategic overview of program performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Executive Analytics</p>
            <p className="text-sm">Key performance indicators and strategic metrics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}