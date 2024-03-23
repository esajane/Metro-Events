import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard'; 
import { createTheme, ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode; 
}

const theme = createTheme({
  palette: {
    background: {
      default: '#fff' 
    },
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { auth } = useAuth();
  return auth?.token ? children : <Navigate to="/login" />;
};

function App() {
  return ( 
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" />} /> {/* Redirects any unknown paths to login */}
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
