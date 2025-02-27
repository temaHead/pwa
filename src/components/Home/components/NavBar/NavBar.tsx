import { Flex, theme, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { FileDoneOutlined, LineChartOutlined, UserOutlined } from '@ant-design/icons';
import style from './NavBar.module.scss';

const { Text } = Typography;

function NavBar() {
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const colorIcon = token.colorIcon;


    return (
        <div className={style.navBar} style={{ backgroundColor }}>
            <Flex justify="space-around" align="center" style={{ padding: '16px' }}>
                <Link to="/room" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Flex vertical align="center">
                        <LineChartOutlined style={{ fontSize: '24px', color: colorIcon }} />
                        <Text type="secondary">Мои графики</Text>
                    </Flex>
                </Link>
                <Link to="/measurements" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Flex vertical align="center">
                        <FileDoneOutlined style={{ fontSize: '24px', color: colorIcon }} />
                        <Text type="secondary">Мои замеры</Text>
                    </Flex>
                </Link>
                <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Flex vertical align="center">
                        <UserOutlined style={{ fontSize: '24px', color: colorIcon }} />
                        <Text type="secondary">Профиль</Text>
                    </Flex>
                </Link>
            </Flex>
        </div>
    );
}

export default NavBar;
