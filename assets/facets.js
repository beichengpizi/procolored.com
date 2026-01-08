/**
 *  @class
 *  @function FacetsToggle
 *  控制筛选抽屉（Facet Drawer）的开关，当点击按钮后打开或关闭抽屉
 */
class FacetsToggle {
  constructor() {
    // 获取抽屉容器元素
    this.container = document.getElementById("Facet-Drawer");
    let button = document.getElementById("Facets-Toggle");
    this.tabContainer = "";
    // 给按钮添加点击事件，切换抽屉显示状态
    if (button) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementsByTagName("body")[0].classList.toggle("open-cc"); // 防止页面内容滚动
        this.container.classList.toggle("active"); // 显示/隐藏侧边栏
      });
    }
  }
}

/**
 * FacetFiltersForm 用于管理筛选表单和相关页面局部刷新
 */
class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    // 绑定点击“移除”筛选事件
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    // 输入事件防抖，避免频繁触发筛选逻辑
    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    // form表单input事件监听，触发表单提交
    this.querySelector("form").addEventListener(
      "input",
      this.debouncedOnSubmit.bind(this)
    );
  }

  /**
   * 监听浏览器history变动，方便后退/前进时页面自动响应
   */
  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state
        ? event.state.searchParams
        : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener("popstate", onHistoryChange);
  }

  /**
   * 切换当前选中的 active filter 是否可点击（禁用状态）
   * @param {boolean} disable 是否禁用所有 js-facet-remove 按钮
   */
  static toggleActiveFacets(disable = true) {
    document.querySelectorAll(".js-facet-remove").forEach((element) => {
      element.classList.toggle("disabled", disable);
    });
  }

  /**
   * 渲染页面主要区域，包括商品列表、统计数量等局部刷新
   * @param {string} searchParams 查询参数
   * @param {Event} event 当前事件
   * @param {boolean} updateURLHash 是否更新URL hash（默认为 true）
   */
  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const container = document.getElementsByClassName("thb-filter-count");

    // 显示 loading 效果
    document
      .getElementById("ProductGridContainer")
      .querySelector(".collection")
      .classList.add("loading");
    for (var item of container) {
      item.classList.add("loading");
    }

    // 对每个需要渲染的section分别请求
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      console.log("对每个需要渲染的section分别请求==", url);
      // 查找缓存中是否有对应数据
      const filterDataUrl = (element) => element.url === url;

      if (FacetFiltersForm.filterData.some(filterDataUrl)) {
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event);
      } else {
        FacetFiltersForm.renderSectionFromFetch(url, event);
      }
    });
    // 更新地址栏URL
    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  /**
   * 网络请求获取新的筛选内容，并缓存
   * @param {string} url
   * @param {Event} event
   */
  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        // 加入缓存
        FacetFiltersForm.filterData = [
          ...FacetFiltersForm.filterData,
          {
            html,
            url,
          },
        ];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);

        new FacetsToggle(); // 重新注册侧边栏开关
      });
  }

  /**
   * 从缓存中渲染部分内容
   * @param {function} filterDataUrl 查找缓存的函数
   * @param {Event} event
   */
  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  /**
   * 渲染商品网格区域
   * @param {string} html 新的HTML内容
   */
  static renderProductGridContainer(html) {
    document.getElementById("ProductGridContainer").innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("ProductGridContainer").innerHTML;
  }

  /**
   * 渲染商品总数统计区域
   * @param {string} html
   */
  static renderProductCount(html) {
    // console.log('renderProductCount');
    const countHtml = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("ProductCount");
    const container = document.getElementsByClassName("thb-filter-count");

    if (countHtml) {
      for (var item of container) {
        item.innerHTML = countHtml.innerHTML;
        item.classList.remove("loading");
      }
      // 获取当前激活的.collection-tab
      const parentTab = document.querySelector(".collection-tab.active");
      if (parentTab) {
        // 获取其 .collection-tabs-wrapper 父级
        this.tabContainer = parentTab.closest(".collection-tabs-wrapper");
        if (this.tabContainer) {
          FacetFiltersForm.scrollTabIntoView(parentTab);
        }
        FacetFiltersForm.updateDiscountInfo();
      }
    }
  }
  /**
   * 更新产品卡片优惠信息
   * @param {string} html
   * @param {Event} event
   */
  static updateDiscountInfo() {
    // 自动化折扣定时显示
    function formatUtcTime(v) {
      let date = new Date(v);
      return (
        date.getFullYear() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
        " " +
        (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
        ":" +
        (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
        ":" +
        (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds())
      );
    }
    // 格式化货币
    // 格式化金额为货币字符串
    function formatMoney(cents, format) {
      // 如果 cents 是字符串类型，去除小数点
      if (typeof cents === "string") {
        cents = cents.replace(".", "");
      }
      let value = "";
      // 占位符正则，用于匹配格式字符串中的 {{ amount }} 等
      const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      // 如果未传入 format，则使用 moneyFormat 变量
      const formatString = format || moneyFormat;

      // 内部函数：根据分隔符和精度格式化数字
      function formatWithDelimiters(
        number,
        precision = 2,
        thousands = ",",
        decimal = "."
      ) {
        // 非数字或空值时返回0
        if (isNaN(number) || number == null) {
          return 0;
        }
        // 将分单位转换为元单位，并保留指定小数位
        number = (number / 100.0).toFixed(precision);

        const parts = number.split(".");
        // 千分位分隔
        const dollarsAmount = parts[0].replace(
          /(\d)(?=(\d\d\d)+(?!\d))/g,
          `$1${thousands}`
        );
        // 小数部分
        const centsAmount = parts[1] ? decimal + parts[1] : "";

        return dollarsAmount + centsAmount;
      }

      // 根据格式字符串中的占位符类型选择不同的格式化方式
      switch (formatString.match(placeholderRegex)[1]) {
        case "amount":
          // 2位小数，千分位逗号
          value = formatWithDelimiters(cents, 2);
          break;
        case "amount_no_decimals":
          // 无小数，千分位逗号
          value = formatWithDelimiters(cents, 0);
          break;
        case "amount_with_comma_separator":
          // 2位小数，千分位点，小数逗号
          value = formatWithDelimiters(cents, 2, ".", ",");
          break;
        case "amount_no_decimals_with_comma_separator":
          // 无小数，千分位点
          value = formatWithDelimiters(cents, 0, ".", ",");
          break;
        case "amount_with_apostrophe_separator":
          // 2位小数，千分位撇号
          value = formatWithDelimiters(cents, 2, "'", ".");
          break;
      }

      // 用格式化后的金额替换格式字符串中的占位符
      return formatString.replace(placeholderRegex, value);
    }
    // 格式化货币代码
    const currency_code_enabled = theme.settings.currency_code_enabled;
    let format = theme.settings.money_format;
    if (currency_code_enabled) {
      format = theme.settings.money_with_currency_format;
    } else {
      format = theme.settings.money_format;
    }
    // 如果 this.format 包含 <span class="money"></span>，则提取 > 和 < 之间的内容作为格式
    const moneySpanMatch = format.match(
      /<span\s+class=["']money["']>(.*?)<\/span>/i
    );
    if (moneySpanMatch) {
      format = moneySpanMatch[1];
    }
    // 获取当前选中的变体
    function findSelectVariant(variantId) {
      console.log("findSelectVariant", variantId);
      console.log("findSelectVariant", getVariantData());
      return getVariantData().find((variant) => variant.id == variantId);
    }
    // 遍历variantData，查找第一个custom_discount有值的对象
    // 如果有，返回该对象，否则返回null
    function findFirstVariantWithDiscount(variantData) {
      for (let i = 0; i < variantData.length; i++) {
        if (
          variantData[i].custom_discount !== undefined &&
          variantData[i].custom_discount !== null &&
          variantData[i].custom_discount !== ""
        ) {
          return variantData[i];
        }
      }
      return null;
    }
    // 遍历所有 product-card，检查 data-discount 是否有值
    $(" product-card").each(function () {
      // 获取当前 product-card 下 custom-automatic-discount-reminder 元素
      const $reminder = $(this).find("custom-automatic-discount-reminder");
      const $finalPrice = $reminder.find("[data-final-price]");
      const $originPrice = $reminder.find("[data-origin-price]");
      const $finalSalePrice = $reminder.find("[data-final-sale-price]");
      const jsonElement = $reminder.find('[type="application/json"]');
      let variantWithDiscount = null;
      let discount_value = null;
      let price = null;
      let compare_at_price = null;
      let difference = null;
      let UTCDate = "1970-01-01T00:00:00Z";
      let UTCDate_end = "1970-01-01T00:00:00Z";
      let finalDate = null;
      let finalDate_end = null;
      let finalDate1 = null;
      let finalDate2 = null;
      let timestamp = null;
      let timestamp_end = null;
      if (!jsonElement.length) throw new Error("JSON data element not found");
      if (jsonElement && jsonElement.length > 0) {
        const variantData = JSON.parse(jsonElement.text());
        console.log("卡片产品的数据===", variantData);
        if (variantData) {
          // 处理多个变体的情况
          variantWithDiscount = findFirstVariantWithDiscount(variantData);
          if (variantWithDiscount) {
            // 找到有custom_discount的变体
            console.log("找到有custom_discount的变体:", variantWithDiscount);
            // 这里可以进行后续处理，比如显示折扣价等
            // 判断 custom_discount 是否包含 %
            if (
              variantWithDiscount.custom_discount &&
              variantWithDiscount.custom_discount.toString().indexOf("%") !== -1
            ) {
              console.log("当前变体custom_discount包含百分比");
              // 提取百分比数值
              let percent = parseFloat(variantWithDiscount.custom_discount);
              console.log("百分比数值：", percent);
              // 计算折扣金额（四舍五入取整）
              discount_value = Math.round(
                (variantWithDiscount.price * percent) / 100
              );
              console.log("折扣金额：", discount_value);
              // 实际售价
              price = variantWithDiscount.price - discount_value;
              console.log("实际售价：", price);
              compare_at_price = variantWithDiscount.price;
              UTCDate = variantWithDiscount.start_date;
              console.log("活动UTC开始时间：", UTCDate);
              UTCDate_end = variantWithDiscount.end_date;
              console.log("活动UTC结束时间：", UTCDate_end);
            } else if (variantWithDiscount.custom_discount !== "") {
              console.log("当前变体custom_discount为数值");
              discount_value = variantWithDiscount.custom_discount;
              console.log("折扣金额：", discount_value);
              price = variantWithDiscount.price - discount_value;
              console.log("实际售价：", price);
              compare_at_price = variantWithDiscount.price;
              UTCDate = variantWithDiscount.start_date;
              console.log("活动UTC开始时间：", UTCDate);
              UTCDate_end = variantWithDiscount.end_date;
              console.log("活动UTC结束时间：", UTCDate_end);
            } else {
              console.log("当前变体custom_discount为空");
              price = variantWithDiscount.price;
              discount_value = variantWithDiscount.custom_discount;
              compare_at_price = variantWithDiscount.compare_at_price;
              UTCDate = variantWithDiscount.start_date;
              console.log("活动UTC开始时间：", UTCDate);
              UTCDate_end = variantWithDiscount.end_date;
              console.log("活动UTC结束时间：", UTCDate_end);
            }
            finalDate = formatUtcTime(UTCDate);
            finalDate_end = formatUtcTime(UTCDate_end);
            finalDate1 = finalDate;
            finalDate2 = finalDate_end ? finalDate_end : null;
            timestamp = new Date(finalDate1).getTime();
            timestamp_end = finalDate2 ? new Date(finalDate2).getTime() : null;

            console.log("compare_at_price:", compare_at_price);
            console.log("当前折扣值:", discount_value);
          }
        }
        // 在 data-final-price 元素下查找 .money 子元素，并获取其文本值
        let moneyValue = window.formatMoney(price, format);
        if ($finalPrice.find(".money").length > 0) {
          $finalPrice.find(".money").text(moneyValue);
        } else {
          $finalPrice.text(moneyValue);
        }
        let originMoneyValue = window.formatMoney(compare_at_price, format);
        if ($originPrice.find(".money").length > 0) {
          $originPrice.find(".money").text(originMoneyValue);
        } else {
          $originPrice.text(originMoneyValue);
        }
        let difference_value = window.formatMoney(discount_value, format);
        if ($finalSalePrice.find(".money").length > 0) {
          $finalSalePrice.find(".money").text(difference_value);
        } else {
          $finalSalePrice.text(difference_value);
        }
        let show_discount_value = false;

        console.log("当前产品存在活动");
        const currentTimestamp = new Date().getTime();

        if (
          UTCDate === "" &&
          UTCDate_end === "" &&
          discount_value &&
          discount_value !== ""
        ) {
          show_discount_value = true;
        } else {
          if (
            UTCDate !== "" &&
            UTCDate_end === "" &&
            currentTimestamp >= timestamp
          ) {
            show_discount_value = true;
          } else if (
            UTCDate !== "" &&
            UTCDate_end !== "" &&
            timestamp_end > currentTimestamp &&
            currentTimestamp >= timestamp
          ) {
            show_discount_value = true;
          } else if (
            UTCDate === "" &&
            UTCDate_end !== "" &&
            timestamp_end > currentTimestamp
          ) {
            show_discount_value = true;
          } else {
            show_discount_value = false;
          }
        }
        console.log("show_discount_value==", show_discount_value);
        if (show_discount_value) {
          console.log("product存在 data-discount:", discount_value);
          if (discount_value && discount_value !== "") {
            $(this)
              .find("custom-automatic-discount-reminder")
              .css({ opacity: "1" });
            console.log("product-card 存在 data-discount:", discount_value);
            $(this).find(".activity-price-display").css("display", "block");
            $(this).find(".daily-price-display").css("display", "none");
            // 这里可以根据需要进行后续处理

            // 隐藏 custom-automatic-discount-reminder 下的 [data-final-price] 元素
            $finalPrice.css("display", "none");
            $(this).find(".badge.onsale").css("display", "none");
            console.log(
              "custom-automatic-discount-reminder 下 data-final-price 的 .money 值:",
              moneyValue
            );
            // 将 moneyValue 的值替换掉当前元素 .activity-price-display 下的 ins 下的 .money 元素的值
            const $productCardPriceAndButton = $(this).find(
              ".activity-price-display"
            );
            $productCardPriceAndButton.find("ins .money").text(moneyValue);
            $productCardPriceAndButton
              .find("del .money")
              .text(originMoneyValue);
          }
        } else {
          console.log("活动已结束");
          $(this)
            .find("custom-automatic-discount-reminder")
            .attr("style", "display: none !important;");
        }
      }
    });
  }
  /**
   * 渲染筛选模块及局部数量统计
   * @param {string} html
   * @param {Event} event
   */
  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");
    // 获取所有 collapsible-row组件（PC和移动端筛选）
    const facetDetailsElements = parsedHTML.querySelectorAll(
      "#FacetFiltersForm collapsible-row, #FacetFiltersFormMobile collapsible-row"
    );
    // 判断当前操作的 collapsible-row 索引
    const matchesIndex = (element) => {
      const jsFilter = event
        ? event.target.closest("collapsible-row")
        : undefined;
      return jsFilter
        ? element.dataset.index === jsFilter.dataset.index
        : false;
    };
    // 所有除当前操作项外的 collapsible-row
    const facetsToRender = Array.from(facetDetailsElements).filter(
      (element) => !matchesIndex(element)
    );
    // 当前操作的 collapsible-row（只渲染数量）
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    // 刷新各筛选项内容
    facetsToRender.forEach((element) => {
      document.querySelector(
        `collapsible-row[data-index="${element.dataset.index}"]`
      ).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    // 只刷新统计数字
    if (countsToRender)
      FacetFiltersForm.renderCounts(
        countsToRender,
        event.target.closest("collapsible-row")
      );
  }

  /**
   * 渲染当前所有已选筛选项
   * @param {Document} html
   */
  static renderActiveFacets(html) {
    const activeFacetElementSelectors = [".active-facets"];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML =
        activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false); // 允许点击
  }

  /**
   * 渲染额外的附加元素，比如移动端筛选计数
   * @param {Document} html
   */
  static renderAdditionalElements(html) {
    const mobileElementSelectors = [".mobile-filter-count"];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML =
        html.querySelector(selector).innerHTML;
    });
  }

  /**
   * 渲染数量徽章等附属数据
   * @param {Element} source
   * @param {Element} target
   */
  static renderCounts(source, target) {
    const targetElement = target.querySelector(".facets__selected");
    const sourceElement = source.querySelector(".facets__selected");

    if (sourceElement && targetElement) {
      target.querySelector(".facets__selected").outerHTML =
        source.querySelector(".facets__selected").outerHTML;
    }
  }

  /**
   * 更新URL地址栏（用于页面后退/前进功能和分享）
   * @param {string} searchParams 查询参数
   */
  static updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  }

  // 滚动逻辑抽出为函数，每次高亮active时都调用，包括初始化
  static scrollTabIntoView(activeTab) {
    console.log(activeTab);
    // 兼容jQuery对象和原生DOM对象
    let tab = activeTab instanceof $ ? activeTab.get(0) : activeTab;
    console.log("activeTab==", tab);
    console.log("this.tabContainer==", this.tabContainer);
    if (!tab || !this.tabContainer) return;

    // 利用scroll-margin和scroll-behavior: smooth实现居中高亮
    // 移除之前所有tab的scroll-margin
    const allTabs = this.tabContainer.querySelectorAll(".collection-tab");
    allTabs.forEach((t) => {
      t.style.scrollMarginLeft = "";
      t.style.scrollMarginRight = "";
    });

    // 计算tab居中所需的scroll-margin-left
    const containerWidth = this.tabContainer.clientWidth;
    const tabWidth = tab.offsetWidth;
    // scroll-margin让tab靠近容器中心
    tab.style.scrollMarginLeft = containerWidth / 2 - tabWidth - 48 + "px";
    // scrollIntoView自动滚动并带平滑效果
    tab.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    //  判断sub-collection-banner是否存在若存在的话，则img 自定义属性 data-index 等于.collection-tab.active的下表激活其余移除
    // 检查sub-collection-banner是否存在
    const subCollectionBanner = document.querySelector(
      ".sub-collection-banner"
    );
    if (subCollectionBanner) {
      // 获取当前激活tab的下标
      const activeTab = document.querySelector(".collection-tab.active");
      if (activeTab) {
        // data-index 下标（string）
        const activeIndex = activeTab.getAttribute("data-index");
        // console.log('激活的下表', activeIndex);
        // 获取所有 img[data-index]，只激活 ==activeIndex 的，移除其余的 active 类
        const imgs_pc = subCollectionBanner.querySelectorAll(
          ".pc-banner[data-index]"
        );
        imgs_pc.forEach(function (img) {
          if (img.getAttribute("data-index") === activeIndex) {
            // console.log('激活的img', img);
            img.classList.add("active");
          } else {
            img.classList.remove("active");
          }
        });
        const imgs_mb = subCollectionBanner.querySelectorAll(
          ".mb-banner[data-index]"
        );
        imgs_mb.forEach(function (img) {
          if (img.getAttribute("data-index") === activeIndex) {
            // console.log('移动端激活的img', img);
            img.classList.add("active");
          } else {
            img.classList.remove("active");
          }
        });
      }
    }
  }

  /**
   * 获取当前需要刷新的section数组，便于多区域同时刷新
   * @returns {Array} section数组
   */
  static getSections() {
    return [
      {
        section: document.getElementById("product-grid").dataset.id,
      },
    ];
  }

  /**
   * 表单提交处理程序
   * @param {Event} event
   */
  onSubmitHandler(event) {
    console.log("onSubmitHandler");
    event.preventDefault();
    const formData = new FormData(event.target.closest("form"));
    // 判断其父元素collection-tab是否存在
    let isInCollectionTab = false;
    const formElem = event.target.closest("form");
    // 判断formElem 的自定义属性data-search-type是否存在若存在则获取该值
    let searchType = null;
    if (formElem && formElem.hasAttribute("data-search-type")) {
      searchType = formElem.getAttribute("data-search-type");
      // 可根据需要后续使用 searchType
     console.log('data-search-type:', searchType);
    }
    let searchTypeValue = searchType ? `filter.p.m.custom.${searchType}` : "";
    if (formElem && formElem.querySelector(".collection-tab")) {
      isInCollectionTab = true;
      const targetValue = event.target.value;
      // 清除formData所有值
      for (let key of Array.from(formData.keys())) {
        formData.delete(key);
      }

      // 添加 filter.p.m.custom.machine_category=P13+Series
      if (searchTypeValue) {
        formData.append(searchTypeValue, targetValue);
      }
    } else {
      // 判断url中是否包含参数filter.p.m.custom.machine_category，若存在则formData添加对应的值
      const urlParams = new URLSearchParams(window.location.search);
      const machineCategoryValue = urlParams.get(searchTypeValue);
      if (machineCategoryValue) {
        formData.set(searchTypeValue, machineCategoryValue);
      }
    }

    // console.log('isInCollectionTab是否点击标签列表', isInCollectionTab);
    const searchParams = new URLSearchParams(formData);
    // console.log('输出searchParams参数:', searchParams.toString());
    // console.log('formData==', formData);
    // console.log('searchParams==', searchParams);
    // 如果最低价格为0，则移除参数
    if (searchParams.get("filter.v.price.gte") === "0.00") {
      searchParams.delete("filter.v.price.gte");
    }
    // 如果最高价格等于最大值，则移除参数
    if (document.querySelector(".price_slider")) {
      if (
        searchParams.get("filter.v.price.lte") ===
        parseFloat(document.querySelector(".price_slider").dataset.max).toFixed(
          2
        )
      ) {
        searchParams.delete("filter.v.price.lte");
      }
    }
    // 刷新页面
    FacetFiltersForm.renderPage(searchParams.toString(), event);
  }

  /**
   * 已激活筛选项的点击事件处理
   * @param {Event} event
   */
  onActiveFilterClick(event) {
    console.log("onActiveFilterClick");
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    // 获取url中的筛选参数
    const url =
      event.currentTarget.href.indexOf("?") == -1
        ? ""
        : event.currentTarget.href.slice(
            event.currentTarget.href.indexOf("?") + 1
          );
    // console.log('event.currentTarget.href==', event.currentTarget.href);
    // console.log('url==', url);
    FacetFiltersForm.renderPage(url);
  }
}

