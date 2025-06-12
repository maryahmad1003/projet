export class DataService {
  static initializeData() {
    if (!localStorage.getItem('whatsapp_users')) {
      // Créer des utilisateurs de démonstration
      const demoUsers = [
        {
          id: '1',
          firstName: 'Amadou dioulde',
          lastName: 'diallo',
          phone: '+33612345678',
          password: '123456',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
          status: 'Disponible pour discuter',
          lastSeen: new Date().toISOString(),
          isOnline: true,
          isBlocked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          firstName: 'mary',
          lastName: 'Diallo',
          phone: '+33687654321',
          password: '123456',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          status: 'Occupé au travail',
          lastSeen: new Date(Date.now() - 300000).toISOString(),
          isOnline: false,
          isBlocked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          firstName: 'papa',
          lastName: 'mary',
          phone: '+33698765432',
          password: '123456',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          status: 'Ne pas déranger',
          lastSeen: new Date(Date.now() - 600000).toISOString(),
          isOnline: true,
          isBlocked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          firstName: 'ala mine',
          lastName: 'sy',
          phone: '+33645123789',
          password: '123456',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
          status: 'En réunion',
          lastSeen: new Date(Date.now() - 1800000).toISOString(),
          isOnline: false,
          isBlocked: false,
          createdAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('whatsapp_users', JSON.stringify(demoUsers))
    }
    
    if (!localStorage.getItem('whatsapp_chats')) {
      localStorage.setItem('whatsapp_chats', JSON.stringify([]))
    }
    if (!localStorage.getItem('whatsapp_messages')) {
      localStorage.setItem('whatsapp_messages', JSON.stringify([]))
    }
    if (!localStorage.getItem('whatsapp_stories')) {
      const demoStories = [
        {
          id: '1',
          userId: '2',
          type: 'image',
          content: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          caption: 'Belle journée !',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          viewedBy: [],
          privacy: 'all'
        },
        {
          id: '2',
          userId: '3',
          type: 'text',
          content: 'Nouveau projet en cours 🚀',
          backgroundColor: '#25d366',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          viewedBy: [],
          privacy: 'all'
        }
      ]
      localStorage.setItem('whatsapp_stories', JSON.stringify(demoStories))
    }
    if (!localStorage.getItem('whatsapp_calls')) {
      const demoCalls = [
        {
          id: '1',
          participants: ['1', '2'],
          type: 'audio',
          direction: 'incoming',
          status: 'completed',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          duration: 245
        },
        {
          id: '2',
          participants: ['1', '3'],
          type: 'video',
          direction: 'outgoing',
          status: 'missed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          duration: null
        }
      ]
      localStorage.setItem('whatsapp_calls', JSON.stringify(demoCalls))
    }
    if (!localStorage.getItem('whatsapp_broadcasts')) {
      localStorage.setItem('whatsapp_broadcasts', JSON.stringify([]))
    }
    if (!localStorage.getItem('whatsapp_blocked_contacts')) {
      localStorage.setItem('whatsapp_blocked_contacts', JSON.stringify([]))
    }
    if (!localStorage.getItem('whatsapp_archived_chats')) {
      localStorage.setItem('whatsapp_archived_chats', JSON.stringify([]))
    }
  }

  // Users
  static getUsers() {
    this.initializeData()
    return JSON.parse(localStorage.getItem('whatsapp_users') || '[]')
  }

  static saveUsers(users) {
    localStorage.setItem('whatsapp_users', JSON.stringify(users))
  }

  static getUserById(id) {
    return this.getUsers().find(user => user.id === id)
  }

  static blockContact(contactId) {
    const blocked = this.getBlockedContacts()
    if (!blocked.includes(contactId)) {
      blocked.push(contactId)
      localStorage.setItem('whatsapp_blocked_contacts', JSON.stringify(blocked))
    }
  }

  static unblockContact(contactId) {
    const blocked = this.getBlockedContacts()
    const index = blocked.indexOf(contactId)
    if (index > -1) {
      blocked.splice(index, 1)
      localStorage.setItem('whatsapp_blocked_contacts', JSON.stringify(blocked))
    }
  }

  static getBlockedContacts() {
    return JSON.parse(localStorage.getItem('whatsapp_blocked_contacts') || '[]')
  }

  static isContactBlocked(contactId) {
    return this.getBlockedContacts().includes(contactId)
  }

  // Chats
  static getChats() {
    this.initializeData()
    return JSON.parse(localStorage.getItem('whatsapp_chats') || '[]')
  }

  static saveChats(chats) {
    localStorage.setItem('whatsapp_chats', JSON.stringify(chats))
  }

  static getChatById(id) {
    return this.getChats().find(chat => chat.id === id)
  }

  static archiveChat(chatId) {
    const archived = this.getArchivedChats()
    if (!archived.includes(chatId)) {
      archived.push(chatId)
      localStorage.setItem('whatsapp_archived_chats', JSON.stringify(archived))
    }
  }

  static unarchiveChat(chatId) {
    const archived = this.getArchivedChats()
    const index = archived.indexOf(chatId)
    if (index > -1) {
      archived.splice(index, 1)
      localStorage.setItem('whatsapp_archived_chats', JSON.stringify(archived))
    }
  }

  static getArchivedChats() {
    return JSON.parse(localStorage.getItem('whatsapp_archived_chats') || '[]')
  }

  static isChatArchived(chatId) {
    return this.getArchivedChats().includes(chatId)
  }

  // Messages
  static getMessages() {
    this.initializeData()
    return JSON.parse(localStorage.getItem('whatsapp_messages') || '[]')
  }

  static saveMessages(messages) {
    localStorage.setItem('whatsapp_messages', JSON.stringify(messages))
  }

  static getMessagesByChatId(chatId) {
    return this.getMessages().filter(message => message.chatId === chatId)
  }

  // Stories
  static getStories() {
    this.initializeData()
    return JSON.parse(localStorage.getItem('whatsapp_stories') || '[]')
  }

  static saveStories(stories) {
    localStorage.setItem('whatsapp_stories', JSON.stringify(stories))
  }

  // Calls
  static getCalls() {
    this.initializeData()
    return JSON.parse(localStorage.getItem('whatsapp_calls') || '[]')
  }

  static saveCalls(calls) {
    localStorage.setItem('whatsapp_calls', JSON.stringify(calls))
  }

  // Broadcasts
  static getBroadcasts() {
    this.initializeData()
    return JSON.parse(localStorage.getItem('whatsapp_broadcasts') || '[]')
  }

  static saveBroadcasts(broadcasts) {
    localStorage.setItem('whatsapp_broadcasts', JSON.stringify(broadcasts))
  }

  // Search functionality
  static searchGlobal(query) {
    const results = {
      chats: [],
      messages: [],
      contacts: []
    }

    if (!query || query.length < 2) return results

    const chats = this.getChats()
    const messages = this.getMessages()
    const users = this.getUsers()

    // Search in chats
    results.chats = chats.filter(chat => 
      chat.name.toLowerCase().includes(query.toLowerCase())
    )

    // Search in messages
    results.messages = messages.filter(message => 
      message.content.toLowerCase().includes(query.toLowerCase())
    )

    // Search in contacts
    results.contacts = users.filter(user => 
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase()) ||
      user.phone.includes(query)
    )

    return results
  }

  // Backup and restore
  static exportData() {
    return {
      users: this.getUsers(),
      chats: this.getChats(),
      messages: this.getMessages(),
      stories: this.getStories(),
      calls: this.getCalls(),
      broadcasts: this.getBroadcasts(),
      blockedContacts: this.getBlockedContacts(),
      archivedChats: this.getArchivedChats(),
      exportDate: new Date().toISOString()
    }
  }

  static importData(data) {
    if (data.users) this.saveUsers(data.users)
    if (data.chats) this.saveChats(data.chats)
    if (data.messages) this.saveMessages(data.messages)
    if (data.stories) this.saveStories(data.stories)
    if (data.calls) this.saveCalls(data.calls)
    if (data.broadcasts) this.saveBroadcasts(data.broadcasts)
    if (data.blockedContacts) localStorage.setItem('whatsapp_blocked_contacts', JSON.stringify(data.blockedContacts))
    if (data.archivedChats) localStorage.setItem('whatsapp_archived_chats', JSON.stringify(data.archivedChats))
  }

  static clearAllData() {
    localStorage.removeItem('whatsapp_users')
    localStorage.removeItem('whatsapp_chats')
    localStorage.removeItem('whatsapp_messages')
    localStorage.removeItem('whatsapp_stories')
    localStorage.removeItem('whatsapp_calls')
    localStorage.removeItem('whatsapp_broadcasts')
    localStorage.removeItem('whatsapp_blocked_contacts')
    localStorage.removeItem('whatsapp_archived_chats')
  }
}
