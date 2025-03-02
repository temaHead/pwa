import React from 'react';
import { Button, Card, Typography } from 'antd';

const { Title } = Typography;

interface FaceIDSetupProps {
    onSetup: () => void; // Функция для настройки Face ID
    onSkip: () => void;  // Функция для пропуска настройки Face ID
}

const FaceIDSetup: React.FC<FaceIDSetupProps> = ({ onSetup, onSkip }) => {
    return (
        <Card style={{ width: 300, textAlign: 'center', marginTop: '20px' }}>
            <Title level={4}>Настройте Face ID</Title>
            <Button
                type="primary"
                block
                style={{ marginBottom: '10px' }}
                onClick={onSetup}
            >
                Настроить
            </Button>
            <Button
                type="default"
                block
                onClick={onSkip}
            >
                Пропустить
            </Button>
        </Card>
    );
};

export default FaceIDSetup;