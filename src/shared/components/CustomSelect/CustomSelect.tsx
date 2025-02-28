import { Select, SelectProps, theme } from 'antd';
import { memo } from 'react';

const { useToken } = theme;

const CustomSelect: React.FC<SelectProps> = memo((props) => {
    const { token } = useToken();
    const selectedBg = token.colorPrimaryActive;
    const selectedText = token.colorTextBase;

    document.documentElement.style.setProperty('--selected-bg', selectedBg);
    document.documentElement.style.setProperty('--selected-text', selectedText);

    return (
        <Select
            dropdownRender={(menu) => (
                <div
                    style={{
                        backgroundColor: token.colorBgContainer, // Цвет фона списка
                        color: token.colorTextBase, // Цвет текста списка
                    }}
                >
                    {menu}
                </div>
            )}
            style={{
                backgroundColor: token.colorBgContainer, // Фон самого Select
                color: token.colorTextBase, // Текст внутри Select
            }}
            popupMatchSelectWidth={false}
            {...props} // Передаём все пропсы
        />
    );
});

export default CustomSelect;
