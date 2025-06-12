import { DataService } from '../../services/data.js'
import { AuthService } from '../../services/auth.js'
import { ChatService } from '../../services/chat.js'
import { MessageList } from './message-list.js'
import { MessageInput } from './message-input.js'

export class ChatWindow {
  constructor(container, callbacks) {
    this.container = container
    this.callbacks = callbacks
    this.currentChat = null
    this.isTyping = false
  }

  render() {
    this.container.innerHTML = this.getHTML()
    this.attachEventListeners()
  }

  getHTML() {
    if (!this.currentChat) {
      return `
        <div class="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
          <div class="text-center">
            <div class="w-32 h-32 bg-whatsapp-green rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fab fa-whatsapp text-white text-6xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">WhatsApp Clone</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Sélectionnez une discussion pour commencer</p>
            <p class="text-sm text-gray-500 dark:text-gray-500">
              Utilisez le bouton + pour démarrer une nouvelle conversation
            </p>
          </div>
        </div>
      `
    }

    return `
      <div class="flex flex-col h-full">
        <!-- Chat Header -->
        <div id="chatHeader" class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <!-- Header will be rendered here -->
        </div>
        
        <!-- Messages -->
        <div id="messagesList" class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <!-- Messages will be rendered here -->
        </div>
        
        <!-- Message Input -->
        <div id="messageInput" class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <!-- Input will be rendered here -->
        </div>
      </div>
      
      <!-- Chat Menu Modal -->
      <div id="chatMenuModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw max-h-80vh overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Options du chat</h3>
            <button id="closeChatMenuBtn" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div id="chatMenuContent">
            <!-- Menu content will be rendered here -->
          </div>
        </div>
      </div>
      
      <!-- Group Info Modal -->
      <div id="groupInfoModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw max-h-80vh overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Informations du groupe</h3>
            <button id="closeGroupInfoBtn" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div id="groupInfoContent">
            <!-- Group info content will be rendered here -->
          </div>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    // Chat menu modal
    const chatMenuModal = document.getElementById('chatMenuModal')
    const closeChatMenuBtn = document.getElementById('closeChatMenuBtn')
    
    if (closeChatMenuBtn) {
      closeChatMenuBtn.addEventListener('click', () => {
        chatMenuModal.classList.add('hidden')
      })
    }

    // Group info modal
    const groupInfoModal = document.getElementById('groupInfoModal')
    const closeGroupInfoBtn = document.getElementById('closeGroupInfoBtn')
    
    if (closeGroupInfoBtn) {
      closeGroupInfoBtn.addEventListener('click', () => {
        groupInfoModal.classList.add('hidden')
      })
    }
  }

  loadChat(chat) {
    this.currentChat = chat
    this.render()
    this.renderHeader()
    this.renderMessages()
    this.renderInput()
  }

  renderHeader() {
    if (!this.currentChat) return

    const headerContainer = document.getElementById('chatHeader')
    if (!headerContainer) return

    const users = DataService.getUsers()
    const currentUser = AuthService.getCurrentUser()
    
    let displayName = this.currentChat.name
    let avatar = this.currentChat.avatar
    let status = ''
    let isOnline = false
    
    if (this.currentChat.type === 'private') {
      const otherParticipant = this.currentChat.participants.find(id => id !== currentUser.id)
      const otherUser = users.find(u => u.id === otherParticipant)
      if (otherUser) {
        displayName = `${otherUser.firstName} ${otherUser.lastName}`
        avatar = otherUser.avatar
        status = otherUser.isOnline ? 'En ligne' : `Vu ${this.formatLastSeen(otherUser.lastSeen)}`
        isOnline = otherUser.isOnline
      }
    } else if (this.currentChat.type === 'group') {
      status = `${this.currentChat.participants.length} membres`
    }

    headerContainer.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3 cursor-pointer" id="chatHeaderInfo">
          <div class="relative">
            <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              ${avatar 
                ? `<img src="${avatar}" alt="${displayName}" class="w-full h-full object-cover">`
                : `<span class="text-lg font-semibold text-gray-600">${displayName[0]}</span>`
              }
            </div>
            ${isOnline ? '<div class="online-indicator"></div>' : ''}
            ${this.currentChat.type === 'group' ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-whatsapp-green rounded-full flex items-center justify-center"><i class="fas fa-users text-xs text-white"></i></div>' : ''}
          </div>
          <div>
            <h2 class="font-semibold text-gray-900 dark:text-white">${displayName}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">${status}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button id="videoCallBtn" class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Appel vidéo">
            <i class="fas fa-video"></i>
          </button>
          <button id="audioCallBtn" class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Appel audio">
            <i class="fas fa-phone"></i>
          </button>
          <button id="chatMenuBtn" class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Menu">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    `

    // Add event listeners for header buttons
    this.attachHeaderEventListeners()
  }

