import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LogoutButtonProps {
  id?: string;
  className?: string;
  variant?: 'nav' | 'button';
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  id = 'logout-btn',
  className = '',
  variant = 'nav',
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (variant === 'button') {
    return (
      <button
        id={id}
        onClick={handleLogout}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-red-700 hover:bg-red-50 transition border border-red-200 ${className}`}
      >
        <LogOut className="w-4 h-4 text-red-600" />
        <span>Sign Out</span>
      </button>
    );
  }

  return (
    <button
      id={id}
      onClick={handleLogout}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50/80 transition group ${className}`}
    >
      <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition" />
      <span>Sign Out</span>
    </button>
  );
};
