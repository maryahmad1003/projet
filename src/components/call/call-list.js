import { DataService } from '../../services/data.js'
import { AuthService } from '../../services/auth.js'

export class CallList {
  constructor(container, options) {
    this.container = container
    this.searchQuery = options.searchQuery || ''
  }

  render() {
    const calls = this.getFilteredCalls()
    this.container.innerHTML = this.getHTML(calls)
    this.attachEventListeners()
  }

  getFilteredCalls() {
    let calls = DataService.getCalls()
    const currentUser = AuthService.getCurrentUser()
    
    // Filter calls involving current user
    calls = calls.filter(call => 
      call.participants.includes(currentUser.id)
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    if (this.searchQuery && this.searchQuery !== '*') {
      const users = DataService.getUsers()
      calls = calls.filter(call => {
        const otherParticipant = call.participants.find(id => id !== currentUser.id)
        const otherUser = users.find(u => u.id === otherParticipant)
        return otherUser && (
          otherUser.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          otherUser.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          otherUser.phone.includes(this.searchQuery)
        )
      })
    }
    
    return calls
  }

  getHTML(calls) {
    if (calls.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <i class="fas fa-phone text-4xl mb-4"></i>
          <p class="text-lg font-medium">Aucun appel</p>
          <p class="text-sm">L'historique des appels apparaîtra ici</p>
        </div>
      `
    }

    return `
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        ${calls.map(call => this.getCallItemHTML(call)).join('')}
      </div>
    `
  }

  getCallItemHTML(call) {
    const users = DataService.getUsers()
    const currentUser = AuthService.getCurrentUser()
    
    const otherParticipant = call.participants.find(id => id !== currentUser.id)
    const otherUser = users.find(u => u.id === otherParticipant)
    
    if (!otherUser) return ''

    const displayName = `${otherUser.firstName} ${otherUser.lastName}`
    const callTime = this.formatTime(call.timestamp)
    const duration = call.duration ? this.formatDuration(call.duration) : null
    
    let callIcon = 'fas fa-phone'
    let callClass = 'text-gray-600'
    
    if (call.type === 'video') {
      callIcon = 'fas fa-video'
    }
    
    if (call.status === 'missed') {
      callClass = 'text-red-500'
      callIcon = call.direction === 'incoming' ? 'fas fa-phone text-red-500' : 'fas fa-phone-slash text-red-500'
    } else if (call.direction === 'outgoing') {
      callIcon = 'fas fa-phone rotate-135'
      callClass = 'text-green-500'
    } else {
      callClass = 'text-green-500'
    }

    return `
      <div class="call-item p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" data-call-id="${call.id}" data-user-id="${otherUser.id}">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              ${otherUser.avatar 
                ? `<img src="${otherUser.avatar}" alt="${displayName}" class="w-full h-full object-cover">`
                : `<span class="text-lg font-semibold text-gray-600">${displayName[0]}</span>`
              }
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">${displayName}</h3>
              <div class="flex items-center space-x-2">
                <button class="call-action p-2 text-whatsapp-green hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full" data-action="call" data-type="audio">
                  <i class="fas fa-phone"></i>
                </button>
                <button class="call-action p-2 text-whatsapp-green hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full" data-action="call" data-type="video">
                  <i class="fas fa-video"></i>
                </button>
              </div>
            </div>
            <div class="flex items-center mt-1 space-x-2">
              <i class="${callIcon} text-sm ${callClass}"></i>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                ${call.direction === 'incoming' ? 'Entrant' : 'Sortant'}
                ${duration ? ` • ${duration}` : ''}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">${callTime}</span>
            </div>
          </div>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    const callItems = this.container.querySelectorAll('.call-item')
    callItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.call-action')) {
          const userId = item.dataset.userId
          this.openChatWithUser(userId)
        }
      })
    })

    const callActions = this.container.querySelectorAll('.call-action')
    callActions.forEach(action => {
      action.addEventListener('click', (e) => {
        e.stopPropagation()
        const callType = action.dataset.type
        const userId = action.closest('.call-item').dataset.userId
        this.initiateCall(userId, callType)
      })
    })
  }

  openChatWithUser(userId) {
    // Implementation to open chat with user
    console.log('Open chat with user:', userId)
  }

  initiateCall(userId, type) {
    // Implementation for call initiation
    console.log('Initiate call:', userId, type)
    
    // Create call record
    const currentUser = AuthService.getCurrentUser()
    const newCall = {
      id: Date.now().toString(),
      participants: [currentUser.id, userId],
      type: type, // 'audio' or 'video'
      direction: 'outgoing',
      status: 'calling',
      timestamp: new Date().toISOString(),
      duration: null
    }
    
    const calls = DataService.getCalls()
    calls.push(newCall)
    DataService.saveCalls(calls)
    
    this.showCallInterface(newCall)
  }

  showCallInterface(call) {
    // Implementation for call interface
    console.log('Show call interface:', call)
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

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}