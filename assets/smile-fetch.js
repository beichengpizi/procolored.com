/**
 * FetchManager 类用于封装 fetch 请求，提供简化的 GET、POST、PUT、DELETE 等请求方法，
 * 并支持设置通用的 headers 和其他配置选项。
 */

class FetchManager {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  // 设置通用 headers
  setHeaders(headers) {
    this.headers = headers
  }

  // 通用 fetch 函数
  async fetchUrl(method, url, body = null, config = {}) {
    // 如果 config 中有 excludeHeaders，则从 headers 中排除这些字段
    let finalHeaders = { ...(this.headers || {}) }
    if (config.excludeHeaders && Array.isArray(config.excludeHeaders)) {
      config.excludeHeaders.forEach(header => {
        delete finalHeaders[header]
      })
    }
    const options = {
      method,
      headers: { ...finalHeaders, ...config.headers },
      body: body ? JSON.stringify(body) : null
    }

    // 合并任何额外的配置
    options.signal = config.signal
    const newUrl = this.baseURL + url

    try {
      const response = await fetch(newUrl, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json() // 或 response.text() 如果你期望的是纯文本
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }

  // GET 请求
  get(url, config = {}) {
    return this.fetchUrl('GET', url, null, config)
  }

  // POST 请求
  post(url, data, config = {}) {
    return this.fetchUrl('POST', url, data, config)
  }

  // PUT 请求
  put(url, data, config = {}) {
    return this.fetchUrl('PUT', url, data, config)
  }

  // DELETE 请求
  delete(url, config = {}) {
    return this.fetchUrl('DELETE', url, null, config)
  }
}

export default FetchManager
