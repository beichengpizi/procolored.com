(function () {
  // 定义每个tab对应的标题和副标题内容
  const tabContents = [
    {
      title: "Precision Color Delivery from Pixel to Fabric",
      desc: "",
      subtitle:
        "With 2 color options and switchable pixel themes right on the screen, turn every print into a playful, personal creation.",
    },
    {
      title: "Precision Color Delivery from Pixel to Fabric",
      desc: "",
      subtitle:
        "With 2 color options and switchable pixel themes right on the screen, turn every print into a playful, personal creation.",
    },
    {
      title: "K13 Lite Early Bird Benefit",
      desc: `<div class="k13-lite-pixel-to-fabric-desc-text-desc-text">Buy 1 get 1 free</div>
            <div class="k13-lite-pixel-to-fabric-desc-text-desc-bgIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 440 51" fill="none">
                <path d="M10.0743 36.6048C10.0743 36.6048 136.124 15.4996 148.747 18.6954C161.371 21.8913 100.522 42.9144 110.666 42.789C120.81 42.6637 317.364 7.85417 426.576 18.3584" stroke="url(#paint0_linear_7809_11498)" stroke-width="14.7364" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                <linearGradient id="paint0_linear_7809_11498" x1="10.2628" y1="25.539" x2="452.5" y2="29" gradientUnits="userSpaceOnUse">
                <stop stop-color="#31BBFF"/>
                <stop offset="1" stop-color="#B36CFF"/>
                </linearGradient>
                </defs>
              </svg>
            </div>`,
      subtitle:
        "Order now to win a hidden edition K13 Lite",
    },
  ];

  const titleEl = document.getElementById("k13-lite-pixel-to-fabric-title"); 
  const descEl = document.getElementById("k13-lite-pixel-to-fabric-desc");
  const subtitleEl = document.getElementById("k13-lite-pixel-to-fabric-subtitle");

  // 初始化 Swiper 3.4.2
  let swiper;
  document.addEventListener("DOMContentLoaded", function () {
    swiper = new Swiper(".k13-lite-pixel-to-fabric-swiper", {
      pagination: {
        el: ".k13-pagination",
        clickable: true,
      },
      speed: 600,
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      slidesPerView: 1,
      autoHeight: true,
      // Swiper 4.x 事件
      on: {
        slideChange: function () {
          updateTabs(this.activeIndex);
          updateTitle(this.activeIndex);
        },
      }
    });
  });



  // 将tabs的声明和相关函数提前，确保不会出现“Cannot access 'tabs' before initialization”错误
  let tabs;
  document.addEventListener("DOMContentLoaded", function () {
    tabs = document.querySelectorAll(".k13-lite-pixel-to-fabric-tab");
    for (let i = 0; i < tabs.length; i++) {
      (function (btn, idx) {
        btn.addEventListener("click", function () {
          // 修复：点击当前tab时也要立即添加is-active
          updateTabs(idx);
          updateTitle(idx); // 修复：点击tab时立即更新标题
          if (swiper) {
            swiper.slideTo(idx);
          }
        });
      })(tabs[i], Number(tabs[i].dataset.slide || 0));
    }
  });

  function updateTabs(activeIndex) {
    for (let i = 0; i < tabs.length; i++) {
      let btn = tabs[i];
      let isActive = Number(btn.dataset.slide) === activeIndex;
      if (isActive) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
      } else {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-selected", "false");
      }
    }
  }

  function updateTitle(idx) {
    if (tabContents[idx]) {
      titleEl.innerHTML = tabContents[idx].title;
      if (descEl) {
        descEl.innerHTML = tabContents[idx].desc;
      }
      if (subtitleEl) {
        subtitleEl.innerHTML = tabContents[idx].subtitle;
      }
    }
  }

  // 新增：当.k13-lite-pixel-to-fabric-tabs出现在视窗顶部时，锁定页面滚动，滚动/滑动切换slide，最后一张才允许滚动
  // 等待资源加载完成再执行
  // window.addEventListener('DOMContentLoaded', function () {
  //   const { animate, scroll, inView } = Motion;
  //   inView("#k13-lite-pixel-to-fabric", (element, info) => {
  //    alert("hello")
  //     console.log("The link ", element, " has entered the viewport")
  //   });
  // });
  // 监听鼠标滚轮事件，切换swiper，首尾slide时允许页面滚动
  // 修复：限制切换速度，防止滚动过快或过慢导致切换异常
  // 同时兼容PC端鼠标滚轮和移动端触摸滑动切换swiper
  (function () {
    let lastSwitchTime = 0;
    const switchInterval = 400; // 最小切换间隔，单位ms，可根据需要调整

    // PC端：监听鼠标滚轮
    $('#k13-lite-pixel-to-fabric-image-wrapper').on('mousewheel', function (event, delta) {
      if (!swiper) return;

      const now = Date.now();
      if (now - lastSwitchTime < switchInterval) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      const isFirst = swiper.activeIndex === 0;
      const isLast = swiper.activeIndex === swiper.slides.length - 1;

      if (delta < 0) {
        // 向下滚动
        if (!isLast) {
          swiper.slideNext();
          lastSwitchTime = now;
          event.preventDefault();
          event.stopPropagation();
          return false;
        } else {
          return true;
        }
      } else if (delta > 0) {
        // 向上滚动
        if (!isFirst) {
          swiper.slidePrev();
          lastSwitchTime = now;
          event.preventDefault();
          event.stopPropagation();
          return false;
        } else {
          return true;
        }
      }
      return true;
    });

    // 移动端：监听触摸滑动
    let touchStartY = 0;
    let touchEndY = 0;
    let isTouching = false;

    const pixelToFabricEl = document.getElementById('k13-lite-pixel-to-fabric');
    if (pixelToFabricEl) {
      pixelToFabricEl.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
          isTouching = true;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      pixelToFabricEl.addEventListener('touchmove', function (e) {
        if (!isTouching) return;
        touchEndY = e.touches[0].clientY;
      }, { passive: true });

      pixelToFabricEl.addEventListener('touchend', function (e) {
        if (!isTouching || !swiper) return;
        isTouching = false;

        const now = Date.now();
        if (now - lastSwitchTime < switchInterval) {
          return;
        }

        const deltaY = touchEndY - touchStartY;
        const threshold = 40; // 滑动阈值，单位px

        const isFirst = swiper.activeIndex === 0;
        const isLast = swiper.activeIndex === swiper.slides.length - 1;

        if (Math.abs(deltaY) > threshold) {
          if (deltaY < 0) {
            // 向上滑动（页面向下滚动，下一页）
            if (!isLast) {
              swiper.slideNext();
              lastSwitchTime = now;
              e.preventDefault && e.preventDefault();
              e.stopPropagation && e.stopPropagation();
            }
            // 最后一页允许页面继续滚动
          } else if (deltaY > 0) {
            // 向下滑动（页面向上滚动，上一页）
            if (!isFirst) {
              swiper.slidePrev();
              lastSwitchTime = now;
              e.preventDefault && e.preventDefault();
              e.stopPropagation && e.stopPropagation();
            }
            // 第一页允许页面继续滚动
          }
        }
        // 重置
        touchStartY = 0;
        touchEndY = 0;
      }, { passive: false });
    }
  })();

  // 等待页面加载完成后再执行初始化
  document.addEventListener("DOMContentLoaded", function () {
    updateTitle(0);
    updateTabs(0);
  });
  // 页面所有进度条倒计时 vipProgressBar  editionProgressBar fabricProgressBar
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
      (date.getMinutes() < 10
        ? "0" + date.getMinutes()
        : date.getMinutes()) +
      ":" +
      (date.getSeconds() < 10
        ? "0" + date.getSeconds()
        : date.getSeconds())
    );
  }


  // 进度条  Precision Color Delivery from Pixel to Fabric
  const fabricProgressBar = document.getElementById("fabricProgressBar");
  const fabricProgressPoints = document.querySelectorAll(".k13-lite-pixel-to-fabric-progress-point");
  const fabricTimelineContainer = document.querySelector(".k13-lite-pixel-to-fabric-timeline-container");
  const fabricStartDateUTC = "2025-09-01T21:00:00-08:00";
  const fabricFirstPhaseEndUTC = "2025-10-10T21:00:00-08:00";
  const fabricSecondPhaseEndUTC = "2025-10-20T21:00:00-08:00";
  const fabricThirdPhaseEndUTC = "2025-10-31T21:00:00-08:00";

  // 创建 fabricObserver Intersection Observer
  const fabricObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && fabricProgressBar) {
          // 添加动画类
          fabricProgressBar.classList.add("animate");
          fabricCalculateProgress(
            fabricStartDateUTC,
            fabricFirstPhaseEndUTC,
            fabricSecondPhaseEndUTC,
            fabricThirdPhaseEndUTC,
            fabricProgressBar,
            fabricProgressPoints
          );
          fabricObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  if (fabricTimelineContainer) {
    fabricObserver.observe(fabricTimelineContainer);
  }

  // 计算进度（根据当前日期按比例计算）
  function fabricCalculateProgress(
    startDateUTC,
    firstPhaseEndUTC,
    secondPhaseEndUTC,
    thirdPhaseEndUTC,
    progressBar,
    progressPoints
  ) {
    // 如果 progressBar 为空，直接返回，防止报错
    if (!progressBar) {
      return;
    }
    const now = formatUtcTime(new Date().toUTCString());
    const nowDateTimestamp = new Date(now).getTime();
    const startDate = formatUtcTime(startDateUTC);
    const firstPhaseEnd = formatUtcTime(firstPhaseEndUTC);
    const secondPhaseEnd = formatUtcTime(secondPhaseEndUTC);
    const thirdPhaseEnd = formatUtcTime(thirdPhaseEndUTC);

    // 新增对应的时间戳（毫秒数）
    const startDateTimestamp = new Date(startDate).getTime();
    const firstPhaseEndTimestamp = new Date(firstPhaseEnd).getTime();
    const secondPhaseEndTimestamp = new Date(secondPhaseEnd).getTime();
    const thirdPhaseEndTimestamp = new Date(thirdPhaseEnd).getTime();

    // 计算天数差
    const getDaysDifference = (date1, date2) => {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    };

    let progress = 0;
    // 进度规则：
    // 未到startDate，进度为0
    if (nowDateTimestamp < startDateTimestamp) {
      progress = 0;
    }
    // 第一阶段：startDate ~ firstPhaseEnd，0%~15%
    else if (nowDateTimestamp >= startDateTimestamp && nowDateTimestamp < firstPhaseEndTimestamp) {
      const totalDays = getDaysDifference(startDate, firstPhaseEnd);
      const passedDays = getDaysDifference(startDate, now);
      progress = 0 + ((passedDays / totalDays) * (15 - 0));
      if (progress > 15) progress = 15;
    }
    // 第二阶段：firstPhaseEnd ~ secondPhaseEnd，15%~50%
    else if (nowDateTimestamp >= firstPhaseEndTimestamp && nowDateTimestamp < secondPhaseEndTimestamp) {
      const totalDays = getDaysDifference(firstPhaseEnd, secondPhaseEnd);
      const passedDays = getDaysDifference(firstPhaseEnd, now);
      progress = 15 + ((passedDays / totalDays) * (50 - 15));
      if (progress > 50) progress = 50;
    }
    // 第三阶段：secondPhaseEnd ~ thirdPhaseEnd，50%~85%
    else if (nowDateTimestamp >= secondPhaseEndTimestamp && nowDateTimestamp < thirdPhaseEndTimestamp) {
      const totalDays = getDaysDifference(secondPhaseEnd, thirdPhaseEnd);
      const passedDays = getDaysDifference(secondPhaseEnd, now);
      progress = 50 + ((passedDays / totalDays) * (85 - 50));
      if (progress > 85) progress = 85;
    }
    // 超过thirdPhaseEnd，进度为85%~100%
    else if (nowDateTimestamp >= thirdPhaseEndTimestamp) {
      // 这里假设超过thirdPhaseEnd后进度直接为100%
      progress = 100;
    }

    // 确保进度在0-100之间
    progress = Math.max(0, Math.min(100, progress));
    console.log("进度==", progress);

    // 判断是否为移动端
    const isMobile = window.innerWidth <= 768;

    // 根据设备类型设置不同的transform-origin和transform
    if (isMobile) {
      console.log("移动端");
      progressBar.style.transformOrigin = "top";
      progressBar.style.transform = `scaleY(${progress / 100})`;
      progressBar.style.height = `${progress}%`;
    } else {
      console.log("pc端");
      progressBar.style.width = `${progress}%`;
      progressBar.style.transformOrigin = "left";
      progressBar.style.transform = `scaleX(${progress / 100})`;
    }

    // 更新点的状态
    // 4个点：第一个15%，第二个50%，第三个85%，第四个100%
    const pointThresholds = [15, 50, 85, 100];
    progressPoints.forEach((point, index) => {
      if (progress >= pointThresholds[index]) {
        point.classList.add("completed");
        // 获取当前点的祖先元素
        const progressBarAncestor = point.closest('.k13-lite-pixel-to-fabric-content-bottom-progress-bar');
        if (progressBarAncestor) {
          const dateSection = progressBarAncestor.querySelector('.k13-lite-pixel-to-fabric-date-section');
          if (dateSection) {
            const datePoints = dateSection.querySelectorAll('.date-point');
            const currentDatePoint = datePoints[index];
            if (currentDatePoint) {
              const joinButton = currentDatePoint.querySelector('.k13-lite-pixel-to-fabric-join-button');
              if (joinButton) {
                joinButton.classList.add('active');
              }
            }
          }
          const dateSection_mb = progressBarAncestor.querySelector('.k13-lite-pixel-to-fabric-progress-text-container');
          if (dateSection_mb) {
            const datePoints_mb = dateSection_mb.querySelectorAll('.progress-text-item');
            const currentDatePoint_mb = datePoints_mb[index];
            if (currentDatePoint_mb) {
              const joinButton_mb = currentDatePoint_mb.querySelector('.k13-lite-pixel-to-fabric-join-button');
              if (joinButton_mb) {
                joinButton_mb.classList.add('active');
              }
            }
          }
        }
      } else {
        point.classList.remove("completed");
      }
    });
  }

  // 初始化进度
  if (fabricProgressBar) {
    fabricCalculateProgress(
      fabricStartDateUTC,
      fabricFirstPhaseEndUTC,
      fabricSecondPhaseEndUTC,
      fabricThirdPhaseEndUTC,
      fabricProgressBar,
      fabricProgressPoints
    );
  }

  // 监听窗口大小变化
  window.addEventListener("resize", function () {
    if (fabricProgressBar) {
      fabricCalculateProgress(
        fabricStartDateUTC,
        fabricFirstPhaseEndUTC,
        fabricSecondPhaseEndUTC,
        fabricThirdPhaseEndUTC,
        fabricProgressBar,
        fabricProgressPoints
      );
    }
  });
})();