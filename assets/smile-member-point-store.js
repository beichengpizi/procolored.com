import { initializeSmileApi } from './smile-member-api.js'
import { Modal, Loading } from './smile-components-index.js'

import {
  encryptPartial,
  copyToClipboardFallback,
  fetchDataAndUpdate,
  deepMergeArrays
} from './smile-utils.js'

// 检测是否在编辑模式
const isDesignMode = window.Shopify.designMode || false

// 用户兑换产品 - Member Points Store
class MemberPointsStore extends window.HTMLElement {
  constructor() {
    super()

    // 初始化组件
    this.loading = new Loading()
    this.initializeComponent()
    this.bindEvents()
  }

  // 初始化组件并获取数据
  async initializeComponent() {
    // 初始化 Smile API，并获取用户信息
    const { config, api } = await initializeSmileApi()
    this.sort = this.getSortConfig()
    this.MemberApi = api
    this.config = config

    // 加载并显示产品列表
    await this.update()
  }

  // 方法：绑定事件处理程序到组件
  bindEvents() {
    // 给整个组件绑定一个点击事件监听器
    this.addEventListener('click', (event) => {
      const target = event.target // 提取事件目标元素

      // 检查点击的元素是否包含 data-item-id 属性
      const itemId = target.dataset.itemId
      if (itemId) {
        // 处理产品点击事件，将 itemId 解析为数字并传递给 handleProductClick 方法
        this.handleProductClick(Number(itemId))
      }
    })
  }

  // 获取新值和排序
  getSortConfig() {
    const PointsSortJSON =
      document.querySelector('#Points-sort-JSON')?.textContent

    try {
      return PointsSortJSON ? JSON.parse(PointsSortJSON) : []
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      return []
    }
  }

