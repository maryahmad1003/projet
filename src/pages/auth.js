import { AuthService } from '../services/auth.js'
import { LoginForm } from '../components/auth/login-form.js'
import { RegisterForm } from '../components/auth/register-form.js'

export class AuthPage {
  constructor(container) {
    this.container = container
    this.currentView = 'login'
  }

  render() {
    this.container.innerHTML = this.getHTML()
    this.attachEventListeners()
    this.renderCurrentForm()
  }

  getHTML() {
    return `
      <div class="min-h-screen bg-gradient-to-br from-whatsapp-green to-whatsapp-dark flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-whatsapp-green rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fab fa-whatsapp text-white text-3xl"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">WhatsApp Clone</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">Connectez-vous pour commencer</p>
          </div>
          
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
            <button id="loginTab" class="tab-btn flex-1 py-2 px-4 rounded-md transition-all duration-200">
              Connexion
            </button>
            <button id="registerTab" class="tab-btn flex-1 py-2 px-4 rounded-md transition-all duration-200">
              Inscription
            </button>
          </div>
          
          <div id="formContainer"></div>
          
          <div id="errorMessage" class="hidden mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"></div>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    document.getElementById('loginTab').addEventListener('click', () => {
      this.currentView = 'login'
      this.updateTabs()
      this.renderCurrentForm()
    })

    document.getElementById('registerTab').addEventListener('click', () => {
      this.currentView = 'register'
      this.updateTabs()
      this.renderCurrentForm()
    })
  }

  updateTabs() {
    const loginTab = document.getElementById('loginTab')
    const registerTab = document.getElementById('registerTab')
    
    if (this.currentView === 'login') {
      loginTab.classList.add('bg-white', 'text-whatsapp-green', 'shadow-sm')
      loginTab.classList.remove('text-gray-600')
      registerTab.classList.remove('bg-white', 'text-whatsapp-green', 'shadow-sm')
      registerTab.classList.add('text-gray-600')
    } else {
      registerTab.classList.add('bg-white', 'text-whatsapp-green', 'shadow-sm')
      registerTab.classList.remove('text-gray-600')
      loginTab.classList.remove('bg-white', 'text-whatsapp-green', 'shadow-sm')
      loginTab.classList.add('text-gray-600')
    }
  }

  renderCurrentForm() {
    const container = document.getElementById('formContainer')
    
    if (this.currentView === 'login') {
      const loginForm = new LoginForm(container, this.handleLogin.bind(this))
      loginForm.render()
    } else {
      const registerForm = new RegisterForm(container, this.handleRegister.bind(this))
      registerForm.render()
    }
    
    this.updateTabs()
  }

  handleLogin(data) {
    const result = AuthService.login(data.phone, data.password)
    if (result.success) {
      window.location.reload()
    } else {
      this.showError(result.message)
    }
  }

  handleRegister(data) {
    const result = AuthService.register(data)
    if (result.success) {
      this.showError('Inscription réussie ! Connectez-vous maintenant.', 'success')
      this.currentView = 'login'
      this.renderCurrentForm()
    } else {
      this.showError(result.message)
    }
  }

  showError(message, type = 'error') {
    const errorDiv = document.getElementById('errorMessage')
    errorDiv.textContent = message
    errorDiv.className = `mt-4 p-3 rounded ${
      type === 'success' 
        ? 'bg-green-100 border border-green-400 text-green-700'
        : 'bg-red-100 border border-red-400 text-red-700'
    }`
    errorDiv.classList.remove('hidden')
    
    setTimeout(() => {
      errorDiv.classList.add('hidden')
    }, 5000)
  }
}