import { signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../../../firebase';
import { removeUser } from '../../../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

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
            type="primary"
            onClick={handleLogout}
            style={{ marginTop: '16px' }}
        >
            Выйти
        </Button>
    );
};

export default Logout;
