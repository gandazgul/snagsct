// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-analytics.js';
import { getFirestore, collection, getDocs, addDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js';

const {
    colors,
    createTheme,
    ThemeProvider,
    CssBaseline,
    Container,
    Box,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    AccordionActions,
    Card,
    CardHeader,
    CardActions,
    CardContent,
    CardMedia,
    Button,
    IconButton,
    CircularProgress,
    Icon,
    Typography,
    Fab,
    TextField,
    Autocomplete,
} = MaterialUI;

// Create a theme instance.
const theme = createTheme({
    typography: {
        gameTitle: {
            fontSize: '1rem',
        },
    },
    palette: {
        mode: 'dark',
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: colors.red.A400,
        },
    },
});

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyCxBRsWU_VJ25YqjJ8uEIcgw9hLv5l8ntk',
    authDomain: 'game-queue-97ad4.firebaseapp.com',
    projectId: 'game-queue-97ad4',
    storageBucket: 'game-queue-97ad4.appspot.com',
    messagingSenderId: '103933957743',
    appId: '1:103933957743:web:f23f34b27f12eb18f8df9a',
    measurementId: 'G-L33QFSY90W',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const { useState, useEffect } = React;

const SCREENS = {
    MAIN: 0,
    ADD_PERSON: 1,
    ADD_GAME: 2,
};

function ConditionalDisplay(props) {
    const { children, activeScreen, name, padding, ...other } = props;

    return (
        <Box
            role="container"
            hidden={activeScreen !== name}
            id={`simple-ConditionalDisplay-${name}`}
            aria-labelledby={`simple-tab-${name}`}
            style={padding ? { padding: 24 } : {}}
            {...other}
        >
            {activeScreen === name && children}
        </Box>
    );
}

function GameCard(props) {
    return (
        <Card style={{ flex: 1 }}>
            <CardHeader
                action={
                    <IconButton aria-label="settings" onClick={() => window.open(`https://boardgamegeek.com/boardgame/${props.id}/`)}>
                        <Icon>open_in_new</Icon>
                    </IconButton>
                }
                title={props.name}
                subheader={props.gameInfo}
            />
            <CardContent>
                <Box style={{ display: 'flex', columnGap: 12 }}>
                    <CardMedia
                        component="img"
                        image={props.thumbnail || 'https://picsum.photos/140'}
                        alt="green iguana"
                        style={{ height: 150, width: 150 }}
                    />
                    <Typography component="p" dangerouslySetInnerHTML={{ __html: props.description || '' }} />
                </Box>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={props.handleMarkGameAsPlayed(props.id)}>Mark as Played</Button>
                <Button size="small" onClick={props.handleDeleteGame(props.id)}>Delete</Button>
            </CardActions>
        </Card>
    );
}

