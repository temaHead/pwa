import React from 'react';
import { Modal, Button } from 'antd';
import style from './CustomModal.module.scss';

interface CustomModalProps {
    isOpen: boolean; // Флаг открытия модального окна
    onClose: () => void; // Функция закрытия модального окна
    onOk: () => void; // Функция для кнопки "ОК"
    title: string; // Заголовок модального окна
    description: string; // Описание модального окна
    okText?: string; // Текст для кнопки "ОК" (по умолчанию "ОК")
    cancelText?: string; // Текст для кнопки "Отмена" (по умолчанию "Отмена")
}

const CustomModal: React.FC<CustomModalProps> = ({
    isOpen,
    onClose,
    onOk,
    title,
    description,
    okText = 'ОК',
    cancelText = 'Отмена',
}) => {
    return (
        <Modal
            open={isOpen}
            centered
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} className={style.cancelButton}>
                    {cancelText}
                </Button>,
                <Button key="ok" onClick={onOk} className={style.okButton}>
                    {okText}
                </Button>,
            ]}
            className={style.modal}
        >
            <div className={style.modalContent}>
                <h2 className={style.modalTitle}>{title}</h2>
                <p className={style.modalDescription}>{description}</p>
            </div>
        </Modal>
    );
};

export default CustomModal;