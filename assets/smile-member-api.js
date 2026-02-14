import {
  PUBLIC_SMILE_API_HOST,
  SMILE_CHANNEL_KEY,
  PUBLISHABLE_KEY
} from './smile-config.js' // 从配置文件中导入 Smile API 的主机地址和通道密钥
import FetchManager from './smile-fetch.js' // 导入自定义的 Fetch 管理器类，用于处理 HTTP 请求

/**
 * SmileAPI 类
 * 用于与 Smile API 交互的主类，包含初始化和各种客户相关的 API 方法。
 */
class SmileAPI {
  #fetchManager // 私有字段，存储 FetchManager 实例
  #customer // 私有字段，存储客户信息

  constructor(
    apiHost = PUBLIC_SMILE_API_HOST,
    channelKey = SMILE_CHANNEL_KEY,
    publicKey = PUBLISHABLE_KEY
  ) {
    this.#fetchManager = new FetchManager(apiHost) // 使用指定的 API 主机地址实例化 FetchManager
    this.channelKey = channelKey // 存储通道密钥
    this.publicKey = publicKey // 存储通道密钥
    this.#fetchManager.setHeaders(this.getDefaultHeaders()) // 设置默认的 HTTP 请求头

    // 初始化时不直接调用 init()，而是由外部触发
  }

  /**
   * 获取默认的 HTTP 请求头
   * @param {string} authToken - 可选的授权令牌，用于设置 Authorization 头
   * @returns {object} - 返回包含默认头部信息的对象
   */
  getDefaultHeaders(authToken = '') {
    return {
      'Content-Type': 'application/json',
      'x-smile-publishable-key': this.publicKey,
      'smile-channel-key': this.channelKey,
      'Smile-Client': 'smile-ui',
      ...(authToken && { Authorization: `Bearer ${authToken}` }) // 如果提供了 authToken，则添加 Authorization 头
    }
  }

  /**
   * 初始化 Smile API
   * 执行 Smile UI 配置的初始化，并识别当前客户。
   * @returns {Promise<{ customer: object, config: object, api: object }>}
   */
  async init() {
    let body = {}

    try {
      // 获取 Smile UI 配置
      const config = await this.#fetchManager.get(
        `/smile_ui/init?publishableKey=${this.channelKey}`
      )

      try {
        const raw =
          JSON.parse(window.localStorage.getItem('smile_shopify_data')) || {}
        // 过滤掉 channel_key 和 skip_smile_ui 字段
        // const { channel_key, skip_smile_ui, ...cleanBody } = raw
      
        body = raw
      } catch (e) {
        console.error('Failed to parse localStorage data', e)
      }

      // 使用 POST 请求识别客户，并获取客户信息和授权令牌
      const customerResponse = await this.#fetchManager.post(
        '/smile_ui/shopify/identify_customer',
        body
      )

