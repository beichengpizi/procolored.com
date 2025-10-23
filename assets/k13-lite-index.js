

// k13-lite-bg-img 背景图轮播 start
(function () {
  // 初始化 Swiper 4.4.2，设置为自动循环切换
  new Swiper(".k13-lite-bg-img-swiper", {
    pagination: {
      el: ".k13-lite-bg-img-swiper-pagination",
      clickable: true,
    },
    speed: 1000,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    slidesPerView: 1,
    // autoHeight: true,
    autoplay: {
      delay: 2000, // 每3秒切换一次
      disableOnInteraction: false, // 用户操作后仍然自动切换
    },
    loop: true, // 循环播放
  });
})();

// k13-lite-bg-img 背景图轮播 end

(function () {
  const bgSwiper= new Swiper('.k13-lite-bg-img-swiper-2', {
    pagination: {
      el: ".k13-lite-bg-img-swiper-pagination-2",
      clickable: true,
    },
    speed: 1000,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    slidesPerView: 1,
    // autoHeight: true,
    autoplay: {
      delay: 3000, // 每3秒切换一次
      disableOnInteraction: false, // 用户操作后仍然自动切换
    },
    loop: true, // 循环播放
  
  });
  // let lastSwitchTime = 0;
  // const switchInterval = 200; // 最小切换间隔，单位ms，可根据需要调整

  // // PC端：监听鼠标滚轮
  // $('#k13-lite-bg-img-swiper-2').on('mousewheel', function (event, delta) {
  //   if (!bgSwiper) return;

  //   const now = Date.now();
  //   if (now - lastSwitchTime < switchInterval) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     return false;
  //   }

  //   const isFirst = bgSwiper.activeIndex === 0;
  //   const isLast = bgSwiper.activeIndex === bgSwiper.slides.length - 1;

  //   if (delta < 0) {
  //     // 向下滚动
  //     if (!isLast) {
  //       bgSwiper.slideNext();
  //       lastSwitchTime = now;
  //       event.preventDefault();
  //       event.stopPropagation();
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   } else if (delta > 0) {
  //     // 向上滚动
  //     if (!isFirst) {
  //       bgSwiper.slidePrev();
  //       lastSwitchTime = now;
  //       event.preventDefault();
  //       event.stopPropagation();
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   }
  //   return true;
  // });

  // // 移动端：监听触摸滑动
  // let touchStartY = 0;
  // let touchEndY = 0;
  // let isTouching = false;

  // const pixelToFabricEl = document.getElementById('k13-lite-bg-img-swiper-2');
  // if (pixelToFabricEl) {
  //   pixelToFabricEl.addEventListener('touchstart', function (e) {
  //     if (e.touches.length === 1) {
  //       isTouching = true;
  //       touchStartY = e.touches[0].clientY;
  //     }
  //   }, { passive: true });

  //   pixelToFabricEl.addEventListener('touchmove', function (e) {
  //     if (!isTouching) return;
  //     touchEndY = e.touches[0].clientY;
  //   }, { passive: true });

  //   pixelToFabricEl.addEventListener('touchend', function (e) {
  //     if (!isTouching || !bgSwiper) return;
  //     isTouching = false;

  //     const now = Date.now();
  //     if (now - lastSwitchTime < switchInterval) {
  //       return;
  //     }

  //     const deltaY = touchEndY - touchStartY;
  //     const threshold = 40; // 滑动阈值，单位px

  //     const isFirst = bgSwiper.activeIndex === 0;
  //     const isLast = bgSwiper.activeIndex === bgSwiper.slides.length - 1;

  //     if (Math.abs(deltaY) > threshold) {
  //       if (deltaY < 0) {
  //         // 向上滑动（页面向下滚动，下一页）
  //         if (!isLast) {
  //           bgSwiper.slideNext();
  //           lastSwitchTime = now;
  //           e.preventDefault && e.preventDefault();
  //           e.stopPropagation && e.stopPropagation();
  //         }
  //         // 最后一页允许页面继续滚动
  //       } else if (deltaY > 0) {
  //         // 向下滑动（页面向上滚动，上一页）
  //         if (!isFirst) {
  //           bgSwiper.slidePrev();
  //           lastSwitchTime = now;
  //           e.preventDefault && e.preventDefault();
  //           e.stopPropagation && e.stopPropagation();
  //         }
  //         // 第一页允许页面继续滚动
  //       }
  //     }
  //     // 重置
  //     touchStartY = 0;
  //     touchEndY = 0;
  //   }, { passive: false });
  // }
})();

