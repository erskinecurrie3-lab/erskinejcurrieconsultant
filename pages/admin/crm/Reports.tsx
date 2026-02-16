import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

export default function CRMReports() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">CRM Reports</h1>
          <p className="text-gray-600">Generate insights from your CRM data</p>
        </div>
        <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-[#F4E2A3]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#F4E2A3]" />
              Lead Conversion Report
            </CardTitle>
            <CardDescription>Track lead-to-client conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Activity Summary
            </CardTitle>
            <CardDescription>Overview of all CRM activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full hover:border-[#F4E2A3]">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}