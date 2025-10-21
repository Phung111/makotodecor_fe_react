import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import { RouterProvider } from 'react-router-dom';
import router from './features/layouts/routes';
import store from './app/store';
import { Provider } from 'react-redux';
import { TranslationProvider } from './contexts/TranslationContext';
import 'animate.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <TranslationProvider>
        <RouterProvider router={router} />
      </TranslationProvider>
    </Provider>
  </StrictMode>
);
