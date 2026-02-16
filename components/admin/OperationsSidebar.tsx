import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  BookOpen,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export default function OperationsSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard Overview',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin/dashboard'
    },
    {
      label: 'Business Intelligence',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/admin/business-intelligence'
    },
    {
      label: 'Analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      path: '/admin/analytics'
    },
    {
      label: 'Resources',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/admin/resources'
    },
    {
      label: 'Resource Analytics',
      icon: <Download className="h-5 w-5" />,
      path: '/admin/resource-analytics'
    },
    {
      label: 'Reports',
      icon: <FileText className="h-5 w-5" />,
      path: '/admin/reports'
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/settings'
    }
  ];

  return (
    <aside className="w-64 bg-[#1a1a1a] text-white h-screen overflow-y-auto flex flex-col">
      <nav className="flex-1">
        <div className="py-4">
          <div className="px-4 py-3 mb-2">
            <h2 className="text-lg font-bold text-[#F4E2A3]">Operations</h2>
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-black text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="py-2 border-t border-gray-800 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}