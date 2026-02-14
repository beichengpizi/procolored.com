import { initializeSmileApi } from './smile-member-api.js'
import { Loading, Modal, SocialShare } from './smile-components-index.js'

// 用户活动历史 - Member Earn Point
class MemberEarnPoint extends window.HTMLElement {
  constructor() {
    super()

    // 初始化方法
    this.loading = new Loading()
    this.birthdayModal = new Modal()

    // 初始化组件并绑定事件
    this.initComponent()
    this.bindEvents()
  }

  // 初始化组件内容
  async initComponent() {
    // 初始化 Smile API，并获取用户信息
    const { config, api } = await initializeSmileApi()
    this.MemberApi = api
    this.config = config

    this.update()
  }

  // 更新数据
  async update() {
    this.loading.show({
      message: 'Please wait...',
      spinnerColor: 'text-accent' // 蓝色旋转图标
    })

    try {
      // 获取用户的活动和用户信息
      const { customer_activity_rules: activityRules } =
        await this.MemberApi.getCustomerActivityRulesAsync()

      const { customer } = await this.MemberApi.getCustomesInfo()

      this.customer = customer
      this.activityRules = activityRules
      // 渲染活动规则到组件
      this.renderActivityRules(activityRules)
    } catch (error) {
      console.error('Error fetching activity rules:', error)
    } finally {
      // 隐藏加载动画
      this.loading.hide()
    }
  }

  // 绑定事件处理程序
  bindEvents() {
    this.addEventListener('click', (event) => {
      const { dataset } = event.target
      const { type } = dataset

      // 处理用户点击事件
      if (!type) return

      const current = this.activityRules.find(
        (rule) => rule.activity_rule.type === type
      )

      switch (type) {
        case 'customer_birthday':
          this.showBirthdayModal() // 显示生日输入模态框
          break

        default:
          this.action(current)
          break
      }
    })
  }

  // 渲染用户活动规则列表
  renderActivityRules(activityRules) {
    if (!activityRules || activityRules.length === 0) {
      this.innerHTML = '<div>No activity rules available.</div>'
      return
    }

    const activityHtml = activityRules
      .map((rule) =>
        rule.activity_rule.is_enabled
          ? `
          <div class="p-4 h-full bg-[#F8F9FC] space-y-12 rounded-lg border border-solid border-gray-100 opacity-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <h4 class="font-extrabold text-xl m-0">${rule.activity_rule.name}</h4>
                <div class="flex items-center text-accent">
                  <svg
                    viewBox="0 0 10 10"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    class="w-3.5 h-3.5"
                  >
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
                  <span class="text-base ml-2">${rule.activity_rule.value_description}</span>
                </div>
              </div>

              <img class="lazyload w-10 h-10" data-src="${rule.activity_rule.image_svg}" />
            </div>
            ${
              rule.will_become_available
                ? rule.activity_rule.action_text
                  ? `<button class="inline-flex items-center bg-accent hover:bg-accent-hover text-white font-semibold rounded-full py-2 px-8" data-type="${rule.activity_rule.type}">
                      <span class="ml-2 pointer-events-none">${rule.activity_rule.type === 'customer_birthday' ? 'Edit Date' : `${rule.activity_rule.action_text} Now`}</span>
                    </button>`
                  : ''
                : `<div class="inline-flex items-center bg-white rounded-full p-2 pr-3">
                    <div class="bg-accent rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                      </svg>
                    </div>
                    <span class="ml-2">Got the Points</span>
                  </div>`
            }
          </div>`
          : ''
      )
      .join('')

    this.innerHTML = activityHtml
  }

