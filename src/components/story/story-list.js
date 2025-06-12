import { DataService } from '../../services/data.js'
import { AuthService } from '../../services/auth.js'
import { StoryViewer } from './story-viewer.js'

export class StoryList {
  constructor(container, options) {
    this.container = container
    this.searchQuery = options.searchQuery || ''
  }

  render() {
    const stories = this.getFilteredStories()
    this.container.innerHTML = this.getHTML(stories)
    this.attachEventListeners()
  }

  getFilteredStories() {
    let stories = DataService.getStories()
    const currentUser = AuthService.getCurrentUser()
    
    // Filter out expired stories (24h)
    const now = new Date()
    stories = stories.filter(story => {
      const storyDate = new Date(story.createdAt)
      const timeDiff = now - storyDate
      return timeDiff < 24 * 60 * 60 * 1000 // 24 hours
    })
    
    // Group stories by user
    const groupedStories = this.groupStoriesByUser(stories)
    
    if (this.searchQuery && this.searchQuery !== '*') {
      const users = DataService.getUsers()
      return groupedStories.filter(group => {
        const user = users.find(u => u.id === group.userId)
        return user && (
          user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.phone.includes(this.searchQuery)
        )
      })
    }
    
    return groupedStories
  }

  groupStoriesByUser(stories) {
    const grouped = {}
    
    stories.forEach(story => {
      if (!grouped[story.userId]) {
        grouped[story.userId] = {
          userId: story.userId,
          stories: [],
          lastStoryTime: story.createdAt
        }
      }
      grouped[story.userId].stories.push(story)
      if (story.createdAt > grouped[story.userId].lastStoryTime) {
        grouped[story.userId].lastStoryTime = story.createdAt
      }
    })
    
    return Object.values(grouped).sort((a, b) => 
      new Date(b.lastStoryTime) - new Date(a.lastStoryTime)
    )
  }

