import { useState } from 'react';
import { 
  Menu, 
  Search, 
  Settings, 
  User, 
  LogOut,
  LayoutDashboard,
  Users as UsersIcon,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from './NotificationDropdown';

interface LMSHeaderProps {
  onMenuClick?: () => void;
}

export default function LMSHeader({ onMenuClick }: LMSHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 gap-4">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Branding */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-[#F4E2A3]">
          <span className="text-[#F4E2A3] font-bold text-sm">WB</span>
        </div>
        <span className="font-bold text-black text-sm hidden sm:block">
          WORSHIP BUILDERS COLLECTIVE
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NotificationDropdown />

        {/* Settings */}
        <Button variant="ghost" size="icon" onClick={() => navigate('/lms/settings')}>
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-8 w-8 bg-[#F4E2A3] rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-black" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{user?.email || 'User'}</span>
                <span className="text-xs text-gray-500 font-normal">LMS Platform</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-xs text-gray-500 font-semibold">
              ADMIN PANEL
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Operations Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/crm')}>
              <UsersIcon className="h-4 w-4 mr-2" />
              CRM & Leads
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/lms/dashboard')}>
              <GraduationCap className="h-4 w-4 mr-2" />
              LMS Access
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/lms/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}