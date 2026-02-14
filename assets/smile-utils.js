export function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: `application/${type}`
    }
  }
}

export function debounce(fn, wait) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn.apply(this, args), wait)
  }
}

/**
 * 部分加密字符串
 * @param {string} input - 需要加密的字符串
 * @param {number} start - 要保留的前几位字符数
 * @param {number} end - 要保留的后几位字符数
 * @returns {string} - 加密后的字符串
 */
export function encryptPartial(input, start = 4, end = 4) {
  // 检查输入字符串的长度是否大于前后保留字符的总和
  if (input.length <= start + end) {
    return input // 如果字符串过短，则不加密，直接返回
  }

  // 截取保留的前几位字符
  const prefix = input.slice(0, start)

  // 截取保留的后几位字符
  const suffix = input.slice(-end)

  // 计算需要加密的字符数量
  const encryptedPart = '*'.repeat(input.length - start - end)

  // 拼接结果并返回
  return `${prefix}${encryptedPart}${suffix}`
}

/**
 * 复制文本到剪贴板（旧版兼容）
 * @param {string} text - 要复制的文本
 */
// export function copyToClipboardFallback(text) {
//   const textArea = document.createElement('textarea')
//   textArea.value = text
//   document.body.appendChild(textArea)
//   textArea.select()
//   try {
//     document.execCommand('copy')
//     // console.log('Text copied to clipboard:', text)
//   } catch (err) {
//     console.error('Failed to copy text to clipboard:', err)
//   } finally {
//     document.body.removeChild(textArea)
//   }
// }

export const copyToClipboardFallback = async (val) => {
  try {
    // 使用现代 API 尝试复制
    if (navigator.clipboard && navigator.permissions) {
      await navigator.clipboard.writeText(val)
      return // 如果成功，直接返回
    }

    // 降级方案
    const textArea = document.createElement('textArea')
    textArea.value = val
    textArea.style.width = 0
    textArea.style.position = 'fixed'
    textArea.style.left = '-999px'
    textArea.style.top = '10px'
    textArea.setAttribute('readonly', 'readonly')
    document.body.appendChild(textArea)
    textArea.select()

    // 尝试执行复制操作
    const success = document.execCommand('copy')
    if (!success) {
      throw new Error('无法复制文本')
    }

    // 清理
    document.body.removeChild(textArea)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 定义一个函数，用于发送请求并更新页面内容
export async function fetchDataAndUpdate(url) {
  try {
    const response = await fetch(url) // 发送请求
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return true
    // const data = await response.json() // 假设返回的是 JSON 数据
    // console.log('Data loaded:', data)
    // updatePageContent(data) // 更新页面内容
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

export const deepMergeArrays = (arr1, arr2) => {
  const result = [...arr1]

  arr2.forEach((item2) => {
    const index = result.findIndex((item1) => item1.id === item2.id)
    if (index > -1) {
      // 如果存在相同的 ID，递归合并对象
      result[index] = deepMergeObjects(result[index], item2)
    } else {
      // 如果不存在相同的 ID，直接添加
      result.push(item2)
    }
  })

  return result
}

const deepMergeObjects = (obj1, obj2) => {
  const result = { ...obj1 }

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (typeof obj2[key] === 'object' && obj2[key] !== null) {
        if (Array.isArray(obj2[key])) {
          result[key] = [...new Set([...(obj1[key] || []), ...obj2[key]])]
        } else {
          result[key] = deepMergeObjects(obj1[key] || {}, obj2[key])
        }
      } else {
        result[key] = obj2[key]
      }
    }
  }

  return result
}

/**
 * HTML 字符串转 HTML 元素
 * @param {String} html html 字符串
 * @returns HTML
 */
export function escapeHTML(html) {
  const div = document.createElement('div')
  div.innerText = html
  return div.innerHTML
}