  // 显示输入生日的模态框
  showBirthdayModal() {
    this.birthdayModal.showModal({
      header: `
        <h2 class="text-xl font-bold m-0">Birthday reward</h2>
        <button id="close-header" class="w-8 h-8 flex items-center justify-center text-lg rounded-full bg-gray-600 text-white hover:bg-gray-900 hover:text-gray-50">&times;</button>
      `,
      content: `
        <p class="text-sm text-gray-500">We want to celebrate your birthday! Make sure you let us know at least one month in advance — otherwise, you'll have to wait until next year.</p>
        <form id="birthdayForm">
          <div class="flex items-center gap-4">
            <div class="w-32">
              <label for="day" class="block text-gray-700">Day</label>
              <input
                type="number"
                id="day"
                name="day"
                class="border border-gray-300 !p-2 w-full !h-auto"
                min="1"
                max="31"
                value="${this.customer?.date_of_birth?.split('-')[2] || ''}"
                required
              >
            </div>
            <div class="w-32">
              <label for="month" class="block text-gray-700">Month</label>
              <input
                type="number"
                id="month"
                name="month"
                class="border border-gray-300 !p-2 w-full !h-auto"
                min="1"
                max="12"
                value="${this.customer?.date_of_birth?.split('-')[1] || ''}"
                required
              >
            </div>
            <div class="w-full">
              <label for="year" class="block text-gray-700">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                class="border border-gray-300 !p-2 w-full !h-auto"
                min="1900"
                max="${new Date().getFullYear()}"
                value="${this.customer?.date_of_birth?.split('-')[0] || ''}"
                required
              >
            </div>
          </div>
          <p class="text-red-500 text-sm m-0 min-h-5" data-error-message></p>
        </form>
        `,
      footer: `<div class="flex justify-end items-center gap-4">
                <button id="close-footer" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" type="cancel">Cancel</button>
                <button class="bg-accent hover:bg-accent-hover text-white py-2 px-4 rounded" type="submit">Confirm</button>
               </div>`
    })

    const submitBtn = this.birthdayModal.modal.querySelector('[type="submit"]')
    const input = this.birthdayModal.modal.querySelectorAll('[type="number"]')

    input.forEach((el) => {
      el.addEventListener('change', () => {
        this.birthdayModal.modal.querySelector(
          '[data-error-message]'
        ).innerHTML = ''
        this.birthdayModal.modal
          .querySelectorAll('#day', '#month', '#year')
          .forEach((selector) => (selector.style.borderColor = ''))
      })
    })

    submitBtn.addEventListener('click', (event) =>
      this.submitBirthdayForm(event)
    )
  }

  // 验证用户输入的生日信息
  validateBirthdayInput(form, { day, month, year }) {
    const errorEl = form.querySelector('[data-error-message]')

    // 重置输入框的边框颜色
    ;['#day', '#month', '#year'].forEach((selector) => {
      form.querySelector(selector).style.borderColor = ''
    })

    if (!day || day < 1 || day > 31) {
      form.querySelector('#day').style.borderColor = '#f00'
      errorEl.innerHTML = 'Please check the date format.'
      return false
    }

    if (!month || month < 1 || month > 12) {
      form.querySelector('#month').style.borderColor = '#f00'
      errorEl.innerHTML = 'Please check the month format.'
      return false
    }

    if (!year || year < 1900 || year > new Date().getFullYear()) {
      form.querySelector('#year').style.borderColor = '#f00'
      errorEl.innerHTML = 'Please check the year format.'
      return false
    }

    return true
  }

  // 处理生日表单提交
  async submitBirthdayForm(event) {
    event.preventDefault()

    const { modal } = this.birthdayModal
    const day = modal.querySelector('#day').value
    const month = modal.querySelector('#month').value
    const year = modal.querySelector('#year').value

    const isValid = this.validateBirthdayInput(modal, {
      day,
      month,
      year
    })

    if (isValid) {
      this.loading.show({
        message: 'Please wait...',
        spinnerColor: 'text-accent' // 蓝色旋转图标
      })

      const body = {
        customer: {
          date_of_birth: new Date(`${year}-${month}-${day}`).toISOString()
        }
      }

      try {
        // 更新用户生日信息
        const { customer } = await this.MemberApi.putCustomersAsync(body)

        if (customer.id) {
          this.birthdayModal.closeModal() // 关闭模态框
          this.initComponent() // 重新初始化组件
        }
      } catch (error) {
        console.error('Failed to update customer information:', error)
      } finally {
        this.birthdayModal.closeModal()
        this.loading.hide()
      }
    }
  }

  // 兑换事件
  async action(current) {
    const { activity_rule: activityRule } = current
    const {
      type,
      like_url: likeUrl,
      share_url: shareUrl,
      username
    } = activityRule

    if (!type) return
    const socialShare = new SocialShare()

    this.loading.show({
      message: 'Please wait...',
      spinnerColor: 'text-accent'
    })

    switch (type) {
      case 'facebook_like':
        socialShare.share('facebookLike', { url: likeUrl })
        break
      case 'facebook_share':
        socialShare.share('facebook', { url: shareUrl })
        break
      case 'instagram_follow':
        socialShare.share('instagramFollow', { url: username })
        break
      case 'tiktok_follow':
        socialShare.share('tiktokFollow', { url: username })
        break
      case 'twitter_follow':
        socialShare.share('twitterFollow', { url: username })
        break
      default:
        break
    }

    try {
      const { activity } = await this.MemberApi.postActivities({
        activity: {
          token: type
        }
      })
      if (activity.id) {
        this.loading.hide()
        this.update()
      }
    } catch (error) {
      console.error('Failed to update customer information:', error)
    } finally {
      this.loading.hide()
    }
  }

  shareUrl(type, url) {}
}

// 注册自定义元素
window.customElements.define('member-earn-point', MemberEarnPoint)
