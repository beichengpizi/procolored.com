// 封装成可复用的类
class ModuleSwitcher {
  /**
   * @param {HTMLElement|string} container 容器元素或选择器
   * @param {Object} moduleData 模块数据
   * @param {Object} [options] 其他配置
   */
  constructor(container, moduleData, options = {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    this.moduleData = moduleData;
    this.options = options;
    this.currentModule = 1;
    this.videoRefs = {};
    this.imageCache = {};
    this.videoCache = {};
    this.switching = false;
    this.uniqueId = "msw_" + Math.random().toString(36).slice(2, 10); // 避免冲突

    this._renderBase();
    this._fillNavItems();
    this._preloadAllMedia();
    this._bindEvents();

    // 初始内容淡入
    this.certificateSection.classList.add("fadein");
    // 初始时隐藏 certificate-placeholder
    this.certificatePlaceholder.style.visibility = "hidden";
    this.certificatePlaceholder.style.display = "none";

    this.showModule(1);
  }

  // 渲染基础结构
  _renderBase() {
    // 生成唯一的id前缀，避免多实例冲突
    const idPrefix = this.uniqueId + "_";

    // 组件HTML结构
    this.container.innerHTML = `
                <div class="k13-lite-hassle-free-maintenance-content-module">
                    <div class="k13-lite-hassle-free-maintenance-top-section" id="${idPrefix}top-section">
                        <div class="k13-lite-hassle-free-maintenance-left-text">
                            <div class="k13-lite-hassle-free-maintenance-pro-text"></div>
                            <div class="k13-lite-hassle-free-maintenance-color-precision-text"></div>
                        </div>
                        <div class="k13-lite-hassle-free-maintenance-right-text">
                            <div class="k13-lite-hassle-free-maintenance-g7-certified" id="${idPrefix}g7-certified"></div>
                            <div class="k13-lite-hassle-free-maintenance-description" id="${idPrefix}description"></div>
                        </div>
                    </div>
                    <div class="k13-lite-hassle-free-maintenance-certificate-section" id="${idPrefix}certificate-section">
                        <div id="${idPrefix}certificate-placeholder" style="width:100%;height:100%;min-height:1px;visibility:hidden;"></div>
                    </div>
                </div>
                <div class="k13-lite-hassle-free-maintenance-bottom-nav" id="${idPrefix}bottom-nav">
                    <div class="k13-lite-hassle-free-maintenance-nav-item active" data-module="1"></div>
                    <div class="k13-lite-hassle-free-maintenance-nav-item" data-module="2"></div>
                    <div class="k13-lite-hassle-free-maintenance-nav-item" data-module="3"></div>
               
                </div>
              
            `;

    // 缓存常用DOM
    this.idPrefix = idPrefix;
    this.topSection = this.container.querySelector(`#${idPrefix}top-section`);
    this.certificateSection = this.container.querySelector(
      `#${idPrefix}certificate-section`
    );
    this.certificatePlaceholder = this.container.querySelector(
      `#${idPrefix}certificate-placeholder`
    );
    this.bottomNav = this.container.querySelector(`#${idPrefix}bottom-nav`);
    this.proText = this.container.querySelector(
      ".k13-lite-hassle-free-maintenance-pro-text"
    );
    this.colorPrecisionText = this.container.querySelector(
      ".k13-lite-hassle-free-maintenance-color-precision-text"
    );
    this.g7Certified = this.container.querySelector(`#${idPrefix}g7-certified`);
    this.description = this.container.querySelector(`#${idPrefix}description`);
  }

  // 填充底部导航内容
  _fillNavItems() {
    this.bottomNav
      .querySelectorAll(".k13-lite-hassle-free-maintenance-nav-item")
      .forEach((item) => {
        const moduleId = parseInt(item.getAttribute("data-module"));
        if (this.moduleData[moduleId]) {
          item.textContent = this.moduleData[moduleId].title;
        }
      });
  }

  // 预加载所有模块的图片和视频
  _preloadAllMedia() {
    Object.values(this.moduleData).forEach((data) => {
      if (data.type === "image") {
        this._preloadImage(data.src);
      } else if (data.type === "video") {
        this._preloadVideo(data.src);
      }
    });
  }

  // 预加载图片
  _preloadImage(src) {
    if (!src || this.imageCache[src]) return;
    const img = new window.Image();
    img.src = src;
    this.imageCache[src] = img;
  }

  // 预加载视频（只预加载metadata，避免带宽压力）
  _preloadVideo(src) {
    if (!src || this.videoCache[src]) return;
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = src;
    this.videoCache[src] = video;
  }

  // 事件绑定
  _bindEvents() {
    // 底部导航点击
    this.bottomNav
      .querySelectorAll(".k13-lite-hassle-free-maintenance-nav-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          const moduleId = parseInt(item.getAttribute("data-module"));
          if (moduleId !== this.currentModule) {
            this.switchModule(moduleId);
          } else {
            // 如果点击的是当前激活的模块，重新播放视频
            if (this.moduleData[moduleId].type === "video") {
              this.restartVideo(moduleId);
            }
          }
        });
      });
  }

  // 切换模块
  switchModule(moduleId) {
    if (this.switching) return;
    this.switching = true;

    // 立即切换模块内容，不等待当前视频重置
    // 预加载即将切换的图片或视频
    const nextData = this.moduleData[moduleId];
    if (nextData.type === "image") {
      this._preloadImage(nextData.src);
    } else if (nextData.type === "video") {
      this._preloadVideo(nextData.src);
    }

    // 更新导航状态
    this.bottomNav
      .querySelectorAll(".k13-lite-hassle-free-maintenance-nav-item")
      .forEach((nav) => {
        nav.classList.remove("active");
      });
    this.bottomNav
      .querySelector(`[data-module="${moduleId}"]`)
      .classList.add("active");

    // 先赋值 currentModule，避免 showModule 里用到旧值
    const prevModule = this.currentModule;
    this.currentModule = moduleId;

    // 切换时隐藏 certificate-placeholder
    this.certificatePlaceholder.style.visibility = "hidden";
    this.certificatePlaceholder.style.display = "none";

    // 切换模块
    this.showModule(moduleId, () => {
      // 切换完成后再重置上一个视频（如果有）
      if (
        this.moduleData[prevModule] &&
        this.moduleData[prevModule].type === "video" &&
        this.videoRefs[prevModule]
      ) {
        this.videoRefs[prevModule].pause();
        this.videoRefs[prevModule].currentTime = 0;
      }
      this.switching = false;
    });
  }

  // 重新播放视频
  restartVideo(moduleId) {
    const video = this.videoRefs[moduleId];
    if (video) {
      video.currentTime = 0;
      video.play().catch(function (error) {
        // 视频自动播放失败
      });
    }
  }

  // 显示模块
  showModule(moduleId, cb) {
    const data = this.moduleData[moduleId];

    // 动画：先隐藏top-section
    this._animateContentOut(() => {
      // 更新顶部文本
      this._updateTopSection(data);

      // 渲染中间内容，等新内容ready后再显示
      this._renderCertificateSection(moduleId, () => {
        // 如果是视频模块，自动播放
        if (data.type === "video") {
          setTimeout(() => {
            this._playVideo(moduleId);
            // this._setupVideoControls(moduleId);
          }, 100);
        }
        // 动画：显示top-section
        this._animateContentIn();
        if (typeof cb === "function") cb();
      });
    });
  }

  // 平滑切换内容的辅助函数（无缝切换实现）
  _seamlessSwitchContent(newNode, callback) {
    // 优化：切换时隐藏 certificate-placeholder
    this.certificatePlaceholder.style.visibility = "hidden";
    this.certificatePlaceholder.style.display = "none";

    // 保留旧内容，插入新内容，重叠显示
    const oldNode = this.certificateSection.querySelector(
      ".k13-lite-hassle-free-maintenance-media-active"
    );
    newNode.classList.add("k13-lite-hassle-free-maintenance-media-next");
    newNode.style.position = "absolute";
    newNode.style.left = "0";
    newNode.style.top = "0";
    newNode.style.width = "100%";
    newNode.style.height = "100%";
    newNode.style.transition = "opacity 0.5s";
    newNode.style.opacity = "0";
    this.certificateSection.appendChild(newNode);

    // 触发重绘
    void newNode.offsetWidth;

    // 新内容淡入，旧内容淡出
    newNode.style.opacity = "1";
    if (oldNode) {
      oldNode.style.transition = "opacity 0.5s";
      oldNode.style.opacity = "0";
    }

    setTimeout(() => {
      // 移除旧内容，只保留新内容
      if (oldNode) this.certificateSection.removeChild(oldNode);
      newNode.classList.remove("k13-lite-hassle-free-maintenance-media-next");
      newNode.classList.add("k13-lite-hassle-free-maintenance-media-active");
      newNode.style.position = "";
      newNode.style.left = "";
      newNode.style.top = "";
      newNode.style.width = "100%";
      newNode.style.height = "";
      newNode.style.transition = "";
      newNode.style.opacity = "";
      if (typeof callback === "function") callback();
    }, 500);
  }

  // 动态渲染certificate-section内容，优化加载和无缝切换
  _renderCertificateSection(moduleId, callback) {
    const data = this.moduleData[moduleId];
    let newNode = null;

    // 切换时隐藏 certificate-placeholder（防止未隐藏）
    this.certificatePlaceholder.style.visibility = "hidden";
    this.certificatePlaceholder.style.display = "none";

    if (data.type === "image") {
      const imgDiv = document.createElement("div");
      imgDiv.className =
        "k13-lite-hassle-free-maintenance-image-container k13-lite-hassle-free-maintenance-media-active";
      imgDiv.style.width = "100%";

      const img = document.createElement("img");
      img.alt = data.alt || "";
      img.loading = "eager";
      img.style.opacity = "0";
      img.style.transition = "opacity 0.3s";
      img.style.width = "100%";

      img.src = data.src;
      imgDiv.appendChild(img);

      const showImage = () => {
        img.style.opacity = "1";
        this._seamlessSwitchContent(imgDiv, callback);
      };

      if (this.imageCache[data.src] && this.imageCache[data.src].complete) {
        showImage();
      } else {
        img.addEventListener("load", showImage);
      }
    } else if (data.type === "video") {
      const videoDiv = document.createElement("div");
      videoDiv.className =
        "k13-lite-hassle-free-maintenance-video-container k13-lite-hassle-free-maintenance-media-active";
      videoDiv.style.width = "100%";

      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.controls = false; // 永远不显示控制条
      video.style.background = "#000";
      // 增加循环播放视频
      video.loop = true;
      video.autoplay = true; // 增加自动播放
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("id", `${this.idPrefix}video-${moduleId}`);
      video.style.opacity = "0";
      video.style.transition = "opacity 0.3s";
      video.style.width = "100%";

      const source = document.createElement("source");
      source.src = data.src;
      source.type = "video/mp4";
      video.appendChild(source);
      video.appendChild(document.createTextNode("您的浏览器不支持视频播放。"));
      videoDiv.appendChild(video);
      this.videoRefs[moduleId] = video;

      const showVideo = () => {
        video.style.opacity = "1";
        this._seamlessSwitchContent(videoDiv, callback);
      };

      // 优化：视频元数据加载后再显示
      if (
        this.videoCache[data.src] &&
        this.videoCache[data.src].readyState >= 1
      ) {
        showVideo();
      } else {
        video.addEventListener("loadeddata", showVideo);
      }
    }
  }

  // 播放视频
  _playVideo(moduleId) {
    const video = this.videoRefs[moduleId];
    if (video) {
      // 优化：如果未加载完成，等待 loadeddata 后再播放
      if (video.readyState < 2) {
        video.addEventListener("loadeddata", function handler() {
          video.removeEventListener("loadeddata", handler);
          video.currentTime = 0;
          video.play().catch(function (error) {
            // 视频自动播放失败
          });
        });
      } else {
        video.currentTime = 0;
        video.play().catch(function (error) {
          // 视频自动播放失败
        });
      }
    }
  }

  // 更新顶部文本
  _updateTopSection(data) {
    this.proText.textContent = data.heading;
    this.colorPrecisionText.textContent = data.subheading;
    this.g7Certified.textContent = data.subtitle;
    this.description.innerHTML = data.description;
  }

  // 动画效果：隐藏top-section
  _animateContentOut(callback) {
    this.topSection.classList.remove("active");
    this.topSection.classList.add("hidden");
    setTimeout(() => {
      if (typeof callback === "function") callback();
    }, 300);
  }

  // 动画效果：显示top-section
  _animateContentIn() {
    this.topSection.classList.remove("hidden");
    setTimeout(() => {
      this.topSection.classList.add("active");
    }, 50);
  }

  // 视频控制
  _setupVideoControls(moduleId) {
    // 只为当前视频绑定一次 ended 事件
    const video = this.videoRefs[moduleId];
    if (video && !video._endedHandlerAdded) {
      video.addEventListener("ended", function () {
        // 不做任何处理，播放完毕后不循环
      });
      video._endedHandlerAdded = true;
    }
  }
}

