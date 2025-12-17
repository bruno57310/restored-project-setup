import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import UserTierBadge from './UserTierBadge';

const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm relative z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-green-800 font-semibold">
            Flour Catalog
          </Link>
          <Link to="/catalog" className="text-gray-600 hover:text-green-800">
            Catalog
          </Link>
          <Link to="/calculator" className="text-gray-600 hover:text-green-800">
            Calculator
          </Link>
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-200 flex items-center gap-2">
              {user.email}
              <UserTierBadge />
            </span>
            <Link to="/dashboard" className="text-gray-600 hover:text-green-800">
              Dashboard
            </Link>
          </div>
        ) : (
          <Link to="/auth" className="text-gray-600 hover:text-green-800">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
