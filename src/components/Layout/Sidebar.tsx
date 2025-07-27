import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  User

} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../../assets/igl-logo.png';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/contracts', icon: FileText, label: 'AMC Contracts' },
    ...(['MANAGER', 'ADMIN'].includes(user?.role || '') ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-24 h-20  rounded-lg flex items-center justify-center">
            <img src={logo} alt="igl-logo" className="w-20 h-20 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">IGL AMC</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-6 left-3 right-3 max-w-60 pr-2">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;