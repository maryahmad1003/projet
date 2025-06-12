import { ChatList } from '../chat/chat-list.js'
import { StoryList } from '../story/story-list.js'
import { CallList } from '../call/call-list.js'
import { ContactList } from '../contact/contact-list.js'
import { AuthService } from '../../services/auth.js'
import { ChatService } from '../../services/chat.js'
import { DataService } from '../../services/data.js'

export class Sidebar {
  constructor(container, callbacks) {
    this.container = container
    this.callbacks = callbacks
    this.activeTab = 'chats'
    this.searchQuery = ''
  }

  render() {
    this.container.innerHTML = this.getHTML()
    this.attachEventListeners()
    this.renderContent()
  }

  getHTML() {
    const user = AuthService.getCurrentUser()
    return `
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-whatsapp-green rounded-full flex items-center justify-center relative overflow-hidden">
              ${user?.avatar 
                ? `<img src="${user.avatar}" alt="${user.firstName}" class="w-full h-full object-cover">`
                : `<span class="text-white font-semibold">${user?.firstName?.[0] || 'U'}</span>`
              }
              <div class="online-indicator"></div>
            </div>
            <div>
              <h2 class="font-semibold text-gray-800 dark:text-white">${user?.firstName || 'Utilisateur'}</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">En ligne</p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button id="newChatBtn" class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Nouveau chat">
              <i class="fas fa-plus"></i>
            </button>
            <button id="menuBtn" class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Menu">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        
        <!-- Search -->
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          <input 
            type="text" 
            id="searchInput"
            placeholder="Rechercher ou tapez * pour ordre alphabétique..." 
            class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
          />
        </div>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button class="tab-button flex-1 py-3 text-sm font-medium" data-tab="chats">
          <i class="fas fa-comment-dots mr-1"></i> Discussions
        </button>
        <button class="tab-button flex-1 py-3 text-sm font-medium" data-tab="stories">
          <i class="fas fa-circle-notch mr-1"></i> Stories
        </button>
        <button class="tab-button flex-1 py-3 text-sm font-medium" data-tab="calls">
          <i class="fas fa-phone mr-1"></i> Appels
        </button>
      </div>
      
      <!-- Content -->
      <div id="sidebarContent" class="flex-1 overflow-y-auto scrollbar-hide">
        <!-- Content will be rendered here -->
      </div>
      
      <!-- Menu Dropdown -->
      <div id="menuDropdown" class="hidden absolute top-16 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50 min-w-48">
        <button id="profileBtn" class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
          <i class="fas fa-user mr-2"></i> Profil
        </button>
        <button id="archivedBtn" class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
          <i class="fas fa-archive mr-2"></i> Discussions archivées
        </button>
        <button id="broadcastBtn" class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
          <i class="fas fa-bullhorn mr-2"></i> Listes de diffusion
        </button>
        <button id="settingsBtn" class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
          <i class="fas fa-cog mr-2"></i> Paramètres
        </button>
        <button id="themeBtn" class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
          <i class="fas fa-moon mr-2"></i> Mode sombre
        </button>
        <hr class="my-1">
        <button id="logoutBtn" class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600">
          <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
        </button>
      </div>
      
      <!-- New Chat Modal -->
      <div id="newChatModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Nouveau chat</h3>
            <button id="closeModalBtn" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="flex space-x-2 mb-4">
            <button id="newPrivateChatBtn" class="flex-1 bg-whatsapp-green text-white py-2 px-4 rounded-lg text-sm">
              <i class="fas fa-user mr-2"></i> Chat privé
            </button>
            <button id="newGroupChatBtn" class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg text-sm">
              <i class="fas fa-users mr-2"></i> Groupe
            </button>
            <button id="newBroadcastBtn" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm">
              <i class="fas fa-bullhorn mr-2"></i> Diffusion
            </button>
          </div>
          
          <div id="modalContent" class="max-h-64 overflow-y-auto">
            <!-- Content will be loaded here -->
          </div>
        </div>
      </div>
      
      <!-- Group Creation Modal -->
      <div id="groupModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Créer un groupe</h3>
            <button id="closeGroupModalBtn" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div id="groupCreationStep" class="step-1">
            <!-- Step 1: Group Info -->
            <div class="step-content step-1-content">
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Nom du groupe</label>
                <input type="text" id="groupName" class="w-full p-2 border rounded-lg" placeholder="Nom du groupe" maxlength="25">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Description (optionnel)</label>
                <textarea id="groupDescription" class="w-full p-2 border rounded-lg" placeholder="Description du groupe" rows="3" maxlength="512"></textarea>
              </div>
              <button id="nextStepBtn" class="w-full bg-whatsapp-green text-white py-2 px-4 rounded-lg">
                Suivant
              </button>
            </div>
            
            <!-- Step 2: Select Members -->
            <div class="step-content step-2-content hidden">
              <div class="mb-4">
                <p class="text-sm text-gray-600 mb-2">Sélectionnez les membres du groupe</p>
                <div id="selectedMembers" class="flex flex-wrap gap-2 mb-2"></div>
              </div>
              <div id="groupContactsList" class="max-h-48 overflow-y-auto mb-4">
                <!-- Contacts will be loaded here -->
              </div>
              <div class="flex space-x-2">
                <button id="prevStepBtn" class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg">
                  Précédent
                </button>
                <button id="createGroupBtn" class="flex-1 bg-whatsapp-green text-white py-2 px-4 rounded-lg">
                  Créer le groupe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    // Tab switching
    const tabButtons = this.container.querySelectorAll('.tab-button')
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tab = button.dataset.tab
        this.setActiveTab(tab)
        if (this.callbacks.onTabChange) {
          this.callbacks.onTabChange(tab)
        }
      })
    })

    // Search functionality
    const searchInput = document.getElementById('searchInput')
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value
      this.renderContent()
    })

    // Menu toggle
    const menuBtn = document.getElementById('menuBtn')
    const menuDropdown = document.getElementById('menuDropdown')
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      menuDropdown.classList.toggle('hidden')
    })

    // Menu items
    document.getElementById('profileBtn').addEventListener('click', () => {
      this.showProfile()
      menuDropdown.classList.add('hidden')
    })

    document.getElementById('archivedBtn').addEventListener('click', () => {
      this.showArchivedChats()
      menuDropdown.classList.add('hidden')
    })

    document.getElementById('broadcastBtn').addEventListener('click', () => {
      this.showBroadcasts()
      menuDropdown.classList.add('hidden')
    })

    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.showSettings()
      menuDropdown.classList.add('hidden')
    })

    document.getElementById('themeBtn').addEventListener('click', () => {
      this.toggleTheme()
      menuDropdown.classList.add('hidden')
    })

    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (this.callbacks.onLogout) {
        this.callbacks.onLogout()
      }
    })

    // New chat modal
    this.attachNewChatModalListeners()
    this.attachGroupModalListeners()

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.classList.add('hidden')
      }
    })
  }

  attachNewChatModalListeners() {
    const newChatBtn = document.getElementById('newChatBtn')
    const newChatModal = document.getElementById('newChatModal')
    const closeModalBtn = document.getElementById('closeModalBtn')
    const newPrivateChatBtn = document.getElementById('newPrivateChatBtn')
    const newGroupChatBtn = document.getElementById('newGroupChatBtn')
    const newBroadcastBtn = document.getElementById('newBroadcastBtn')

    newChatBtn.addEventListener('click', () => {
      this.showNewChatModal('private')
    })

    closeModalBtn.addEventListener('click', () => {
      newChatModal.classList.add('hidden')
    })

    newPrivateChatBtn.addEventListener('click', () => {
      this.showNewChatModal('private')
    })

    newGroupChatBtn.addEventListener('click', () => {
      newChatModal.classList.add('hidden')
      this.showGroupModal()
    })

    newBroadcastBtn.addEventListener('click', () => {
      this.showNewChatModal('broadcast')
    })
  }

  attachGroupModalListeners() {
    const groupModal = document.getElementById('groupModal')
    const closeGroupModalBtn = document.getElementById('closeGroupModalBtn')
    const nextStepBtn = document.getElementById('nextStepBtn')
    const prevStepBtn = document.getElementById('prevStepBtn')
    const createGroupBtn = document.getElementById('createGroupBtn')

    closeGroupModalBtn.addEventListener('click', () => {
      groupModal.classList.add('hidden')
      this.resetGroupModal()
    })

    nextStepBtn.addEventListener('click', () => {
      const groupName = document.getElementById('groupName').value.trim()
      if (groupName) {
        this.showGroupStep2()
      } else {
        alert('Veuillez entrer un nom de groupe')
      }
    })

    prevStepBtn.addEventListener('click', () => {
      this.showGroupStep1()
    })

    createGroupBtn.addEventListener('click', () => {
      this.createGroup()
    })
  }

  setActiveTab(tab) {
    this.activeTab = tab
    const tabButtons = this.container.querySelectorAll('.tab-button')
    tabButtons.forEach(button => {
      if (button.dataset.tab === tab) {
        button.classList.add('text-whatsapp-green', 'border-b-2', 'border-whatsapp-green')
        button.classList.remove('text-gray-600', 'dark:text-gray-400')
      } else {
        button.classList.remove('text-whatsapp-green', 'border-b-2', 'border-whatsapp-green')
        button.classList.add('text-gray-600', 'dark:text-gray-400')
      }
    })
  }

  renderContent() {
    const contentContainer = document.getElementById('sidebarContent')
    
    switch (this.activeTab) {
      case 'chats':
        this.chatList = new ChatList(contentContainer, {
          onChatSelect: this.callbacks.onChatSelect,
          searchQuery: this.searchQuery
        })
        this.chatList.render()
        break
      case 'stories':
        this.storyList = new StoryList(contentContainer, { searchQuery: this.searchQuery })
        this.storyList.render()
        break
      case 'calls':
        this.callList = new CallList(contentContainer, { searchQuery: this.searchQuery })
        this.callList.render()
        break
    }
  }

  showNewChatModal(type) {
    const modal = document.getElementById('newChatModal')
    const modalContent = document.getElementById('modalContent')
    
    // Update button states
    const buttons = modal.querySelectorAll('button[id$="Btn"]:not(#closeModalBtn)')
    buttons.forEach(btn => {
      btn.classList.remove('bg-whatsapp-green', 'bg-gray-500', 'bg-blue-500')
      btn.classList.add('bg-gray-300')
    })
    
    if (type === 'private') {
      document.getElementById('newPrivateChatBtn').classList.remove('bg-gray-300')
      document.getElementById('newPrivateChatBtn').classList.add('bg-whatsapp-green')
    } else if (type === 'broadcast') {
      document.getElementById('newBroadcastBtn').classList.remove('bg-gray-300')
      document.getElementById('newBroadcastBtn').classList.add('bg-blue-500')
    }
    
    // Load contacts
    this.contactList = new ContactList(modalContent, {
      selectionMode: type === 'broadcast',
      callbacks: {
        onContactSelect: (contactId) => {
          if (type === 'private') {
            this.createChatWithContact(contactId)
            modal.classList.add('hidden')
          }
        },
        onSelectionChange: (selectedContacts) => {
          this.selectedBroadcastContacts = selectedContacts
        }
      }
    })
    this.contactList.render()
    
    if (type === 'broadcast') {
      modalContent.innerHTML += `
        <div class="mt-4 pt-4 border-t">
          <button id="createBroadcastBtn" class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg">
            Créer la liste de diffusion
          </button>
        </div>
      `
      
      document.getElementById('createBroadcastBtn').addEventListener('click', () => {
        this.createBroadcast()
        modal.classList.add('hidden')
      })
    }
    
    modal.classList.remove('hidden')
  }

  showGroupModal() {
    const modal = document.getElementById('groupModal')
    this.resetGroupModal()
    modal.classList.remove('hidden')
  }

  resetGroupModal() {
    document.getElementById('groupName').value = ''
    document.getElementById('groupDescription').value = ''
    this.selectedGroupMembers = []
    this.showGroupStep1()
  }

  showGroupStep1() {
    document.querySelector('.step-1-content').classList.remove('hidden')
    document.querySelector('.step-2-content').classList.add('hidden')
  }

  showGroupStep2() {
    document.querySelector('.step-1-content').classList.add('hidden')
    document.querySelector('.step-2-content').classList.remove('hidden')
    
    // Load contacts for group selection
    const contactsList = document.getElementById('groupContactsList')
    this.groupContactList = new ContactList(contactsList, {
      selectionMode: true,
      selectedContacts: this.selectedGroupMembers || [],
      callbacks: {
        onSelectionChange: (selectedContacts) => {
          this.selectedGroupMembers = selectedContacts
          this.updateSelectedMembersDisplay()
        }
      }
    })
    this.groupContactList.render()
  }

  updateSelectedMembersDisplay() {
    const container = document.getElementById('selectedMembers')
    const users = DataService.getUsers()
    
    container.innerHTML = this.selectedGroupMembers.map(memberId => {
      const user = users.find(u => u.id === memberId)
      if (!user) return ''
      
      return `
        <span class="bg-whatsapp-green text-white px-2 py-1 rounded-full text-xs">
          ${user.firstName} ${user.lastName}
          <button class="ml-1 text-white hover:text-gray-200" onclick="this.parentElement.remove()">×</button>
        </span>
      `
    }).join('')
  }

  createGroup() {
    const groupName = document.getElementById('groupName').value.trim()
    const groupDescription = document.getElementById('groupDescription').value.trim()
    
    if (!groupName) {
      alert('Veuillez entrer un nom de groupe')
      return
    }
    
    if (!this.selectedGroupMembers || this.selectedGroupMembers.length === 0) {
      alert('Veuillez sélectionner au moins un membre')
      return
    }
    
    const currentUser = AuthService.getCurrentUser()
    const participants = [currentUser.id, ...this.selectedGroupMembers]
    
    const newGroup = ChatService.createChat('group', participants, groupName, groupDescription)
    if (newGroup && this.callbacks.onChatSelect) {
      this.callbacks.onChatSelect(newGroup.id)
    }
    
    document.getElementById('groupModal').classList.add('hidden')
    this.updateChatList()
  }

  createBroadcast() {
    if (!this.selectedBroadcastContacts || this.selectedBroadcastContacts.length === 0) {
      alert('Veuillez sélectionner au moins un contact')
      return
    }
    
    const broadcastName = prompt('Nom de la liste de diffusion:')
    if (!broadcastName) return
    
    const broadcast = ChatService.createBroadcast(broadcastName, this.selectedBroadcastContacts)
    if (broadcast) {
      alert('Liste de diffusion créée avec succès')
    }
  }

  createChatWithContact(contactId) {
    const currentUser = AuthService.getCurrentUser()
    const existingChat = ChatService.findPrivateChat(currentUser.id, contactId)
    
    if (existingChat) {
      if (this.callbacks.onChatSelect) {
        this.callbacks.onChatSelect(existingChat.id)
      }
    } else {
      const newChat = ChatService.createChat('private', [currentUser.id, contactId])
      if (newChat && this.callbacks.onChatSelect) {
        this.callbacks.onChatSelect(newChat.id)
      }
    }
    this.updateChatList()
  }

  updateContent(tab) {
    if (tab) {
      this.setActiveTab(tab)
    }
    this.renderContent()
  }

  updateChatList() {
    if (this.activeTab === 'chats' && this.chatList) {
      this.chatList.render()
    }
  }

  showProfile() {
    console.log('Affichage du profil')
    // Implementation for profile page
  }

  showArchivedChats() {
    console.log('Affichage des discussions archivées')
    // Implementation for archived chats
  }

  showBroadcasts() {
    console.log('Affichage des listes de diffusion')
    // Implementation for broadcasts
  }

  showSettings() {
    console.log('Affichage des paramètres')
    // Implementation for settings page
  }

  toggleTheme() {
    document.documentElement.classList.toggle('dark')
    const isDark = document.documentElement.classList.contains('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }
}