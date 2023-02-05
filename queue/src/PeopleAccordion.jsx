import React, { useEffect } from 'react';
import { getDocs, collection, deleteDoc } from 'firebase/firestore';
import Person from './Person';
import { db } from './firebase';

function PeopleAccordion(props) {
    const { queueOrder, updateQueuePosition, addGameToLog } = props;

    const [expanded, setExpanded] = React.useState(queueOrder[0]);
    const [people, setPeople] = React.useState(null);

    useEffect(() => {
        if (!people) {
            getDocs(collection(db, 'people'))
                .then((querySnapshot) => {
                    const docs = {};
                    for (const doc of querySnapshot.docs) {
                        docs[doc.id] = {
                            ...doc.data(),
                            id: doc.id,
                            docRef: doc.ref,
                        };
                    }

                    console.log(docs);

                    setPeople(docs);
                });
        }
    }, [people]);

    function handleAccordionChange(panel) {
        return (event, isExpanded) => setExpanded(isExpanded ? panel : false);
    }

    function onPersonUpdated(personID) {
        return (updates) => {
            const newPeople = {
                ...people,
                [personID]: {
                    ...people[personID],
                    ...updates,
                },
            };

            setPeople(newPeople);
            // setExpanded(false);
        };
    }

    function handleDeletePerson(personID) {
        return () => {
            if (window.confirm('Are you sure?')) {
                const { [personID]: deleted, ...newPeople } = people;

                setPeople(newPeople);
                // delete from queue order
                props.updateQueuePosition(personID, null);

                (async () => {
                    try {
                        await deleteDoc(deleted.docRef);
                    }
                    catch (e) {
                        console.error('Error updating config: ', e);
                    }
                })();
            }
        };
    }

    if (!people) { return null; }

    return queueOrder.map((personID) =>
        people[personID] ? (
            <Person key={personID}
                person={people[personID]}
                onPersonUpdated={onPersonUpdated(personID)}
                handleDeletePerson={handleDeletePerson(personID)}
                updateQueuePosition={updateQueuePosition}
                handleAccordionChange={handleAccordionChange}
                addGameToLog={addGameToLog}
                expanded={expanded}
            />
        ) : null,
    );
}

export default PeopleAccordion;
