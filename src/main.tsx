import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion, domAnimation } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { LicenseProvider } from './context/LicenseContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'
import { TutorialProvider } from './tutorial'
import 'driver.js/dist/driver.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LazyMotion features={domAnimation} strict>
        <ThemeProvider>
          <AuthProvider>
            <LicenseProvider>
              <NotificationProvider>
                <TutorialProvider>
                  <App />
                </TutorialProvider>
              </NotificationProvider>
            </LicenseProvider>
          </AuthProvider>
        </ThemeProvider>
      </LazyMotion>
    </BrowserRouter>
  </StrictMode>,
)
