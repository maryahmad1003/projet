export class StoryViewer {
  constructor(container, callbacks) {
    this.container = container
    this.callbacks = callbacks
    this.currentStoryIndex = 0
    this.stories = []
    this.autoPlayTimer = null
    this.progressTimer = null
  }

  render() {
    this.container.innerHTML = this.getHTML()
    this.attachEventListeners()
  }

  getHTML() {
    return `
      <div class="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <!-- Story Container -->
        <div class="relative w-full max-w-md h-full bg-black">
          <!-- Header -->
          <div class="absolute top-0 left-0 right-0 z-10 p-4">
            <!-- Progress Bars -->
            <div class="flex space-x-1 mb-4">
              ${this.stories.map((_, index) => `
                <div class="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div class="progress-bar h-full bg-white transition-all duration-100" data-index="${index}"></div>
                </div>
              `).join('')}
            </div>
            
            <!-- User Info -->
            <div class="flex items-center justify-between text-white">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                  <img src="${this.getUserAvatar()}" alt="User" class="w-full h-full object-cover">
                </div>
                <div>
                  <p class="font-medium text-sm">${this.getUserName()}</p>
                  <p class="text-xs opacity-75">${this.getStoryTime()}</p>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button id="pauseBtn" class="p-2 hover:bg-gray-700 rounded-full">
                  <i class="fas fa-pause text-sm"></i>
                </button>
                <button id="muteBtn" class="p-2 hover:bg-gray-700 rounded-full">
                  <i class="fas fa-volume-up text-sm"></i>
                </button>
                <button id="closeStoryBtn" class="p-2 hover:bg-gray-700 rounded-full">
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Story Content -->
          <div id="storyContent" class="w-full h-full flex items-center justify-center">
            <!-- Story content will be rendered here -->
          </div>
          
          <!-- Navigation -->
          <div class="absolute inset-0 flex">
            <button id="prevStoryBtn" class="flex-1 z-10"></button>
            <button id="nextStoryBtn" class="flex-1 z-10"></button>
          </div>
          
          <!-- Reply Input -->
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <div class="flex items-center space-x-2">
              <input 
                type="text" 
                id="replyInput"
                placeholder="Répondre à cette story..."
                class="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full text-sm focus:outline-none"
              />
              <button id="sendReplyBtn" class="p-2 bg-whatsapp-green text-white rounded-full">
                <i class="fas fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    const closeBtn = document.getElementById('closeStoryBtn')
    const pauseBtn = document.getElementById('pauseBtn')
    const muteBtn = document.getElementById('muteBtn')
    const prevBtn = document.getElementById('prevStoryBtn')
    const nextBtn = document.getElementById('nextStoryBtn')
    const sendReplyBtn = document.getElementById('sendReplyBtn')
    const replyInput = document.getElementById('replyInput')

    closeBtn.addEventListener('click', () => {
      this.close()
    })

    pauseBtn.addEventListener('click', () => {
      this.togglePause()
    })

    muteBtn.addEventListener('click', () => {
      this.toggleMute()
    })

    prevBtn.addEventListener('click', () => {
      this.previousStory()
    })

    nextBtn.addEventListener('click', () => {
      this.nextStory()
    })

    sendReplyBtn.addEventListener('click', () => {
      this.sendReply()
    })

    replyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendReply()
      }
    })

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          this.previousStory()
          break
        case 'ArrowRight':
        case ' ':
          this.nextStory()
          break
        case 'Escape':
          this.close()
          break
      }
    })
  }

  loadStories(stories, startIndex = 0) {
    this.stories = stories
    this.currentStoryIndex = startIndex
    this.render()
    this.showCurrentStory()
    this.startAutoPlay()
  }

  showCurrentStory() {
    if (this.currentStoryIndex >= this.stories.length) {
      this.close()
      return
    }

    const story = this.stories[this.currentStoryIndex]
    const content = document.getElementById('storyContent')
    
    // Update progress bars
    this.updateProgressBars()
    
    // Render story content
    switch (story.type) {
      case 'image':
        content.innerHTML = `
          <img src="${story.content}" alt="Story" class="max-w-full max-h-full object-contain">
        `
        break
      case 'video':
        content.innerHTML = `
          <video src="${story.content}" class="max-w-full max-h-full object-contain" autoplay muted>
            Votre navigateur ne supporte pas la vidéo.
          </video>
        `
        break
      case 'text':
        content.innerHTML = `
          <div class="text-center p-8" style="background-color: ${story.backgroundColor || '#25d366'}">
            <p class="text-white text-xl font-medium">${story.content}</p>
          </div>
        `
        break
    }
    
    // Mark as viewed
    this.markAsViewed(story.id)
  }

  updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar')
    
    progressBars.forEach((bar, index) => {
      if (index < this.currentStoryIndex) {
        bar.style.width = '100%'
      } else if (index === this.currentStoryIndex) {
        bar.style.width = '0%'
        this.animateProgress(bar)
      } else {
        bar.style.width = '0%'
      }
    })
  }

  animateProgress(progressBar) {
    const duration = this.getStoryDuration()
    progressBar.style.transition = `width ${duration}ms linear`
    progressBar.style.width = '100%'
    
    this.progressTimer = setTimeout(() => {
      this.nextStory()
    }, duration)
  }

  getStoryDuration() {
    const story = this.stories[this.currentStoryIndex]
    switch (story.type) {
      case 'image':
      case 'text':
        return 5000 // 5 seconds
      case 'video':
        return 15000 // 15 seconds
      default:
        return 5000
    }
  }

  startAutoPlay() {
    this.showCurrentStory()
  }

  stopAutoPlay() {
    if (this.progressTimer) {
      clearTimeout(this.progressTimer)
      this.progressTimer = null
    }
  }

  togglePause() {
    const pauseBtn = document.getElementById('pauseBtn')
    const icon = pauseBtn.querySelector('i')
    
    if (this.progressTimer) {
      this.stopAutoPlay()
      icon.className = 'fas fa-play text-sm'
    } else {
      this.startAutoPlay()
      icon.className = 'fas fa-pause text-sm'
    }
  }

  toggleMute() {
    const muteBtn = document.getElementById('muteBtn')
    const icon = muteBtn.querySelector('i')
    const video = document.querySelector('video')
    
    if (video) {
      video.muted = !video.muted
      icon.className = video.muted ? 'fas fa-volume-mute text-sm' : 'fas fa-volume-up text-sm'
    }
  }

  previousStory() {
    this.stopAutoPlay()
    
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--
      this.showCurrentStory()
      this.startAutoPlay()
    } else {
      this.close()
    }
  }

  nextStory() {
    this.stopAutoPlay()
    
    if (this.currentStoryIndex < this.stories.length - 1) {
      this.currentStoryIndex++
      this.showCurrentStory()
      this.startAutoPlay()
    } else {
      this.close()
    }
  }

  sendReply() {
    const input = document.getElementById('replyInput')
    const message = input.value.trim()
    
    if (message) {
      const story = this.stories[this.currentStoryIndex]
      
      if (this.callbacks.onReply) {
        this.callbacks.onReply(story.id, message)
      }
      
      input.value = ''
      
      // Show confirmation
      const sendBtn = document.getElementById('sendReplyBtn')
      const originalIcon = sendBtn.innerHTML
      sendBtn.innerHTML = '<i class="fas fa-check text-sm"></i>'
      
      setTimeout(() => {
        sendBtn.innerHTML = originalIcon
      }, 1000)
    }
  }

  markAsViewed(storyId) {
    if (this.callbacks.onView) {
      this.callbacks.onView(storyId)
    }
  }

  getUserAvatar() {
    const story = this.stories[this.currentStoryIndex]
    // Implementation to get user avatar
    return 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
  }

  getUserName() {
    const story = this.stories[this.currentStoryIndex]
    // Implementation to get user name
    return 'Utilisateur'
  }

  getStoryTime() {
    const story = this.stories[this.currentStoryIndex]
    const date = new Date(story.createdAt)
    const now = new Date()
    const diff = now - date
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min`
    } else {
      return `${Math.floor(diff / 3600000)} h`
    }
  }

  close() {
    this.stopAutoPlay()
    
    if (this.callbacks.onClose) {
      this.callbacks.onClose()
    }
    
    this.container.innerHTML = ''
  }
}