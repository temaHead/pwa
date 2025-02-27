import { memo, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Select, Form, Input, Alert, DatePicker } from 'antd';
import { AppDispatch, RootState } from '../../../../../../../../store';
import { updateGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import { Goal } from '../../../../../../../../types';
import dayjs from 'dayjs';


const { Option } = Select;

const GoalEditing = memo(() => {
    const { goalId } = useParams<{ goalId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const goalData = useSelector((state: RootState) => state.goals.goals.find((g) => g.id === goalId));

    const [form] = Form.useForm();
    const [updatedStatus, setUpdatedStatus] = useState<Goal['status'] | null>(null);

    useEffect(() => {
        if (goalData) {
            form.setFieldsValue({
                ...goalData.goal,
                startDate: goalData.goal.startDate ? dayjs(goalData.goal.startDate) : null,
                endDate: goalData.goal.endDate ? dayjs(goalData.goal.endDate) : null
            });
        }
    }, [goalData, form]);

    const handleSave = useCallback(() => {
        if (!goalData) return;
    
        form.validateFields().then((values) => {
            dispatch(updateGoalAsync({ 
                id: goalData.id, 
                goal: { 
                    ...values, 
                    status: updatedStatus || goalData.goal.status,
                    startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
                    endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null
                }
            }));
            navigate(-1);
        });
    }, [dispatch, goalData, updatedStatus, form, navigate]);
    

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
            <h2>Редактирование цели</h2>
            {goalData && goalData.goal.status === 'done' && (
                <>
                    <Alert message='Время на выполнение вашей задачи закончилось. Обновите статус цели.' type='info' showIcon style={{ marginBottom: 16 }} />
                    <Form.Item label='Обновите статус'>
                        <Select value={updatedStatus} onChange={setUpdatedStatus}>
                            <Option value='success'>Успешно</Option>
                            <Option value='failed'>Провалена</Option>
                        </Select>
                    </Form.Item>
                </>
            )}
            <Form form={form} layout='vertical'>
                <Form.Item name='type' label='Тип цели' rules={[{ required: true, message: 'Выберите тип цели' }]}>
                    <Select>
                        <Option value='weight'>Вес</Option>
                        <Option value='fat'>Процент жира</Option>
                    </Select>
                </Form.Item>
                {goalData && goalData.goal.type === 'weight' && (
                    <>
                        <Form.Item name='initialWeight' label='Начальный вес'>
                            <Input type='number' />
                        </Form.Item>
                        <Form.Item name='desiredWeight' label='Желаемый вес'>
                            <Input type='number' />
                        </Form.Item>
                    </>
                )}
                {goalData && goalData.goal.type === 'fat' && (
                    <>
                        <Form.Item name='initialFat' label='Начальный жир (%)'>
                            <Input type='number' />
                        </Form.Item>
                        <Form.Item name='desiredFat' label='Желаемый жир (%)'>
                            <Input type='number' />
                        </Form.Item>
                    </>
                )}
                <Form.Item name='startDate' label='Дата начала'>
                    <DatePicker format='YYYY-MM-DD' style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name='endDate' label='Дата окончания'>
                    <DatePicker format='YYYY-MM-DD' style={{ width: '100%' }} />
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    <Button type='primary' onClick={handleSave}>Сохранить</Button>
                    <Button onClick={() => navigate(-1)}>Отмена</Button>
                </div>
            </Form>
        </div>
    );
});

export default GoalEditing;