      this.#customer = customerResponse.customer // 保存客户信息
      this.config = config // 保存配置信息
      this.#fetchManager.setHeaders(
        this.getDefaultHeaders(customerResponse.customer_token)
      ) // 使用授权令牌更新请求头

      // 返回初始化后的信息和 API 方法
      return {
        customer: this.#customer,
        config: this.config,
        api: {
          putCustomersAsync: this.putCustomersAsync.bind(this),
          postActivities: this.postActivities.bind(this),
          getCustomesInfo: this.getCustomesInfo.bind(this),
          getBestPointsProductToShow:
            this.getBestPointsProductToShow.bind(this),
          getCustomerPointsProducts: this.getCustomerPointsProducts.bind(this),
          getCustomerActivityRulesAsync:
            this.getCustomerActivityRulesAsync.bind(this),
          getAllPointsProducts: this.getAllPointsProducts.bind(this),
          fetchAllPointsPointsTransactions:
            this.fetchAllPointsPointsTransactions.bind(this),
          getRewardFulfillments: this.getRewardFulfillments.bind(this),
          purchase: this.purchase.bind(this)
        }
      }
    } catch (error) {
      console.error('Failed to initialize Smile API', error)
      throw error // 如果初始化失败，则抛出错误
    }
  }

  /**
   * 更新客户信息
   * @param {object} body - 包含客户信息的对象（例如：生日）
   * @returns {Promise<object>} - 返回更新后的客户信息
   */
  async putCustomersAsync(body) {
    return this.#fetchManager.put(`/customers/${this.#customer.id}`, body)
  }

  // 兑换积分
  async postActivities(body) {
    return await this.#fetchManager.post(`/smile_ui/activities`, body)
  }

  /**
   * 获取用户信息
   * @returns {Promise<object>} 返回最新的客户信息
   */
  async getCustomesInfo() {
    return this.#fetchManager.get(
      `/smile_ui/smile_ui_customers/me?include=next_vip_tier.image_svg,vip_tier.image_svg,`
    )
  }

  /**
   * 获取最佳积分展示产品
   * @returns {Promise<object>} - 返回最佳积分展示产品的信息
   */
  async getBestPointsProductToShow() {
    return this.#fetchManager.get(
      `/smile_ui/customers/${this.#customer.id}/best_points_product_to_show?include=reward,current_available_points_product.reward.image_svg,next_points_product.reward.image_svg`
    )
  }

  /**
   * 获取客户的积分产品
   * @returns {Promise<object>} - 返回客户积分产品的信息
   */
  async getCustomerPointsProducts() {
    return this.#fetchManager.get(
      `/smile_ui/customer_points_products/${this.#customer.id}?include=reward,customer_points_products.points_product.reward.image_svg`
    )
  }

  /**
   * 获取客户的活动记录
   * @param {number} limit - 限制返回记录的数量
   * @param {string} cursor - 用于分页的游标
   * @returns {Promise<object>} - 返回客户活动记录
   */
  async getCustomerActivityRulesAsync(limit = 10, cursor = '') {
    return this.#fetchManager.get(
      `/smile_ui/customer_activity_rules?customer_id=${this.#customer.id}&include=activity_rule,image_svg,metadata&limit=${limit}&cursor=${cursor}`
    )
  }

  /**
   * 获取所有积分产品
   * @param {number} limit - 限制返回产品的数量
   * @param {string} cursor - 用于分页的游标
   * @returns {Promise<object>} - 返回所有积分产品的信息
   */
  async getAllPointsProducts(limit = 10, cursor = '') {
    return this.#fetchManager.get(
      `/smile_ui/customer_points_products?customer_id=${this.#customer.id}&include=reward,customer_points_products.points_product.reward.image_svg,metadata&limit=${limit}&cursor=${cursor}`
    )
  }

  /**
   * 获取所有积分交易记录
   * @param {number} limit - 限制返回交易记录的数量
   * @param {string} cursor - 用于分页的游标
   * @returns {Promise<object>} - 返回积分交易记录
   */
  async fetchAllPointsPointsTransactions(limit = 10, cursor = '') {
    return this.#fetchManager.get(
      `/smile_ui/points_transactions?include=image_svg,source_description,instructions_html,reward,state,metadata&limit=${limit}&cursor=${cursor}`
    )
  }

  /**
   * 获取奖励履行信息
   * @returns {Promise<object>} - 返回奖励履行信息
   */
  async getRewardFulfillments() {
    return this.#fetchManager.get(
      `/smile_ui/reward_fulfillments?include=image_svg,source_description,instructions_html,reward,state&is_transient=false`
    )
  }

  /**
   * 购买积分产品
   * @param {string} id - 积分产品的 ID
   * @param {object} body - 购买请求体
   * @returns {Promise<object>} - 返回购买后的信息
   */
  async purchase(id, body) {
    // 确保 body 中包含 customer_id
    const purchaseBody = {
      ...body,
      customer_id: this.#customer.id
    }
    return this.#fetchManager.post(
      `/smile_ui/points_products/${id}/purchase?include=reward_fulfillment.image_svg,reward_fulfillment.reward,reward_fulfillment.source_description,reward_fulfillment.instructions_html&customer_id=${this.#customer.id}`,
      purchaseBody
    )
  }

  /**
   * 等待指定的全局对象在 `window` 上可用
   * @param {string} method - 要检查的全局对象的名称
   * @returns {Promise<object>} - 返回找到的全局对象
   */
  async waitForObject(method) {
    while (typeof window[method] !== 'object') {
      await new Promise((resolve) => setTimeout(resolve, 100)) // 等待 100ms 后再次检查
    }
    return window[method] // 返回找到的全局对象
  }
}

/**
 * 导出一个初始化后的 SmileAPI 实例及相关信息和方法
 * @returns {Promise<{ customer: object, config: object, api: object }>}
 */
export async function initializeSmileApi() {
  const smileApi = new SmileAPI() // 创建 SmileAPI 实例
  return await smileApi.init() // 返回初始化后的用户信息、配置信息和方法
}
