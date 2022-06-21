import React, { useEffect, useState } from 'react';
import { firebase } from './firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {
    createTheme,
    ThemeProvider,
    CssBaseline,
    Box,
} from '@mui/material';
import UserContext from './UserContext';
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
    const [currentUser, setCurrentUser] = useState(null); // Local signed-in state.

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
        const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                setCurrentUser(null);
                return;
            }

            user.getIdTokenResult()
                .then((idTokenResult) => {
                    const newUser = {
                        displayName: idTokenResult.claims.name,
                        photoURL: idTokenResult.claims.picture,
                        uid: user.uid,
                    };
                    // Confirm the user is an Admin.
                    if (!!idTokenResult.claims.admin) {
                        // Show admin UI.
                        setCurrentUser({
                            ...newUser,
                            isAdmin: true,
                        });
                    } else {
                        // Show regular user UI.
                        setCurrentUser(newUser);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        });

        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, []);

    function handleSignOut() {
        firebase.auth().signOut();
    }

    return (
        <ThemeProvider theme={theme}>
            <UserContext.Provider value={currentUser}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <ResponsiveAppBar user={currentUser} handleSignOut={handleSignOut} />
                {
                    currentUser ?
                    <Queue user={currentUser} /> : (
                        <Box style={{ padding: '1rem' }}>
                            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                        </Box>
                    )
                }
            </UserContext.Provider>
        </ThemeProvider>
    );
}

export default App;
