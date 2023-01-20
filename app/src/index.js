import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { MantineProvider } from '@mantine/core'

import Accounts from './pages/Accounts'
import Balance from './pages/Balance'
import DashBoard from './pages/DashBoard'
import FixedAssets from './pages/FixedAssets'
import HGB275SPage from './pages/HGB275S2Page'
import History from './pages/History'
import Partner from './pages/Partner'
import Status from './pages/Status'
import Transfer from './pages/Transfer'
import { SessionProvider } from './modules/sessionmanager';

import Gauge from './components/Gauge'


function Report() { return (
        <div>
            <Balance show={1} />
            <FixedAssets />
            <Partner />
        </div>
    )
}

const router = createBrowserRouter([
    {
        path: '/dashboard',
        element: <DashBoard />
    },
    {
        path: '/report',
        element: <Report />
    },
    {
        path: '/accounts',
        element: <Accounts />
    },
    {
        path: '/balance',
        element: <Balance />
    },
    {
        path: '/fixedAssets',
        element: <FixedAssets />
    },
    {
        path: '/hgb275s',
        element: <HGB275SPage />
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
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <SessionProvider
                onLoading={'Loading session...'}
                location={ router.state.location }
                server={ window.location.origin.replace('3000','81')} //.split('//')[1]
                >
                <RouterProvider router={router} />
            </SessionProvider>
        </MantineProvider>
    </React.StrictMode>
);