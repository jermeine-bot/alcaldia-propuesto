import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/apiService';

const ProtectedRoute = ({ children }) => {
  const user = apiService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
