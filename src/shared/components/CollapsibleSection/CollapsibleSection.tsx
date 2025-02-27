import React from 'react';
import { Collapse, theme } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import style from './CollapsibleSection.module.scss';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    children,
    defaultExpanded = false,
}) => {
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgContainer; // Автоматически подстраивается
    return (
        <Collapse
            style={{ backgroundColor, marginTop: 0 }}
            defaultActiveKey={defaultExpanded ? ['1'] : []}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            className={style.collapsibleSection}
        >
            <Collapse.Panel
                header={title}
                key='1'
            >
                <div className={style.content}>{children}</div>
            </Collapse.Panel>
        </Collapse>
    );
};

export default CollapsibleSection;
