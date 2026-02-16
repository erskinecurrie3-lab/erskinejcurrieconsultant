import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Plus } from 'lucide-react';

export default function Certifications() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Certifications</h1>
          <p className="text-gray-600">Manage program certifications</p>
        </div>
        <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Plus className="h-4 w-4 mr-2" />
          Issue Certification
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-[#F4E2A3]" />
            Certification Management
          </CardTitle>
          <CardDescription>Track and issue program certifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Certification System</p>
            <p className="text-sm">Issue and manage Worship Builder certifications</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}