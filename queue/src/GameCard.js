import React, { useContext } from 'react';
import { Card, CardHeader, CardContent, CardActions, Button, IconButton, CardMedia, Typography, Box, Icon } from '@mui/material';
import UserContext from './UserContext';
import ConditionalDisplay from './ConditionalDisplay';

function GameCard(props) {
    const { game, person, handleMarkGameAsPlayed, handleDeleteGame } = props;
    const { id, name, thumbnail, description, gameInfo } = game;
    const currentUser = useContext(UserContext);
    const userOwnsGameOrIsAdmin = currentUser.uid === person.id || currentUser.isAdmin;

    const {
        minPlayers,
        maxPlayers,
        bestPCount,
        maxPlayTime,
        weight,
        weightNumRatings,
        rating,
        usersRated,
    } = gameInfo;
    const gameInfoRendered = `${minPlayers}-${maxPlayers}p ${bestPCount && `(Best: ${bestPCount})`} | ${maxPlayTime}m | ${weight} weight (${weightNumRatings}) | ${rating} rating (${usersRated})`;

    return (
        <Card style={{ flex: 1 }}>
            <CardHeader
                action={
                    <IconButton aria-label="settings" onClick={() => window.open(`https://boardgamegeek.com/boardgame/${id}/`)}>
                        <Icon>open_in_new</Icon>
                    </IconButton>
                }
                title={name}
                subheader={gameInfoRendered}
            />
            <CardContent>
                <Box style={{ display: 'flex', columnGap: 12 }}>
                    <CardMedia
                        component="img"
                        image={thumbnail || 'https://picsum.photos/140'}
                        alt={name}
                        style={{ height: '50%', width: '50%', maxWidth: 150 }}
                    />
                    <Typography component="p" variant="gameDescription" dangerouslySetInnerHTML={{ __html: description || '' }} />
                </Box>
            </CardContent>
            <ConditionalDisplay condition={userOwnsGameOrIsAdmin}>
                <CardActions>
                    <Button size="small" onClick={handleMarkGameAsPlayed(id)}>Mark as Played</Button>
                    <Button size="small" onClick={handleDeleteGame(id)}>Delete</Button>
                </CardActions>
            </ConditionalDisplay>
        </Card>
    );
}

export default GameCard;
