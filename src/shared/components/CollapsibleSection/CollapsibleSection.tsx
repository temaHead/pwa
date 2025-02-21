import React, { useState, useCallback } from 'react';
import { Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import style from './CollapsibleSection.module.scss';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    return (
        <div className={style.collapsibleSection}>
            <div className={style.header} onClick={toggleExpand}>
                <div className={style.title}>{title}</div>
                <IconButton size="medium">
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </div>
            <Collapse in={isExpanded}>
                <div className={style.content}>{children}</div>
            </Collapse>
        </div>
    );
};

export default CollapsibleSection;
