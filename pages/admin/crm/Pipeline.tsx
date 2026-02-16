import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function Pipeline() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Sales Pipeline</h1>
        <p className="text-gray-600">Visualize and manage your sales pipeline</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Pipeline Overview
          </CardTitle>
          <CardDescription>Track deals through each stage of your sales process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Pipeline Management</p>
            <p className="text-sm">Visual pipeline with drag-and-drop functionality</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}