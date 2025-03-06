import { memo, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Select, Form, Input, Alert, theme } from 'antd';
import { AppDispatch, RootState } from '../../../../../../../../store';
import { updateGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import { Goal } from '../../../../../../../../types';
import CustomSelect from '../../../../../../../../shared/components/CustomSelect/CustomSelect';
import Header from '../../../../../../../../shared/components/Header/Header';

const { Option } = Select;

const GoalEditing = memo(() => {
    const { goalId } = useParams<{ goalId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const goalData = useSelector((state: RootState) => state.goals.goals.find((g) => g.id === goalId));
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const textColor = token.colorTextBase;
    const [form] = Form.useForm();
    const [updatedStatus, setUpdatedStatus] = useState<Goal['status'] | null>(null);

    useEffect(() => {
        if (goalData) {
            form.setFieldsValue({
                ...goalData.goal,
                startDate: goalData.goal.startDate ?? null,
                endDate: goalData.goal.endDate ?? null,
            });
        }
    }, [goalData, form]);

    const handleSave = useCallback(() => {
        if (!goalData) return;

        form.validateFields().then((values) => {
            dispatch(
                updateGoalAsync({
                    id: goalData.id,
                    goal: {
                        ...values,
                        status: updatedStatus ?? goalData.goal.status,
                        startDate: values.startDate ?? null,
                        endDate: values.endDate ?? null,
                    },
                })
            );
            navigate(-1);
        });
    }, [dispatch, goalData, updatedStatus, form, navigate]);

    return (
        <div style={{  padding: 15, color: textColor }}>
             <Header
                title={'Редактирование цели'}
                showBackButton
            />
            {goalData && goalData.goal.status === 'done' && (
                <>
                    <Alert
                        message='Время на выполнение вашей задачи закончилось. Обновите статус цели.'
                        type='info'
                        showIcon
                        style={{ marginBottom: 16, color: 'black' }}
                    />
                    <Form.Item label='Обновите статус'>
                        <CustomSelect
                            value={updatedStatus}
                            onChange={setUpdatedStatus}
                        >
                            <Option value='success'>Успешно</Option>
                            <Option value='failed'>Провалена</Option>
                        </CustomSelect>
                    </Form.Item>
                </>
            )}
            <Form
                form={form}
                layout='vertical'
            >
                <Form.Item
                    name='type'
                    label='Тип цели'
                    rules={[{ required: true, message: 'Выберите тип цели' }]}
                >
                    <Select>
                        <Option value='weight'>Вес</Option>
                        <Option value='fat'>Процент жира</Option>
                    </Select>
                </Form.Item>
                {goalData && goalData.goal.type === 'weight' && (
                    <>
                        <Form.Item
                            name='initialWeight'
                            label='Начальный вес'
                        >
                            <Input type='number' />
                        </Form.Item>
                        <Form.Item
                            name='desiredWeight'
                            label='Желаемый вес'
                        >
                            <Input type='number' />
                        </Form.Item>
                    </>
                )}
                {goalData && goalData.goal.type === 'fat' && (
                    <>
                        <Form.Item
                            name='initialFat'
                            label='Начальный жир (%)'
                        >
                            <Input type='number' />
                        </Form.Item>
                        <Form.Item
                            name='desiredFat'
                            label='Желаемый жир (%)'
                        >
                            <Input type='number' />
                        </Form.Item>
                    </>
                )}
                <Form.Item
                    name='startDate'
                    label='Дата начала'
                >
                    <Input
                        type='date'
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                <Form.Item
                    name='endDate'
                    label='Дата окончания'
                >
                    <Input
                        type='date'
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    <Button onClick={() => navigate(-1)}>Отмена</Button>
                    <Button
                        type='primary'
                        onClick={handleSave}
                    >
                        Сохранить
                    </Button>
                </div>
            </Form>
        </div>
    );
});

export default GoalEditing;
