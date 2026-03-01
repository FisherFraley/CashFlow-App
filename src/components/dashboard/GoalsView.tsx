import { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useGoals } from '../../context/GoalsContext';
import { GoalCard } from './GoalCard';
import { GoalForm } from '../forms/GoalForm';
import { Modal } from '../shared/Modal';
import { EmptyState } from '../shared/EmptyState';
import { Button } from '../shared/Button';
import styles from './GoalsView.module.css';

export function GoalsView() {
  const { goals, addGoal, contributeToGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (data: Parameters<typeof addGoal>[0]) => {
    addGoal(data);
    setShowForm(false);
  };

  if (goals.length === 0 && !showForm) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState
          icon={<Target size={48} />}
          message="Set savings goals to track your progress toward financial milestones."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} /> Create Goal
            </Button>
          }
        />
        <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Savings Goal">
          <GoalForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </Modal>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Savings Goals</h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> New Goal
        </Button>
      </div>

      <div className={styles.grid}>
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onContribute={contributeToGoal}
            onDelete={deleteGoal}
          />
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Savings Goal">
        <GoalForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