  // 处理点击产品的事件
  handleProductClick(productId) {
    this.modal = new Modal({
      className: {
        content: 'max-w-2xl',
        body: 'p-0 px-4 space-y-4'
      }
    })
    const {
      id,
      can_afford: canAfford,
      need_more_points_text: needMorPointsText,
      points_product: pointsProduct
    } = this.getProductById(productId)

    const {
      reward: {
        customized_image_url: customizedImageUrl,
        image_url: imageUrl,
        description
      }
    } = pointsProduct

    this.modal.showModal({
      header: `
        <h2 class="text-xl font-bold m-0">Details</h2>
        <button id="close-header" class="w-8 h-8 flex items-center justify-center text-lg rounded-full bg-gray-600 text-white hover:bg-gray-900 hover:text-gray-50">&times;</button>
      `,
      content: `<div class="flex flex-col sm:flex-row items-center pt-4">
                  <!-- Gift Card Image -->
                  <div class="flex-shrink-0 aspect-square w-48 h-48">
                    <img class="lazyload object-cover w-full h-full" src="${customizedImageUrl || imageUrl}" alt="${pointsProduct.reward.name}">
                  </div>
                  
                  <!-- Gift Card Details -->
                  <div class="flex-1 mt-4 sm:mt-0 sm:ml-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-1">${pointsProduct.reward.name}</h2>
                    <div class="flex items-center text-accent">
                      <svg viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-3.5 h-3.5">
                        <g stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd">
                          <g transform="translate(-848, -390)">
                            <g transform="translate(696, 259)">
                              <g transform="translate(151.9999, 95)">
                                <g transform="translate(0, 5)">
                                  <g transform="translate(0, 31)">
                                    <path d="M9.565,3.80458333 C9.565,4.575 7.69,5.43416667 5,5.43416667 C2.309,5.43416667 0.435,4.575 0.435,3.80458333 L0.435,2.805 C1.2145,3.50041667 2.9645,3.985 5,3.985 C7.0345,3.985 8.785,3.50041667 9.565,2.805 L9.565,3.80458333 Z M9.565,5.61583333 C9.565,6.38625 7.69,7.24583333 5,7.24583333 C2.309,7.24583333 0.435,6.38625 0.435,5.61583333 L0.435,4.61666667 C1.2145,5.31125 2.9645,5.79625 5,5.79625 C7.0345,5.79625 8.785,5.31125 9.565,4.61625 L9.565,5.61583333 Z M9.565,7.06416667 L9.565,7.4275 C9.565,8.19791667 7.69,9.0575 5,9.0575 C2.309,9.0575 0.435,8.19791667 0.435,7.4275 L0.435,6.42666667 C1.2145,7.12291667 2.9645,7.60833333 5,7.60833333 C7.0345,7.60833333 8.785,7.12333333 9.565,6.42666667 L9.565,7.06416667 Z M5,0.362083333 C7.69,0.362083333 9.565,1.22125 9.565,1.99291667 C9.565,2.76333333 7.69,3.62291667 5,3.62291667 C2.309,3.62291667 0.435,2.76375 0.435,1.99291667 C0.435,1.22125 2.3085,0.362083333 5,0.362083333 L5,0.362083333 Z M5,0 C2.239,0 0,0.892083333 0,1.99333333 L0,7.42791667 C0,8.52958333 2.239,9.42041667 5,9.42041667 C7.7615,9.42041667 10,8.52875 10,7.42791667 L10,1.99291667 C10,0.892083333 7.7615,0 5,0 L5,0 Z"></path>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                      <span class="text-base ml-2">${pointsProduct.default_sort_order}</span>
                    </div>
                    
                    ${
                      description
                        ? `<div class="mt-6">
                            <h3 class="text-base font-semibold text-gray-700 mb-1">Description</h3>
                            <p class="text-gray-500 text-sm">${description}</p>
                          </div>`
                        : ''
                    }
                    
                  </div>
                </div>
                ${canAfford ? `` : `<div class="bg-red-50 text-red-600 text-center py-2">${needMorPointsText}.</div>`}
            `,
      footer: `<div class="flex justify-end items-center gap-4">
                <button class="inline-flex items-center text-xs md:text-sm md:font-bold bg-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-400 text-white rounded-full py-2 px-8 hover:shadow-sm" ${canAfford ? '' : 'disabled'} data-redeem-id="${id}">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>  
                  Redeem Now
                </button>
               </div>`
      // onClose: () => {
      //   console.log('Modal closed')
      // }
    })

    // 弹出模态框绑定事件
    this.modal.el.addEventListener('click', async (event) => {
      const target = event.target // 提取事件目标元素
      const redeemId = target.dataset.redeemId

      const successModal = new Modal({
        className: {
          body: 'space-y-4'
        }
      })

      if (redeemId) {
        const btn = this.modal.el.querySelector(
          `[data-redeem-id="${redeemId}"]`
        )
        const loading = btn.querySelector('svg')

        try {
          loading.classList.remove('hidden')

          const { points_purchase: pointsPurchase } =
            await this.MemberApi.purchase(Number(redeemId), {})

          if (pointsPurchase.fulfilled_reward.id) {
            this.modal.closeModal()

            successModal.showModal({
              header: `<h2 class="text-xl font-bold m-0">Redeem Successfully</h2>
                       <button id="close-header" class="w-8 h-8 flex items-center justify-center text-lg rounded-full bg-gray-600 text-white hover:bg-gray-900 hover:text-gray-50">&times;</button>`,
              content: `<div class="flex flex-col items-center pt-4">
                          <div class="flex-shrink-0 aspect-square w-48 h-48">
                            <img src="${pointsPurchase.fulfilled_reward.image_url}" alt="${pointsPurchase.fulfilled_reward.name}" class="lazyload w-full h-full object-cover">
                          </div>
                          <div>
                            <h3 class="text-lg font-semibold text-center m-0">${pointsPurchase.fulfilled_reward.name}</h3>
                            <div class="flex items-center justify-center text-accent">
                              <svg viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-3.5 h-3.5">
                                <g stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd">
                                  <g transform="translate(-848, -390)">
                                    <g transform="translate(696, 259)">
                                      <g transform="translate(151.9999, 95)">
                                        <g transform="translate(0, 5)">
                                          <g transform="translate(0, 31)">
                                            <path d="M9.565,3.80458333 C9.565,4.575 7.69,5.43416667 5,5.43416667 C2.309,5.43416667 0.435,4.575 0.435,3.80458333 L0.435,2.805 C1.2145,3.50041667 2.9645,3.985 5,3.985 C7.0345,3.985 8.785,3.50041667 9.565,2.805 L9.565,3.80458333 Z M9.565,5.61583333 C9.565,6.38625 7.69,7.24583333 5,7.24583333 C2.309,7.24583333 0.435,6.38625 0.435,5.61583333 L0.435,4.61666667 C1.2145,5.31125 2.9645,5.79625 5,5.79625 C7.0345,5.79625 8.785,5.31125 9.565,4.61625 L9.565,5.61583333 Z M9.565,7.06416667 L9.565,7.4275 C9.565,8.19791667 7.69,9.0575 5,9.0575 C2.309,9.0575 0.435,8.19791667 0.435,7.4275 L0.435,6.42666667 C1.2145,7.12291667 2.9645,7.60833333 5,7.60833333 C7.0345,7.60833333 8.785,7.12333333 9.565,6.42666667 L9.565,7.06416667 Z M5,0.362083333 C7.69,0.362083333 9.565,1.22125 9.565,1.99291667 C9.565,2.76333333 7.69,3.62291667 5,3.62291667 C2.309,3.62291667 0.435,2.76375 0.435,1.99291667 C0.435,1.22125 2.3085,0.362083333 5,0.362083333 L5,0.362083333 Z M5,0 C2.239,0 0,0.892083333 0,1.99333333 L0,7.42791667 C0,8.52958333 2.239,9.42041667 5,9.42041667 C7.7615,9.42041667 10,8.52875 10,7.42791667 L10,1.99291667 C10,0.892083333 7.7615,0 5,0 L5,0 Z"></path>
                                          </g>
                                        </g>
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </svg>
                              <span class="text-base ml-2">${pointsPurchase.fulfilled_reward.reason_text}</span>
                            </div>
                            <p class="text-gray-500 mt-6">${pointsPurchase.fulfilled_reward.usage_instructions}</p>
                          </div>

                          <div class="space-y-4 w-full max-w-sm">
                            <div class="flex items-center bg-gray-100 border border-gray-200 rounded-md p-2">
                              <span class="flex-1 text-lg font-medium text-gray-400" data-code>${encryptPartial(pointsPurchase.fulfilled_reward.code)}</span>
                              <button class="ml-2 flex items-center text-gray-400 hover:text-gray-600" data-clip>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                </svg>
                              </button>
                            </div>
                              ${
                                pointsPurchase.fulfilled_reward.reward_token !==
                                'shopify_gift_card'
                                  ? `<button class="flex items-center justify-center w-full text-xs md:text-sm md:font-bold bg-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-400 text-white rounded-full py-2 px-8 hover:shadow-sm" data-apply>
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hidden">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                      </svg>
                                      <span>Apply code</span>
                                    </button>`
                                  : ''
                              }
                          </div>
                        </div>`,
              onClose: async () => await this.update()
            })

            const codeMessage = successModal.el?.querySelector('[data-code]')
            const clip = successModal.el?.querySelector('[data-clip]')
            const btnApply = successModal.el?.querySelector('[data-apply]')
            const check = btnApply?.querySelector('svg')
            const text = btnApply?.querySelector('span')

            clip.addEventListener('click', (event) => {
              copyToClipboardFallback(pointsPurchase.fulfilled_reward.code)
              codeMessage.innerHTML = 'Copy successfully!'

              setTimeout(() => {
                codeMessage.innerHTML = encryptPartial(
                  pointsPurchase.fulfilled_reward.code
                )
              }, 1000)
            })

            btnApply?.addEventListener('click', async () => {
              const state = await fetchDataAndUpdate(
                `/discount/${pointsPurchase.fulfilled_reward.code}`
              )

              if (state) {
                check.setAttribute('disabled', true)
                check.classList.remove('hidden')
                text.classList.add('hidden')
              }
            })
          }
        } catch (error) {
          console.error('Failed to load points products:', error)
        } finally {
          loading.classList.add('hidden')
        }
      }
    })

    // 如果用户积分不足，显示提示信息
    // if (!canAfford) {
    //   alert(needMorPointsText)
    // }
  }