  getHTML(storyGroups) {
    if (storyGroups.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <i class="fas fa-circle-notch text-4xl mb-4"></i>
          <p class="text-lg font-medium">Aucune story</p>
          <p class="text-sm">Les stories disparaissent après 24h</p>
          <button id="createStoryBtn" class="mt-4 bg-whatsapp-green text-white px-4 py-2 rounded-lg">
            <i class="fas fa-plus mr-2"></i> Créer une story
          </button>
        </div>
      `
    }

    const currentUser = AuthService.getCurrentUser()
    const hasMyStory = storyGroups.find(group => group.userId === currentUser.id)

    return `
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <!-- My Story -->
        <div class="p-4">
          <div class="story-item flex items-center space-x-3 cursor-pointer" data-user-id="${currentUser.id}">
            <div class="relative">
              <div class="story-ring w-14 h-14 rounded-full ${hasMyStory ? 'story-ring' : ''}">
                <div class="story-inner w-full h-full rounded-full overflow-hidden">
                  <div class="w-full h-full bg-whatsapp-green flex items-center justify-center">
                    ${currentUser.avatar 
                      ? `<img src="${currentUser.avatar}" alt="${currentUser.firstName}" class="w-full h-full object-cover">`
                      : `<span class="text-white font-semibold text-lg">${currentUser.firstName[0]}</span>`
                    }
                  </div>
                </div>
              </div>
              ${!hasMyStory ? '<div class="absolute bottom-0 right-0 w-5 h-5 bg-whatsapp-green border-2 border-white rounded-full flex items-center justify-center"><i class="fas fa-plus text-white text-xs"></i></div>' : ''}
            </div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                ${hasMyStory ? 'Ma story' : 'Ajouter une story'}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                ${hasMyStory ? this.formatTime(hasMyStory.lastStoryTime) : 'Partagez un moment'}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Other Stories -->
        ${storyGroups.filter(group => group.userId !== currentUser.id).map(group => this.getStoryGroupHTML(group)).join('')}
      </div>
      
      <!-- Story Creation Modal -->
      <div id="storyModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Créer une story</h3>
            <button id="closeStoryModalBtn" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="flex space-x-2">
              <button id="textStoryBtn" class="flex-1 bg-whatsapp-green text-white py-2 px-4 rounded-lg text-sm">
                <i class="fas fa-font mr-2"></i> Texte
              </button>
              <button id="imageStoryBtn" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm">
                <i class="fas fa-image mr-2"></i> Image
              </button>
            </div>
            
            <div id="storyContent">
              <!-- Story creation content -->
            </div>
          </div>
        </div>
      </div>
      
      <!-- Story Viewer Container -->
      <div id="storyViewer"></div>
    `
  }

  getStoryGroupHTML(group) {
    const users = DataService.getUsers()
    const user = users.find(u => u.id === group.userId)
    if (!user) return ''

    const currentUser = AuthService.getCurrentUser()
    const hasUnseenStories = group.stories.some(story => !story.viewedBy.includes(currentUser.id))
    const ringClass = hasUnseenStories ? 'story-ring' : 'opacity-50'

    return `
      <div class="p-4">
        <div class="story-item flex items-center space-x-3 cursor-pointer" data-user-id="${group.userId}">
          <div class="${ringClass} w-14 h-14 rounded-full">
            <div class="story-inner w-full h-full rounded-full overflow-hidden">
              ${user.avatar 
                ? `<img src="${user.avatar}" alt="${user.firstName}" class="w-full h-full object-cover">`
                : `<div class="w-full h-full bg-gray-300 flex items-center justify-center">
                     <span class="text-gray-600 font-semibold text-lg">${user.firstName[0]}</span>
                   </div>`
              }
            </div>
          </div>
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              ${user.firstName} ${user.lastName}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              ${this.formatTime(group.lastStoryTime)}
            </p>
          </div>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    const storyItems = this.container.querySelectorAll('.story-item')
    const createStoryBtn = document.getElementById('createStoryBtn')
    
    storyItems.forEach(item => {
      item.addEventListener('click', () => {
        const userId = item.dataset.userId
        const currentUser = AuthService.getCurrentUser()
        
        if (userId === currentUser.id) {
          this.showStoryCreation()
        } else {
          this.openStoryViewer(userId)
        }
      })
    })

    if (createStoryBtn) {
      createStoryBtn.addEventListener('click', () => {
        this.showStoryCreation()
      })
    }

    this.attachStoryModalListeners()
  }

  attachStoryModalListeners() {
    const storyModal = document.getElementById('storyModal')
    const closeStoryModalBtn = document.getElementById('closeStoryModalBtn')
    const textStoryBtn = document.getElementById('textStoryBtn')
    const imageStoryBtn = document.getElementById('imageStoryBtn')

    if (closeStoryModalBtn) {
      closeStoryModalBtn.addEventListener('click', () => {
        storyModal.classList.add('hidden')
      })
    }

    if (textStoryBtn) {
      textStoryBtn.addEventListener('click', () => {
        this.showTextStoryCreation()
      })
    }

    if (imageStoryBtn) {
      imageStoryBtn.addEventListener('click', () => {
        this.showImageStoryCreation()
      })
    }
  }

  showStoryCreation() {
    const modal = document.getElementById('storyModal')
    modal.classList.remove('hidden')
    this.showTextStoryCreation() // Default to text story
  }

  showTextStoryCreation() {
    const content = document.getElementById('storyContent')
    
    content.innerHTML = `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Votre message</label>
          <textarea 
            id="storyText" 
            class="w-full p-3 border rounded-lg resize-none" 
            placeholder="Que voulez-vous partager ?" 
            rows="4"
            maxlength="200"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">
            <span id="charCount">0</span>/200 caractères
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Couleur de fond</label>
          <div class="flex space-x-2">
            <button class="color-btn w-8 h-8 rounded-full bg-whatsapp-green border-2 border-transparent" data-color="#25d366"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-blue-500 border-2 border-transparent" data-color="#3b82f6"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-red-500 border-2 border-transparent" data-color="#ef4444"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-purple-500 border-2 border-transparent" data-color="#8b5cf6"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-pink-500 border-2 border-transparent" data-color="#ec4899"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-yellow-500 border-2 border-transparent" data-color="#eab308"></button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Confidentialité</label>
          <select id="storyPrivacy" class="w-full p-2 border rounded-lg">
            <option value="all">Tous mes contacts</option>
            <option value="close_friends">Amis proches</option>
            <option value="except">Tous sauf...</option>
          </select>
        </div>
        
        <button id="publishTextStoryBtn" class="w-full bg-whatsapp-green text-white py-2 px-4 rounded-lg">
          <i class="fas fa-share mr-2"></i> Publier la story
        </button>
      </div>
    `

    this.attachTextStoryListeners()
  }

  showImageStoryCreation() {
    const content = document.getElementById('storyContent')
    
    content.innerHTML = `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Sélectionner une image</label>
          <input type="file" id="storyImageInput" accept="image/*" class="w-full p-2 border rounded-lg">
        </div>
        
        <div id="imagePreview" class="hidden">
          <img id="previewImg" class="w-full h-48 object-cover rounded-lg">
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Légende (optionnel)</label>
          <textarea 
            id="storyCaption" 
            class="w-full p-3 border rounded-lg resize-none" 
            placeholder="Ajoutez une légende..." 
            rows="2"
            maxlength="100"
          ></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Confidentialité</label>
          <select id="imageStoryPrivacy" class="w-full p-2 border rounded-lg">
            <option value="all">Tous mes contacts</option>
            <option value="close_friends">Amis proches</option>
            <option value="except">Tous sauf...</option>
          </select>
        </div>
        
        <button id="publishImageStoryBtn" class="w-full bg-whatsapp-green text-white py-2 px-4 rounded-lg" disabled>
          <i class="fas fa-share mr-2"></i> Publier la story
        </button>
      </div>
    `

    this.attachImageStoryListeners()
  }

  attachTextStoryListeners() {
    const storyText = document.getElementById('storyText')
    const charCount = document.getElementById('charCount')
    const colorBtns = document.querySelectorAll('.color-btn')
    const publishBtn = document.getElementById('publishTextStoryBtn')
    
    let selectedColor = '#25d366'

    storyText.addEventListener('input', () => {
      const count = storyText.value.length
      charCount.textContent = count
      
      if (count > 180) {
        charCount.classList.add('text-red-500')
      } else {
        charCount.classList.remove('text-red-500')
      }
    })

    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('border-gray-800'))
        btn.classList.add('border-gray-800')
        selectedColor = btn.dataset.color
      })
    })

    publishBtn.addEventListener('click', () => {
      const text = storyText.value.trim()
      const privacy = document.getElementById('storyPrivacy').value
      
      if (text) {
        this.createTextStory(text, selectedColor, privacy)
      }
    })
  }

  attachImageStoryListeners() {
    const imageInput = document.getElementById('storyImageInput')
    const imagePreview = document.getElementById('imagePreview')
    const previewImg = document.getElementById('previewImg')
    const publishBtn = document.getElementById('publishImageStoryBtn')
    
    let selectedImage = null

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          selectedImage = e.target.result
          previewImg.src = selectedImage
          imagePreview.classList.remove('hidden')
          publishBtn.disabled = false
          publishBtn.classList.remove('opacity-50')
        }
        reader.readAsDataURL(file)
      }
    })

    publishBtn.addEventListener('click', () => {
      const caption = document.getElementById('storyCaption').value.trim()
      const privacy = document.getElementById('imageStoryPrivacy').value
      
      if (selectedImage) {
        this.createImageStory(selectedImage, caption, privacy)
      }
    })
  }

  createTextStory(text, backgroundColor, privacy) {
    const currentUser = AuthService.getCurrentUser()
    const newStory = {
      id: Date.now().toString(),
      userId: currentUser.id,
      type: 'text',
      content: text,
      backgroundColor: backgroundColor,
      caption: '',
      createdAt: new Date().toISOString(),
      viewedBy: [],
      privacy: privacy
    }

    const stories = DataService.getStories()
    stories.push(newStory)
    DataService.saveStories(stories)

    document.getElementById('storyModal').classList.add('hidden')
    this.render() // Refresh the list
  }

  createImageStory(imageData, caption, privacy) {
    const currentUser = AuthService.getCurrentUser()
    const newStory = {
      id: Date.now().toString(),
      userId: currentUser.id,
      type: 'image',
      content: imageData,
      caption: caption,
      createdAt: new Date().toISOString(),
      viewedBy: [],
      privacy: privacy
    }

    const stories = DataService.getStories()
    stories.push(newStory)
    DataService.saveStories(stories)

    document.getElementById('storyModal').classList.add('hidden')
    this.render() // Refresh the list
  }

  openStoryViewer(userId) {
    const stories = DataService.getStories()
    const userStories = stories.filter(story => story.userId === userId)
    
    if (userStories.length > 0) {
      const viewerContainer = document.getElementById('storyViewer')
      const viewer = new StoryViewer(viewerContainer, {
        onClose: () => {
          viewerContainer.innerHTML = ''
          this.render() // Refresh to update viewed status
        },
        onView: (storyId) => {
          this.markStoryAsViewed(storyId)
        },
        onReply: (storyId, message) => {
          this.replyToStory(storyId, message)
        }
      })
      
      viewer.loadStories(userStories, 0)
    }
  }

  markStoryAsViewed(storyId) {
    const stories = DataService.getStories()
    const storyIndex = stories.findIndex(s => s.id === storyId)
    const currentUser = AuthService.getCurrentUser()
    
    if (storyIndex !== -1 && !stories[storyIndex].viewedBy.includes(currentUser.id)) {
      stories[storyIndex].viewedBy.push(currentUser.id)
      DataService.saveStories(stories)
    }
  }

  replyToStory(storyId, message) {
    // Implementation to send reply to story owner
    console.log('Reply to story:', storyId, message)
  }

  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) {
      return 'à l\'instant'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} h`
    } else {
      return 'Hier'
    }
  }
}