import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import stores from "./redux/store";
import {Provider} from "react-redux";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={stores}>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