// 静态属性，缓存请求过的筛选区域HTML
FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1); // 初始参数
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1); // 上一次参数
customElements.define("facet-filters-form", FacetFiltersForm);
FacetFiltersForm.setListeners();

/**
 * 用于处理单一的filter item移除按钮
 */
class FacetRemove extends HTMLElement {
  constructor() {
    super();
    // 为所有a标签添加点击事件（移除筛选）
    this.querySelectorAll("a").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        const form =
          this.closest("facet-filters-form") ||
          document.querySelector("facet-filters-form");
        form.onActiveFilterClick(event);
      });
    });
  }
}

customElements.define("facet-remove", FacetRemove);

/**
 *  @class
 *  @function PriceSlider
 *  价格滑块组件，负责渲染滑块及处理change事件
 */
class PriceSlider extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    // 获取滑块及金额元素
    let slider = this.querySelector(".price_slider"),
      amounts = this.querySelector(".price_slider_amount"),
      args = {
        // 设置滑块初始值
        start: [
          parseFloat(slider.dataset.minValue || 0),
          parseFloat(slider.dataset.maxValue || slider.dataset.max),
        ],
        connect: true, // 双端
        step: 10, // 步进值
        range: {
          min: 0,
          max: parseFloat(slider.dataset.max),
        },
      },
      event = new CustomEvent("input"),
      form =
        this.closest("facet-filters-form") ||
        document.querySelector("facet-filters-form");

    // 如果已经初始化过，先销毁
    if (slider.classList.contains("noUi-target")) {
      slider.noUiSlider.destroy();
    }
    // 创建滑块
    noUiSlider.create(slider, args);

    // 每次滑动更新输入框值
    slider.noUiSlider.on("update", function (values) {
      amounts.querySelector(".field__input_min").value = values[0];
      amounts.querySelector(".field__input_max").value = values[1];
    });
    // 每次滑块变更触发表单input事件（自动刷新列表）
    slider.noUiSlider.on("change", function (values) {
      form.querySelector("form").dispatchEvent(event);
    });
  }
}
customElements.define("price-slider", PriceSlider);

// 页面加载时，初始化 FacetsToggle
window.addEventListener("load", () => {
  new FacetsToggle();
});
