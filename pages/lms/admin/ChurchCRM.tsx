import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function ChurchCRM() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Church CRM</h1>
        <p className="text-gray-600">Manage church partnerships and relationships</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-[#F4E2A3]" />
            Church Management
          </CardTitle>
          <CardDescription>Track church partnerships and participant affiliations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Church Database</p>
            <p className="text-sm">Manage church relationships and program partnerships</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}