  attachHeaderEventListeners() {
    const chatHeaderInfo = document.getElementById('chatHeaderInfo')
    const videoCallBtn = document.getElementById('videoCallBtn')
    const audioCallBtn = document.getElementById('audioCallBtn')
    const chatMenuBtn = document.getElementById('chatMenuBtn')

    if (chatHeaderInfo) {
      chatHeaderInfo.addEventListener('click', () => {
        if (this.currentChat.type === 'group') {
          this.showGroupInfo()
        } else {
          this.showContactInfo()
        }
      })
    }

    if (videoCallBtn) {
      videoCallBtn.addEventListener('click', () => {
        this.initiateCall('video')
      })
    }

    if (audioCallBtn) {
      audioCallBtn.addEventListener('click', () => {
        this.initiateCall('audio')
      })
    }

    if (chatMenuBtn) {
      chatMenuBtn.addEventListener('click', () => {
        this.showChatMenu()
      })
    }
  }

  showChatMenu() {
    const modal = document.getElementById('chatMenuModal')
    const content = document.getElementById('chatMenuContent')
    
    const isGroup = this.currentChat.type === 'group'
    const currentUser = AuthService.getCurrentUser()
    const isAdmin = isGroup && this.currentChat.admins.includes(currentUser.id)
    const isArchived = DataService.isChatArchived(this.currentChat.id)

    content.innerHTML = `
      <div class="space-y-2">
        ${isGroup ? `
          <button id="groupInfoBtn" class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <i class="fas fa-info-circle mr-3"></i> Informations du groupe
          </button>
        ` : `
          <button id="contactInfoBtn" class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <i class="fas fa-user mr-3"></i> Informations du contact
          </button>
        `}
        
        <button id="searchInChatBtn" class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <i class="fas fa-search mr-3"></i> Rechercher dans la discussion
        </button>
        
        <button id="muteBtn" class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <i class="fas fa-bell-slash mr-3"></i> Désactiver les notifications
        </button>
        
        <button id="archiveBtn" class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <i class="fas fa-archive mr-3"></i> ${isArchived ? 'Désarchiver' : 'Archiver'} la discussion
        </button>
        
        <button id="clearChatBtn" class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-orange-600">
          <i class="fas fa-trash mr-3"></i> Vider la discussion
        </button>
        
        ${!isGroup ? `
          <button id="blockContactBtn" class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600">
            <i class="fas fa-ban mr-3"></i> Bloquer le contact
          </button>
        ` : ''}
        
        <button id="deleteChatBtn" class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600">
          <i class="fas fa-trash-alt mr-3"></i> Supprimer la discussion
        </button>
      </div>
    `

    // Add event listeners
    this.attachChatMenuEventListeners()
    modal.classList.remove('hidden')
  }