// 示例数据（可自定义/复用）
const moduleData1 = {
  1: {
    heading: "Hassle-Free ",
    subheading: "Maintenance",
    title: "Automated Cleaning System",
    subtitle: "Automated Cleaning System",
    description:
      "The system operates on a fixed schedule and automatically initiates a cleaning cycle every 10 hours when the device is powered on.<br>This proactive maintenance prevents build up and reduces the risk of white ink clogging by up to 85%.",
    type: "video",
    src: "https://cdn.shopify.com/videos/c/o/v/bb0a207264804fd5a154a5381fc95b43.mp4",
  },
  2: {
    heading: "Hassle-Free ",
    subheading: "Maintenance",
    title: "White Ink Circulation",
    subtitle: "White Ink Circulation",
    description:
      "White ink is circulated every 30 minutes to prevent sedimentation and maintain consistent flow—ensuring smoother, more even printing every time.<br>By reducing clog-related wear, the circulation system helps extend printhead durability by up to 5×.",
    type: "video",
    src: "https://cdn.shopify.com/videos/c/o/v/2db0ec5605fc499ebd79c6a0ea448dde.mp4",
  },
  3: {
    heading: "Hassle-Free ",
    subheading: "Maintenance",
    title: "Printhead SafeGuard System",
    subtitle: "Smarter Protection, Longer Lifespan",
    description:
      "Our new Infrared Printhead SafeGuard System detects film warping and microscopic debris in real time, identifying foreign objects as small as 2 mm.<br> This proactive safeguard reduces 90% of common failures and responds instantly to potential hazards, helping to keep your printhead running longer and your costs lower.",
    type: "video",
    src: "https://cdn.shopify.com/videos/c/o/v/a76a42d6c5494c94b4cc99e039940dbc.mp4",
  },
};

