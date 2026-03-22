import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/theme.css';
import './styles/consistency-pass.css';
import './styles/drawer.css';
import './styles/performance.css';
import { logWarn } from './utils/logger';

function validateEnvironment() {
  const requiredEnvVars = [];
  requiredEnvVars.forEach((key) => {
    if (!import.meta.env[key]) {
      logWarn('env', `Missing env var: ${key}`);
    }
  });
}

function applyRuntimePerformanceProfile() {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const narrowViewport = window.matchMedia?.('(max-width: 820px)').matches ?? false;
  const saveData = navigator.connection?.saveData ?? false;
  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  const liteEffects = prefersReducedMotion || saveData || lowMemory || lowCpu || (coarsePointer && narrowViewport);

  root.classList.toggle('lite-effects', liteEffects);
  root.classList.toggle('reduced-motion', prefersReducedMotion);
}

applyRuntimePerformanceProfile();
validateEnvironment();
window.addEventListener('resize', applyRuntimePerformanceProfile, { passive: true });
window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change', applyRuntimePerformanceProfile);
window.matchMedia?.('(pointer: coarse)').addEventListener?.('change', applyRuntimePerformanceProfile);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