function Person(props) {
    const { person, onPersonUpdated, updateQueuePosition, handleAccordionChange } = props;

    const [addGameVisible, setAddGameVisible] = React.useState(false);
    const [bggResults, setBGGResults] = React.useState([]);
    const [bggSearch, setBGGSearch] = React.useState('');
    const [addingGame, setAddingGame] = React.useState(false);
    const [selectedGame, setSelectedGame] = React.useState(null);
    const [games, setGames] = React.useState(person.games);
    const hasEnoughGames = games.length === 2;

    function handleClick() {
        setAddGameVisible(true);
    }

    function handleCancel() {
        setAddGameVisible(false);
    }

    const handleAddGameInputChange = _.debounce((event) => {
        setBGGSearch(event.target.value);

        if (!event.target.value || event.target.value && event.target.value.length < 3) { return; }

        (async () => {
            const response = await fetch(`https://api.geekdo.com/xmlapi2/search?query=${event.target.value}&type=boardgame`);
            console.log('Search API hit with query:', event.target.value);
            const bggResponse = await response.text();

            if (bggResponse !== undefined) {
                const games = xml2js(bggResponse, { compact: true });
                const options = games?.items?.item || [];

                setBGGResults(options.map((o) => ({ id: o._attributes.id, label: `${o.name._attributes.value} (${o.yearpublished?._attributes?.value || 'Unknown'})` })));
            }
        })();
    }, 1500);

    function resetState() {
        setAddingGame(false);
        setAddGameVisible(false);
        setBGGSearch('');
        setSelectedGame(null);
    }

    async function updatePerson(games) {
        try {
            const updates = { games };
            await setDoc(person.docRef, updates, { merge: true });
            onPersonUpdated(updates);

            resetState();
            console.log('Document written');
            setGames(games);
        }
        catch (e) {
            console.error('Error adding document: ', e);
            resetState();
        }
    }

    function getBestPlayerCount(polls) {
        if (!polls.length) { return null; }

        let best = {
            numVotes: 0,
            playerCount: 0,
        };

        for (const poll of polls) {
            if (poll._attributes.name === 'suggested_numplayers') {
                for (const result of poll.results) {
                    for (const type of result.result) {
                        if (type._attributes.value === "Best" && parseInt(type._attributes.numvotes, 10) > best.numVotes) {
                            best.numVotes = parseInt(type._attributes.numvotes, 10);
                            best.playerCount = result._attributes.numplayers;
                        }
                    }
                }
            }
        }

        return best.playerCount;
    }

    function handleAddGame() {
        setAddingGame(true);

        (async () => {
            const response = await fetch(`https://api.geekdo.com/xmlapi2/thing?id=${selectedGame.id}`);
            console.log('Thing API hit with query:', selectedGame);
            const bggRawResponse = await response.text();

            if (bggRawResponse !== undefined) {
                const bggResponse = xml2js(bggRawResponse, { compact: true })?.items?.item;
                if (!bggResponse) {
                    console.error('There was an error with the BGG Thing API. Response:', bggResponse);
                    resetState();
                }

                // "description": "<b>2-5p  |  120 minutes  |  3.3 weight  |  7.6 rating (416 users)</b>\n\nIcaion is an Engine Territory Building, Resource Management eurogame for 2 to 5 players designed by Martino Chiacchiera and Marta Ciaccasassi.\n\nIn Icaion you become a Seeker, an expert adventurer, sent out by the Organization to hunt for treasures, Qoam, relics and artifacts from ancient times.\n\nKey Features:\n\n     Original illustrations from acclaimed artist Travis Anderson\n     More than 70 highly detailed miniatures\n     The unique 120mm tall Colossus miniature\n     Combine it with Mysthea for a co-op experience \"The Fall\"\n     Deploy your Machines, Harvesters, Scavengers in strategic places of the map before other players to establish control of areas and exploit its resources\n     Go on a quest to activate the special Apparatus in the far craters left by the islands of Mysthea\n\n\n—description from the publisher\n\n"

                const bestPCount = getBestPlayerCount(bggResponse.poll || []);
                const minPlayers = bggResponse.minplayers._attributes.value;
                const maxPlayers = bggResponse.maxplayers._attributes.value;
                const maxPlayTime = bggResponse.maxplaytime._attributes.value;
                const gameInfo = `${minPlayers}-${maxPlayers}p ${bestPCount || `(Best: ${bestPCount})`}  | ${maxPlayTime} minutes | x.x weight | ?.? rating (xyz users)`;
                const description = bggResponse.description._text.split('.').splice(0, 2).join('.');
                const newGames = [
                    ...games,
                    {
                        id: selectedGame.id,
                        name: selectedGame.label,
                        thumbnail: bggResponse.thumbnail._text,
                        description: `${description}.`,
                        gameInfo,
                    },
                ];

                await updatePerson(newGames);
            }
        })();
    }

    function handleNewGameName(e, game) {
        setSelectedGame(game);
    }

    function handleDeleteGame(gameID) {
        return () => {
            (async () => {
                await updatePerson(person.games.filter((g) => g.id !== gameID));
            })();
        };
    }

    function handleMarkGameAsPlayed(gameID) {
        return () => {
            handleDeleteGame(gameID)();
            // -1 === bottom of the queue
            updateQueuePosition(person.id);
        };
    }

    return (
        <Accordion expanded={props.expanded === person.name} onChange={handleAccordionChange(person.name)} disableGutters square elevation={0}>
            <AccordionSummary
                expandIcon={<Icon>expand_more</Icon>}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{person.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack direction="column" spacing={2}>
                    {games.map((game) => (
                        <GameCard {...game} handleDeleteGame={handleDeleteGame} handleMarkGameAsPlayed={handleMarkGameAsPlayed} key={game.id} />
                    ))}
                </Stack>
                {hasEnoughGames ?
                 null : (
                     <ConditionalDisplay name={SCREENS.ADD_GAME} activeScreen={addGameVisible ? SCREENS.ADD_GAME : SCREENS.MAIN} padding={true}>
                         <Autocomplete
                             onChange={handleNewGameName}
                             value={selectedGame}
                             // isOptionEqualToValue={(option, value) => option.id === value.id}
                             options={bggResults}
                             renderInput={(params) => (
                                 <TextField id="outlined-basic"
                                     label="Search BGG for a game to add"
                                     variant="outlined"
                                     value={bggSearch}
                                     onChange={handleAddGameInputChange}
                                     {...params}
                                 />
                             )}
                         />
                         <Box sx={{ mt: 1, mb: 1 }}>
                             <Button variant="outlined" onClick={handleCancel} startIcon={<Icon>cancel</Icon>}>Cancel</Button>
                             <Button variant="contained"
                                 sx={{ ml: 1 }}
                                 onClick={handleAddGame}
                                 startIcon={addingGame ? <CircularProgress size={24} /> : <Icon>add</Icon>}
                                 disabled={addingGame}
                             >
                                 Add game
                             </Button>
                         </Box>
                     </ConditionalDisplay>
                 )}
            </AccordionDetails>
            {hasEnoughGames ?
             null : (
                 <ConditionalDisplay name={SCREENS.MAIN} activeScreen={addGameVisible ? SCREENS.ADD_GAME : SCREENS.MAIN}>
                     <AccordionActions>
                         <Button variant="contained" onClick={handleClick}><Icon>add</Icon> Add game</Button>
                     </AccordionActions>
                 </ConditionalDisplay>
             )}
        </Accordion>
    );
}

function PeopleAccordion(props) {
    const { queueOrder, updateQueuePosition } = props;

    const [expanded, setExpanded] = React.useState(false);
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

function Queue() {
    const [activeScreen, setActiveScreen] = useState(0);
    const [config, setConfig] = useState(null);
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonBGGID, setNewPersonBGGID] = useState('');

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
                } else {
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

    function handleAddPerson() {
        const newPerson = {
            games: [],
            name: newPersonName,
            bggID: newPersonBGGID,
        };
        (async () => {
            try {
                const docRef = await addDoc(collection(db, 'people'), newPerson);
                updateQueuePosition(docRef.id);
                setActiveScreen(SCREENS.MAIN);
                setNewPersonBGGID('');
                setNewPersonName('');
            }
            catch (e) {
                console.error('Error adding person: ', newPerson, e);
            }
        })();
    }

    return (
        <Container style={{ position: 'relative', padding: 0 }}>
            <ConditionalDisplay name={SCREENS.MAIN} activeScreen={activeScreen}>
                <PeopleAccordion queueOrder={config.queueOrder} updateQueuePosition={updateQueuePosition} />
                <Fab color="primary" aria-label="add" onClick={handleShowNewPersonModal} style={{ position: 'absolute', right: 0, bottom: -72 }} variant="extended">
                    <Icon>add</Icon>
                    Add Person
                </Fab>
            </ConditionalDisplay>
            <ConditionalDisplay name={SCREENS.ADD_PERSON} activeScreen={activeScreen}>
                <TextField label="Name" variant="outlined" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} />
                <TextField label="BGG Username" variant="outlined" value={newPersonBGGID} onChange={(e) => setNewPersonBGGID(e.target.value)} />
                <Button variant="outlined" onClick={handleCancelNewPersonModal}>Cancel</Button>
                <Button variant="contained" onClick={handleAddPerson}>Add Person</Button>
            </ConditionalDisplay>
        </Container>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Queue />
    </ThemeProvider>,
);
