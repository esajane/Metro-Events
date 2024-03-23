import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container, Typography, Box, Link, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../App.css';

const Login: React.FC = () => {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setAuth({ token: response.data.token });
      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data.message || 'An error occurred. Please try again.');
      } else {
        console.error('Error', (error as Error).message);
      }
    }
  };

  return (
    <>
      <CssBaseline />
      <main>
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography component="h1" variant="h5">Sign in</Typography>
            {errorMessage && <Typography color="error">{errorMessage}</Typography>}
            <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
              <TextField variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField variant="outlined" margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Sign In</Button>
            </Box>
            <Link href="/register" variant="body2" align="center" sx={{ mt: 2 }}>
              {"Don't have an account? Register"}
            </Link>
          </Box>
        </Container>
      </main>
    </>
  );
};

export default Login;
