import { Sidebar } from '../components/layout/sidebar.js'
import { ChatList } from '../components/chat/chat-list.js'
import { ChatWindow } from '../components/chat/chat-window.js'
import { ChatService } from '../services/chat.js'
import { AuthService } from '../services/auth.js'

export class MainPage {
  constructor(container) {
    this.container = container
    this.currentChat = null
    this.selectedTab = 'chats'
  }

  render() {
    this.container.innerHTML = this.getHTML()
    this.initializeComponents()
    this.attachEventListeners()
  }

  getHTML() {
    return `
      <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
        <!-- Sidebar -->
        <div id="sidebar" class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <!-- Sidebar will be rendered here -->
        </div>
        
        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col">
          <div id="chatWindow" class="flex-1">
            <!-- Chat window will be rendered here -->
          </div>
        </div>
      </div>
    `
  }

  initializeComponents() {
    // Initialize sidebar
    const sidebarContainer = document.getElementById('sidebar')
    this.sidebar = new Sidebar(sidebarContainer, {
      onTabChange: this.handleTabChange.bind(this),
      onChatSelect: this.handleChatSelect.bind(this),
      onLogout: this.handleLogout.bind(this)
    })
    this.sidebar.render()

    // Initialize chat window
    const chatWindowContainer = document.getElementById('chatWindow')
    this.chatWindow = new ChatWindow(chatWindowContainer, {
      onSendMessage: this.handleSendMessage.bind(this)
    })
    this.chatWindow.render()
  }

  attachEventListeners() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            this.startNewChat()
            break
          case 'f':
            e.preventDefault()
            this.focusSearch()
            break
        }
      }
    })
  }

  handleTabChange(tab) {
    this.selectedTab = tab
    this.sidebar.updateContent(tab)
  }

  handleChatSelect(chatId) {
    this.currentChat = chatId
    const chat = ChatService.getChatById(chatId)
    if (chat) {
      this.chatWindow.loadChat(chat)
      ChatService.markAsRead(chatId)
      this.sidebar.updateChatList()
    }
  }

  handleSendMessage(messageData) {
    if (this.currentChat) {
      const message = ChatService.sendMessage(this.currentChat, messageData)
      this.chatWindow.addMessage(message)
      this.sidebar.updateChatList()
    }
  }

  handleLogout() {
    AuthService.logout()
    window.location.reload()
  }

  startNewChat() {
    // Implementation for starting new chat
    console.log('Starting new chat...')
  }

  focusSearch() {
    const searchInput = document.querySelector('#searchInput')
    if (searchInput) {
      searchInput.focus()
    }
  }
}