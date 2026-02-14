import { initializeSmileApi } from './smile-member-api.js'

import { Loading } from './smile-components-index.js'

import { encryptPartial, escapeHTML } from './smile-utils.js'

// 用户兑换产品 - Member Points Store
class MemberCoupon extends window.HTMLElement {
  constructor() {
    super()
    // 初始化组件
    this.loading = new Loading()
    this.api = 'https://booster.procolored.com' // 正式
    // this.api = "https://test.procolored.com" //测试
    this.lotteryRecordsApi = '/procolored/shopify/getPersonalAsset'
    this.userInfo =
      JSON.parse(window.localStorage.getItem('smile_shopify_data')) || {}
  }

  connectedCallback() {
    if (!window.Shopify.designMode) {
      this._init()
    }

    // 编辑状态手动加载数据
    // this?.loadBtn.addEventListener('click', () => this._init())
  }

  // 初始化组件并获取数据
  async _init() {
    this.loading.show({
      message: 'Please wait...',
      spinnerColor: 'text-accent' // 蓝色旋转图标
    })

    // 初始化 Smile API，并获取用户信息
    const { config, api } = await initializeSmileApi()

    this.MemberApi = api
    this.config = config
    console.log('[_init] this.config:', this.config)
    console.log('[_init] this.MemberApi:', this.MemberApi)
    console.log('初始化结束')
    console.log('开始执行更新this.update()')
    // 加载并显示产品列表
    await this.update()
  }

  // 根据产品 ID 获取产品信息
  getProductById(productId) {
    return this.pointsProducts.find((product) => productId === product.id)
  }

  // 处理UTC时间为本地时间，兼容iOS，并格式化为"2025/8/14 14:50:50"
  parseUTCToLocal(utcString) {
    if (!utcString) return ''
    // 替换T和Z，兼容iOS
    const iosCompatible = utcString
      .replace(/-/g, '/')
      .replace('T', ' ')
      .replace('Z', '')
    // 直接用Date解析
    let date = new Date(iosCompatible + ' UTC')
    if (isNaN(date.getTime())) {
      // fallback: 直接用原始字符串
      date = new Date(utcString)
    }
    return date
  }

  // 格式化时间为"2025/8/14 14:50:50"
  // 补零函数
  padZero(num) {
    return num < 10 ? '0' + num : num
  }

  formatDateToCustomString(date) {
    if (!date || isNaN(date.getTime())) return ''
    const y = date.getFullYear()
    const m = this.padZero(date.getMonth() + 1)
    const d = this.padZero(date.getDate())
    const hh = this.padZero(date.getHours())
    const mm = this.padZero(date.getMinutes())
    const ss = this.padZero(date.getSeconds())
    // 补零输出
    return `${y}/${m}/${d} ${hh}:${mm}:${ss}`
  }

