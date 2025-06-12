import { AuthPage } from './pages/auth.js'
import { MainPage } from './pages/main.js'
import { Router } from './utils/router.js'
import { ThemeManager } from './utils/theme.js'

export class App {
  constructor() {
    this.appElement = document.getElementById('app')
    this.router = new Router()
    this.themeManager = new ThemeManager()
    this.initializeRoutes()
  }

  initializeRoutes() {
    this.router.addRoute('/', () => this.showAuthPage())
    this.router.addRoute('/auth', () => this.showAuthPage())
    this.router.addRoute('/main', () => this.showMainApp())
    this.router.addRoute('/chat/:id', (params) => this.showChat(params.id))
    this.router.addRoute('/profile', () => this.showProfile())
    this.router.addRoute('/settings', () => this.showSettings())
  }

  showAuthPage() {
    this.appElement.innerHTML = ''
    const authPage = new AuthPage(this.appElement)
    authPage.render()
  }

  showMainApp() {
    this.appElement.innerHTML = ''
    const mainPage = new MainPage(this.appElement)
    mainPage.render()
  }

  showChat(chatId) {
    // Navigate to specific chat
    console.log('Showing chat:', chatId)
  }

  showProfile() {
    // Show profile page
    console.log('Showing profile')
  }

  showSettings() {
    // Show settings page
    console.log('Showing settings')
  }
}