import React from 'react';
import { Card, CardHeader, CardContent, CardActions, Button, IconButton, CardMedia, Typography, Box, Icon } from '@mui/material';

function GameCard(props) {
    const { id, name, thumbnail, description, gameInfo } = props;
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
                        style={{ height: 150, width: 150 }}
                    />
                    <Typography component="p" variant="gameDescription" dangerouslySetInnerHTML={{ __html: description || '' }} />
                </Box>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={props.handleMarkGameAsPlayed(id)}>Mark as Played</Button>
                <Button size="small" onClick={props.handleDeleteGame(id)}>Delete</Button>
            </CardActions>
        </Card>
    );
}

export default GameCard;
