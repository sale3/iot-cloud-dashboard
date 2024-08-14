import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('jwt');
        sessionStorage.removeItem('device');
        navigate('/iot-dashboard/login');
    };

    return (
        <Button variant="outlined"
            color="error" onClick={handleLogout}>Logout</Button>
    );
};

export default LogoutButton;
