import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './pages/App';
import Status from './pages/Status'

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
        <RouterProvider router={router} />
    </React.StrictMode>
);