import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div>
      <h1>Hello from JSX!</h1>
      <p>This was compiled from a .jsx file by esbuild.</p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
