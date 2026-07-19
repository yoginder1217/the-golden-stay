import { createContext, useContext } from 'react';

// 1. Create the Context here
export const AuthContext = createContext();

// 2. Create the Custom Hook here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};