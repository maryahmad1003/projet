export class MessageInput {
  constructor(container, callbacks) {
    this.container = container
    this.callbacks = callbacks
    this.isDraftMode = false
    this.replyToMessage = null
    this.draftContent = ''
    this.chatId = null
  }

  render() {
    this.container.innerHTML = this.getHTML()
    this.attachEventListeners()
    this.loadDraft()
  }

  setChatId(chatId) {
    this.chatId = chatId
  }

  getHTML() {
    return `
      <div class="p-4">
        ${this.replyToMessage ? this.getReplyPreviewHTML() : ''}
        <div class="flex items-end space-x-3">
          <!-- Attachment Button -->
          <button id="attachmentBtn" class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <i class="fas fa-paperclip"></i>
          </button>
          
          <!-- Message Input Area -->
          <div class="flex-1 relative">
            <div class="flex items-end bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div class="flex-1 max-h-32 overflow-y-auto">
                <textarea 
                  id="messageTextarea"
                  placeholder="Tapez votre message..."
                  class="w-full p-3 bg-transparent resize-none focus:outline-none dark:text-white"
                  rows="1"
                ></textarea>
              </div>
              <div class="flex items-center p-1">
                <button id="emojiBtn" class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                  <i class="far fa-smile"></i>
                </button>
              </div>
            </div>
            
            <!-- Typing Indicator -->
            <div id="typingIndicator" class="hidden absolute -top-8 left-0 text-xs text-gray-500">
              <span>Vous tapez...</span>
            </div>
          </div>
          
          <!-- Send/Voice Button -->
          <button id="sendBtn" class="p-3 bg-whatsapp-green text-white rounded-full hover:bg-whatsapp-dark transition-colors duration-200">
            <i class="fas fa-paper-plane"></i>
          </button>
          
          <button id="voiceBtn" class="hidden p-3 bg-whatsapp-green text-white rounded-full hover:bg-whatsapp-dark transition-colors duration-200">
            <i class="fas fa-microphone"></i>
          </button>
        </div>
        
        <!-- Draft Indicator -->
        <div id="draftIndicator" class="hidden mt-2 text-xs text-orange-500">
          <i class="fas fa-edit mr-1"></i>
          Brouillon sauvegardé
        </div>
      </div>
      
      <!-- Attachment Menu -->
      <div id="attachmentMenu" class="hidden absolute bottom-20 left-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50">
        <button class="attachment-option w-full flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" data-type="image">
          <div class="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
            <i class="fas fa-image text-white"></i>
          </div>
          <span class="text-sm">Photos et vidéos</span>
        </button>
        <button class="attachment-option w-full flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" data-type="document">
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-file text-white"></i>
          </div>
          <span class="text-sm">Document</span>
        </button>
        <button class="attachment-option w-full flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" data-type="contact">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white"></i>
          </div>
          <span class="text-sm">Contact</span>
        </button>
      </div>
      
      <!-- Emoji Picker -->
      <div id="emojiPicker" class="hidden absolute bottom-20 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 w-80 z-50">
        <div class="grid grid-cols-8 gap-2">
          ${this.getEmojiHTML()}
        </div>
      </div>
    `
  }

  getEmojiHTML() {
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
    
    return emojis.map(emoji => 
      `<button class="emoji-btn p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg">${emoji}</button>`
    ).join('')
  }

  getReplyPreviewHTML() {
    if (!this.replyToMessage) return ''
    
    return `
      <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-t-lg border-l-4 border-whatsapp-green">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-whatsapp-green">Réponse à ${this.replyToMessage.senderName}</p>
            <p class="text-sm text-gray-600 dark:text-gray-300">${this.replyToMessage.content}</p>
          </div>
          <button id="cancelReply" class="p-1 text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    const textarea = document.getElementById('messageTextarea')
    const sendBtn = document.getElementById('sendBtn')
    const voiceBtn = document.getElementById('voiceBtn')
    const attachmentBtn = document.getElementById('attachmentBtn')
    const emojiBtn = document.getElementById('emojiBtn')
    const attachmentMenu = document.getElementById('attachmentMenu')
    const emojiPicker = document.getElementById('emojiPicker')

    if (!textarea || !sendBtn) return

    // Auto-resize textarea
    textarea.addEventListener('input', () => {
      this.autoResize(textarea)
      this.handleTyping()
      this.saveDraft(textarea.value)
      this.toggleSendButton(textarea.value.trim().length > 0)
    })

    // Send message on Enter
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    // Send button
    sendBtn.addEventListener('click', () => {
      this.sendMessage()
    })

    // Voice button
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        this.startVoiceRecording()
      })
    }

    // Attachment menu
    if (attachmentBtn && attachmentMenu) {
      attachmentBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        attachmentMenu.classList.toggle('hidden')
        if (emojiPicker) emojiPicker.classList.add('hidden')
      })
    }

    // Emoji picker
    if (emojiBtn && emojiPicker) {
      emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        emojiPicker.classList.toggle('hidden')
        if (attachmentMenu) attachmentMenu.classList.add('hidden')
      })
    }

    // Attachment options
    const attachmentOptions = document.querySelectorAll('.attachment-option')
    attachmentOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.handleAttachment(option.dataset.type)
        if (attachmentMenu) attachmentMenu.classList.add('hidden')
      })
    })

    // Emoji selection
    const emojiButtons = document.querySelectorAll('.emoji-btn')
    emojiButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.insertEmoji(button.textContent)
        if (emojiPicker) emojiPicker.classList.add('hidden')
      })
    })

    // Cancel reply
    const cancelReply = document.getElementById('cancelReply')
    if (cancelReply) {
      cancelReply.addEventListener('click', () => {
        this.replyToMessage = null
        this.render()
      })
    }

    // Close menus on outside click
    document.addEventListener('click', (e) => {
      if (attachmentBtn && attachmentMenu && !attachmentBtn.contains(e.target) && !attachmentMenu.contains(e.target)) {
        attachmentMenu.classList.add('hidden')
      }
      if (emojiBtn && emojiPicker && !emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.classList.add('hidden')
      }
    })
  }

  autoResize(textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  handleTyping() {
    if (this.callbacks.onTyping) {
      this.callbacks.onTyping(true)
      
      clearTimeout(this.typingTimeout)
      this.typingTimeout = setTimeout(() => {
        this.callbacks.onTyping(false)
      }, 1000)
    }
  }

  toggleSendButton(hasContent) {
    const sendBtn = document.getElementById('sendBtn')
    const voiceBtn = document.getElementById('voiceBtn')
    
    if (hasContent) {
      if (sendBtn) sendBtn.classList.remove('hidden')
      if (voiceBtn) voiceBtn.classList.add('hidden')
    } else {
      if (sendBtn) sendBtn.classList.add('hidden')
      if (voiceBtn) voiceBtn.classList.remove('hidden')
    }
  }

  sendMessage() {
    const textarea = document.getElementById('messageTextarea')
    if (!textarea) return
    
    const content = textarea.value.trim()
    if (!content) return

    const messageData = {
      type: 'text',
      content: content,
      replyTo: this.replyToMessage?.id || null
    }

    if (this.callbacks.onSendMessage) {
      this.callbacks.onSendMessage(messageData)
    }
    
    textarea.value = ''
    this.autoResize(textarea)
    this.replyToMessage = null
    this.clearDraft()
    this.toggleSendButton(false)
    this.render()
  }

  insertEmoji(emoji) {
    const textarea = document.getElementById('messageTextarea')
    if (!textarea) return
    
    const cursorPos = textarea.selectionStart
    const textBefore = textarea.value.substring(0, cursorPos)
    const textAfter = textarea.value.substring(cursorPos)
    
    textarea.value = textBefore + emoji + textAfter
    textarea.focus()
    textarea.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length)
    
    this.autoResize(textarea)
    this.saveDraft(textarea.value)
    this.toggleSendButton(textarea.value.trim().length > 0)
  }

  handleAttachment(type) {
    switch (type) {
      case 'image':
        this.openImagePicker()
        break
      case 'document':
        this.openDocumentPicker()
        break
      case 'contact':
        this.openContactPicker()
        break
    }
  }

  openImagePicker() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.multiple = true
    input.onchange = (e) => {
      this.handleFileSelection(e.target.files, 'image')
    }
    input.click()
  }

  openDocumentPicker() {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e) => {
      this.handleFileSelection(e.target.files, 'document')
    }
    input.click()
  }

  openContactPicker() {
    console.log('Ouverture du sélecteur de contact')
  }

  handleFileSelection(files, type) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const messageData = {
          type: type,
          content: type === 'document' ? { 
            name: file.name, 
            size: this.formatFileSize(file.size), 
            url: e.target.result 
          } : e.target.result
        }
        if (this.callbacks.onSendMessage) {
          this.callbacks.onSendMessage(messageData)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  startVoiceRecording() {
    console.log('Démarrage de l\'enregistrement vocal')
  }

  saveDraft(content) {
    if (!this.chatId) return
    
    this.draftContent = content
    const draftIndicator = document.getElementById('draftIndicator')
    
    if (content.trim()) {
      if (draftIndicator) draftIndicator.classList.remove('hidden')
      localStorage.setItem(`draft_${this.chatId}`, content)
    } else {
      if (draftIndicator) draftIndicator.classList.add('hidden')
      localStorage.removeItem(`draft_${this.chatId}`)
    }
  }

  loadDraft() {
    if (!this.chatId) return
    
    const draft = localStorage.getItem(`draft_${this.chatId}`)
    if (draft) {
      const textarea = document.getElementById('messageTextarea')
      if (textarea) {
        textarea.value = draft
        this.draftContent = draft
        this.autoResize(textarea)
        this.toggleSendButton(draft.trim().length > 0)
      }
    }
  }

  clearDraft() {
    if (!this.chatId) return
    
    localStorage.removeItem(`draft_${this.chatId}`)
    const draftIndicator = document.getElementById('draftIndicator')
    if (draftIndicator) draftIndicator.classList.add('hidden')
  }

  setReplyToMessage(message) {
    this.replyToMessage = message
    this.render()
    const textarea = document.getElementById('messageTextarea')
    if (textarea) textarea.focus()
  }
}