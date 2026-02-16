import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function MyDevelopment() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">My Development</h1>
        <p className="text-gray-600">Your personal growth and training</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Professional Development
          </CardTitle>
          <CardDescription>Continue your own learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Mentor Training</p>
            <p className="text-sm">Access resources for your continued development</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}