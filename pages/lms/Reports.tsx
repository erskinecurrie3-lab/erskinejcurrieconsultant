import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

export default function LMSReports() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Reports</h1>
          <p className="text-gray-600">View and download your progress reports</p>
        </div>
        <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#F4E2A3]" />
            Progress Reports
          </CardTitle>
          <CardDescription>Track your learning progress and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Your Reports</p>
            <p className="text-sm">Access detailed progress reports and transcripts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}