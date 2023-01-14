import React, { useContext } from 'react';
import { Card, CardHeader, CardContent, CardActions, IconButton, CardMedia, Typography, Box, Icon } from '@mui/material';
import UserContext from './UserContext';

function GameCard(props) {
    const { game, person, handleMarkGameAsPlayed, handleDeleteGame } = props;
    const { id, name, thumbnail, description, gameInfo } = game;
    const currentUser = useContext(UserContext);
    const ownsGame = currentUser.uid === person.id;
    const userOwnsGameOrIsAdmin = ownsGame || currentUser.isAdmin;

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
            <CardActions>
                {userOwnsGameOrIsAdmin && (
                    <IconButton title="Mark as played" size="small" onClick={handleMarkGameAsPlayed(id)}><Icon>playlist_add_check</Icon></IconButton>
                )}
                {userOwnsGameOrIsAdmin && (
                    <IconButton title="Delete" color="error" size="small" onClick={handleDeleteGame(id)}><Icon>delete_forever</Icon></IconButton>
                )}
            </CardActions>
        </Card>
    );
}

export default GameCard;
