import { signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../../../firebase';
import { removeUser } from '../../../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const confirmLogout = window.confirm('Вы уверены, что хотите выйти?');

        if (confirmLogout) {
            // Если пользователь подтвердил, выполняем логаут
            await signOut(auth);
            dispatch(removeUser());
            navigate('/');
        }
    };

    return (
        <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            style={{ marginTop: '16px' }}
        >
            Выйти
        </Button>
    );
};

export default Logout;
