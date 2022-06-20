import React, { useEffect, useState } from 'react';
import { firebase } from './firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {
    createTheme,
    ThemeProvider,
    CssBaseline,
    Box,
} from '@mui/material';
import ResponsiveAppBar from './AppBar';
import Queue from './Queue';

import './App.css';

// Create a theme instance.
const theme = createTheme({
    typography: {
        gameTitle: {
            fontSize: '1rem',
        },
        gameDescription: {
            fontSize: '0.8rem',
        },
    },
    palette: {
        // mode: 'dark',
        primary: {
            main: '#90a959',
        },
        secondary: {
            main: '#7259a9',
        },
        error: {
            main: '#a00020',
        },
    },
});

function App() {
    const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.

    // Configure FirebaseUI.
    const uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => false,
        },
    };

    // Listen to the Firebase Auth state and set the local state.
    useEffect(() => {
        const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
            setIsSignedIn(!!user);
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [isSignedIn]);

    function handleSignOut() {
        firebase.auth().signOut();
    }

    return (
        <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <ResponsiveAppBar user={firebase.auth().currentUser} handleSignOut={handleSignOut} />
            {
                isSignedIn ?
                <Queue user={firebase.auth().currentUser} /> : (
                    <Box style={{ padding: '1rem' }}>
                        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                    </Box>
                )
            }
        </ThemeProvider>
    );
}

export default App;
