// yg-moment 在 Shopify 环境中不可用，使用简单的日期格式化函数
function dateFormat(format, date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  const pad = (n) => n < 10 ? '0' + n : n;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return format
    .replace('YYYY', year)
    .replace('MM', pad(month))
    .replace('mm', pad(month))
    .replace('DD', pad(day))
    .replace('dd', pad(day));
}
import { initializeSmileApi } from './smile-member-api.js'
import { Loading } from './smile-components-index.js'
import { encryptPartial, copyToClipboardFallback } from './smile-utils.js'

// 用户兑换产品 - Member Points Store
class MemberGiftCard extends window.HTMLElement {
  constructor() {
    super()
    this.api = 'https://booster.procolored.com' // 正式
    // this.api = "https://test.procolored.com" //测试
    this.lotteryRecordsApi = '/procolored/shopify/getPersonalAsset'
    this.userInfo =
      JSON.parse(window.localStorage.getItem('smile_shopify_data')) || {}

    // 初始化组件
    this.loading = new Loading()
    this.initializeComponent()
    this.bindEvents()
  }

  // 初始化组件并获取数据
  async initializeComponent() {
    // 初始化 Smile API，并获取用户信息
    const { config, api } = await initializeSmileApi()

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
      const code = target.dataset.copy
      code && this.handleCopy(target, code)
    })
  }

  // 复制事件
  handleCopy(target, code) {
    target.innerHTML = 'Copy successfully!'
    target.setAttribute('disabled', true)
    copyToClipboardFallback(code)

    setTimeout(() => {
      target.removeAttribute('disabled')
      target.innerHTML = 'Copy'
    }, 1000)
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
      console.log('查询个人抽奖记录:', data)
      if (data.code === 200) {
        const result = data.result
        if (Array.isArray(result) && result.length > 0) {
          // 生成所有slideHtml的数组
          // 将 slideHtmlArr 数组拼接成一个字符串返回
          const slideHtmlArr = result.map((item, idx) => {
            if (item.prizeType === 3) {
              // 变量赋值
              const prizeTitle = item.prizeTitle || ''
              const prizeContent = item.prizeContent || ''
              // const prizeType = item.prizeType || "";
              const discountTitle = item.discountTitle || ''
              const prizeUsageScope = item.prizeUsageScope || ''
              const prizePicPc = item.prizePicPc || ''
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
             <div class="bg-gray-50 lg:hover:shadow-lg lg:hover:scale-105 transition-all rounded-lg p-6">
    <div class="flex justify-between">
      <div class="space-y-2">
<h2 class="text-xl font-bold ${accentClasses} ">${discountTitle}</h2>
        <div class="flex items-center">
          <p class="text-sm text-black font-medium m-0 min-w-32">Gift Card Code</p>
          <p class="ml-4 text-sm text-gray-800 m-0 uppercase">${encryptPartial(
            prizeContent,
            0,
            4
          )}</p>
        </div>
          <div class="flex items-center">
        ${prizeUsageScope !== '' ? `<p class="${commonClasses}">${prizeUsageScope}</p>` : ''}
 
        </div>
        <div class="flex items-center">
         ${expireAt !== '' ? `<p class="${commonClasses}">EXP: ${expireAt}</p>` : `<p class="${commonClasses}">Valid for a long time</p>`}
 
        </div>
        <button class="!mt-12 bg-accent text-white py-2 px-4 shadow-sm rounded-full hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-400 focus:outline-none transition-all" ${
          expireAt !== '' ? '' : 'disabled'
        } data-copy="${prizeContent}">
          ${expireAt !== '' ? 'Copy Code' : 'Expired'}
        </button>
      </div>
      <div class="w-12 h-12 bg-green-100 flex items-center justify-center rounded-full">
        <img src="${prizePicPc}" alt="${prizeTitle}" class="lazyload w-full h-full object-cover">
      </div>
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
    this.loading.show({
      message: 'Please wait...',
      spinnerColor: 'text-accent' // 蓝色旋转图标
    })

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
      this.rewardFulfillments = rewardFulfillments.filter(
        (line) => line.name && line.name.toLowerCase().includes('gift card')
      ) // 过滤掉不需要的项

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
    // 如果没有产品可显示，返回空内容
    if (
      (!rewardFulfillments || rewardFulfillments.length === 0) &&
      // eslint-disable-next-line eqeqeq
      this.lotteryRecords == ''
    ) {
      this.innerHTML = '<div>No Gift Card available for redemption.</div>'
      return
    }

    // 生成产品列表的 HTML
    const html = rewardFulfillments
      .map((line) => {
        // 使用常量存储常见的CSS类，避免重复

        return ` <div class="bg-gray-50 lg:hover:shadow-lg lg:hover:scale-105 transition-all rounded-lg p-6">
    <div class="flex justify-between">
      <div class="space-y-2">
<h2 class="text-xl font-bold text-accent m-0 ">${line.name}</h2>
        <div class="flex items-center">
          <p class="text-sm text-black font-medium m-0 min-w-32">Gift Card Code</p>
          <p class="ml-4 text-sm text-gray-800 m-0 uppercase">${encryptPartial(
            line.code,
            0,
            4
          )}</p>
        </div>
                  <div class="flex items-center">
        ${line.usage_instructions !== '' ? `<p class="text-sm m-0">${line.usage_instructions}</p>` : ''}
 
        </div>
        <div class="flex items-center">
          <p class="text-sm text-black font-medium m-0 min-w-32">Expired at</p>
          <p class="ml-4 text-sm text-gray-800 m-0">${
            this.isExpired(line.created_at, 365)
              ? 'Expired'
              : dateFormat(
                  'mm/dd/YYYY',
                  this.getExpiresDate(line.created_at, 365)
                )
          }</p>
        </div>
        <button class="!mt-12 bg-accent text-white py-2 px-4 shadow-sm rounded-full hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-400 focus:outline-none transition-all" ${
          this.isExpired(line.created_at, 365) ? 'disabled' : ''
        } data-copy="${line.code}">
          ${this.isExpired(line.created_at, 365) ? 'Expired' : 'Copy Code'}
        </button>
      </div>
      <div class="w-12 h-12 bg-green-100 flex items-center justify-center rounded-full">
        <img src="${line.image_url}" alt="${line.name}" class="lazyload w-full h-full object-cover">
      </div>
    </div>
  </div>`
      })
      .join('')

    // 将产品列表的 HTML 设置为组件的内部 HTML ${product.can_afford ? 'Learn More' : 'Insufficient points'}
    this.innerHTML = (this.lotteryRecords || '') + html
  }

  isExpired(startDate, days) {
    // 获取当前日期
    const now = new Date()

    // 计算N年后的日期
    const expiryDate = this.getExpiresDate(startDate, days)

    // 判断是否过期
    return now > expiryDate
  }

  getExpiresDate(startDate, days) {
    // 解析起始日期
    const expiryDate = new Date(startDate)

    // 添加指定的天数
    expiryDate.setDate(expiryDate.getDate() + days)

    // 返回计算后的日期
    return expiryDate
  }
}

// 注册自定义元素
window.customElements.define('member-gift-card', MemberGiftCard)
