import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Temporary mock user - remove before production
    return { id: '72116F34-0343-F111-9119-505A65EB9648', name: 'Alice', role: 'GUEST' };
    // try { return JSON.parse(localStorage.getItem('user')) || null; }
    // catch { return null; }
  });

  const [token, setToken] = useState(() => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MjExNkYzNC0wMzQzLUYxMTEtOTExOS01MDVBNjVFQjk2NDgiLCJlbWFpbCI6ImFsaWNlQGFsaWNlLmNvbSIsInJvbGUiOiJHVUVTVCIsImlhdCI6MTc3NzM4MTcxMiwiZXhwIjoxNzc3OTg2NTEyfQ.xukLAadff1FmM5SZ0uSNvfrdy_rI_eP-ir_jvbPAsY4';
  localStorage.setItem('token', mockToken);
  return mockToken;
});

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUser,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};