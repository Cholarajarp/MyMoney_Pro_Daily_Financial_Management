import './theme-init';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error(
    "ERROR: No <div id='root'> found in public/index.html. " +
    "Create public/index.html with <div id='root'></div>."
  );
}

const root = createRoot(rootElement);
root.render(<App />);