  attachChatMenuEventListeners() {
    const modal = document.getElementById('chatMenuModal')
    
    const groupInfoBtn = document.getElementById('groupInfoBtn')
    const contactInfoBtn = document.getElementById('contactInfoBtn')
    const archiveBtn = document.getElementById('archiveBtn')
    const clearChatBtn = document.getElementById('clearChatBtn')
    const blockContactBtn = document.getElementById('blockContactBtn')
    const deleteChatBtn = document.getElementById('deleteChatBtn')

    if (groupInfoBtn) {
      groupInfoBtn.addEventListener('click', () => {
        modal.classList.add('hidden')
        this.showGroupInfo()
      })
    }

    if (contactInfoBtn) {
      contactInfoBtn.addEventListener('click', () => {
        modal.classList.add('hidden')
        this.showContactInfo()
      })
    }

    if (archiveBtn) {
      archiveBtn.addEventListener('click', () => {
        this.toggleArchiveChat()
        modal.classList.add('hidden')
      })
    }

    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir vider cette discussion ?')) {
          this.clearChat()
        }
        modal.classList.add('hidden')
      })
    }

    if (blockContactBtn) {
      blockContactBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir bloquer ce contact ?')) {
          this.blockContact()
        }
        modal.classList.add('hidden')
      })
    }

    if (deleteChatBtn) {
      deleteChatBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette discussion ?')) {
          this.deleteChat()
        }
        modal.classList.add('hidden')
      })
    }
  }

  showGroupInfo() {
    const modal = document.getElementById('groupInfoModal')
    const content = document.getElementById('groupInfoContent')
    const currentUser = AuthService.getCurrentUser()
    const isAdmin = this.currentChat.admins.includes(currentUser.id)
    const users = DataService.getUsers()

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Group Header -->
        <div class="text-center">
          <div class="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
            ${this.currentChat.avatar 
              ? `<img src="${this.currentChat.avatar}" alt="${this.currentChat.name}" class="w-full h-full object-cover">`
              : `<span class="text-2xl font-semibold text-gray-600">${this.currentChat.name[0]}</span>`
            }
          </div>
          <h3 class="text-xl font-semibold">${this.currentChat.name}</h3>
          <p class="text-sm text-gray-500">Créé le ${new Date(this.currentChat.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>

        <!-- Group Description -->
        <div>
          <h4 class="font-medium mb-2">Description</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            ${this.currentChat.description || 'Aucune description'}
          </p>
          ${isAdmin ? `
            <button id="editDescriptionBtn" class="text-sm text-whatsapp-green mt-1">
              <i class="fas fa-edit mr-1"></i> Modifier
            </button>
          ` : ''}
        </div>

        <!-- Members -->
        <div>
          <h4 class="font-medium mb-2">${this.currentChat.participants.length} membres</h4>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            ${this.currentChat.participants.map(participantId => {
              const user = users.find(u => u.id === participantId)
              if (!user) return ''
              
              const isUserAdmin = this.currentChat.admins.includes(participantId)
              const isCreator = this.currentChat.createdBy === participantId
              
              return `
                <div class="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      ${user.avatar 
                        ? `<img src="${user.avatar}" alt="${user.firstName}" class="w-full h-full object-cover">`
                        : `<span class="text-sm font-semibold text-gray-600">${user.firstName[0]}</span>`
                      }
                    </div>
                    <div>
                      <p class="font-medium">${user.firstName} ${user.lastName}</p>
                      <p class="text-xs text-gray-500">
                        ${isCreator ? 'Créateur' : isUserAdmin ? 'Administrateur' : 'Membre'}
                      </p>
                    </div>
                  </div>
                  
                  ${isAdmin && participantId !== currentUser.id && !isCreator ? `
                    <div class="flex space-x-1">
                      ${!isUserAdmin ? `
                        <button class="promote-member p-1 text-green-600 hover:bg-green-100 rounded" data-user-id="${participantId}" title="Promouvoir admin">
                          <i class="fas fa-arrow-up text-xs"></i>
                        </button>
                      ` : `
                        <button class="demote-member p-1 text-orange-600 hover:bg-orange-100 rounded" data-user-id="${participantId}" title="Rétrograder">
                          <i class="fas fa-arrow-down text-xs"></i>
                        </button>
                      `}
                      <button class="remove-member p-1 text-red-600 hover:bg-red-100 rounded" data-user-id="${participantId}" title="Retirer du groupe">
                        <i class="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ` : ''}
                </div>
              `
            }).join('')}
          </div>
        </div>

        ${isAdmin ? `
          <div class="pt-4 border-t">
            <button id="addMemberBtn" class="w-full bg-whatsapp-green text-white py-2 px-4 rounded-lg">
              <i class="fas fa-user-plus mr-2"></i> Ajouter un membre
            </button>
          </div>
        ` : ''}
      </div>
    `

    // Add event listeners for group management
    this.attachGroupInfoEventListeners()
    modal.classList.remove('hidden')
  }

  attachGroupInfoEventListeners() {
    const promoteButtons = document.querySelectorAll('.promote-member')
    const demoteButtons = document.querySelectorAll('.demote-member')
    const removeButtons = document.querySelectorAll('.remove-member')
    const addMemberBtn = document.getElementById('addMemberBtn')

    promoteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId
        const result = ChatService.promoteToAdmin(this.currentChat.id, userId, AuthService.getCurrentUser().id)
        if (result.success) {
          this.showGroupInfo() // Refresh
        } else {
          alert(result.message)
        }
      })
    })

    demoteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId
        const result = ChatService.demoteFromAdmin(this.currentChat.id, userId, AuthService.getCurrentUser().id)
        if (result.success) {
          this.showGroupInfo() // Refresh
        } else {
          alert(result.message)
        }
      })
    })

    removeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId
        const user = DataService.getUserById(userId)
        if (confirm(`Retirer ${user.firstName} ${user.lastName} du groupe ?`)) {
          const result = ChatService.removeMemberFromGroup(this.currentChat.id, userId, AuthService.getCurrentUser().id)
          if (result.success) {
            this.currentChat = DataService.getChatById(this.currentChat.id) // Refresh chat data
            this.showGroupInfo() // Refresh
            this.renderMessages() // Refresh messages
          } else {
            alert(result.message)
          }
        }
      })
    })

    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', () => {
        this.showAddMemberModal()
      })
    }
  }

  showContactInfo() {
    const currentUser = AuthService.getCurrentUser()
    const otherParticipant = this.currentChat.participants.find(id => id !== currentUser.id)
    const contact = DataService.getUserById(otherParticipant)
    
    if (!contact) return

    const modal = document.getElementById('groupInfoModal')
    const content = document.getElementById('groupInfoContent')

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Contact Header -->
        <div class="text-center">
          <div class="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
            ${contact.avatar 
              ? `<img src="${contact.avatar}" alt="${contact.firstName}" class="w-full h-full object-cover">`
              : `<span class="text-2xl font-semibold text-gray-600">${contact.firstName[0]}</span>`
            }
          </div>
          <h3 class="text-xl font-semibold">${contact.firstName} ${contact.lastName}</h3>
          <p class="text-sm text-gray-500">${contact.phone}</p>
        </div>

        <!-- Status -->
        <div>
          <h4 class="font-medium mb-2">Statut</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">${contact.status}</p>
        </div>

        <!-- Last Seen -->
        <div>
          <h4 class="font-medium mb-2">Dernière connexion</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            ${contact.isOnline ? 'En ligne' : this.formatLastSeen(contact.lastSeen)}
          </p>
        </div>

        <!-- Actions -->
        <div class="space-y-2 pt-4 border-t">
          <button id="callContactBtn" class="w-full bg-whatsapp-green text-white py-2 px-4 rounded-lg">
            <i class="fas fa-phone mr-2"></i> Appeler
          </button>
          <button id="videoCallContactBtn" class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg">
            <i class="fas fa-video mr-2"></i> Appel vidéo
          </button>
          <button id="blockContactInfoBtn" class="w-full bg-red-500 text-white py-2 px-4 rounded-lg">
            <i class="fas fa-ban mr-2"></i> Bloquer le contact
          </button>
        </div>
      </div>
    `

    modal.classList.remove('hidden')
  }

  toggleArchiveChat() {
    const isArchived = DataService.isChatArchived(this.currentChat.id)
    
    if (isArchived) {
      DataService.unarchiveChat(this.currentChat.id)
    } else {
      DataService.archiveChat(this.currentChat.id)
    }
    
    // Refresh sidebar
    if (this.callbacks.onChatArchived) {
      this.callbacks.onChatArchived()
    }
  }

  clearChat() {
    const messages = DataService.getMessages()
    const filteredMessages = messages.filter(m => m.chatId !== this.currentChat.id)
    DataService.saveMessages(filteredMessages)
    
    this.renderMessages()
  }

  blockContact() {
    const currentUser = AuthService.getCurrentUser()
    const otherParticipant = this.currentChat.participants.find(id => id !== currentUser.id)
    
    if (otherParticipant) {
      DataService.blockContact(otherParticipant)
      alert('Contact bloqué')
    }
  }

  deleteChat() {
    const chats = DataService.getChats()
    const filteredChats = chats.filter(c => c.id !== this.currentChat.id)
    DataService.saveChats(filteredChats)
    
    // Clear messages
    this.clearChat()
    
    // Reset view
    this.currentChat = null
    this.render()
    
    // Refresh sidebar
    if (this.callbacks.onChatDeleted) {
      this.callbacks.onChatDeleted()
    }
  }

  initiateCall(type) {
    console.log(`Démarrage appel ${type}`)
    // Implementation for call initiation
  }

  renderMessages() {
    if (!this.currentChat) return

    const messagesContainer = document.getElementById('messagesList')
    if (!messagesContainer) return

    this.messageList = new MessageList(messagesContainer, {
      chatId: this.currentChat.id
    })
    this.messageList.render()
  }

  renderInput() {
    if (!this.currentChat) return

    const inputContainer = document.getElementById('messageInput')
    if (!inputContainer) return

    this.messageInput = new MessageInput(inputContainer, {
      onSendMessage: this.callbacks.onSendMessage,
      onTyping: this.handleTyping.bind(this)
    })
    this.messageInput.setChatId(this.currentChat.id)
    this.messageInput.render()
  }

  addMessage(message) {
    if (this.messageList) {
      this.messageList.addMessage(message)
    }
  }

  handleTyping(isTyping) {
    this.isTyping = isTyping
    // Implement typing indicator logic
  }

  formatLastSeen(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) {
      return 'à l\'instant'
    } else if (diff < 3600000) {
      return `il y a ${Math.floor(diff / 60000)} min`
    } else if (diff < 86400000) {
      return `il y a ${Math.floor(diff / 3600000)} h`
    } else {
      return date.toLocaleDateString('fr-FR')
    }
  }
}