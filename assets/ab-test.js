// const currentUsedTemplate = 'black-friday-2024-10'; // 当前使用的默认模板
 const currentUsedTemplate = shopifyTemplateName; // 当前使用的默认模板
// const ABTestNum = 1; // AB测试的模板数量

// 检查URL是否有参数
function hasUrlParams(url) {
    console.log('检查URL是否有参数==', url.indexOf('?') !== -1);
    return url.indexOf('?') !== -1;
}

// 获取URL参数
function getUrlParams(url) {
    const params = {}; // 存储解析后的参数
    const parser = document.createElement('a'); // 创建一个临时的a元素用于解析URL
    parser.href = url;
    const query = parser.search.substring(1); // 获取查询字符串部分
    const vars = query.split('&'); // 将查询字符串按&分割成数组
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('='); // 将每个键值对按=分割
        params[pair[0]] = decodeURIComponent(pair[1]); // 解码并存储参数
    }
    console.log('获取URL参数==', params);
    return params;
}

// 设置URL参数
function setUrlParams(url, params) {
    const urlParts = url.split('?'); // 将URL按?分割成两部分
    let baseUrl = urlParts[0]; // 获取基础URL部分
    let existingParams = {};

    if (urlParts.length > 1) {
        existingParams = getUrlParams(url); // 获取现有的参数
    }

    Object.assign(existingParams, params); // 合并新参数和现有参数

    const queryString = Object.keys(existingParams)
        .map(key => `${key}=${encodeURIComponent(existingParams[key])}`) // 生成新的查询字符串
        .join('&');
    console.log('设置URL参数==', `${baseUrl}?${queryString}`);
    return `${baseUrl}?${queryString}`;
}

// 获取LocalStorage中的值
function getLocalStorageValue(key) {
    console.log('获取LocalStorage中的值==', localStorage.getItem(key));
    return localStorage.getItem(key);
}

// 设置LocalStorage中的值
function setLocalStorageValue(key, value) {
    localStorage.setItem(key, value);
}
// 清除LocalStorage中的值
function clearLocalStorageValue(key) {
    localStorage.removeItem(key);
    console.log('清除LocalStorage中的值==', key);
}
// 根据ABTestNum选择模板
function getRandomPage(ABTestNum) {
    const templates = [currentUsedTemplate]; // 初始化模板数组，包含默认模板
    for (let i = 1; i < ABTestNum + 1; i++) {
        templates.push(`${currentUsedTemplate}-${i}`); // 生成后续的模板名称并添加到数组中
    }
    const randomIndex = Math.floor(Math.random() * templates.length); // 随机选择一个模板索引
    return templates[randomIndex]; // 返回随机选择的模板
}

// 主逻辑
function handleABTest() {
    const currentUrl = window.location.href; // 获取当前页面的URL
    const abTestKey = `ab_test_view_${currentUsedTemplate}`; // 存储AB测试视图的LocalStorage键
    console.log('currentUrl==', currentUrl);

    // 检查URL是否有参数
    if (hasUrlParams(currentUrl)) {
        console.log('当前URL携带其他参数');
        const urlParams = getUrlParams(currentUrl); // 获取URL参数
        if (!urlParams.view) {
            // 如果没有view参数，从LocalStorage中获取
            const storedView = getLocalStorageValue(abTestKey);
            if (storedView) {
                const newUrl = setUrlParams(currentUrl, { view: storedView }); // 设置URL参数
                window.location.href = newUrl; // 重定向到新URL
            } else {
                // 如果LocalStorage中没有值，随机分配一个值并保存
                const page = getRandomPage(ABTestNum); // 随机选择一个模板
                setLocalStorageValue(abTestKey, page); // 保存到LocalStorage
                const newUrl = setUrlParams(currentUrl, { view: page }); // 设置URL参数
                window.location.href = newUrl; // 重定向到新URL
            }
        }
    } else {
        // 如果没有参数，从LocalStorage中获取
        console.log('当前URL没有携带其他参数');
        const storedView = getLocalStorageValue(abTestKey);
        if (storedView) {
            console.log('AB测试页面：', storedView);
            const newUrl = setUrlParams(currentUrl, { view: storedView }); // 设置URL参数
            // window.location.href = newUrl; // 重定向到新URL（注释掉以避免不必要的重定向）
        } else {
            console.log('No stored view found in localStorage.');
            // 如果LocalStorage中没有值，随机分配一个值并保存
            const page = getRandomPage(ABTestNum); // 随机选择一个模板
            setLocalStorageValue(abTestKey, page); // 保存到LocalStorage
            const newUrl = setUrlParams(currentUrl, { view: page }); // 设置URL参数
            //window.location.href = newUrl; // 重定向到新URL
        }
    }
}

// 页面加载之前执行
(function () {
    const abTestKey = `ab_test_view_${currentUsedTemplate}`;
    if (isABTest && ABTestNum > 0) {
        console.log('ABTest is enabled');
        handleABTest(); // 执行AB测试逻辑
    } else {
        console.log('ABTest is not enabled');
        if (getLocalStorageValue(abTestKey)) {
            clearLocalStorageValue(abTestKey)
        } 
    }
})();