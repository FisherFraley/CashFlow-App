import { useState, useMemo, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, Check } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { ColumnMapper } from './ColumnMapper';
import { ImportPreviewTable } from './ImportPreviewTable';
import { parseCSV, detectColumnMapping, mapRowsToTransactions, detectDuplicates } from '../../utils/csvParser';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatCurrency';
import type { CsvColumnMapping } from '../../types';
import styles from './CsvImportModal.module.css';

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'done';

export function CsvImportModal({ open, onClose }: CsvImportModalProps) {
  const { transactions: existingTxs, addTransaction } = useTransactions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<CsvColumnMapping>({ date: 0, description: 1, amount: 2 });
  const [importedCount, setImportedCount] = useState(0);

  // Mapped transactions
  const mappedTransactions = useMemo(
    () => step === 'preview' ? mapRowsToTransactions(rows, mapping) : [],
    [rows, mapping, step]
  );

  // Duplicates
  const duplicates = useMemo(
    () => step === 'preview' ? detectDuplicates(mappedTransactions, existingTxs) : new Set<number>(),
    [mappedTransactions, existingTxs, step]
  );

  // Selection state — exclude duplicates by default
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleFileLoad = useCallback((text: string) => {
    const { headers: h, rows: r } = parseCSV(text);
    setHeaders(h);
    setRows(r);

    const autoMapping = detectColumnMapping(h, r.slice(0, 5));
    setMapping(autoMapping);
    setStep('mapping');
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleFileLoad(text);
    };
    reader.readAsText(file);
  }, [handleFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleFileLoad(text);
    };
    reader.readAsText(file);
  }, [handleFileLoad]);

  const handleProceedToPreview = useCallback(() => {
    const txs = mapRowsToTransactions(rows, mapping);
    const dupes = detectDuplicates(txs, existingTxs);
    // Select all non-duplicates by default
    const initialSelected = new Set<number>();
    txs.forEach((_, i) => {
      if (!dupes.has(i)) initialSelected.add(i);
    });
    setSelected(initialSelected);
    setStep('preview');
  }, [rows, mapping, existingTxs]);

  const handleToggle = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === mappedTransactions.length) return new Set();
      return new Set(mappedTransactions.map((_, i) => i));
    });
  }, [mappedTransactions]);

  const handleImport = useCallback(() => {
    let count = 0;
    for (const idx of selected) {
      const tx = mappedTransactions[idx];
      if (tx) {
        addTransaction(tx);
        count++;
      }
    }
    setImportedCount(count);
    setStep('done');
  }, [selected, mappedTransactions, addTransaction]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setHeaders([]);
    setRows([]);
    setMapping({ date: 0, description: 1, amount: 2 });
    setSelected(new Set());
    setImportedCount(0);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const totalSelected = selected.size;
  const totalAmount = [...selected]
    .map((i) => mappedTransactions[i])
    .filter(Boolean)
    .reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0);

  return (
    <Modal open={open} onClose={handleClose} title="Import CSV">
      <div className={styles.content}>
        {step === 'upload' && (
          <div
            className={styles.dropZone}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={40} className={styles.uploadIcon} />
            <p className={styles.dropText}>
              Drag & drop a CSV file here, or click to browse
            </p>
            <p className={styles.dropHint}>
              Supports bank statement exports (.csv)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {step === 'mapping' && (
          <div className={styles.stepContent}>
            <div className={styles.fileBadge}>
              <FileSpreadsheet size={16} />
              {rows.length} rows detected
            </div>
            <ColumnMapper headers={headers} mapping={mapping} onChange={setMapping} />
            <div className={styles.stepActions}>
              <Button variant="ghost" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleProceedToPreview}>
                Preview <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className={styles.stepContent}>
            <div className={styles.previewHeader}>
              <span className={styles.previewCount}>
                {totalSelected} of {mappedTransactions.length} transactions selected
              </span>
              {duplicates.size > 0 && (
                <span className={styles.dupeCount}>
                  {duplicates.size} potential duplicate{duplicates.size > 1 ? 's' : ''} found
                </span>
              )}
            </div>
            <ImportPreviewTable
              transactions={mappedTransactions}
              duplicates={duplicates}
              selected={selected}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
            />
            <div className={styles.importSummary}>
              <span>
                Importing {totalSelected} transactions (net: {formatCurrency(totalAmount)})
              </span>
            </div>
            <div className={styles.stepActions}>
              <Button variant="ghost" onClick={() => setStep('mapping')}>Back</Button>
              <Button onClick={handleImport} disabled={totalSelected === 0}>
                Import {totalSelected} Transaction{totalSelected !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className={styles.doneSection}>
            <div className={styles.doneIcon}>
              <Check size={40} />
            </div>
            <h3 className={styles.doneTitle}>Import Complete!</h3>
            <p className={styles.doneDesc}>
              Successfully imported {importedCount} transaction{importedCount !== 1 ? 's' : ''}.
            </p>
            <div className={styles.stepActions}>
              <Button variant="ghost" onClick={handleReset}>Import More</Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
