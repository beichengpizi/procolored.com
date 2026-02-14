// tailwind-merge 在 Shopify 环境中可能不可用，使用简单的合并函数
function twMerge(...classes) {
  return classes.filter(Boolean).join(' ');
}

class Modal {
  constructor({ className = {} } = {}) {
    this.el = null // 模态框元素
    this.className = {
      content: twMerge(
        'bg-white rounded-lg max-w-lg w-full mx-4 shadow-lg transform overflow-hidden transition-transform duration-300 scale-90',
        className?.content // 合并传递的 content 样式
      ),
      header: twMerge(
        'flex justify-between px-6 py-4 items-center border-l-0 border-r-0 border-t-0 border-b border border-solid border-gray-200',
        className?.header // 合并传递的 header 样式
      ),
      body: twMerge(
        'text-gray-700 px-6 py-4',
        className?.body // 合并传递的 body 样式
      ),
      footer: twMerge(
        'px-6 py-4 border-l-0 border-r-0 border-b-0 border-t border border-solid border-gray-200',
        className?.footer // 合并传递的 footer 样式
      )
    }
  }

  // 创建并显示模态框
  showModal({ header = '', content = '', footer = '', onClose = null }) {
    // 如果模态框已存在，先移除
    this.closeModal()

    // 创建模态框容器
    this.el = document.createElement('div')
    this.el.className =
      'fixed inset-0 flex items-center justify-center bg-black/50 z-[9999999999] opacity-0 transition-opacity duration-300'

    // 添加背景点击关闭模态框事件
    this.el.addEventListener('click', (event) => {
      if (event.target === this.el) {
        this.closeModal()
        if (onClose) onClose()
      }
    })

    // 创建模态框内容容器
    const modalContent = document.createElement('div')
    modalContent.className = this.className.content

    // 创建模态框头部插槽
    const modalHeader = document.createElement('div')
    modalHeader.className = this.className.header
    modalHeader.innerHTML = header

    // 创建模态框内容插槽
    const modalBody = document.createElement('div')
    modalBody.className = this.className.body
    modalBody.innerHTML = content

    // 创建模态框底部插槽
    const modalFooter = document.createElement('div')
    modalFooter.className = this.className.footer
    modalFooter.innerHTML = footer

    // 将头部、内容、页尾添加到模态框
    header && modalContent.appendChild(modalHeader)
    content && modalContent.appendChild(modalBody)
    footer && modalContent.appendChild(modalFooter)
    this.el.appendChild(modalContent)

    // 收集所有关闭按钮（支持多个关闭按钮）
    const closeButtons = this.el.querySelectorAll(
      '[id^="close-"], [class^="close-"]'
    )

    // 绑定关闭事件到所有关闭按钮
    closeButtons?.forEach((button) => {
      button.addEventListener('click', () => {
        this.closeModal()
        if (onClose) onClose()
      })
    })

    // 将模态框添加到body
    document.body.appendChild(this.el)

    // 强制重绘以触发动画
    window.requestAnimationFrame(() => {
      this.el.classList.remove('opacity-0')
      modalContent.classList.remove('scale-90')
    })

    return this
  }

  // 关闭模态框
  closeModal() {
    if (this.el) {
      // 添加淡出和缩小动画效果
      this.el.classList.add('opacity-0')
      const modalContent = this.el.querySelector('div')
      if (modalContent) {
        modalContent.classList.add('scale-90')
      }

      // 在动画结束后移除模态框
      setTimeout(() => {
        if (this.el) {
          this.el.remove()
          this.el = null
        }
      }, 300) // 与动画持续时间一致
    }
  }
}

export default Modal
