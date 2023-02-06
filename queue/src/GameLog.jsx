import React from 'react';
import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

function GameLog(props) {
    const { gameLog } = props;

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.primary.main,
            color: theme.typography.caption,
            padding: 12,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    return (
        <div>
            <h2>Game Log</h2>
            <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Thumbnail</StyledTableCell>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Played By</StyledTableCell>
                            <StyledTableCell>Date & Time</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {gameLog.map((row) => (
                            <TableRow
                                key={row.name}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    <img src={row.thumbnail} alt={row.name} loading="lazy" width={100} />
                                </TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.playedBy}</TableCell>
                                <TableCell>{new Date(row.playedAt.seconds * 1000).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default GameLog;
