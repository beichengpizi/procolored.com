import { initializeSmileApi } from './smile-member-api.js'

class MemberAccount extends window.HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.init()

    this.renewEl &&
      this.renewEl.addEventListener('click', () => {
        const renew = this.renewEl.dataset.renew

        if (!renew) return
        const activeHTML = this.querySelector(`member-${renew}`)

        this.update && this.update()
        activeHTML && activeHTML.update()
      })
  }

  async init() {
    const { config, api } = await initializeSmileApi()

    this.MemberApi = api
    this.config = config

    this.update()

    // const dd = await this.MemberApi.getBestPointsProductToShow()
  }

  async update() {
    const { customer } = await this.MemberApi.getCustomesInfo()
    const { reward_fulfillments: rewardFulfillments } =
      await this.MemberApi.getRewardFulfillments()

    this.customer = customer

    this.rewardFulfillmentsGiftCard = rewardFulfillments.filter(
      (line) => line.reward_token === 'shopify_gift_card'
    ) // 过滤掉不需要的项
    this.rewardFulfillmentsCoupon = rewardFulfillments.filter(
      (line) => line.reward_token !== 'shopify_gift_card'
    ) // 过滤掉不需要的项

    this.pointsEl?.forEach((el) => {
      el.innerHTML = this.customer.points_balance
    })

    this.giftCartNumberEl?.forEach((el) => {
      el.innerHTML = this.rewardFulfillmentsGiftCard.length
    })

    this.couponNumberEl?.forEach((el) => {
      el.innerHTML = this.rewardFulfillmentsCoupon.length
    })
  }

  get giftCartNumberEl() {
    return this.querySelectorAll('[data-gift-card]')
  }

  get couponNumberEl() {
    return this.querySelectorAll('[data-coupon]')
  }

  get pointsEl() {
    return this.querySelectorAll('[data-points]')
  }

  get renewEl() {
    return this.querySelector('[data-renew]')
  }
}

window.customElements.define('member-account', MemberAccount)
