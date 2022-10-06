import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './pages/App';
import Status from './pages/Status'
import { SessionProvider } from './modules/sessionmanager';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: '/status',
        element: <Status />
    }
]);
const root = ReactDOM.createRoot(document.getElementById('windowBorder'));
root.render(
    <React.StrictMode>
        <SessionProvider
            createSession
            onLoading={'Loading session...'}
        >
            <RouterProvider router={router} />
        </SessionProvider>
    </React.StrictMode>
);