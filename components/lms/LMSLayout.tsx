import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LMSSidebar from './LMSSidebar';
import LMSHeader from './LMSHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { client } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LMSLayoutProps {
  children: React.ReactNode;
}

export default function LMSLayout({ children }: LMSLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Pages that should NOT trigger the onboarding redirect
  const isOnboardingPage = location.pathname.includes('/onboarding');
  const isAuthCallback = location.pathname.includes('/auth/callback');

  useEffect(() => {
    if (isOnboardingPage || isAuthCallback) {
      setCheckingOnboarding(false);
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        const user = await client.auth.me();
        if (!user?.data) {
          // Not logged in, skip onboarding check
          setCheckingOnboarding(false);
          return;
        }

        const response = await client.entities.user_onboarding.query({
          query: { is_completed: true },
          limit: 1
        });

        const items = response.data?.items || [];
        if (items.length === 0) {
          // User has NOT completed onboarding, redirect
          navigate('/lms/participant/onboarding', { replace: true });
          return;
        }
      } catch {
        // If query fails (e.g., no auth), just let them through
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checkingOnboarding && !isOnboardingPage && !isAuthCallback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <LMSSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <LMSSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <LMSHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}