// 第二个实例可用不同数据
const moduleData2 = {
  1: {
    heading: "Pro",
    subheading: "Color Precision",
    title: "Color Curve",
    subtitle: "Color Curve",
    description: "By using precisely calibrated color curves, users can avoid manual adjustments while achieving accurate color reproduction. This effectively resolves issues such as color cast and poor saturation, and ensures consistent results from the digital draft to the final transfer.",
    type: "video",
    src: "https://cdn.shopify.com/videos/c/o/v/03b79c19928048bbbc55da4faf5fdf4f.mp4",
  },
  2: {
    heading: "Pro",
    subheading: "Color Precision",
    title: "G7 Certified Color Accuracy",
    subtitle: "G7 Certified Color Accuracy",
    description: "The G7 color certification empowers the K13 Lite with exceptional color accuracy, from screen to fabric. It eliminates color deviation, ensuring that every pattern is perfectly reproduced on the fabric. That means smoother output, dependable color, and higher productivity.",
    type: "image",
    src: "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/PC_Pro_Color_Precision_02.jpg?v=1756375457",
  },
  3: {
    heading: "Pro",
    subheading: "Color Precision",
    title: "Procolored Studio Lite",
    subtitle: "Professional RIP Program",
    description: "Prcolored Studio Lite automatically detects image formats, accurately distinguishes between RGB and CMYK color modes, and intelligently matches preset color curves to ensure each hue is accurately translated onto the final print. It's easy for beginners to achieve high-quality results with precise and professional color reproduction.",
    type: "video",
    src: "https://cdn.shopify.com/videos/c/o/v/d0bef47aaa5e4e2ea343c6204d96044d.mp4",
  },
};

// 页面上调用，可多次实例化，互不干扰
document.addEventListener("DOMContentLoaded", function () {
  // 第一个实例
  new ModuleSwitcher("#module-switcher-1", moduleData1);
  // 第二个实例（演示多实例）
  new ModuleSwitcher("#module-switcher-2", moduleData2);
});
