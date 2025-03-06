import React from 'react';
import { Button, Typography, Row, Col, theme } from 'antd';
import FaceIdIcon from '/face.svg'; // Иконка Face ID
import style from './FaceID.module.scss'; // Подключаем стили

const { Title, Text } = Typography;

interface FaceIDSetupProps {
    onSetup: () => void; // Функция для настройки Face ID
    onSkip: () => void;  // Функция для пропуска настройки Face ID
}

const FaceIDInstallation: React.FC<FaceIDSetupProps> = ({ onSetup, onSkip }) => {

        const { token } = theme.useToken();
        const textColor = token.colorTextBase;
        const backgroundColor = token.colorBgLayout;
    
    return (
        <div
            className={style.faceIdInstallation }
            style={{ backgroundColor, color: textColor }}
        >
            <Row justify="center" align="middle" gutter={[16, 16]}>
                <Col span={24} className={style.faceIdIcon}>
                <img src={FaceIdIcon} alt="Face ID Icon" style={{ width: '48px', height: '48px' }} />
                </Col>
                <Col span={24}>
                    <Title level={4} style={{ marginBottom: '8px' }}>
                        Настройте Face ID
                    </Title>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        Используйте Face ID для быстрого и безопасного входа в приложение.
                    </Text>
                </Col>
                <Col span={24} className={style.buttons}>
                    <Button
                        type="primary"
                        block
                        style={{ marginBottom: '10px', borderRadius: '6px' }}
                        onClick={onSetup}
                    >
                        Настроить Face ID
                    </Button>
                    <Button
                        type="default"
                        
                        block
                        style={{ borderRadius: '6px' }}
                        onClick={onSkip}
                    >
                        Пропустить
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default FaceIDInstallation;