import './style.css'
import { App } from './src/app.js'
import { AuthService } from './src/services/auth.js'

// Initialize the application
const app = new App()

// Check if user is logged in
const currentUser = AuthService.getCurrentUser()
if (currentUser) {
  app.showMainApp()
} else {
  app.showAuthPage()
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Application Error:', event.error)
})

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(registrationError => console.log('SW registration failed'))
  })
}