import { DataService } from '../../services/data.js'
import { AuthService } from '../../services/auth.js'

export class ContactList {
  constructor(container, options) {
    this.container = container
    this.searchQuery = options.searchQuery || ''
    this.selectionMode = options.selectionMode || false
    this.selectedContacts = options.selectedContacts || []
    this.callbacks = options.callbacks || {}
  }

  render() {
    const contacts = this.getFilteredContacts()
    this.container.innerHTML = this.getHTML(contacts)
    this.attachEventListeners()
  }

  getFilteredContacts() {
    let users = DataService.getUsers()
    const currentUser = AuthService.getCurrentUser()
    
    // Exclude current user
    users = users.filter(user => user.id !== currentUser.id)
    
    if (this.searchQuery) {
      if (this.searchQuery === '*') {
        // Alphabetical order
        users.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
      } else {
        // Filter by name and phone
        users = users.filter(user => 
          user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.phone.includes(this.searchQuery)
        )
      }
    } else {
      // Default alphabetical order
      users.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
    }
    
    return users
  }

  getHTML(contacts) {
    if (contacts.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <i class="fas fa-address-book text-4xl mb-4"></i>
          <p class="text-lg font-medium">Aucun contact</p>
          <p class="text-sm">Les contacts apparaîtront ici</p>
        </div>
      `
    }

    return `
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        ${contacts.map(contact => this.getContactItemHTML(contact)).join('')}
      </div>
    `
  }

  getContactItemHTML(contact) {
    const displayName = `${contact.firstName} ${contact.lastName}`
    const isSelected = this.selectedContacts.includes(contact.id)
    const lastSeen = this.formatLastSeen(contact.lastSeen)

    return `
      <div class="contact-item p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-whatsapp-light' : ''}" data-contact-id="${contact.id}">
        <div class="flex items-center space-x-3">
          ${this.selectionMode ? `
            <div class="flex-shrink-0">
              <input type="checkbox" class="contact-checkbox w-4 h-4 text-whatsapp-green border-gray-300 rounded focus:ring-whatsapp-green" ${isSelected ? 'checked' : ''}>
            </div>
          ` : ''}
          
          <div class="relative">
            <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              ${contact.avatar 
                ? `<img src="${contact.avatar}" alt="${displayName}" class="w-full h-full object-cover">`
                : `<span class="text-lg font-semibold text-gray-600">${contact.firstName[0]}</span>`
              }
            </div>
            ${contact.isOnline ? '<div class="online-indicator"></div>' : ''}
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">${displayName}</h3>
              ${!this.selectionMode ? `
                <div class="flex items-center space-x-1">
                  <button class="contact-action p-1 text-gray-400 hover:text-whatsapp-green" data-action="message" title="Message">
                    <i class="fas fa-comment"></i>
                  </button>
                  <button class="contact-action p-1 text-gray-400 hover:text-whatsapp-green" data-action="call" title="Appeler">
                    <i class="fas fa-phone"></i>
                  </button>
                  <button class="contact-action p-1 text-gray-400 hover:text-whatsapp-green" data-action="video" title="Appel vidéo">
                    <i class="fas fa-video"></i>
                  </button>
                </div>
              ` : ''}
            </div>
            <div class="mt-1">
              <p class="text-sm text-gray-600 dark:text-gray-400">${contact.phone}</p>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                ${contact.status} • ${contact.isOnline ? 'En ligne' : lastSeen}
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    const contactItems = this.container.querySelectorAll('.contact-item')
    contactItems.forEach(item => {
      if (this.selectionMode) {
        const checkbox = item.querySelector('.contact-checkbox')
        checkbox.addEventListener('change', (e) => {
          const contactId = item.dataset.contactId
          if (e.target.checked) {
            if (!this.selectedContacts.includes(contactId)) {
              this.selectedContacts.push(contactId)
            }
          } else {
            const index = this.selectedContacts.indexOf(contactId)
            if (index > -1) {
              this.selectedContacts.splice(index, 1)
            }
          }
          
          if (this.callbacks.onSelectionChange) {
            this.callbacks.onSelectionChange(this.selectedContacts)
          }
        })
        
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.contact-checkbox')) {
            checkbox.click()
          }
        })
      } else {
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.contact-action')) {
            const contactId = item.dataset.contactId
            this.openChatWithContact(contactId)
          }
        })
      }
    })

    if (!this.selectionMode) {
      const contactActions = this.container.querySelectorAll('.contact-action')
      contactActions.forEach(action => {
        action.addEventListener('click', (e) => {
          e.stopPropagation()
          const actionType = action.dataset.action
          const contactId = action.closest('.contact-item').dataset.contactId
          this.handleContactAction(contactId, actionType)
        })
      })
    }
  }

  openChatWithContact(contactId) {
    if (this.callbacks.onContactSelect) {
      this.callbacks.onContactSelect(contactId)
    }
  }

  handleContactAction(contactId, actionType) {
    switch (actionType) {
      case 'message':
        this.openChatWithContact(contactId)
        break
      case 'call':
        this.initiateCall(contactId, 'audio')
        break
      case 'video':
        this.initiateCall(contactId, 'video')
        break
    }
  }

  initiateCall(contactId, type) {
    // Implementation for call initiation
    console.log('Initiate call:', contactId, type)
  }

  formatLastSeen(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) {
      return 'vu à l\'instant'
    } else if (diff < 3600000) {
      return `vu il y a ${Math.floor(diff / 60000)} min`
    } else if (diff < 86400000) {
      return `vu il y a ${Math.floor(diff / 3600000)} h`
    } else {
      return `vu ${date.toLocaleDateString('fr-FR')}`
    }
  }

  getSelectedContacts() {
    return this.selectedContacts
  }

  clearSelection() {
    this.selectedContacts = []
    this.render()
  }
}