export class Router {
  constructor() {
    this.routes = new Map()
    this.currentRoute = null
    this.init()
  }

  init() {
    window.addEventListener('popstate', () => {
      this.handleRoute()
    })
    this.handleRoute()
  }

  addRoute(path, handler) {
    this.routes.set(path, handler)
  }

  navigate(path) {
    window.history.pushState({}, '', path)
    this.handleRoute()
  }

  handleRoute() {
    const path = window.location.pathname
    const route = this.findRoute(path)
    
    if (route) {
      this.currentRoute = route.path
      route.handler(route.params)
    }
  }

  findRoute(path) {
    for (let [routePath, handler] of this.routes) {
      const params = this.matchRoute(routePath, path)
      if (params !== null) {
        return { path: routePath, handler, params }
      }
    }
    return null
  }

  matchRoute(routePath, path) {
    const routeParts = routePath.split('/')
    const pathParts = path.split('/')
    
    if (routeParts.length !== pathParts.length) {
      return null
    }
    
    const params = {}
    
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i]
      const pathPart = pathParts[i]
      
      if (routePart.startsWith(':')) {
        const paramName = routePart.substring(1)
        params[paramName] = pathPart
      } else if (routePart !== pathPart) {
        return null
      }
    }
    
    return params
  }
}