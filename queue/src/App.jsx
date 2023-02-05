import React, { useEffect, useState } from 'react';
import { db, firebase } from './firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {
    createTheme,
    ThemeProvider,
    CssBaseline,
    Paper,
    Container, Typography,
} from '@mui/material';
import { collection, getDocs, setDoc } from 'firebase/firestore';
import { isNumber } from 'lodash';
import UserContext from './UserContext';
import ResponsiveAppBar from './AppBar';
import Queue from './Queue';
import GameLog from './GameLog';
import ConditionalDisplay from './ConditionalDisplay';

import './App.css';

// Create a theme instance.
const theme = createTheme({
    typography: {
        gameTitle: {
            fontSize: '1.1rem',
        },
        gameDescription: {
            fontSize: '0.9rem',
        },
    },
    palette: {
        // mode: 'dark',
        primary: {
            main: '#90a959',
            light: '#eee',
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
    const [config, setConfig] = useState(null);

    // Configure FirebaseUI.
    const firebaseAuthUIConfig = {
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

    useEffect(() => {
        if (currentUser && !config) {
            getDocs(collection(db, 'config'))
                .then((querySnapshot) => {
                    const appConfig = querySnapshot.docs[0];

                    console.log(appConfig);

                    setConfig({
                        ...appConfig.data(),
                        id: appConfig.id,
                        docRef: appConfig.ref,
                    });
                });
        }
    }, [config, currentUser]);

    function updateQueuePosition(personID, position = -1) {
        (async () => {
            try {
                let queueOrder = config.queueOrder.filter((id) => id !== personID);
                // bottom of the queue
                if (position === -1) {
                    queueOrder.push(personID);
                } else if (isNumber(position)) {
                    queueOrder = [
                        ...queueOrder.slice(0, position),
                        personID,
                        ...queueOrder.slice(position),
                    ];
                }

                await setDoc(config.docRef, { queueOrder }, { merge: true });
                setConfig({
                    ...config,
                    queueOrder,
                });

                console.log('Config written');
            }
            catch (e) {
                console.error('Error updating config: ', e);
            }
        })();
    }

    function addGameToLog(game) {
        const gameLog = {
            name: game.name,
            thumbnail: game.thumbnail,
            playedBy: currentUser.displayName,
            playedAt: {
                seconds: (new Date()).getTime(),
                nanoseconds: 0,
            },
        };

        (async () => {
            try {
                await setDoc(
                    config.docRef,
                    {
                        gameLog: [
                            ...config.gameLog,
                            {
                                ...gameLog,
                                playedAt: new Date(),
                            },
                        ],
                    }, { merge: true },
                );

                console.log('Game added to the log.');

                config.gameLog.push({
                    name: game.name,
                    thumbnail: game.thumbnail,
                    playedBy: currentUser.displayName,
                    playedAt: {
                        seconds: (new Date()).getTime(),
                        nanoseconds: 0,
                    },
                });
            }
            catch (e) {
                console.error('Error updating config: ', e);
            }
        })();
    }

    const loadingComplete = currentUser && config;

    return (
        <ThemeProvider theme={theme}>
            <UserContext.Provider value={currentUser}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <Container maxWidth="xl">
                    <ResponsiveAppBar user={currentUser} handleSignOut={handleSignOut} />
                    {loadingComplete ? (
                        <>
                            <Queue queueOrder={config.queueOrder} user={currentUser} updateQueuePosition={updateQueuePosition} addGameToLog={addGameToLog} />
                            <GameLog gameLog={config.gameLog} />
                        </>
                    ) : null}
                    {!currentUser ? (
                        <Paper style={{ padding: 24, borderRadius: 0 }}>
                            <Typography variant="h5">Please sign in to see and participate in the queue.</Typography>
                            <StyledFirebaseAuth uiConfig={firebaseAuthUIConfig} firebaseAuth={firebase.auth()} />
                            <Typography variant="h6" style={{ marginTop: 24 }}>Privacy</Typography>
                            <Typography variant="body1">
                                The reason for authentication is to enable administrators to manage the queue and for you to manage your own queued games.
                                We don't get your Google credentials or any information about your account other than what's listed below.
                            </Typography>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li><strong>What do we get?</strong> Your name, email, and photo URL.</li>
                                <li><strong>What do we store?</strong> Your name.</li>
                                <li><strong>How do you use the information?</strong></li>
                            </ul>
                            <ul>
                                <li><strong>Name:</strong> we only use your name to display you in the queue.</li>
                                <li><strong>Email:</strong> is used differentiate you from other users. We won't email you.</li>
                                <li><strong>Photo URL:</strong> is used for displaying in the top right corner, but we dont store it.</li>
                            </ul>
                        </Paper>
                    ) : null}
                </Container>
            </UserContext.Provider>
        </ThemeProvider>
    );
}

export default App;
