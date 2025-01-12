import { Box, Stack, Typography } from '@mui/material';
import style from './NavBar.module.scss';
import { Link } from 'react-router-dom';
import { AccountCircle, Person, RuleRounded } from '@mui/icons-material';

function NavBar() {
    return (
        <div className={style.navBar}>
        <Box
            display="flex"
            justifyContent="space-around"
            alignItems="center"
            padding="16px"
        >
            <Stack spacing={1} alignItems="center" component={Link} to="/room" style={{ textDecoration: 'none', color: 'inherit' }}>
                <AccountCircle fontSize="large" />
                <Typography variant="caption">Личный кабинет</Typography>
            </Stack>
            <Stack spacing={1} alignItems="center" component={Link} to="/measurements" style={{ textDecoration: 'none', color: 'inherit' }}>
                <RuleRounded fontSize="large" />
                <Typography variant="caption">Мои замеры</Typography>
            </Stack>
            <Stack spacing={1} alignItems="center" component={Link} to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Person fontSize="large" />
                <Typography variant="caption">Профиль</Typography>
            </Stack>
        </Box>
        </div>
    );
}

export default NavBar;
