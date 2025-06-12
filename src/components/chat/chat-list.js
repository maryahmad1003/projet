import { ChatService } from '../../services/chat.js'
import { DataService } from '../../services/data.js'
import { AuthService } from '../../services/auth.js'

export class ChatList {
  constructor(container, callbacks) {
    this.container = container
    this.callbacks = callbacks
    this.searchQuery = callbacks.searchQuery || ''
  }

  render() {
    const chats = this.getFilteredChats()
    this.container.innerHTML = this.getHTML(chats)
    this.attachEventListeners()
  }

  getFilteredChats() {
    let chats = ChatService.getChats()
    
    if (this.searchQuery) {
      if (this.searchQuery === '*') {
        // Alphabetical order
        chats.sort((a, b) => a.name.localeCompare(b.name))
      } else {
        // Filter by name and participants
        chats = chats.filter(chat => {
          const nameMatch = chat.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          const participantMatch = this.searchParticipants(chat, this.searchQuery)
          return nameMatch || participantMatch
        })
      }
    }
    
    return chats
  }

  searchParticipants(chat, query) {
    const users = DataService.getUsers()
    const participants = chat.participants
      .map(id => users.find(u => u.id === id))
      .filter(user => user)
    
    return participants.some(user => 
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase()) ||
      user.phone.includes(query)
    )
  }

  getHTML(chats) {
    if (chats.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <i class="fas fa-comments text-4xl mb-4"></i>
          <p class="text-lg font-medium">Aucune discussion</p>
          <p class="text-sm">Commencez une nouvelle conversation</p>
        </div>
      `
    }

    return `
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        ${chats.map(chat => this.getChatItemHTML(chat)).join('')}
      </div>
    `
  }

  getChatItemHTML(chat) {
    const users = DataService.getUsers()
    const currentUser = AuthService.getCurrentUser()
    
    // Get chat display info
    let displayName = chat.name
    let avatar = chat.avatar
    let isOnline = false
    
    if (chat.type === 'private') {
      const otherParticipant = chat.participants.find(id => id !== currentUser.id)
      const otherUser = users.find(u => u.id === otherParticipant)
      if (otherUser) {
        displayName = `${otherUser.firstName} ${otherUser.lastName}`
        avatar = otherUser.avatar
        isOnline = otherUser.isOnline
      }
    }

    const lastMessageTime = this.formatTime(chat.lastMessageTime)
    const hasUnread = chat.unreadCount > 0

    return `
      <div class="chat-item p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150" data-chat-id="${chat.id}">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              ${avatar 
                ? `<img src="${avatar}" alt="${displayName}" class="w-full h-full object-cover">`
                : `<span class="text-lg font-semibold text-gray-600">${displayName[0]}</span>`
              }
            </div>
            ${isOnline ? '<div class="online-indicator"></div>' : ''}
            ${chat.type === 'group' ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-whatsapp-green rounded-full flex items-center justify-center"><i class="fas fa-users text-xs text-white"></i></div>' : ''}
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">${displayName}</h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">${lastMessageTime}</span>
            </div>
            <div class="flex items-center justify-between mt-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                ${chat.lastMessage || 'Aucun message'}
              </p>
              ${hasUnread ? `<span class="notification-badge">${chat.unreadCount}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    const chatItems = this.container.querySelectorAll('.chat-item')
    chatItems.forEach(item => {
      item.addEventListener('click', () => {
        const chatId = item.dataset.chatId
        this.callbacks.onChatSelect(chatId)
        
        // Update visual selection
        chatItems.forEach(ci => ci.classList.remove('bg-whatsapp-light'))
        item.classList.add('bg-whatsapp-light')
      })
    })
  }

  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }
  }
}