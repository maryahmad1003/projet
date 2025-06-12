export class RegisterForm {
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
      <form id="registerForm" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom
            </label>
            <input 
              type="text" 
              id="firstName" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Votre prénom"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input 
              type="text" 
              id="lastName" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Votre nom"
              required
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Numéro de téléphone
          </label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400">+33</span>
            <input 
              type="tel" 
              id="registerPhone" 
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
              id="registerPassword" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Minimum 6 caractères"
              required
              minlength="6"
            />
            <button type="button" id="toggleRegisterPassword" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmer le mot de passe
          </label>
          <div class="relative">
            <input 
              type="password" 
              id="confirmPassword" 
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Confirmer votre mot de passe"
              required
            />
          </div>
        </div>
        
        <div class="flex items-center">
          <input type="checkbox" id="acceptTerms" class="w-4 h-4 text-whatsapp-green border-gray-300 rounded focus:ring-whatsapp-green" required>
          <label for="acceptTerms" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
            J'accepte les <a href="#" class="text-whatsapp-green hover:text-whatsapp-dark">conditions d'utilisation</a>
          </label>
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-whatsapp-green text-white py-3 px-4 rounded-lg hover:bg-whatsapp-dark transition-colors duration-200 font-medium"
        >
          S'inscrire
        </button>
      </form>
    `
  }

  attachEventListeners() {
    const form = document.getElementById('registerForm')
    const togglePassword = document.getElementById('toggleRegisterPassword')
    const passwordInput = document.getElementById('registerPassword')

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
    const phoneInput = document.getElementById('registerPhone')
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '')
      if (value.length > 0) {
        value = value.match(/.{1,2}/g)?.join(' ') || value
      }
      e.target.value = value
    })

    // Password validation
    const confirmPassword = document.getElementById('confirmPassword')
    confirmPassword.addEventListener('input', () => {
      this.validatePasswords()
    })
    passwordInput.addEventListener('input', () => {
      this.validatePasswords()
    })
  }

  validatePasswords() {
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value
    const confirmInput = document.getElementById('confirmPassword')

    if (confirmPassword && password !== confirmPassword) {
      confirmInput.setCustomValidity('Les mots de passe ne correspondent pas')
      confirmInput.classList.add('border-red-500')
    } else {
      confirmInput.setCustomValidity('')
      confirmInput.classList.remove('border-red-500')
    }
  }

  handleSubmit() {
    const firstName = document.getElementById('firstName').value
    const lastName = document.getElementById('lastName').value
    const phone = '+33' + document.getElementById('registerPhone').value.replace(/\s/g, '')
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (password !== confirmPassword) {
      return
    }

    this.onSubmit({
      firstName,
      lastName,
      phone,
      password
    })
  }
}