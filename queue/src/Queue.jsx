import React, { useState } from 'react';
import { collection, doc, addDoc, setDoc } from 'firebase/firestore';
import { Fab, Icon, TextField, Button, Stack, Paper, Box } from '@mui/material';
import ConditionalDisplay from './ConditionalDisplay';
import PeopleAccordion from './PeopleAccordion';
import { db } from './firebase';
import { SCREENS } from './constants';

function Queue(props) {
    const [activeScreen, setActiveScreen] = useState(0);
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonBGGID, setNewPersonBGGID] = useState('');
    const [newPersonID, setNewPersonID] = useState(null);

    const { updateQueuePosition, queueOrder, user } = props;

    function handleShowNewPersonModal() { setActiveScreen(SCREENS.ADD_PERSON); }

    function handleCancelNewPersonModal() { setActiveScreen(SCREENS.MAIN); }

    function addPerson(newPerson) {
        (async () => {
            try {
                if (newPerson.id) {
                    await setDoc(
                        doc(db, 'people', newPerson.id),
                        newPerson,
                    );

                    updateQueuePosition(newPerson.id);
                } else {
                    const docRef = await addDoc(
                        collection(db, 'people'),
                        newPerson,
                    );

                    updateQueuePosition(docRef.id);
                }

                setActiveScreen(SCREENS.MAIN);
                setNewPersonBGGID('');
                setNewPersonName('');
                setNewPersonID(null);
            }
            catch (e) {
                console.error('Error adding person: ', newPerson, e);
            }
        })();
    }

    function handleAddPerson() {
        const newPerson = {
            games: [],
            name: newPersonName,
            bggID: newPersonBGGID,
        };

        if (newPersonID) { newPerson.id = newPersonID; }

        addPerson(newPerson);
    }

    function handleSignUp() {
        setNewPersonName(user.displayName);
        setNewPersonID(user.uid);
        handleShowNewPersonModal();
    }

    return (
        <>
            <ConditionalDisplay condition={activeScreen === SCREENS.MAIN}>
                <Box style={{ position: 'relative', paddingBottom: 50 }}>
                    <PeopleAccordion queueOrder={queueOrder} updateQueuePosition={updateQueuePosition} />
                    <Stack spacing={2} direction={'row'} justifyContent={'flex-end'} style={{ marginTop: 24, marginRight: 12 }}>
                        <ConditionalDisplay condition={user.isAdmin}>
                            <Fab color="secondary" aria-label="add" onClick={handleShowNewPersonModal} variant="extended">
                                <Icon>add</Icon>
                                Add Person
                            </Fab>
                        </ConditionalDisplay>
                        <ConditionalDisplay condition={!queueOrder.includes(user.uid)}>
                            <Fab color="primary" aria-label="add" onClick={handleSignUp} variant="extended">
                                <Icon>add</Icon>
                                Get in the Queue
                            </Fab>
                        </ConditionalDisplay>
                    </Stack>
                </Box>
            </ConditionalDisplay>
            <ConditionalDisplay condition={activeScreen === SCREENS.ADD_PERSON}>
                <Paper elevation={2} style={{ padding: 24, borderRadius: 0 }}>
                    <Stack direction="column" spacing={2}>
                        <TextField label="Name" variant="outlined" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} />
                        <TextField label="BGG Username" variant="outlined" value={newPersonBGGID} onChange={(e) => setNewPersonBGGID(e.target.value)} />
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} style={{ marginTop: 12 }}>
                        <Button variant="outlined" onClick={handleCancelNewPersonModal}>Cancel</Button>
                        <Button variant="contained" onClick={handleAddPerson}>Add Person</Button>
                    </Stack>
                </Paper>
            </ConditionalDisplay>
        </>
    );
}

export default Queue;
