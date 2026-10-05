import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App";
import {restoreShellBoxSizing} from "./features/persistentShell/restoreBoxSizing";

restoreShellBoxSizing();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
