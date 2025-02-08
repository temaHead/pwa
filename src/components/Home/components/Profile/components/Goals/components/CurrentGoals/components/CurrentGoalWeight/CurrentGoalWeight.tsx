import { Goal } from "../../../../../../../../../../types";



interface CurrentGoalWeightProps {
  goal: Goal;
  currentWeight: number;
}

function CurrentGoalWeight( props: CurrentGoalWeightProps) {  
  const { goal, currentWeight } = props;
  

  const initialWeight =  Number(goal.initialWeight)
  const targetWeight = Number( goal.currentWeight)

  // Рассчитываем прогресс в процентах
  const totalDifference = Math.abs(targetWeight - initialWeight);
  const currentDifference = Math.abs(currentWeight - initialWeight);
  const progress = (currentDifference / totalDifference) * 100;

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h3>Прогресс достижения цели</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>{initialWeight} кг</span>
        <progress
          value={progress}
          max="100"
          style={{ flex: 1, height: "20px" }}
        />
        <span>{targetWeight} кг</span>
      </div>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        Текущий вес: <strong>{currentWeight} кг</strong>
      </div>
    </div>
  );
}

export default CurrentGoalWeight;