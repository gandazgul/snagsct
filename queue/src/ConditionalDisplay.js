import React from 'react';
import { Box } from '@mui/material';

function ConditionalDisplay(props) {
    const { children, condition, padding, ...other } = props;

    return condition ? (
        <Box role="container"
            style={padding ? { padding: 24 } : {}}
            {...other}
        >
            {children}
        </Box>
    ) : null;
}

export default ConditionalDisplay;
