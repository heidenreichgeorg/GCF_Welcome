import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import History from './pages/History'
import Status from './pages/Status'
import Transfer from './pages/Transfer'
import { SessionProvider } from './modules/sessionmanager';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Status />,
    },
    {
        path: '/status',
        element: <Status />
    },
    {
        path: '/transfer',
        element: <Transfer />
    },
    {
        path: '/history',
        element: <History />
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