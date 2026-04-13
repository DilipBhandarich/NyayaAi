import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api/auth.api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nyaya_token'));
  const [loading, setLoading] = useState(true);
  const userSetByLogin = useRef(false);

  useEffect(() => {
    // If user was just set by login(), skip the getMe call
    if (userSetByLogin.current) {
      userSetByLogin.current = false;
      setLoading(false);
      return;
    }

    if (token) {
      authApi
        .getMe()
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem('nyaya_token');
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    const accessToken = data.access_token;
    if (!accessToken) {
      throw new Error('No access token received from server');
    }
    localStorage.setItem('nyaya_token', accessToken);
    userSetByLogin.current = true;
    setUser(data.user);
    setToken(accessToken);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nyaya_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
