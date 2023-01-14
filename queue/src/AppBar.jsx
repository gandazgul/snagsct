import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

function ResponsiveAppBar(props) {
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    function handleOpenUserMenu(event) { setAnchorElUser(event.currentTarget); }

    function handleCloseUserMenu() { setAnchorElUser(null); }

    function handleLogout() {
        handleCloseUserMenu();
        props.handleSignOut();
    }

    return (
        <AppBar position="static" enableColorOnDark>
            <Toolbar style={{ justifyContent: 'space-between' }}>
                <img src="/icon144.png" alt="SNAGs Queue" height={40} />
                <Typography
                    variant="h5"
                    noWrap
                    component="p"
                    sx={{
                        ml: 2,
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.1rem',
                        color: 'inherit',
                        textDecoration: 'none',
                    }}
                >
                    SNAGs Queue
                </Typography>
                {props.user ?
                 (
                     <Box sx={{ flexGrow: 0 }}>
                         <Tooltip title="Open settings">
                             <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                 <Avatar alt={props.user.displayName} src={props.user.photoURL} />
                             </IconButton>
                         </Tooltip>
                         <Menu
                             sx={{ mt: '45px' }}
                             id="menu-appbar"
                             anchorEl={anchorElUser}
                             anchorOrigin={{
                                 vertical: 'top',
                                 horizontal: 'right',
                             }}
                             keepMounted
                             transformOrigin={{
                                 vertical: 'top',
                                 horizontal: 'right',
                             }}
                             open={Boolean(anchorElUser)}
                             onClose={handleCloseUserMenu}
                         >
                             <MenuItem key="logout" onClick={handleLogout}>
                                 <Typography textAlign="center">Logout</Typography>
                             </MenuItem>
                         </Menu>
                     </Box>
                 ) : null}
            </Toolbar>
        </AppBar>
    );
}

export default ResponsiveAppBar;