  // 根据产品 ID 获取产品信息
  getProductById(productId) {
    return this.pointsProducts.find((product) => productId === product.id)
  }

  // 加载并初始化产品列表
  async update() {
    // this.toggleLoading(true) // 显示加载动画
    this.loading.show({
      message: 'Please wait...',
      spinnerColor: 'text-accent' // 蓝色旋转图标
    })

    try {
      // 获取用户的积分兑换产品列表
      const { customer_points_products: pointsProducts } =
        await this.MemberApi.getAllPointsProducts()
      const { customer } = await this.MemberApi.getCustomesInfo()
      this.customer = customer

      this.pointsProducts = deepMergeArrays(pointsProducts, this.sort)

      const orderMap = new Map(this.sort.map(({ id }, index) => [id, index]))

      this.pointsProducts.sort((a, b) => {
        const indexA = orderMap.has(a.id)
          ? orderMap.get(a.id)
          : Number.MAX_SAFE_INTEGER
        const indexB = orderMap.has(b.id)
          ? orderMap.get(b.id)
          : Number.MAX_SAFE_INTEGER
        return indexA - indexB
      })

      // 渲染产品列表
      this.renderProductList(this.pointsProducts)
    } catch (error) {
      console.error('Failed to load points products:', error)
    } finally {
      this.loading.hide()
    }
  }

