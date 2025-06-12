export class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light'
    this.applyTheme()
  }

  applyTheme() {
    if (this.currentTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', this.currentTheme)
    this.applyTheme()
  }

  setTheme(theme) {
    this.currentTheme = theme
    localStorage.setItem('theme', theme)
    this.applyTheme()
  }

  getCurrentTheme() {
    return this.currentTheme
  }
}