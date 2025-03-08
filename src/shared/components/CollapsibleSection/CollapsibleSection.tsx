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
    const { token } = theme.useToken();
    const backgroundColor = token.colorBgContainer;

    const items = [
        {
            key: '1',
            label: title,
            children: <div className={style.content}>{children}</div>,
        },
    ];

    return (
        <Collapse
            style={{ backgroundColor, marginTop: 0 }}
            defaultActiveKey={defaultExpanded ? ['1'] : []}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            className={style.collapsibleSection}
            items={items}
        />
    );
};

export default React.memo(CollapsibleSection);