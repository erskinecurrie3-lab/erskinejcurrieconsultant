import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await client.auth.login();
        
        // Get user info to determine role
        const user = await client.auth.me();
        
        // Redirect based on role (you can customize this logic)
        if (user.data) {
          // For now, redirect all authenticated users to home
          // You can add role-based routing here later
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}