  // 转盘 查询个人用户中奖记录
  // 改为异步函数，并返回slideHtml
  async getUserLotteryRecords(id, email, origin) {
    console.log('用户ID:', id)
    console.log('用户邮箱:', email)
    try {
      const response = await fetch(
        `${this.api}${this.lotteryRecordsApi}?customerEmail=${email}&customerId=${id}&origin=${origin}`,
        {
          method: 'GET',
          headers: window.ShopifyData.headers
        }
      )
      if (!response.ok) {
        throw new Error('网络请求失败')
      }
      const data = await response.json()
      console.log('查询个人抽奖记录(coupon):', data)
      if (data.code === 200) {
        const result = data.result
        if (Array.isArray(result) && result.length > 0) {
          // 生成所有slideHtml的数组
          // 将 slideHtmlArr 数组拼接成一个字符串返回
          const slideHtmlArr = result.map((item, idx) => {
            if (item.prizeType !== 3) {
              // 变量赋值
              const prizeTitle = item.prizeTitle || ''
              const prizeContent = item.prizeContent || ''
              // const prizeType = item.prizeType || "";
              const discountTitle = item.discountTitle || ''
              const prizeUsageScope = item.prizeUsageScope || ''
              // const expireAtUTC = null || "";  // 测试奖品时间永久有效
              // const expireAtUTC = '2025-08-07T10:28:16Z' || "";  // 测试奖品过期时间
              const expireAtUTC = item.expireAt || ''
              let expireAtDate = ''
              let expireAt = ''
              let isExpired = false
              if (expireAtUTC !== '') {
                expireAtDate = this.parseUTCToLocal(expireAtUTC)
                expireAt = expireAtDate
                  ? this.formatDateToCustomString(expireAtDate)
                  : ''

                // 获取当前时间
                const now = new Date()
                // 判断是否已过期
                isExpired = expireAtDate && now > expireAtDate

                console.log('UTC折扣券失效时间expireAtUTC :', expireAtUTC)
                console.log('本地折扣券失效时间expireAt:', expireAt)
                console.log('当前时间:', this.formatDateToCustomString(now))
                console.log('是否已过期:', isExpired)
              }

              // usageStatus的值，若isExpired为false时为item.usageStatus，若为true时为"Expired"，默认值为"Used"
              const usageStatus = isExpired
                ? 'Expired'
                : item.usageStatus || 'Used'
              const commonClasses = 'text-sm m-0'
              const accentClasses =
                usageStatus !== 'unused' ? 'm-0' : 'text-accent m-0'
              const idUsedContainer =
                usageStatus !== 'unused'
                  ? 'bg-gray-50 border-t-gray-400'
                  : 'border-t-accent bg-yellow-50 lg:hover:shadow-lg lg:hover:scale-105 transition-all'

              // 生成DOM结构
              const slideHtml = `
            
              <div class="isolate border border-solid border-gray-50 border-t-8 rounded-lg p-4 ${idUsedContainer}">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <h2 class="text-xl font-bold ${accentClasses} ">${discountTitle}</h2>
                    <p class="${accentClasses}">${prizeTitle}</p>
                  </div>
                  <copy-button>
                    <button class="bg-accent text-white py-1 px-3 shadow-sm rounded-full hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-400 focus:outline-none transition-all" ${
                      usageStatus !== 'unused' ? `disabled` : ``
                    } data-copy="${prizeContent}">
                    ${usageStatus !== 'unused' ? usageStatus : 'Copy'}
                    </button>
                  </copy-button>
                </div>
                
                <div class="mb-4">
                  <p class="${commonClasses} text-gray-700 font-semibold">
                    CODE: <span class="text-black uppercase">${
                      usageStatus !== 'unused'
                        ? encryptPartial(prizeContent)
                        : prizeContent
                    }</span>
                  </p>
                </div>
                
                <hr class="border-gray-200 mb-4">
                
                <div class="text-gray-600">
                ${prizeUsageScope !== '' ? `<p class="${commonClasses}">${prizeUsageScope}</p>` : ''}
                ${expireAt !== '' ? `<p class="${commonClasses}">EXP: ${expireAt}</p>` : `<p class="${commonClasses}">Valid for a long time</p>`}
                </div>
              </div>
            `
              return slideHtml
            }
          })
          const slideHtmlStr = slideHtmlArr.join('')
          // console.log("slideHtmlStr==", slideHtmlStr);
          return slideHtmlStr
        } else {
          console.warn('result 不是数组')
          return ''
        }
      } else {
        console.error('查询抽奖记录失败:', data.msg)
        return ''
      }
    } catch (error) {
      console.error('查询抽奖记录失败:', error)
      return ''
    }
  }

  // 加载并初始化产品列表
  async update() {
    try {
      // 获取用户的积分兑换产品列表
      const { reward_fulfillments: rewardFulfillments } =
        await this.MemberApi.getRewardFulfillments()

      const { customer } = await this.MemberApi.getCustomesInfo()

      this.customer = customer
      this.customerId = this.userInfo.customer.id
      this.email = this.userInfo.customer.email
      this.origin = 'Shopify_US'
      console.log('this.customerId===', this.customerId)
      if (this.customerId) {
        this.lotteryRecords = await this.getUserLotteryRecords(
          this.customerId,
          this.email,
          this.origin
        )
        console.log('this.lotteryRecords===', this.lotteryRecords)
      }
      this.rewardFulfillments = rewardFulfillments
        .filter(
          (line) => !line.name || !line.name.toLowerCase().includes('gift card')
        )
        .reverse() // 过滤掉不需要的项

      // // 渲染产品列表
      this.render(this.rewardFulfillments)
    } catch (error) {
      console.error('Failed to load points products:', error)
    } finally {
      this.loading.hide()
    }
  }