  // 渲染产品列表
  renderProductList(products) {
    // 如果没有产品可显示，返回空内容
    if (!products || products.length === 0) {
      this.innerHTML = '<div>No products available for redemption.</div>'
      return
    }

    // 生成产品列表的 HTML
    const productHtml = products
      .filter((res) => res.points_product.id !== undefined)
      .map(
        (product) => `
        <div class="p-4 rounded-lg border border-solid border-gray-100 h-full hover:shadow-md transition-all">
          <div class="flex items-center text-accent">
            <svg viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-3.5 h-3.5">
              <g stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd">
                <g transform="translate(-848, -390)">
                  <g transform="translate(696, 259)">
                    <g transform="translate(151.9999, 95)">
                      <g transform="translate(0, 5)">
                        <g transform="translate(0, 31)">
                          <path d="M9.565,3.80458333 C9.565,4.575 7.69,5.43416667 5,5.43416667 C2.309,5.43416667 0.435,4.575 0.435,3.80458333 L0.435,2.805 C1.2145,3.50041667 2.9645,3.985 5,3.985 C7.0345,3.985 8.785,3.50041667 9.565,2.805 L9.565,3.80458333 Z M9.565,5.61583333 C9.565,6.38625 7.69,7.24583333 5,7.24583333 C2.309,7.24583333 0.435,6.38625 0.435,5.61583333 L0.435,4.61666667 C1.2145,5.31125 2.9645,5.79625 5,5.79625 C7.0345,5.79625 8.785,5.31125 9.565,4.61625 L9.565,5.61583333 Z M9.565,7.06416667 L9.565,7.4275 C9.565,8.19791667 7.69,9.0575 5,9.0575 C2.309,9.0575 0.435,8.19791667 0.435,7.4275 L0.435,6.42666667 C1.2145,7.12291667 2.9645,7.60833333 5,7.60833333 C7.0345,7.60833333 8.785,7.12333333 9.565,6.42666667 L9.565,7.06416667 Z M5,0.362083333 C7.69,0.362083333 9.565,1.22125 9.565,1.99291667 C9.565,2.76333333 7.69,3.62291667 5,3.62291667 C2.309,3.62291667 0.435,2.76375 0.435,1.99291667 C0.435,1.22125 2.3085,0.362083333 5,0.362083333 L5,0.362083333 Z M5,0 C2.239,0 0,0.892083333 0,1.99333333 L0,7.42791667 C0,8.52958333 2.239,9.42041667 5,9.42041667 C7.7615,9.42041667 10,8.52875 10,7.42791667 L10,1.99291667 C10,0.892083333 7.7615,0 5,0 L5,0 Z"></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
            <span class="text-base ml-2">${product.points_product.exchange_description}</span>
          </div>
          ${isDesignMode ? `<div class="flex flex-col text-sm mt-2"><span class="text-red-500 text-xs">编辑的时候显示</span><div>ID: ${product.points_product.id}</div></div>` : ``}
          <div class="aspect-square bg-gray-100 overflow-hidden flex justify-center items-center">
            <img
              class="lazyload object-cover object-center w-full h-full"
              width="360"
              height="360"
              data-src="${product.points_product.reward.image_url}"
            >
          </div>

          <h4 class="font-normal text-sm md:text-base m-0 min-h-12 line-clamp-2">${product.points_product.reward.name}</h4>

          <button class="flex items-center justify-center text-xs md:text-sm md:font-bold bg-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-400 text-white rounded-full py-2 px-8 w-full mt-6 hover:shadow-sm" data-item-id="${product.id}">
            <span class="pointer-events-none">Learn More</span>
          </button>
        </div>`
      )
      .join('')

    // 将产品列表的 HTML 设置为组件的内部 HTML ${product.can_afford ? 'Learn More' : 'Insufficient points'}
    this.innerHTML = productHtml
  }
}

// 注册自定义元素
window.customElements.define('member-point-store', MemberPointsStore)
