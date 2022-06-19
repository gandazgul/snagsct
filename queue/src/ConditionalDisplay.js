import React from 'react';
import { Box } from '@mui/material';

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

export default ConditionalDisplay;