  // 渲染产品列表
  render(rewardFulfillments) {
    const hasLocalCoupon =
      this.querySelectorAll('[data-local-coupon]').length > 0
    // 如果没有产品可显示，返回空内容
    if (
      !hasLocalCoupon &&
      (!rewardFulfillments || rewardFulfillments.length === 0) &&
      this.lotteryRecords == ''
    ) {
      this.innerHTML = '<div>No products available for redemption.</div>'
      return
    }

    // 生成产品列表的 HTML
    // const html = rewardFulfillments
    //   .map((line) => {
    //     // 使用常量存储常见的CSS类，避免重复
    //     const commonClasses = 'text-sm m-0'
    //     const accentClasses =
    //       line.usage_status !== 'unused' ? 'm-0' : 'text-accent m-0'
    //     const idUsedContainer =
    //       line.usage_status !== 'unused'
    //         ? 'bg-gray-50 border-t-gray-400'
    //         : 'border-t-accent lg:hover:shadow-lg lg:hover:scale-105 transition-all'

    //     return `
    //           <div class="isolate border border-solid border-gray-50 border-t-8 rounded-lg p-4 ${idUsedContainer}">
    //             <div class="flex items-center justify-between mb-2">
    //               <div>
    //                 <h2 class="text-xl font-bold ${accentClasses} ">${line.name}</h2>
    //                 <p class="${accentClasses}">${line.reason_text}</p>
    //               </div>
    //               <copy-button>
    //                 <button class="bg-accent text-white py-1 px-3 shadow-sm rounded-full hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-400 focus:outline-none transition-all" ${line.usage_status !== 'unused' ? `disabled` : ``} data-copy="${line.code}">
    //                 ${line.usage_status !== 'unused' ? line.usage_status : 'Copy'}
    //                 </button>
    //               </copy-button>
    //             </div>

    //             <div class="mb-4">
    //               <p class="${commonClasses} text-gray-700 font-semibold">
    //                 CODE: <span class="text-black uppercase">${line.usage_status !== 'unused' ? encryptPartial(line.code) : line.code}</span>
    //               </p>
    //             </div>

    //             <hr class="border-gray-200 mb-4">

    //             <div class="text-gray-600">
    //               <p class="${commonClasses}">${line.usage_instructions}</p>
    //             </div>
    //           </div>`
    //   })
    //   .join('')

    // 将产品列表的 HTML 设置为组件的内部 HTML ${product.can_afford ? 'Learn More' : 'Insufficient points'}
    rewardFulfillments.forEach((line) => {
      // 使用常量存储常见的CSS类，避免重复
      const commonClasses = 'text-sm m-0'
      const accentClasses =
        line.usage_status !== 'unused' ? 'm-0' : 'text-accent m-0'
      const idUsedContainer =
        line.usage_status !== 'unused'
          ? 'bg-gray-50 border-t-gray-400'
          : 'border-t-accent lg:hover:shadow-lg lg:hover:scale-105 transition-all'

      const couponLine = `
          <div class="isolate border border-solid border-gray-50 border-t-8 rounded-lg p-4 ${
            line.usage_status !== 'unused'
              ? 'bg-gray-50 border-t-gray-400'
              : 'border-t-accent lg:hover:shadow-lg lg:hover:scale-105 transition-all'
          }">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h2 class="text-xl font-bold ${accentClasses} ">${line.name}</h2>
<!--                  <p class="${accentClasses}">${line.reason_text}</p>-->
                </div>
                <copy-button>
                  <button class="bg-accent text-white py-1 px-3 shadow-sm rounded-full hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-400 focus:outline-none transition-all" ${
                    line.usage_status !== 'unused' ? 'disabled' : ''
                  } data-copy="${line.code}">
                  ${line.usage_status !== 'unused' ? line.usage_status : 'Copy'}
                  </button>
                </copy-button>
              </div>
              
              <div class="mb-4">
                <p class="${commonClasses} text-gray-700 font-semibold">
                  CODE: <span class="text-black uppercase">${
                    line.usage_status !== 'unused'
                      ? encryptPartial(line.code)
                      : line.code
                  }</span>
                </p>
              </div>
              
              <hr class="border-gray-200 mb-4">
              
              <div class="text-gray-600">
                <p class="${commonClasses}">${line.usage_instructions}</p>
              </div>
            </div>`

      this.insertAdjacentHTML('beforeend', couponLine)
    })

    this.insertAdjacentHTML('beforeend', this.lotteryRecords)

    // 删除加载动画元素
    this.querySelectorAll('[data-loading-el]')?.forEach((el) => el.remove())
  }

  get loadBtn() {
    return this.querySelector('[data-load]')
  }
}

// 注册自定义元素
window.customElements.define('member-coupon', MemberCoupon)
