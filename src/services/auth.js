import { DataService } from './data.js'

export class AuthService {
  static login(phone, password) {
    const users = DataService.getUsers()
    const user = users.find(u => u.phone === phone && u.password === password)
    
    if (user) {
      const userData = { ...user }
      delete userData.password
      localStorage.setItem('currentUser', JSON.stringify(userData))
      localStorage.setItem('isLoggedIn', 'true')
      return { success: true, user: userData }
    }
    
    return { success: false, message: 'Numéro ou mot de passe incorrect' }
  }

  static register(userData) {
    const users = DataService.getUsers()
    
    // Check if phone already exists
    if (users.find(u => u.phone === userData.phone)) {
      return { success: false, message: 'Ce numéro est déjà utilisé' }
    }

    const newUser = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      password: userData.password,
      avatar: null,
      status: 'Disponible',
      lastSeen: new Date().toISOString(),
      isOnline: false,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    DataService.saveUsers(users)

    return { success: true, user: newUser }
  }

  static logout() {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isLoggedIn')
  }

  static getCurrentUser() {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn === 'true') {
      return JSON.parse(localStorage.getItem('currentUser'))
    }
    return null
  }

  static isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true'
  }

  static updateUserStatus(status) {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      currentUser.status = status
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      
      const users = DataService.getUsers()
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex].status = status
        DataService.saveUsers(users)
      }
    }
  }

  static updateUserProfile(profileData) {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      Object.assign(currentUser, profileData)
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      
      const users = DataService.getUsers()
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      if (userIndex !== -1) {
        Object.assign(users[userIndex], profileData)
        DataService.saveUsers(users)
      }
    }
  }
}