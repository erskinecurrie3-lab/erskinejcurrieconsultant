import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';

export default function AdminOverview() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Admin Overview</h1>
        <p className="text-gray-600">Program administration and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-[#F4E2A3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-[#F4E2A3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">248</div>
            <p className="text-xs text-gray-500 mt-1">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">6</div>
            <p className="text-xs text-gray-500 mt-1">Training modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Certifications</CardTitle>
            <Award className="h-4 w-4 text-[#F4E2A3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">89</div>
            <p className="text-xs text-gray-500 mt-1">Issued this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">78%</div>
            <p className="text-xs text-gray-500 mt-1">Program completion</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Administration</CardTitle>
          <CardDescription>Manage the Certified Worship Builder Training Program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Administrative Dashboard</p>
            <p className="text-sm">Comprehensive program management tools</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}