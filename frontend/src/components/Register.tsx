import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container, Typography, Box, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
                const response = await axios.post('http://localhost:3000/register', {
                    firstname,
                    lastname,
                    username,
                        email,
                        password,

                });
                localStorage.setItem('registrationToken', response.data.token);
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
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">Register</Typography>
                {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
                    <TextField variant="outlined" margin="normal" required fullWidth id="firstname" label="First Name" name="firstname" autoComplete="name" autoFocus value={firstname} onChange={(e) => setFirstName(e.target.value)} />
                    <TextField variant="outlined" margin="normal" required fullWidth id="lastname" label="Last Name" name="lastname" autoComplete="name" value={lastname} onChange={(e) => setLastName(e.target.value)} />
                    <TextField variant="outlined" margin="normal" required fullWidth id="username" label="Username" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <TextField variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField variant="outlined" margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Register</Button>
                </Box>
            </Box>
        </Container>
        </main>
        </>
    );
};

export default Register;