// k13-lite 产品 参数表格 start
document.addEventListener("DOMContentLoaded", function () {
  const learnMoreBtn = document.querySelector(".learn-more-btn");
  const hiddenRows = document.querySelectorAll(".mobile-hidden-new");
  let isExpanded = false;

  learnMoreBtn.addEventListener("click", function () {
    isExpanded = !isExpanded;
    hiddenRows.forEach((row) => {
      row.style.display = isExpanded ? "flex" : "none";
    });
    learnMoreBtn.innerHTML = isExpanded ? `Show less<svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
<path d="M9 6L5 1L1 6" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"/>
</path>
    </svg>` : `Learn more <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
      <path d="M9 1L5 6L1 1" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;
  });
});

// <!-- faq 事件 --> 解决移动端点击时背景闪烁问题，使用 touchstart 阻止点击高亮
document.addEventListener("DOMContentLoaded", function () {
  var faqItems = document.querySelectorAll(".ugc-faq-container-content-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(
      ".ugc-faq-container-content-item-question"
    );
    // 阻止移动端点击高亮（闪烁）
    question.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault(); // 阻止默认的点击高亮
        // 手动触发点击事件
        this.click();
      },
      { passive: false }
    );
    question.addEventListener("click", function (e) {
      // 如果当前item已激活，则移除active，实现随时切换
      if (item.classList.contains("active")) {
        item.classList.remove("active");
      } else {
        // 移除所有的active
        faqItems.forEach(function (i) {
          i.classList.remove("active");
        });
        // 给当前点击的item添加active
        item.classList.add("active");
      }
    });
  });
});

// 等待页面加载完成
document.addEventListener("DOMContentLoaded", function () {


  // 初始化Fancybox
  $('[data-fancybox="video"]').fancybox({
    type: "iframe",
    iframe: {
      css: {
        width: "100%",
        height: "100%",
      },
    },
    beforeLoad: function (instance, slide) {
      // 将YouTube链接转换为嵌入链接
      let url = slide.src;
      if (url.indexOf("youtu.be") !== -1) {
        let videoId = url.split("youtu.be/")[1];
        slide.src =
          "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0";
      } else if (url.indexOf("youtube.com/watch") !== -1) {
        let videoId = url.split("v=")[1];
        const ampersandPosition = videoId.indexOf("&");
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
        slide.src =
          "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0";
      }
    },
    afterClose: function () {
      // 关闭弹窗后销毁iframe内容
      $(".fancybox-iframe").attr("src", "");
    },
  });

  // 更新导航按钮状态
  function updateNavigationButtons() {
    const prevButton = document.getElementById(
      "k13-lite-customers-are-saying-prevButton"
    );
    const nextButton = document.getElementById(
      "k13-lite-customers-are-saying-nextButton"
    );

    prevButton.disabled =
      k13_lite_customers_are_saying_swiper_container_swiper.isBeginning;
    nextButton.disabled =
      k13_lite_customers_are_saying_swiper_container_swiper.isEnd;
  }

  // 动态计算 slidesOffsetBefore，使其在1920px时为360px，响应式自适应
  function getSlidesOffsetBefore() {
    const winWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    // 设计稿为1920px，左边距为360px，按比例缩放
    if (winWidth >= 1920) {
      return 360;
    } else if (winWidth <= 1024) {
      // 在breakpoints中已单独设置
      return 0;
    } else {
      // 其余宽度按比例缩放
      return Math.round(360 * (winWidth / 1920));
    }
  }

  let k13_lite_customers_are_saying_swiper_container_swiper = null;
  function initk13_lite_customers_are_saying_swiper_container_swiper() {
    if (k13_lite_customers_are_saying_swiper_container_swiper) {
      k13_lite_customers_are_saying_swiper_container_swiper.destroy(true, true);
    }
    k13_lite_customers_are_saying_swiper_container_swiper = new Swiper(
      ".k13-lite-customers-are-saying-swiper-container",
      {
        slidesPerView: 4.1,
        spaceBetween: 20,
        navigation: {
          nextEl: "#k13-lite-customers-are-saying-nextButton",
          prevEl: "#k13-lite-customers-are-saying-prevButton",
        },

        slidesOffsetBefore: getSlidesOffsetBefore(),
        loopedSlides: 10, // slidesPerView设置为非整数（如1.2）时，可能会出现循环问题添加此行，指定循环所需的额外幻灯片数量
        observer: true, //开启动态检查器，监测swiper和slide
        observeParents: true, //监测Swiper 的祖/父元素

        on: {},
        breakpoints: {
          //当宽度小于等于1024时显示

          1024: {
            slidesPerView: 3.5,
            spaceBetween: 15,
            slidesOffsetBefore: 0,
          },
          //当宽度小于等于768时显示
          768: {
            slidesOffsetBefore: 24,
            slidesOffsetAfter: 24,
            slidesPerView: 1.2,
            spaceBetween: 12,
          },
        },
      }
    );
  }

  // 初始化swiper
  initk13_lite_customers_are_saying_swiper_container_swiper();
  // 监听滑动事件
  k13_lite_customers_are_saying_swiper_container_swiper.on(
    "slideChange",
    updateNavigationButtons
  );
  k13_lite_customers_are_saying_swiper_container_swiper.on(
    "init",
    updateNavigationButtons
  );

  // 只监听PC端窗口变化，移动端（宽度小于等于1024px）不监听
  window.addEventListener("resize", function () {
    const winWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    if (winWidth > 1024) {
      initk13_lite_customers_are_saying_swiper_container_swiper();
    }
  });
});


// 图片地址没有规律性，自己可随时更换对应的图片地址

// 设计和材质的顺序与data-design-index/data-materials-index一致
// 这里用一个二维数组，图片地址可随时更换
// images[designIndex][materialsIndex] = 图片地址

const images = [
  // 设计0
  [
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0101.png?v=1755761193", // 材质0
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0201_6f224cdf-16c1-41c9-9f6b-64e970b7779e.png?v=1755761652", // 材质1
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0301.png?v=1755761916", // 材质2
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0401.png?v=1755761958", // 材质3
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0501.png?v=1755761990", // 材质4
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0601.png?v=1755762019", // 材质5
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0701.png?v=1755762042", // 材质6
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0801.png?v=1755762061", // 材质7
  ],
  // 设计1
  [
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0102.png?v=1755761193",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0202.png?v=1755761652",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0302.png?v=1755761916",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0402.png?v=1755761958",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0502.png?v=1755761990",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0602.png?v=1755762018",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0702.png?v=1755762042",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0802.png?v=1755762061",
  ],
  // 设计2
  [
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0103.png?v=1755761193",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0203.png?v=1755761652",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0303.png?v=1755761916",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0403.png?v=1755761958",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0503.png?v=1755761990",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0603.png?v=1755762018",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0703.png?v=1755762042",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0803.png?v=1755762061",
  ],
  // 设计3
  [
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0104.png?v=1755761193",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0204.png?v=1755761652",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0304.png?v=1755761916",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0404.png?v=1755761958",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0504.png?v=1755761990",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0604.png?v=1755762018",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0704.png?v=1755762042",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0804.png?v=1755762061",
  ],
  // 设计4
  [
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0105.png?v=1755761193",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0205.png?v=1755761652",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0305.png?v=1755761916",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0405.png?v=1755761958",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0505.png?v=1755761990",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0605.png?v=1755762018",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0705.png?v=1755762042",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0805.png?v=1755762061",
  ],
  // 设计5
  [
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0106.png?v=1755761193",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0206.png?v=1755761652",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0306.png?v=1755761916",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0406.png?v=1755761958",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0506.png?v=1755761990",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0606.png?v=1755762018",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0706.png?v=1755762042",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0806.png?v=1755762061",
  ],
  // 设计6
  [
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0107.png?v=1755761193",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0207.png?v=1755761652",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0307.png?v=1755761916",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0407.png?v=1755761958",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0507.png?v=1755761990",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0607.png?v=1755762018",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0707.png?v=1755762042",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0807.png?v=1755762061",
  ],
  // 设计7
  [
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0108.png?v=1755761193",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0208.png?v=1755761652",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0308.png?v=1755761916",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0408.png?v=1755761958",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0508.png?v=1755761990",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0608.png?v=1755762018",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0708.png?v=1755762042",
    "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/0808.png?v=1755762061",
  ],
];

// 当前激活的索引
let currentDesignIndex = 0;
let currentMaterialsIndex = 0;

function updateMainImage() {
  const img = document.getElementById('k13-lite-can-really-do-main-img');
  img.src = images[currentDesignIndex][currentMaterialsIndex];
}

// 绑定点击事件
document.addEventListener('DOMContentLoaded', function () {
  // 设计
  const designImgs = document.querySelectorAll('.k13-lite-can-really-do-content-options-item-design');
  designImgs.forEach(function (el) {
    el.addEventListener('click', function () {
      // 移除所有active
      designImgs.forEach(function (e2) { e2.classList.remove('active'); });
      el.classList.add('active');
      currentDesignIndex = parseInt(el.getAttribute('data-design-index'));
      updateMainImage();
    });
  });

  // 材质
  const materialsImgs = document.querySelectorAll('.k13-lite-can-really-do-content-options-item-materials');
  materialsImgs.forEach(function (el) {
    el.addEventListener('click', function () {
      // 移除所有active
      materialsImgs.forEach(function (e2) { e2.classList.remove('active'); });
      el.classList.add('active');
      currentMaterialsIndex = parseInt(el.getAttribute('data-materials-index'));
      updateMainImage();
    });
  });

  // 初始化图片
  updateMainImage();
});


// 增加tab点击切换功能
(function () {
  const k13_lite_parameter_table_tabs = document.querySelectorAll('.k13-lite-parameter-table-tab');
  let k13_lite_parameter_table_product_img = document.querySelector('.k13-lite-parameter-table-product-img');
  const whatsInTheBoxWrapper = document.querySelector('.whats-in-the-box-wrapper');
  const whatsInTheBoxContainerContentImg = document.querySelector('.whats-in-the-box-container-content-img img');
  k13_lite_parameter_table_tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // 移除所有tab的is-active
      k13_lite_parameter_table_tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      // 当前tab加is-active
      this.classList.add('is-active');
      this.setAttribute('aria-selected', 'true');
      // 替换图片
      const newImg = this.getAttribute('data-img');
      const newPackedImg = this.getAttribute('data-packed-img');
      if (k13_lite_parameter_table_product_img && newImg) {
        k13_lite_parameter_table_product_img.setAttribute('src', newImg);
      }
      if (whatsInTheBoxContainerContentImg && newPackedImg) {
        whatsInTheBoxContainerContentImg.setAttribute('src', newPackedImg);
      }
      // 获取当前tab的data-color属性
      const color = this.getAttribute('data-color');
      if (whatsInTheBoxWrapper) {
        if (color === 'pink') {
          whatsInTheBoxWrapper.classList.add('pink');
        } else {
          whatsInTheBoxWrapper.classList.remove('pink');
        }
      }
    });
  });
})();
