import { createContext, useContext } from 'react';

// 1. Create the Context here
export const AuthContext = createContext();

// 2. Create the Custom Hook here
export const useAuth = () => {
  return useContext(AuthContext);
};