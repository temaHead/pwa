import { LeftOutlined } from '@ant-design/icons';
import { Button, Flex, theme } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useNavigate } from 'react-router-dom';
import style from './Header.module.scss';

interface HeaderProps {
    title: string;
    rightIcon?: React.ReactNode;
    onRightClick?: () => void;
    showBackButton?: boolean;
}

function Header({ title, rightIcon, onRightClick, showBackButton = false }: HeaderProps) {
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const textColor = token.colorTextBase;
    const colorIcon = token.colorIcon;

    return (
        <Flex className={style.header} align="center" style={{ backgroundColor: token.colorBgLayout }}>
            {/* Левая кнопка */}
            <div className={style.buttonContainer}>
                {showBackButton && (
                    <Button
                        type="text"
                        icon={<LeftOutlined style={{ color: colorIcon }} />}
                        onClick={() => navigate(-1)}
                    />
                )}
            </div>

            {/* Заголовок */}
            <Title className={style.title} level={4} style={{ margin: 0, color: textColor }}>
                {title}
            </Title>

            {/* Правая кнопка */}
            <div className={style.buttonContainer}>
                {rightIcon && (
                    <Button
                        type="text"
                        icon={rightIcon}
                        onClick={onRightClick}
                        style={{ color: colorIcon }}
                    />
                )}
            </div>
        </Flex>
    );
}

export default Header;
