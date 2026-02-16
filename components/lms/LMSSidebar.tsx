import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Church,
  UserCheck,
  Award,
  UserCog,
  Compass,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  Mail,
  ChevronDown,
  ChevronRight,
  Settings,
  BookMarked,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LMSSidebarProps {
  onClose?: () => void;
}

export default function LMSSidebar({ onClose }: LMSSidebarProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['admin', 'mentor', 'pastor', 'participant']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const menuSections = [
    {
      id: 'main',
      title: 'Main',
      items: [
        { path: '/lms/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/lms/modules', icon: BookOpen, label: 'My Courses' },
        { path: '/lms/courses', icon: Search, label: 'Browse Courses' },
        { path: '/lms/account', icon: Settings, label: 'Your Account' }
      ]
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: UserCog,
      items: [
        { path: '/lms/admin/overview', icon: LayoutDashboard, label: 'Overview' },
        { path: '/lms/admin/executive', icon: TrendingUp, label: 'Executive Dashboard' },
        { path: '/lms/admin/courses', icon: BookMarked, label: 'Course Management' },
        { path: '/lms/admin/certifications', icon: Award, label: 'Certifications' },
        { path: '/lms/admin/candidates', icon: UserCheck, label: 'Candidate Approval' },
        { path: '/lms/admin/crm', icon: Church, label: 'Church CRM' }
      ]
    },
    {
      id: 'mentor',
      title: 'Mentor',
      icon: Users,
      items: [
        { path: '/lms/mentor/overview', icon: LayoutDashboard, label: 'Overview' },
        { path: '/lms/mentor/formation', icon: Compass, label: 'Formation Stewardship' },
        { path: '/lms/mentor/development', icon: TrendingUp, label: 'My Development' }
      ]
    },
    {
      id: 'pastor',
      title: 'Pastor',
      icon: Church,
      items: [
        { path: '/lms/pastor', icon: LayoutDashboard, label: 'Dashboard' }
      ]
    },
    {
      id: 'participant',
      title: 'Participant',
      icon: GraduationCap,
      items: [
        { path: '/lms/participant/dashboard', icon: LayoutDashboard, label: 'Formation Dashboard' },
        { path: '/lms/participant/onboarding', icon: Compass, label: 'Onboarding' }
      ]
    },
    {
      id: 'other',
      title: 'Other',
      items: [
        { path: '/lms/financial', icon: DollarSign, label: 'Financial' },
        { path: '/lms/schedule', icon: Calendar, label: 'Schedule' },
        { path: '/lms/reports', icon: FileText, label: 'Reports' },
        { path: '/lms/payment', icon: CreditCard, label: 'Payment' },
        { path: '/lms/mail', icon: Mail, label: 'Mail' }
      ]
    }
  ];

  return (
    <div className="w-64 bg-black h-screen flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F4E2A3] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">WB</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">WORSHIP BUILDERS</h2>
            <p className="text-[#F4E2A3] text-xs">LMS Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {menuSections.map((section) => (
          <div key={section.id} className="mb-4">
            {section.title !== 'Main' && section.title !== 'Other' ? (
              <>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {section.icon && <section.icon className="h-4 w-4" />}
                    <span className="text-xs font-semibold uppercase">{section.title}</span>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.includes(section.id) && (
                  <div className="mt-1 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-[#F4E2A3] text-black'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-1">
                {section.title !== 'Main' && (
                  <div className="px-3 py-2">
                    <span className="text-xs font-semibold uppercase text-gray-400">{section.title}</span>
                  </div>
                )}
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#F4E2A3] text-black'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Button
          variant="outline"
          className="w-full border-[#F4E2A3] text-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
          onClick={() => window.location.href = '/'}
        >
          Back to Main Site
        </Button>
      </div>
    </div>
  );
}