import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail as MailIcon, Plus } from 'lucide-react';

export default function Mail() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Mail</h1>
          <p className="text-gray-600">Communicate with mentors and peers</p>
        </div>
        <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MailIcon className="h-5 w-5 mr-2 text-blue-600" />
            Inbox
          </CardTitle>
          <CardDescription>Messages from your mentor and program administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <MailIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No Messages</p>
            <p className="text-sm">Your inbox is empty. Start a conversation with your mentor!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}