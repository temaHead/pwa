import { memo, useMemo } from 'react';
import { Flex, theme, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { FileDoneOutlined, LineChartOutlined, UserOutlined } from '@ant-design/icons';
import style from './NavBar.module.scss';

const { Text } = Typography;

const NavBar = memo(() => {
    const { token } = theme.useToken();
    const location = useLocation();

    // Мемоизированные стили
    const styles = useMemo(() => ({
        backgroundColor: token.colorBgLayout,
        colorIcon: token.colorIcon,
        colorIconActive: token.colorLinkActive,
        colorTextLink: token.colorInfoTextActive,
    }), [token]);

    // Массив ссылок (мемоизирован)
    const navLinks = useMemo(() => [
        { to: '/room', label: 'Мои графики', Icon: LineChartOutlined },
        { to: '/measurements', label: 'Мои замеры', Icon: FileDoneOutlined },
        { to: '/profile', label: 'Профиль', Icon: UserOutlined },
    ], []);

    return (
        <div className={style.navBar} style={{ backgroundColor: styles.backgroundColor }}>
            <Flex justify="space-around" align="center" style={{ padding: '16px' }}>
                {navLinks.map(({ to, label, Icon }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link key={to} to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Flex vertical align="center">
                                <Icon style={{ fontSize: '24px', color: isActive ? styles.colorIconActive : styles.colorIcon }} />
                                <Text style={{ color: isActive ? styles.colorTextLink : styles.colorIcon }} type="secondary">
                                    {label}
                                </Text>
                            </Flex>
                        </Link>
                    );
                })}
            </Flex>
        </div>
    );
});

export default NavBar;
