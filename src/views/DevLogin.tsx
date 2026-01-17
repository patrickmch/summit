import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dev-only route that auto-logs in with a test profile and redirects to plan review.
 * Access via: /#/dev
 */
export const DevLogin: React.FC = () => {
  const navigate = useNavigate();
  const { devLogin } = useAuth();

  useEffect(() => {
    devLogin();
    navigate('/plan-review');
  }, [devLogin, navigate]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <p className="text-[#737373]">Loading dev profile...</p>
    </div>
  );
};
