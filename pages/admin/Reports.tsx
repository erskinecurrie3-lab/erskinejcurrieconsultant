import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

export default function AdminReports() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Reports</h1>
          <p className="text-gray-600">Generate and download comprehensive reports</p>
        </div>
        <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-[#F4E2A3]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#F4E2A3]" />
              Monthly Performance Report
            </CardTitle>
            <CardDescription>Comprehensive overview of monthly metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Includes revenue, client acquisition, project completion rates, and engagement metrics.
            </p>
            <Button variant="outline" className="w-full border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
              <Download className="h-4 w-4 mr-2" />
              Download Latest Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Quarterly Business Review
            </CardTitle>
            <CardDescription>Strategic insights and growth analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Detailed analysis of quarterly performance, trends, and strategic recommendations.
            </p>
            <Button variant="outline" className="w-full hover:border-[#F4E2A3]">
              <Download className="h-4 w-4 mr-2" />
              Download Q4 2025 Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Client Engagement Report
            </CardTitle>
            <CardDescription>Track client interactions and satisfaction</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Monitor client touchpoints, feedback, and engagement levels across all projects.
            </p>
            <Button variant="outline" className="w-full hover:border-[#F4E2A3]">
              <Download className="h-4 w-4 mr-2" />
              Generate Custom Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Financial Summary
            </CardTitle>
            <CardDescription>Revenue, expenses, and profitability</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Complete financial overview including revenue streams, operational costs, and margins.
            </p>
            <Button variant="outline" className="w-full hover:border-[#F4E2A3]">
              <Download className="h-4 w-4 mr-2" />
              Download Financial Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Monthly Performance - January 2026', date: '2026-02-01', size: '2.4 MB' },
              { name: 'Q4 2025 Business Review', date: '2026-01-15', size: '5.1 MB' },
              { name: 'Client Engagement - December 2025', date: '2026-01-05', size: '1.8 MB' },
              { name: 'Financial Summary - 2025', date: '2026-01-01', size: '3.2 MB' }
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-[#F4E2A3] transition-colors">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium text-black">{report.name}</p>
                    <p className="text-xs text-gray-500">Generated on {report.date} • {report.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}