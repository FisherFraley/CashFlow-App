import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { TYPE_LABELS } from '../../constants/categories';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { EmptyState } from '../shared/EmptyState';
import { BudgetItemForm } from './BudgetItemForm';
import { ItemList } from './ItemList';
import type { BudgetItem, BudgetItemType, Frequency } from '../../types';
import styles from './BudgetSection.module.css';

interface BudgetSectionProps {
  type: BudgetItemType;
  colorVar: string;
}

export function BudgetSection({ type, colorVar }: BudgetSectionProps) {
  const { getItemsByType, addItem, updateItem, deleteItem } = useBudget();
  const items = getItemsByType(type);
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const handleAdd = (data: { name: string; rawAmount: number; category: string; frequency: Frequency; notes?: string }) => {
    addItem({ type, ...data });
    setShowForm(false);
  };

  const handleUpdate = (data: { name: string; rawAmount: number; category: string; frequency: Frequency; notes?: string }) => {
    if (!editingItem) return;
    updateItem(editingItem.id, data);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
  };

  return (
    <Card>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.dot} style={{ background: `var(${colorVar})` }} />
          <h3 className={styles.title}>{TYPE_LABELS[type]}</h3>
          <span className={styles.total}>{formatCurrency(total)}/mo</span>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {items.length === 0 && !showForm ? (
        <EmptyState message={`No ${TYPE_LABELS[type].toLowerCase()} added yet.`} />
      ) : (
        <ItemList items={items} onEdit={setEditingItem} onDelete={handleDelete} />
      )}

      {showForm && (
        <div className={styles.inlineForm}>
          <BudgetItemForm type={type} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <Modal open={!!editingItem} onClose={() => setEditingItem(null)} title={`Edit ${editingItem?.name ?? ''}`}>
        {editingItem && (
          <BudgetItemForm
            type={type}
            existingItem={editingItem}
            onSubmit={handleUpdate}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>
    </Card>
  );
}
