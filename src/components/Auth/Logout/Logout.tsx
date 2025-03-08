import { signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../../../firebase';
import { removeUser } from '../../../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { deleteUserFromIDB } from '../../../shared/utils/idb';

interface LogoutProps {
    text?: string; // Текст кнопки (опциональный, по умолчанию "Выйти")
    [key: string]: unknown; // Позволяет прокидывать любые другие пропсы
}

const Logout: React.FC<LogoutProps> = ({ text = 'Выйти', ...props }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const confirmLogout = window.confirm('Вы уверены, что хотите выйти?');

        if (confirmLogout) {
            // Если пользователь подтвердил, выполняем логаут
            await signOut(auth);
            dispatch(removeUser());
            await deleteUserFromIDB();
            navigate('/');
        }
    };

    return (
        <Button
            type="primary"
            onClick={handleLogout}
            {...props} // Прокидываем все пропсы в кнопку
        >
            {text} {/* Используем переданный текст или значение по умолчанию */}
        </Button>
    );
};

export default Logout;