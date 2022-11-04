import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Balance from './pages/Balance'
import History from './pages/History'
import Partner from './pages/Partner'
import Status from './pages/Status'
import Transfer from './pages/Transfer'
import { SessionProvider } from './modules/sessionmanager';



const router = createBrowserRouter([
    {
        path: '/balance',
        element: <Balance />
    },
    {
        path: '/partner',
        element: <Partner />
    },
    {
        path: '/history',
        element: <History />
    },
    {
        path: "/",
        element: <Status />,
    },
    {
        path: "/status",
        element: <Status />
    },
    {
        path: '/transfer',
        element: <Transfer />
    }
]);

const root = ReactDOM.createRoot(document.getElementById('windowBorder'));

root.render(
    <React.StrictMode>
        <SessionProvider
            createSession
            onLoading={'Loading session...'}
            location={ router.state.location }
            >
            <RouterProvider router={router} />
        </SessionProvider>
    </React.StrictMode>
);