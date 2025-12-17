import { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Application Loaded</h1>
      <p className="mt-2">Ready to build amazing features!</p>
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      {isLoading ? <LoadingSpinner /> : <AppContent />}
    </ErrorBoundary>
  );
}
