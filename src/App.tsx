import { ThemeProvider } from './context/ThemeContext';
import { BudgetProvider } from './context/BudgetContext';
import { AppContent } from './components/AppContent';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <AppContent />
      </BudgetProvider>
    </ThemeProvider>
  );
}

export default App;
