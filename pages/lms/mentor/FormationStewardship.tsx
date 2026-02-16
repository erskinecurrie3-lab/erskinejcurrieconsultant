import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function FormationStewardship() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Formation Stewardship</h1>
        <p className="text-gray-600">Guide spiritual and professional formation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-600" />
            Formation Guidance
          </CardTitle>
          <CardDescription>Support mentees in their formation journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Formation Resources</p>
            <p className="text-sm">Tools and resources for guiding spiritual formation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}