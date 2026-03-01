import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { FREQUENCY_LABELS } from '../../constants/categories';
import type { BudgetItem } from '../../types';
import styles from './ItemList.module.css';

interface ItemListProps {
  items: BudgetItem[];
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
}

export function ItemList({ items, onEdit, onDelete }: ItemListProps) {
  if (items.length === 0) return null;

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <div className={styles.info}>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.meta}>
              {item.category} &middot; {FREQUENCY_LABELS[item.frequency]}
            </span>
          </div>
          <div className={styles.right}>
            <span className={styles.amount}>{formatCurrency(item.amount)}/mo</span>
            <div className={styles.actions}>
              <button className={styles.iconBtn} onClick={() => onEdit(item)} aria-label="Edit">
                <Pencil size={15} />
              </button>
              <button className={styles.iconBtn} onClick={() => onDelete(item.id)} aria-label="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
