import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

export default function CandidateApproval() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Candidate Approval</h1>
        <p className="text-gray-600">Review and approve program candidates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-green-600" />
            Candidate Review
          </CardTitle>
          <CardDescription>Approve or reject program applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Candidate Management</p>
            <p className="text-sm">Review applications and approve qualified candidates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}