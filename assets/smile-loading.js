class Loading {
  constructor() {
    this.loadingElement = null // Loading 组件的 DOM 元素
  }

  // 显示 Loading 组件
  show({
    message = 'Loading...',
    background = 'bg-black/50',
    spinnerColor = 'text-white'
  } = {}) {
    // 如果 Loading 已经存在，则不需要重新创建
    if (this.loadingElement) return

    // 创建 Loading 容器
    this.loadingElement = document.createElement('div')
    this.loadingElement.className = `fixed inset-0 flex flex-col items-center justify-center z-[9999999999] ${background} opacity-0 transition-opacity duration-300`

    // 创建旋转的 SVG 图标
    const spinner = document.createElement('div')
    spinner.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-12 w-12 ${spinnerColor}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `

    // 创建显示的消息
    const messageEl = document.createElement('p')
    messageEl.className = 'mt-4 text-lg font-medium text-white'
    messageEl.textContent = message

    // 将 SVG 图标和消息添加到 Loading 容器中
    this.loadingElement.appendChild(spinner)
    this.loadingElement.appendChild(messageEl)

    // 将 Loading 容器添加到 body
    document.body.appendChild(this.loadingElement)

    // 强制重绘以触发动画
    window.requestAnimationFrame(() => {
      this.loadingElement?.classList.remove('opacity-0')
    })
  }

  // 隐藏 Loading 组件
  hide() {
    if (this.loadingElement) {
      this.loadingElement.classList.add('opacity-0')

      // 在动画结束后移除 DOM 元素
      setTimeout(() => {
        if (this.loadingElement) {
          this.loadingElement.remove()
          this.loadingElement = null
        }
      }, 300) // 与动画持续时间一致
    }
  }
}

export default Loading
