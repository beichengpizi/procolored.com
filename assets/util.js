// 注意：本实现基于 spark-md5 实现，可用于浏览器与 Node.js 环境（需先引入 spark-md5 库）

// 需确保页面或打包环境已引入 spark-md5
// <script src="https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js"></script>

const SECRET = "BE19C08691FEF37763F325S12BCADT6S4BYSHVEN";
// const booster_base_url = "https://test.procolored.com"; // 测试接口
 const booster_base_url = "https://booster.procolored.com"  // 正式接口
function urlEncode(str) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16)
  );
}

function httpBuildQuery(params, secret) {
  const keys = Object.keys(params).sort();
  const arr = [];
  keys.forEach((k) => {
    arr.push(urlEncode(k) + "=" + urlEncode(params[k]));
  });
  let str = arr.join("&");
  if (secret) str += secret;
  return str;
}

// 使用 spark-md5 实现MD5
// 返回32字符的大写HEX字符串
function getMD5String(str) {
  // SparkMD5.hash 返回 hex
  let hex = SparkMD5.hash(str);
  // 补齐32位
  while (hex.length < 32) hex = "0" + hex;
  return hex.toUpperCase();
}

async function generateSign(timestamp) {
  const data = { timestamp };
  const queryStr = httpBuildQuery(data, SECRET);
  // spark-md5为同步实现，这里可直接返回
  return getMD5String(queryStr);
}

// 使用示例（异步）：
const timestamp = Date.now().toString();
generateSign(timestamp).then((sign) => {
  // 使用 sign
//   console.log("sign:", sign);
});

// ⚠️ 跨域修复要点：fetch对CORS redirect限制非常严格，如果API服务未配置正确，会导致 preflight (OPTIONS) 被拦截（如302跳转）。后端应避免对API接口302跳转。前端只能尽量保证fetch配置标准、不主动引发redirect与credentials相关问题。

/**
 * boosterFetch
 * @param {string} url 请求地址 (格式如 "/procolored/lotteryConfig/getAllPrize" 等)
 * @param {object} data POST时传递的数据对象
 * @param {object} options 额外fetch和boosterFetch配置参数
 *    - options.method 默认为POST，若为GET则data自动拼到query
 *    - options.toJson 默认为true，自动返回response.json()，否则返回原生response对象
 *    - options.headers 附加自定义headers
 *    - 其它fetch的可用属性
 * @returns {Promise<any>} 根据 options.toJson 决定是返回json还是response
 */
async function boosterFetch(url, data, options = {}) {
  // options 解析
  const isToJson = options.toJson !== false; // 默认为true
  let method = (options.method || "POST").toUpperCase();

  // url为接口路径(如"/procolored/lotteryConfig/getAllPrize")，直接和booster_base_url拼接
  let finalUrl = "";
  // 对于url为"/procolored/..."格式，自动拼接booster_base_url
  if (typeof url === "string" && url.startsWith("/procolored/")) {
    finalUrl = `${booster_base_url}${url}`;
  } else {
    finalUrl = url;
  }

  // 只对 booster_base_url 接口加签
  if (typeof url === "string" && url.startsWith("/procolored/")) {
    const timestamp = Date.now().toString();
    const sign = await generateSign(timestamp);

    // 合并headers：传入优先、签名必加
    let headers = Object.assign({}, options.headers || {}, {
      "Content-Type": "application/json",
      timestamp: timestamp,
      sign: sign,
    });

    // 若无明确设置，则强行指定允许跨域（并防止自动带凭据）
    // 1. mode: 'cors' 必须
    // 2. credentials: 'omit'，以防因凭据引发预检请求被阻止
    // 3. redirect: 'error'，遇重定向直接抛错，避免fetch自动跟随导致CORS失败
    const fetchOptions = {
      ...options,
      method,
      headers,
      mode: "cors",
      credentials: "omit",
      redirect: "error", // 防止API服务端 302 跳转导致CORS失败
    };

    // GET则data拼为query，POST/PUT则data为body
    if (method === "GET" || method === "HEAD") {
      // 兼容 data 为空/undefined/非object 的情况
      if (
        data &&
        typeof data === "object" &&
        !(data instanceof FormData) &&
        Object.keys(data).length > 0
      ) {
        let base = booster_base_url;
        const urlObj = new URL(finalUrl, base);
        Object.entries(data).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            v.forEach((val) => urlObj.searchParams.append(k, val));
          } else if (typeof v === "object" && v !== null) {
            urlObj.searchParams.append(k, JSON.stringify(v));
          } else {
            urlObj.searchParams.append(k, v);
          }
        });
        finalUrl = urlObj.toString();
      }
      // data为空则不拼接 query
    } else if (typeof data !== "undefined") {
      if (data instanceof FormData) {
        // 如果是FormData就不做处理，直接赋值
        fetchOptions.body = data;
        // 删除（或不设置）Content-Type 让浏览器自己带
        if (fetchOptions.headers && fetchOptions.headers["Content-Type"]) {
          delete fetchOptions.headers["Content-Type"];
        }
      } else {
        fetchOptions.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(finalUrl, fetchOptions);
      if (!response.ok) {
        // fetch的redirect: 'error' 会在重定向时直接抛，但仍做兜底处理
        const text = await response.text();
        throw new Error(`boosterFetch(${response.status}): ${text}`);
      }
      return isToJson ? response.json() : response;
    } catch (err) {
      // 统一控制台输出
      console.error("boosterFetch error:", err);
      // 针对特定错误提示
      if (err instanceof TypeError && /redirect/i.test(err.message)) {
        // fetch遇到redirect: 'error'的重定向，浏览器会直接抛TypeError
        console.error(
          "CORS/redirect error: 后端接口存在302跳转。这将导致预检请求被拒，需后端修复（必须返回200，不能302）"
        );
      }
      throw err;
    }
  } else {
    // 非目标接口直接透传，但兼容 options.toJson
    // 这里也强制配置mode、credentials、redirect以防止CORS问题
    try {
      const fetchOptions = {
        ...options,
        mode: "cors",
        credentials: "omit",
        redirect: "error",
      };
      const response = await fetch(finalUrl, fetchOptions);
      return isToJson ? response.json() : response;
    } catch (err) {
      console.error("boosterFetch (other domain) error:", err);
      throw err;
    }
  }
}
if (typeof window !== "undefined") {
  window.boosterFetch = boosterFetch;
  // 兼容smile io 请求方式
  const timestamp = Date.now().toString();
  generateSign(timestamp).then(function (sign) {
    window.ShopifyData = {
      headers: {
        "Content-Type": "application/json",
        timestamp: timestamp,
        sign: sign,
      },
    };
  });
}

// 查询抽奖机会示例
// 假设有如下变量
// let api = "https://booster.procolored.com";
// let lotteryChanceApi = '/procolored/lotteryChances/getLotteryChance';
// let id = "用户ID"; let email = "邮箱"; let activityId = 1;

// 调用方式如下：
/*
boosterFetch(
    `/procolored/lotteryChances/getLotteryChance`, 
    {
        customerId: id,
        customerEmail: email,
        activityId: activityId
    }, 
    { method: 'GET' }
).then(data => {
    // 这里可以根据实际需求处理返回的数据
    console.log('查询抽奖机会结果:', data);
}).catch(error => {
    console.error('查询抽奖机会失败:', error);
});
*/
