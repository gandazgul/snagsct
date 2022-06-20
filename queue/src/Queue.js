import React, { useState, useEffect } from 'react';
import { isNumber } from 'lodash';
import { getDocs, collection, doc, addDoc, setDoc } from 'firebase/firestore';
import { Fab, Icon, TextField, Button, Stack } from '@mui/material';
import ConditionalDisplay from './ConditionalDisplay';
import PeopleAccordion from './PeopleAccordion';
import { db } from './firebase';
import { SCREENS } from './constants';

function Queue(props) {
    const [activeScreen, setActiveScreen] = useState(0);
    const [config, setConfig] = useState(null);
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonBGGID, setNewPersonBGGID] = useState('');
    const [newPersonID, setNewPersonID] = useState(null);

    useEffect(() => {
        if (!config) {
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
    }, [config]);

    if (!config) { return null; }

    function handleShowNewPersonModal() { setActiveScreen(SCREENS.ADD_PERSON); }

    function handleCancelNewPersonModal() { setActiveScreen(SCREENS.MAIN); }

    function updateQueuePosition(personID, position = -1) {
        (async () => {
            try {
                let queueOrder = config.queueOrder.filter((id) => id !== personID);
                // bottom of the queue
                if (position === -1) {
                    queueOrder.push(personID);
                }
                else if (isNumber(position)) {
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

    function addPerson(newPerson) {
        (async () => {
            try {
                const { id, ...person } = newPerson;

                if (newPerson.id) {
                    await setDoc(
                        doc(db, 'people', id),
                        person
                    );
                    updateQueuePosition(id);
                }
                else {
                    const docRef = await addDoc(
                        collection(db, 'people'),
                        person
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
        setNewPersonName(props.user.displayName);
        setNewPersonID(props.user.uid);
        handleShowNewPersonModal();
    }

    return (
        <>
            <ConditionalDisplay name={SCREENS.MAIN} activeScreen={activeScreen} style={{ position: 'relative', paddingBottom: 96 }}>
                <PeopleAccordion queueOrder={config.queueOrder} updateQueuePosition={updateQueuePosition} />
                <Fab color="primary" aria-label="add" onClick={handleShowNewPersonModal} style={{ position: 'absolute', right: 16, bottom: 16 }} variant="extended">
                    <Icon>add</Icon>
                    Add Person
                </Fab>
                <Fab color="secondary" aria-label="add" onClick={handleSignUp} style={{ position: 'absolute', right: 185, bottom: 16 }} variant="extended">
                    <Icon>add</Icon>
                    Sign Up
                </Fab>
            </ConditionalDisplay>
            <ConditionalDisplay name={SCREENS.ADD_PERSON} activeScreen={activeScreen} style={{ padding: 24 }}>
                <Stack direction="column" spacing={2}>
                    <TextField label="Name" variant="outlined" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} />
                    <TextField label="BGG Username" variant="outlined" value={newPersonBGGID} onChange={(e) => setNewPersonBGGID(e.target.value)} />
                </Stack>
                <Stack direction="row" justifyContent="flex-end" spacing={2} style={{ marginTop: 12 }}>
                    <Button variant="outlined" onClick={handleCancelNewPersonModal}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddPerson}>Add Person</Button>
                </Stack>
            </ConditionalDisplay>
        </>
    );
}

export default Queue;
