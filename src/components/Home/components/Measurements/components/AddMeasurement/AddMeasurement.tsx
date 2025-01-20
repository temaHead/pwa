import React, { useCallback, useEffect, useState } from 'react';
import style from './AddMeasurement.module.scss';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Button } from '@mui/material';
import Input from '../../../../../../shared/components/Input/Input';
import DatePicker from '../../../../../../shared/components/DatePicker/DatePicker';
import dayjs from 'dayjs';

interface AddMeasurementProps {
  isOpen: boolean;
  onClose: () => void;
  gender: string | null; // Пол пользователя
}

const AddMeasurement: React.FC<AddMeasurementProps> = ({ isOpen, onClose, gender }) => {
  const [{ y }, api] = useSpring(() => ({ y: 100 }));

  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    weight: '',
    chest: '',
    hips: '',
    thigh: '',
    waist: '',
    arms: '',
    bodyFat: '',
    chestCaliper: '',
    bellyCaliper: '',
    thighCaliper: '',
    tricepsCaliper: '',
  });

  // Обработчик изменения инпутов
  const handleSubFormInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const close = () => {
    api.start({ y: 100, onRest: onClose });
  };

  const open = useCallback(() => {
    api.start({ y: 0 });
  }, [api]);

  useEffect(() => {
    if (isOpen) open();
  }, [isOpen, open]);

  const bind = useDrag(
    ({ last, movement: [, my], cancel }) => {
      if (my > 200) cancel?.();
      api.start({ y: last ? (my > 50 ? 100 : 0) : my });
      if (last && my > 50) onClose();
    },
    { from: () => [0, y.get()] }
  );

  return (
    <>
      <div
        className={`${style.backdrop} ${isOpen ? style.visible : ''}`}
        onClick={close}
      ></div>
      <animated.div
        className={style.modal}
        style={{ transform: y.to((v) => `translateY(${v}%)`) }}
        {...bind()}
      >
        <div className={style.header}>
          <h2>Добавить замер</h2>
          <Button onClick={close} variant="contained" color="secondary">Закрыть</Button>
        </div>
        <div className={style.content}>
          <form>
            {/* Общие поля */}
            <div className={style.fieldGroup}>
              <DatePicker
                name="date"
                value={formData.date}
                onChange={handleSubFormInputChange}
                placeholder="Дата"
              />
            </div>
            <div className={style.fieldGroup}>
              <Input
                name="weight"
                value={formData.weight}
                onChange={handleSubFormInputChange}
                type="number"
                placeholder="Введите вес (кг)"
              />
            </div>

            {/* Замеры лентой */}
            <h3>Замеры лентой</h3>
            {['Грудь', 'Ягодицы', 'Бедро', 'Талия', 'Руки'].map((area) => (
              <div className={style.fieldGroup} key={area}>
                <Input
                  name={area}
                  value={formData[area.toLowerCase() as keyof typeof formData]}
                  onChange={handleSubFormInputChange}
                  type="number"
                  placeholder={`Введите замер (${area})`}
                />
              </div>
            ))}

            {/* Замеры жира */}
            <h3>Процент жира</h3>
            <div className={style.fieldGroup}>
              <Input
                name="bodyFat"
                value={formData.bodyFat}
                onChange={handleSubFormInputChange}
                type="number"
                placeholder="Введите процент жира"
              />
            </div>

            <h3>Замеры калипером</h3>
            {(gender === 'male'
              ? ['Грудь', 'Живот', 'Бедро']
              : ['Бедро', 'Трицепс', 'Талия']
            ).map((area) => (
              <div className={style.fieldGroup} key={area}>
                <Input
                  name={area + 'Caliper'}
                  value={formData[`${area.toLowerCase()}Caliper` as keyof typeof formData]}
                  onChange={handleSubFormInputChange}
                  type="number"
                  placeholder={`Введите замер калипером (${area})`}
                />
              </div>
            ))}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={style.saveButton}
            >
              Сохранить
            </Button>
          </form>
        </div>
      </animated.div>
    </>
  );
};

export default AddMeasurement;
