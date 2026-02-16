import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Activity } from 'lucide-react';

export default function Activities() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Activities</h1>
          <p className="text-gray-600">Track all interactions and touchpoints</p>
        </div>
        <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-600" />
            Activity Timeline
          </CardTitle>
          <CardDescription>Complete history of client interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Activity Tracking</p>
            <p className="text-sm">Log calls, meetings, emails, and more</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}