export class LoginForm {
  constructor(container, onSubmit) {
    this.container = container
    this.onSubmit = onSubmit
  }

  render() {
    this.container.innerHTML = this.getHTML()
    this.attachEventListeners()
  }

  getHTML() {
    return `
      <form id="loginForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Numéro de téléphone
          </label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400">+33</span>
            <input 
              type="tel" 
              id="loginPhone" 
              class="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="6 12 34 56 78"
              required
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe
          </label>
          <div class="relative">
            <input 
              type="password" 
              id="loginPassword" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Votre mot de passe"
              required
            />
            <button type="button" id="toggleLoginPassword" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input type="checkbox" id="rememberMe" class="w-4 h-4 text-whatsapp-green border-gray-300 rounded focus:ring-whatsapp-green">
            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
          </label>
          <button type="button" class="text-sm text-whatsapp-green hover:text-whatsapp-dark">
            Mot de passe oublié ?
          </button>
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-whatsapp-green text-white py-3 px-4 rounded-lg hover:bg-whatsapp-dark transition-colors duration-200 font-medium"
        >
          Se connecter
        </button>
      </form>
    `
  }

  attachEventListeners() {
    const form = document.getElementById('loginForm')
    const togglePassword = document.getElementById('toggleLoginPassword')
    const passwordInput = document.getElementById('loginPassword')

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSubmit()
    })

    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type')
      passwordInput.setAttribute('type', type === 'password' ? 'text' : 'password')
      togglePassword.querySelector('i').classList.toggle('fa-eye')
      togglePassword.querySelector('i').classList.toggle('fa-eye-slash')
    })

    // Auto-format phone number
    const phoneInput = document.getElementById('loginPhone')
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '')
      if (value.length > 0) {
        value = value.match(/.{1,2}/g)?.join(' ') || value
      }
      e.target.value = value
    })
  }

  handleSubmit() {
    const phone = '+33' + document.getElementById('loginPhone').value.replace(/\s/g, '')
    const password = document.getElementById('loginPassword').value

    if (!phone || !password) {
      return
    }

    this.onSubmit({ phone, password })
  }
}