import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import jwt_decode from 'jwt-decode';
import { authService } from '../services/api';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwt_decode(token);
      // Add a 60-second buffer to handle slight time differences
      return (decoded.exp - 60) < Date.now() / 1000;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext: Initializing auth state');
      setLoading(true);
      
      try {
        // Get stored token and user data
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('AuthContext: Token exists:', !!token);
        
        // First try to use stored user data if available
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('AuthContext: Successfully parsed stored user data');
            // Set user state with stored data for immediate UI update
            setUser(userData);
            setLoading(false);
            
            // If we have a valid token, try to refresh user data in the background
            if (token && !isTokenExpired(token)) {
              console.log('AuthContext: Valid token found, will refresh user data in background');
              // Don't await this - let it run in background
              authService.getCurrentUser()
                .then(freshUserData => {
                  console.log('AuthContext: Successfully refreshed user data');
                  localStorage.setItem('user', JSON.stringify(freshUserData));
                  setUser(freshUserData);
                })
                .catch(refreshError => {
                  console.warn('AuthContext: Could not refresh user data:', refreshError);
                  // Keep using stored data, no need to logout
                });
            } else if (token) {
              // Token exists but is expired
              console.log('AuthContext: Token is expired, logging out');
              logout();
            }
          } catch (parseError) {
            console.error('AuthContext: Error parsing stored user data:', parseError);
            // Invalid JSON in localStorage
            localStorage.removeItem('user');
            
            if (token && !isTokenExpired(token)) {
              // Try to recover by fetching from API
              console.log('AuthContext: Trying to recover user data from API');
              try {
                const freshUserData = await authService.getCurrentUser();
                console.log('AuthContext: Successfully recovered user data');
                localStorage.setItem('user', JSON.stringify(freshUserData));
                setUser(freshUserData);
                setLoading(false);
              } catch (apiError) {
                console.error('AuthContext: Failed to recover user data:', apiError);
                logout();
              }
            } else if (token) {
              // Token is expired
              console.log('AuthContext: Token is expired');
              logout();
            } else {
              // No token and invalid user data
              console.log('AuthContext: No valid authentication data');
              setUser(null);
              setLoading(false);
            }
          }
        } else {
          // No stored user data
          if (token && !isTokenExpired(token)) {
            // Try to get user data with token
            console.log('AuthContext: No stored user data but valid token, fetching from API');
            try {
              const userData = await authService.getCurrentUser();
              console.log('AuthContext: Successfully fetched user data');
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
              setLoading(false);
            } catch (apiError) {
              console.error('AuthContext: Failed to fetch user data with token:', apiError);
              logout();
            }
          } else if (token) {
            // Token is expired
            console.log('AuthContext: Token is expired');
            logout();
          } else {
            // No authentication data at all
            console.log('AuthContext: No authentication data found');
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      }
    };
    
    initAuth();
  }, [router]); // Keep router as a dependency

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('AuthContext: Calling login API');
      const data = await authService.login(credentials);
      console.log('AuthContext: Login API response:', data);
      
      // Handle the new response format that includes token and user data
       if (data.token) {
         localStorage.setItem('token', data.token);
         
         if (data.user) {
           // Use the user data returned directly from the login endpoint
           console.log('AuthContext: User data received with login response:', data.user);
           localStorage.setItem('user', JSON.stringify(data.user));
           setUser(data.user);
         } else {
           // Fallback to fetching user data if not included in response
           try {
             console.log('AuthContext: Fetching user data from API');
             const userData = await authService.getCurrentUser();
             console.log('AuthContext: User data fetched:', userData);
             
             // Store user data
             localStorage.setItem('user', JSON.stringify(userData));
             setUser(userData);
           } catch (userError) {
             console.error('Error fetching user data:', userError);
             // Create a minimal user object if we can't fetch the full profile
             const minimalUser = { email: credentials.email };
             localStorage.setItem('user', JSON.stringify(minimalUser));
             setUser(minimalUser);
           }
         }
        
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('AuthContext: Registering user with email:', userData.email);
      setLoading(true);
      const data = await authService.register(userData);
      console.log('AuthContext: Register API response:', data);
      
      // Handle the new response format that includes token and user data
       if (data.token) {
         localStorage.setItem('token', data.token);
         
         if (data.user) {
           // Use the user data returned directly from the register endpoint
           console.log('AuthContext: User data received with registration response:', data.user);
           localStorage.setItem('user', JSON.stringify(data.user));
           setUser(data.user);
         } else {
           // Fallback to fetching user data if not included in response
           try {
             // Get user data from /api/auth/me endpoint
             const userProfile = await authService.getCurrentUser();
             console.log('AuthContext: User data fetched after registration:', userProfile);
             
             // Store user data
             localStorage.setItem('user', JSON.stringify(userProfile));
             setUser(userProfile);
           } catch (userError) {
             console.error('Error fetching user data after registration:', userError);
             // Create a minimal user object with the registration data
             const minimalUser = { 
               name: userData.name,
               email: userData.email 
             };
             localStorage.setItem('user', JSON.stringify(minimalUser));
             setUser(minimalUser);
           }
         }
        
        toast.success('Registration successful!');
        return { success: true };
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext: Logging out');
    setLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('AuthContext: Redirecting to login page');
    router.push('/login').then(() => {
      console.log('AuthContext: Navigation to login completed');
      setLoading(false);
    }).catch(err => {
      console.error('AuthContext: Navigation error:', err);
      setLoading(false);
    });
  };

  // Update user profile
  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;