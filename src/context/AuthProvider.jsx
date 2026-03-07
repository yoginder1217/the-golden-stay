import React, { useState } from 'react';
import { AuthContext } from './AuthContextUtils'; // Import from the new Utils file

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email) => {
    // Simulate an API login
    setUser({ name: 'Yogendra Singh', email: email, role: 'user' });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};