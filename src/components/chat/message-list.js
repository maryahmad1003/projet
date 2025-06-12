import { DataService } from '../../services/data.js'
import { AuthService } from '../../services/auth.js'

export class MessageList {
  constructor(container, options) {
    this.container = container
    this.chatId = options.chatId
    this.messages = []
  }

  render() {
    this.loadMessages()
    this.container.innerHTML = this.getHTML()
    this.scrollToBottom()
    this.attachEventListeners()
  }

  loadMessages() {
    this.messages = DataService.getMessagesByChatId(this.chatId)
  }

  getHTML() {
    if (this.messages.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <i class="fas fa-comment text-4xl mb-4"></i>
          <p class="text-lg">Aucun message</p>
          <p class="text-sm">Envoyez votre premier message !</p>
        </div>
      `
    }

    return `
      <div class="p-4 space-y-4">
        ${this.messages.map(message => this.getMessageHTML(message)).join('')}
      </div>
    `
  }

  getMessageHTML(message) {
    const currentUser = AuthService.getCurrentUser()
    const isSent = message.senderId === currentUser.id
    const sender = DataService.getUserById(message.senderId)
    const senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Utilisateur'
    
    const messageClass = isSent ? 'message-sent ml-auto' : 'message-received mr-auto'
    const timestamp = new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    let contentHTML = ''
    switch (message.type) {
      case 'text':
        contentHTML = this.formatTextMessage(message.content)
        break
      case 'image':
        contentHTML = `<img src="${message.content}" alt="Image" class="max-w-sm rounded-lg mb-2">`
        break
      case 'audio':
        contentHTML = `
          <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <button class="p-2 bg-whatsapp-green text-white rounded-full">
              <i class="fas fa-play"></i>
            </button>
            <div class="flex-1">
              <div class="w-full bg-gray-300 rounded-full h-1">
                <div class="bg-whatsapp-green h-1 rounded-full" style="width: 0%"></div>
              </div>
            </div>
            <span class="text-xs text-gray-500">0:00</span>
          </div>
        `
        break
      case 'document':
        contentHTML = `
          <div class="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <i class="fas fa-file-alt text-2xl text-gray-600"></i>
            <div>
              <p class="font-medium">${message.content.name}</p>
              <p class="text-sm text-gray-500">${message.content.size}</p>
            </div>
          </div>
        `
        break
    }

    return `
      <div class="flex ${isSent ? 'justify-end' : 'justify-start'}">
        <div class="message-bubble ${messageClass} p-3 shadow-sm">
          ${!isSent && message.chatType === 'group' ? `<p class="text-xs font-medium text-whatsapp-green mb-1">${senderName}</p>` : ''}
          ${message.replyTo ? this.getReplyHTML(message.replyTo) : ''}
          <div class="message-content">
            ${contentHTML}
          </div>
          <div class="flex items-center justify-end mt-1 space-x-1">
            ${message.edited ? '<span class="text-xs text-gray-400">modifié</span>' : ''}
            <span class="text-xs text-gray-400">${timestamp}</span>
            ${isSent ? this.getStatusIcon(message.status) : ''}
          </div>
          ${message.reactions.length > 0 ? this.getReactionsHTML(message.reactions) : ''}
        </div>
      </div>
    `
  }

  formatTextMessage(content) {
    // Format links, mentions, emojis
    let formatted = content
    
    // Format URLs
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>'
    )
    
    // Format mentions
    formatted = formatted.replace(
      /@(\w+)/g,
      '<span class="text-whatsapp-green font-medium">@$1</span>'
    )
    
    // Format bold text
    formatted = formatted.replace(
      /\*([^*]+)\*/g,
      '<strong>$1</strong>'
    )
    
    // Format italic text
    formatted = formatted.replace(
      /_([^_]+)_/g,
      '<em>$1</em>'
    )
    
    return formatted
  }

  getReplyHTML(replyToId) {
    const replyMessage = this.messages.find(m => m.id === replyToId)
    if (!replyMessage) return ''
    
    const replySender = DataService.getUserById(replyMessage.senderId)
    const replyContent = replyMessage.content.length > 50 
      ? replyMessage.content.substring(0, 50) + '...'
      : replyMessage.content
    
    return `
      <div class="bg-gray-200 dark:bg-gray-600 p-2 rounded mb-2 border-l-4 border-whatsapp-green">
        <p class="text-xs font-medium text-whatsapp-green">${replySender?.firstName || 'Utilisateur'}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300">${replyContent}</p>
      </div>
    `
  }

  getStatusIcon(status) {
    switch (status) {
      case 'sent':
        return '<i class="fas fa-check text-xs text-gray-400"></i>'
      case 'delivered':
        return '<i class="fas fa-check-double text-xs text-gray-400"></i>'
      case 'read':
        return '<i class="fas fa-check-double text-xs text-whatsapp-green"></i>'
      default:
        return '<i class="far fa-clock text-xs text-gray-400"></i>'
    }
  }

  getReactionsHTML(reactions) {
    if (reactions.length === 0) return ''
    
    const reactionCounts = {}
    reactions.forEach(reaction => {
      reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1
    })
    
    const reactionElements = Object.entries(reactionCounts).map(([emoji, count]) => 
      `<span class="bg-white dark:bg-gray-700 px-2 py-1 rounded-full text-xs border">${emoji} ${count}</span>`
    ).join('')
    
    return `<div class="flex space-x-1 mt-2">${reactionElements}</div>`
  }

  attachEventListeners() {
    // Add message interaction listeners
    const messages = this.container.querySelectorAll('.message-bubble')
    messages.forEach(messageEl => {
      messageEl.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        this.showContextMenu(e, messageEl)
      })
    })
  }

  showContextMenu(event, messageEl) {
    // Implementation for message context menu
    console.log('Show message context menu')
  }

  addMessage(message) {
    this.messages.push(message)
    this.render()
  }

  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight
  }
}