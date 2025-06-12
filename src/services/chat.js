import { DataService } from './data.js'
import { AuthService } from './auth.js'

export class ChatService {
  static getChats() {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return []

    const chats = DataService.getChats()
    const archivedChats = DataService.getArchivedChats()
    
    return chats.filter(chat => 
      chat.participants.includes(currentUser.id) && 
      !archivedChats.includes(chat.id)
    ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
  }

  static getArchivedChats() {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return []

    const chats = DataService.getChats()
    const archivedChats = DataService.getArchivedChats()
    
    return chats.filter(chat => 
      chat.participants.includes(currentUser.id) && 
      archivedChats.includes(chat.id)
    ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
  }

  static getChatById(id) {
    return DataService.getChatById(id)
  }

  static findPrivateChat(userId1, userId2) {
    const chats = DataService.getChats()
    return chats.find(chat => 
      chat.type === 'private' && 
      chat.participants.includes(userId1) && 
      chat.participants.includes(userId2)
    )
  }

  static createChat(type, participants, name = null, description = '') {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return null

    const newChat = {
      id: Date.now().toString(),
      type, // 'private', 'group', 'broadcast'
      name: name || this.generateChatName(participants),
      description: description,
      participants,
      admins: type === 'group' ? [currentUser.id] : [],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      avatar: null,
      settings: {
        muteNotifications: false,
        disappearingMessages: false,
        onlyAdminsCanMessage: false,
        allowMemberEdit: true
      }
    }

    const chats = DataService.getChats()
    chats.push(newChat)
    DataService.saveChats(chats)

    return newChat
  }

  static createBroadcast(name, participants) {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return null

    const broadcast = {
      id: Date.now().toString(),
      name,
      participants,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      messageCount: 0
    }

    const broadcasts = DataService.getBroadcasts()
    broadcasts.push(broadcast)
    DataService.saveBroadcasts(broadcasts)

    return broadcast
  }

  static addMemberToGroup(chatId, userId) {
    const chats = DataService.getChats()
    const chatIndex = chats.findIndex(chat => chat.id === chatId)
    
    if (chatIndex !== -1 && chats[chatIndex].type === 'group') {
      if (!chats[chatIndex].participants.includes(userId)) {
        chats[chatIndex].participants.push(userId)
        DataService.saveChats(chats)
        
        // Add system message
        this.addSystemMessage(chatId, `${this.getUserName(userId)} a été ajouté au groupe`)
        return true
      }
    }
    return false
  }

  static removeMemberFromGroup(chatId, userId, removedBy) {
    const chats = DataService.getChats()
    const chatIndex = chats.findIndex(chat => chat.id === chatId)
    
    if (chatIndex !== -1 && chats[chatIndex].type === 'group') {
      const chat = chats[chatIndex]
      
      // Check if remover is admin
      if (!chat.admins.includes(removedBy)) {
        return { success: false, message: 'Seuls les administrateurs peuvent retirer des membres' }
      }
      
      // Cannot remove creator
      if (userId === chat.createdBy) {
        return { success: false, message: 'Impossible de retirer le créateur du groupe' }
      }
      
      const memberIndex = chat.participants.indexOf(userId)
      if (memberIndex > -1) {
        chat.participants.splice(memberIndex, 1)
        
        // Remove from admins if was admin
        const adminIndex = chat.admins.indexOf(userId)
        if (adminIndex > -1) {
          chat.admins.splice(adminIndex, 1)
        }
        
        DataService.saveChats(chats)
        
        // Add system message
        this.addSystemMessage(chatId, `${this.getUserName(userId)} a été retiré du groupe`)
        return { success: true }
      }
    }
    return { success: false, message: 'Membre non trouvé' }
  }

  static promoteToAdmin(chatId, userId, promotedBy) {
    const chats = DataService.getChats()
    const chatIndex = chats.findIndex(chat => chat.id === chatId)
    
    if (chatIndex !== -1 && chats[chatIndex].type === 'group') {
      const chat = chats[chatIndex]
      
      // Check if promoter is admin
      if (!chat.admins.includes(promotedBy)) {
        return { success: false, message: 'Seuls les administrateurs peuvent promouvoir des membres' }
      }
      
      if (chat.participants.includes(userId) && !chat.admins.includes(userId)) {
        chat.admins.push(userId)
        DataService.saveChats(chats)
        
        // Add system message
        this.addSystemMessage(chatId, `${this.getUserName(userId)} est maintenant administrateur`)
        return { success: true }
      }
    }
    return { success: false, message: 'Impossible de promouvoir ce membre' }
  }

  static demoteFromAdmin(chatId, userId, demotedBy) {
    const chats = DataService.getChats()
    const chatIndex = chats.findIndex(chat => chat.id === chatId)
    
    if (chatIndex !== -1 && chats[chatIndex].type === 'group') {
      const chat = chats[chatIndex]
      
      // Check if demoter is admin
      if (!chat.admins.includes(demotedBy)) {
        return { success: false, message: 'Seuls les administrateurs peuvent rétrograder des membres' }
      }
      
      // Cannot demote creator
      if (userId === chat.createdBy) {
        return { success: false, message: 'Impossible de rétrograder le créateur du groupe' }
      }
      
      const adminIndex = chat.admins.indexOf(userId)
      if (adminIndex > -1) {
        chat.admins.splice(adminIndex, 1)
        DataService.saveChats(chats)
        
        // Add system message
        this.addSystemMessage(chatId, `${this.getUserName(userId)} n'est plus administrateur`)
        return { success: true }
      }
    }
    return { success: false, message: 'Membre non trouvé dans les administrateurs' }
  }

  static updateGroupInfo(chatId, updates, updatedBy) {
    const chats = DataService.getChats()
    const chatIndex = chats.findIndex(chat => chat.id === chatId)
    
    if (chatIndex !== -1 && chats[chatIndex].type === 'group') {
      const chat = chats[chatIndex]
      
      // Check permissions
      if (!chat.admins.includes(updatedBy) && !chat.settings.allowMemberEdit) {
        return { success: false, message: 'Permissions insuffisantes' }
      }
      
      if (updates.name) {
        const oldName = chat.name
        chat.name = updates.name
        this.addSystemMessage(chatId, `Le nom du groupe a été changé de "${oldName}" à "${updates.name}"`)
      }
      
      if (updates.description !== undefined) {
        chat.description = updates.description
        this.addSystemMessage(chatId, 'La description du groupe a été mise à jour')
      }
      
      if (updates.avatar) {
        chat.avatar = updates.avatar
        this.addSystemMessage(chatId, 'La photo du groupe a été mise à jour')
      }
      
      DataService.saveChats(chats)
      return { success: true }
    }
    return { success: false, message: 'Groupe non trouvé' }
  }

  static sendMessage(chatId, messageData) {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return null

    const message = {
      id: Date.now().toString(),
      chatId,
      senderId: currentUser.id,
      type: messageData.type || 'text',
      content: messageData.content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      replyTo: messageData.replyTo || null,
      forwarded: messageData.forwarded || false,
      edited: false,
      editedAt: null,
      reactions: [],
      mentions: messageData.mentions || []
    }

    // Save message
    const messages = DataService.getMessages()
    messages.push(message)
    DataService.saveMessages(messages)

    // Update chat
    this.updateChatLastMessage(chatId, message)

    return message
  }

  static sendBroadcastMessage(broadcastId, messageData) {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return null

    const broadcasts = DataService.getBroadcasts()
    const broadcast = broadcasts.find(b => b.id === broadcastId)
    
    if (!broadcast || broadcast.createdBy !== currentUser.id) return null

    // Send message to each participant
    const sentMessages = []
    broadcast.participants.forEach(participantId => {
      const privateChat = this.findPrivateChat(currentUser.id, participantId)
      if (privateChat) {
        const message = this.sendMessage(privateChat.id, {
          ...messageData,
          forwarded: true
        })
        if (message) sentMessages.push(message)
      }
    })

    // Update broadcast message count
    broadcast.messageCount++
    DataService.saveBroadcasts(broadcasts)

    return sentMessages
  }

  static forwardMessage(messageId, targetChatIds) {
    const messages = DataService.getMessages()
    const originalMessage = messages.find(m => m.id === messageId)
    
    if (!originalMessage) return []

    const forwardedMessages = []
    targetChatIds.forEach(chatId => {
      const forwardedMessage = this.sendMessage(chatId, {
        type: originalMessage.type,
        content: originalMessage.content,
        forwarded: true
      })
      if (forwardedMessage) forwardedMessages.push(forwardedMessage)
    })

    return forwardedMessages
  }

  static deleteMessage(messageId, deleteForEveryone = false) {
    const messages = DataService.getMessages()
    const messageIndex = messages.findIndex(m => m.id === messageId)
    
    if (messageIndex !== -1) {
      if (deleteForEveryone) {
        messages[messageIndex].content = 'Ce message a été supprimé'
        messages[messageIndex].type = 'deleted'
      } else {
        messages.splice(messageIndex, 1)
      }
      DataService.saveMessages(messages)
      return true
    }
    return false
  }

  static updateChatLastMessage(chatId, message) {
    const chats = DataService.getChats()
    const chatIndex = chats.findIndex(chat => chat.id === chatId)
    
    if (chatIndex !== -1) {
      let lastMessageText = message.content
      if (message.type === 'image') lastMessageText = '📷 Image'
      else if (message.type === 'audio') lastMessageText = '🎵 Audio'
      else if (message.type === 'document') lastMessageText = '📄 Document'
      else if (message.type === 'deleted') lastMessageText = 'Ce message a été supprimé'
      
      chats[chatIndex].lastMessage = lastMessageText
      chats[chatIndex].lastMessageTime = message.timestamp
      DataService.saveChats(chats)
    }
  }

  static markAsRead(chatId) {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) return

    const messages = DataService.getMessages()
    messages.forEach(message => {
      if (message.chatId === chatId && message.senderId !== currentUser.id && message.status !== 'read') {
        message.status = 'read'
      }
    })
    DataService.saveMessages(messages)

    // Reset unread count
    const chats = DataService.getChats()
    const chatIndex = chats.findIndex(chat => chat.id === chatId)
    if (chatIndex !== -1) {
      chats[chatIndex].unreadCount = 0
      DataService.saveChats(chats)
    }
  }

  static addSystemMessage(chatId, content) {
    const message = {
      id: Date.now().toString(),
      chatId,
      senderId: 'system',
      type: 'system',
      content,
      timestamp: new Date().toISOString(),
      status: 'read',
      replyTo: null,
      forwarded: false,
      edited: false,
      editedAt: null,
      reactions: [],
      mentions: []
    }

    const messages = DataService.getMessages()
    messages.push(message)
    DataService.saveMessages(messages)

    return message
  }

  static getUserName(userId) {
    const user = DataService.getUserById(userId)
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'
  }

  static generateChatName(participants) {
    const users = DataService.getUsers()
    const currentUser = AuthService.getCurrentUser()
    
    const participantNames = participants
      .filter(id => id !== currentUser.id)
      .map(id => users.find(u => u.id === id))
      .filter(user => user)
      .map(user => `${user.firstName} ${user.lastName}`)
    
    return participantNames.join(', ') || 'Chat'
  }

  static searchMessages(query) {
    const messages = DataService.getMessages()
    return messages.filter(message => 
      message.content.toLowerCase().includes(query.toLowerCase())
    )
  }
}