import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function Contacts() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Contacts</h1>
          <p className="text-gray-600">Manage your contact database</p>
        </div>
        <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#F4E2A3]" />
            Contact Management
          </CardTitle>
          <CardDescription>Centralized contact information and history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Contact Database</p>
            <p className="text-sm">Store and manage all your ministry contacts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}