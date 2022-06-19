import React, { useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import Person from './Person';
import { db } from './firebase';

function PeopleAccordion(props) {
    const { queueOrder, updateQueuePosition } = props;

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
            setExpanded(false);
        };
    }

    if (!people) { return null; }

    return queueOrder.map((personID) => (
        <Person key={personID}
            person={people[personID]}
            onPersonUpdated={onPersonUpdated(personID)}
            updateQueuePosition={updateQueuePosition}
            handleAccordionChange={handleAccordionChange}
            expanded={expanded}
        />
    ));
}

export default PeopleAccordion;
