import { ThemeProvider } from './context/ThemeContext';
import { BudgetProvider } from './context/BudgetContext';
import { TransactionProvider } from './context/TransactionContext';
import { GoalsProvider } from './context/GoalsContext';
import { AppContent } from './components/AppContent';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <TransactionProvider>
          <GoalsProvider>
            <AppContent />
          </GoalsProvider>
        </TransactionProvider>
      </BudgetProvider>
    </ThemeProvider>
  );
}

export default App;
