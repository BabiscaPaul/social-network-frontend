import React from "react";
import { createContext, useState } from "react";
import { API_ROUTE, IP_PORT } from '@env';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/login`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify({email, password}), 
            });

            const data = await response.json();

            if (response.ok) {
                console.log('logged in succesfully!');
                setIsLoggedIn(true);
                setUserData(data);
                return data;
            } else {
                console.log('Login failed');
            }
        } catch (error) {
            console.log('Error: ' + error);
        }
    };

    const signup = async (username, email, password, confirmPassword) => {
        try {
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/signup`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify({username, email, password, confirmPassword}), 
            });

            if (response.ok) {
                console.log('signed up successfully!');
            } else {
                console.log('sign up failed');
            }
        } catch (error) {
            console.log('Error: ' + error);
        }
    };

    const logout = async () => {
        try {
            const response = await fetch(`${IP_PORT}${API_ROUTE}/users/signout`);
            if (response.ok) {
                console.log('Logged out successfully');
            } else {
                console.log('Log out failed');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <AuthContext.Provider value = {{isLoggedIn, login, signup, logout, userData}}>
            {children}
        </AuthContext.Provider>
    );
};        
