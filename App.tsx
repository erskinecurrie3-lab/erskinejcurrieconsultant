import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import EventRegistration from "./pages/EventRegistration";
import Resources from "./pages/Resources";
import Booking from "./pages/Booking";
import Assessment from "./pages/Assessment";
import AssessmentResults from "./pages/AssessmentResults";
import CRM from "./pages/admin/CRM";
import Dashboard from "./pages/admin/Dashboard";
import BusinessIntelligence from "./pages/admin/BusinessIntelligence";
import Analytics from "./pages/admin/Analytics";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminResources from "./pages/admin/AdminResources";
import ResourceAnalytics from "./pages/admin/ResourceAnalytics";
import LeadManagement from "./pages/admin/crm/LeadManagement";
import Pipeline from "./pages/admin/crm/Pipeline";
import Contacts from "./pages/admin/crm/Contacts";
import Activities from "./pages/admin/crm/Activities";
import CRMReports from "./pages/admin/crm/Reports";
import CRMSettings from "./pages/admin/crm/Settings";
import ClientDashboard from "./pages/portal/ClientDashboard";
import ClientProjects from "./pages/portal/ClientProjects";
import ClientAssessments from "./pages/portal/ClientAssessments";
import AuthCallback from "./pages/AuthCallback";
import LMSLayout from "./components/lms/LMSLayout";
import OperationsLayout from "./components/admin/OperationsLayout";
import CRMLayout from "./components/admin/CRMLayout";
import Modules from "./pages/lms/Modules";
import LMSDashboard from "./pages/lms/Dashboard";
import Account from "./pages/lms/Account";
import AdminOverview from "./pages/lms/admin/Overview";
import ExecutiveDashboard from "./pages/lms/admin/Executive";
import Certifications from "./pages/lms/admin/Certifications";
import CandidateApproval from "./pages/lms/admin/CandidateApproval";
import ChurchCRM from "./pages/lms/admin/ChurchCRM";
import CourseList from "./pages/lms/admin/CourseList";
import CourseEditor from "./pages/lms/admin/CourseEditor";
import MentorOverview from "./pages/lms/mentor/Overview";
import FormationStewardship from "./pages/lms/mentor/FormationStewardship";
import MyDevelopment from "./pages/lms/mentor/MyDevelopment";
import PastorDashboard from "./pages/lms/pastor/Dashboard";
import FormationDashboard from "./pages/lms/participant/FormationDashboard";
import Onboarding from "./pages/lms/participant/Onboarding";
import Financial from "./pages/lms/Financial";
import Schedule from "./pages/lms/Schedule";
import LMSReports from "./pages/lms/Reports";
import Payment from "./pages/lms/Payment";
import Mail from "./pages/lms/Mail";
import LMSSettings from "./pages/lms/Settings";
import CourseCatalog from "./pages/lms/CourseCatalog";
import CourseDetail from "./pages/lms/CourseDetail";
import CoursePlayer from "./pages/lms/CoursePlayer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Main Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/register" element={<EventRegistration />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/results/:id" element={<AssessmentResults />} />
          <Route path="/portal/dashboard" element={<ClientDashboard />} />
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/client/projects" element={<ClientProjects />} />
          <Route path="/client/assessments" element={<ClientAssessments />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Operations Dashboard Routes */}
          <Route path="/admin/dashboard" element={<OperationsLayout><Dashboard /></OperationsLayout>} />
          <Route path="/admin/business-intelligence" element={<OperationsLayout><BusinessIntelligence /></OperationsLayout>} />
          <Route path="/admin/analytics" element={<OperationsLayout><Analytics /></OperationsLayout>} />
          <Route path="/admin/resources" element={<OperationsLayout><AdminResources /></OperationsLayout>} />
          <Route path="/admin/resource-analytics" element={<OperationsLayout><ResourceAnalytics /></OperationsLayout>} />
          <Route path="/admin/reports" element={<OperationsLayout><AdminReports /></OperationsLayout>} />
          <Route path="/admin/settings" element={<OperationsLayout><AdminSettings /></OperationsLayout>} />

          {/* CRM Routes */}
          <Route path="/admin/crm" element={<CRMLayout><CRM /></CRMLayout>} />
          <Route path="/admin/crm/leads" element={<CRMLayout><LeadManagement /></CRMLayout>} />
          <Route path="/admin/crm/pipeline" element={<CRMLayout><Pipeline /></CRMLayout>} />
          <Route path="/admin/crm/contacts" element={<CRMLayout><Contacts /></CRMLayout>} />
          <Route path="/admin/crm/activities" element={<CRMLayout><Activities /></CRMLayout>} />
          <Route path="/admin/crm/reports" element={<CRMLayout><CRMReports /></CRMLayout>} />
          <Route path="/admin/crm/settings" element={<CRMLayout><CRMSettings /></CRMLayout>} />

          {/* LMS Routes */}
          <Route path="/lms/dashboard" element={<LMSLayout><LMSDashboard /></LMSLayout>} />
          <Route path="/lms/modules" element={<LMSLayout><Modules /></LMSLayout>} />
          <Route path="/lms/account" element={<LMSLayout><Account /></LMSLayout>} />
          <Route path="/lms/settings" element={<LMSLayout><LMSSettings /></LMSLayout>} />
          <Route path="/lms/onboarding" element={<LMSLayout><Onboarding /></LMSLayout>} />
          
          {/* LMS Admin Routes */}
          <Route path="/lms/admin/overview" element={<LMSLayout><AdminOverview /></LMSLayout>} />
          <Route path="/lms/admin/executive" element={<LMSLayout><ExecutiveDashboard /></LMSLayout>} />
          <Route path="/lms/admin/certifications" element={<LMSLayout><Certifications /></LMSLayout>} />
          <Route path="/lms/admin/candidates" element={<LMSLayout><CandidateApproval /></LMSLayout>} />
          <Route path="/lms/admin/crm" element={<LMSLayout><ChurchCRM /></LMSLayout>} />
          <Route path="/lms/admin/courses" element={<LMSLayout><CourseList /></LMSLayout>} />
          <Route path="/lms/admin/courses/new" element={<LMSLayout><CourseEditor /></LMSLayout>} />
          <Route path="/lms/admin/courses/:id/edit" element={<LMSLayout><CourseEditor /></LMSLayout>} />
          
          {/* LMS Course Routes */}
          <Route path="/lms/courses" element={<LMSLayout><CourseCatalog /></LMSLayout>} />
          <Route path="/lms/courses/:id" element={<LMSLayout><CourseDetail /></LMSLayout>} />
          <Route path="/lms/courses/:id/learn" element={<CoursePlayer />} />
          
          {/* LMS Other Routes */}
          <Route path="/lms/mentor/overview" element={<LMSLayout><MentorOverview /></LMSLayout>} />
          <Route path="/lms/mentor/formation" element={<LMSLayout><FormationStewardship /></LMSLayout>} />
          <Route path="/lms/mentor/development" element={<LMSLayout><MyDevelopment /></LMSLayout>} />
          <Route path="/lms/pastor" element={<LMSLayout><PastorDashboard /></LMSLayout>} />
          <Route path="/lms/participant/dashboard" element={<LMSLayout><FormationDashboard /></LMSLayout>} />
          <Route path="/lms/participant/onboarding" element={<LMSLayout><Onboarding /></LMSLayout>} />
          <Route path="/lms/financial" element={<LMSLayout><Financial /></LMSLayout>} />
          <Route path="/lms/schedule" element={<LMSLayout><Schedule /></LMSLayout>} />
          <Route path="/lms/reports" element={<LMSLayout><LMSReports /></LMSLayout>} />
          <Route path="/lms/payment" element={<LMSLayout><Payment /></LMSLayout>} />
          <Route path="/lms/mail" element={<LMSLayout><Mail /></LMSLayout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;