import React, { useContext, useState } from 'react';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Icon, Autocomplete, Stack, Box, Button, TextField, CircularProgress, Typography } from '@mui/material';
import _ from 'lodash';
import { xml2js } from 'xml-js';
import { setDoc } from 'firebase/firestore';
import ConditionalDisplay from './ConditionalDisplay';
import GameCard from './GameCard';
import UserContext from './UserContext';

function Person(props) {
    const { person, onPersonUpdated, updateQueuePosition, handleAccordionChange, handleDeletePerson, addGameToLog } = props;
    const currentUser = useContext(UserContext);

    const [addGameVisible, setAddGameVisible] = useState(false);
    const [bggResults, setBGGResults] = useState([]);
    const [bggSearch, setBGGSearch] = useState('');
    const [addingGame, setAddingGame] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [games, setGames] = useState(person.games);
    const canAddGames = games.length < 2 && (currentUser.uid === person.id || currentUser.isAdmin);

    function handleClick() {
        setAddGameVisible(true);
    }

    function handleCancel() {
        setAddGameVisible(false);
    }

    function handleGoToPersonProfile() {
        window.open(`https://boardgamegeek.com/user/${person.bggID}`);
    }

    const handleAddGameInputChange = _.debounce((event) => {
        setBGGSearch(event.target.value);

        if (!event.target.value || (event.target.value && event.target.value.length < 3)) { return; }

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
            playerCount: 0,
        };

        for (const poll of polls) {
            if (poll._attributes.name === 'suggested_numplayers') {
                for (const result of poll.results) {
                    for (const type of result.result) {
                        if (type._attributes.value === 'Best' && parseInt(type._attributes.numvotes, 10) > best.numVotes) {
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
            const response = await fetch(`https://api.geekdo.com/xmlapi2/thing?stats=1&id=${selectedGame.id}`);
            console.log('Thing API hit with query:', selectedGame);
            const bggRawResponse = await response.text();

            if (bggRawResponse !== undefined) {
                const bggResponse = xml2js(bggRawResponse, { compact: true })?.items?.item;
                if (!bggResponse) {
                    console.error('There was an error with the BGG Thing API. Response:', bggResponse);
                    resetState();
                }

                const bestPCount = getBestPlayerCount(bggResponse.poll || []);
                const minPlayers = bggResponse.minplayers._attributes.value;
                const maxPlayers = bggResponse.maxplayers._attributes.value;
                const maxPlayTime = bggResponse.maxplaytime._attributes.value;
                const weight = parseFloat(bggResponse.statistics.ratings.averageweight._attributes.value).toFixed(1);
                const weightNumRatings = bggResponse.statistics.ratings.numweights._attributes.value;
                const rating = parseFloat(bggResponse.statistics.ratings.average._attributes.value).toFixed(1);
                const usersRated = bggResponse.statistics.ratings.usersrated._attributes.value;
                const gameInfo = {
                    minPlayers,
                    maxPlayers,
                    bestPCount,
                    maxPlayTime,
                    weight,
                    weightNumRatings,
                    rating,
                    usersRated,
                };
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
        return (confirm = true) => {
            let shouldUpdate = true;
            if (confirm) {
                shouldUpdate = window.confirm('Are you sure you want to delete this game?');
            }

            if (shouldUpdate) {
                (async () => {
                    await updatePerson(person.games.filter((g) => g.id !== gameID));
                })();
            }
        };
    }

    function handleMarkGameAsPlayed(gameID) {
        return () => {
            if (window.confirm('Are you sure you want to mark as played? you will be moved to the end of the queue and this game removed.')) {
                addGameToLog(person.games.find((g) => g.id === gameID));
                updateQueuePosition(person.id);
                handleDeleteGame(gameID)(false);
            }
        };
    }

    return (
        <Accordion expanded={props.expanded === person.id} onChange={handleAccordionChange(person.id)} disableGutters square elevation={2}>
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
                        <GameCard key={game.id}
                            game={game}
                            person={person}
                            handleDeleteGame={handleDeleteGame}
                            handleMarkGameAsPlayed={handleMarkGameAsPlayed}
                        />
                    ))}
                    {canAddGames ? (
                        <ConditionalDisplay condition={addGameVisible} padding={true}>
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
                    ) : null}
                </Stack>
            </AccordionDetails>
            <ConditionalDisplay condition={!addGameVisible}>
                <AccordionActions>
                    {currentUser.isAdmin ? <Button variant="contained" color="error" onClick={handleDeletePerson}><Icon>delete_forever</Icon> Delete Person</Button> : null}
                    {person.bggID ? <Button variant="outlined" onClick={handleGoToPersonProfile}><Icon>open_in_new</Icon> BGG Profile</Button> : null}
                    {canAddGames ? <Button variant="contained" onClick={handleClick}><Icon>add</Icon> Add game</Button> : null}
                </AccordionActions>
            </ConditionalDisplay>
        </Accordion>
    );
}

export default Person;
