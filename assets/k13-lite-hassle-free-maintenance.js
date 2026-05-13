class ModuleSwitcher {
  constructor(container) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!this.container || this.container.dataset.moduleSwitcherInited === "true") {
      return;
    }

    this.container.dataset.moduleSwitcherInited = "true";
    this.switching = false;
    this.navItems = Array.from(
      this.container.querySelectorAll(".k13-lite-hassle-free-maintenance-nav-item")
    );
    this.panels = Array.from(this.container.querySelectorAll("[data-module-panel]"));
    this.topSection = this.container.querySelector(
      ".k13-lite-hassle-free-maintenance-top-section"
    );
    this.proText = this.container.querySelector(
      ".k13-lite-hassle-free-maintenance-pro-text"
    );
    this.colorPrecisionText = this.container.querySelector(
      ".k13-lite-hassle-free-maintenance-color-precision-text"
    );
    this.subtitle = this.container.querySelector(
      ".k13-lite-hassle-free-maintenance-g7-certified"
    );
    this.description = this.container.querySelector(
      ".k13-lite-hassle-free-maintenance-description"
    );

    this.currentModule = this._getInitialModule();
    this._bindEvents();
    this._syncModule(this.currentModule, false);
    this._bindAutoplayRetries();
  }

  _getInitialModule() {
    const activeNav = this.navItems.find((item) => item.classList.contains("active"));
    const activePanel = this.panels.find((panel) =>
      panel.classList.contains("k13-lite-hassle-free-maintenance-media-active")
    );

    return (
      activeNav?.dataset.module ||
      activePanel?.dataset.modulePanel ||
      this.panels[0]?.dataset.modulePanel ||
      "1"
    );
  }

  _bindEvents() {
    this.navItems.forEach((item) => {
      item.addEventListener("click", () => {
        this.switchModule(item.dataset.module);
      });

      item.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        this.switchModule(item.dataset.module);
      });
    });
  }

  _bindAutoplayRetries() {
    const playIfVisible = () => {
      if (this._isContainerInViewport()) {
        this._playCurrentWithRetry();
      }
    };

    window.addEventListener("pageshow", playIfVisible);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        playIfVisible();
      }
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this._playCurrentWithRetry();
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(this.container);
    } else {
      window.addEventListener("scroll", playIfVisible, { passive: true });
      window.addEventListener("resize", playIfVisible);
      playIfVisible();
    }
  }

  _isContainerInViewport() {
    if (!this.container || this.container.offsetParent === null) return false;

    const rect = this.container.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < viewportHeight &&
      rect.left < viewportWidth
    );
  }

  switchModule(moduleId) {
    if (!moduleId || this.switching) return;

    if (moduleId === this.currentModule) {
      this.restartVideo(moduleId);
      return;
    }

    const nextPanel = this._getPanel(moduleId);
    if (!nextPanel) return;

    this.switching = true;
    const previousPanel = this._getPanel(this.currentModule);
    this._setNavActive(moduleId);
    this._pausePanelVideo(previousPanel);

    this._animateContentOut(() => {
      this._updateTopSection(nextPanel);
      this._showPanel(nextPanel, previousPanel, () => {
        this.currentModule = moduleId;
        this._animateContentIn();
        this._playPanelVideo(nextPanel, true);
        this.switching = false;
      });
    });
  }

  restartVideo(moduleId) {
    const panel = this._getPanel(moduleId);
    const video = panel?.querySelector("video");
    if (!video) return;

    this._prepareVideo(video);
    video.currentTime = 0;
    this._playVideo(video);
  }

  _syncModule(moduleId, shouldPlay = true) {
    const activePanel = this._getPanel(moduleId) || this.panels[0];
    if (!activePanel) return;

    this._setNavActive(activePanel.dataset.modulePanel);
    this._updateTopSection(activePanel);

    this.panels.forEach((panel) => {
      const isActive = panel === activePanel;
      panel.hidden = !isActive;
      panel.classList.toggle(
        "k13-lite-hassle-free-maintenance-media-active",
        isActive
      );
      panel.classList.remove("k13-lite-hassle-free-maintenance-media-next");

      if (!isActive) {
        this._pausePanelVideo(panel);
      }
    });

    this.currentModule = activePanel.dataset.modulePanel;

    if (shouldPlay) {
      this._playPanelVideo(activePanel);
    }
  }

  _setNavActive(moduleId) {
    this.navItems.forEach((item) => {
      const isActive = item.dataset.module === moduleId;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
  }

  _getPanel(moduleId) {
    return this.panels.find((panel) => panel.dataset.modulePanel === moduleId);
  }

  _getPanelDescription(panel) {
    return (
      panel.querySelector(".k13-lite-hassle-free-maintenance-panel-description")
        ?.innerHTML || ""
    );
  }

  _updateTopSection(panel) {
    if (!panel) return;

    if (this.proText) {
      this.proText.textContent = panel.dataset.heading || "";
    }

    if (this.colorPrecisionText) {
      this.colorPrecisionText.textContent = panel.dataset.subheading || "";
    }

    if (this.subtitle) {
      this.subtitle.textContent = panel.dataset.subtitle || "";
    }

    if (this.description) {
      this.description.innerHTML = this._getPanelDescription(panel);
    }
  }

  _showPanel(nextPanel, previousPanel, callback) {
    if (!nextPanel || nextPanel === previousPanel) {
      if (typeof callback === "function") callback();
      return;
    }

    nextPanel.hidden = false;
    nextPanel.classList.add("k13-lite-hassle-free-maintenance-media-next");
    nextPanel.style.position = "absolute";
    nextPanel.style.left = "0";
    nextPanel.style.top = "0";
    nextPanel.style.width = "100%";
    nextPanel.style.opacity = "0";
    nextPanel.style.transition = "opacity 0.5s";

    window.requestAnimationFrame(() => {
      nextPanel.style.opacity = "1";

      if (previousPanel) {
        previousPanel.style.transition = "opacity 0.5s";
        previousPanel.style.opacity = "0";
      }
    });

    window.setTimeout(() => {
      this.panels.forEach((panel) => {
        const isActive = panel === nextPanel;
        panel.hidden = !isActive;
        panel.classList.toggle(
          "k13-lite-hassle-free-maintenance-media-active",
          isActive
        );
        panel.classList.remove("k13-lite-hassle-free-maintenance-media-next");
        panel.style.position = "";
        panel.style.left = "";
        panel.style.top = "";
        panel.style.width = "";
        panel.style.opacity = "";
        panel.style.transition = "";

        if (!isActive) {
          this._pausePanelVideo(panel);
        }
      });

      if (typeof callback === "function") callback();
    }, 520);
  }

  _animateContentOut(callback) {
    if (!this.topSection) {
      if (typeof callback === "function") callback();
      return;
    }

    this.topSection.classList.remove("active");
    this.topSection.classList.add("hidden");

    window.setTimeout(() => {
      if (typeof callback === "function") callback();
    }, 300);
  }

  _animateContentIn() {
    if (!this.topSection) return;

    this.topSection.classList.remove("hidden");
    window.setTimeout(() => {
      this.topSection.classList.add("active");
    }, 50);
  }

  _prepareVideo(video) {
    if (!video) return;

    let shouldLoad = false;
    const videoSrc = video.dataset.src;

    if (videoSrc && !video.getAttribute("src") && !video.querySelector("source[src]")) {
      video.setAttribute("src", videoSrc);
      shouldLoad = true;
    }

    video.querySelectorAll("source").forEach((source) => {
      const sourceSrc = source.dataset.src;

      if (sourceSrc && !source.getAttribute("src")) {
        source.setAttribute("src", sourceSrc);
        shouldLoad = true;
      }
    });

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "muted");
    video.setAttribute("playsinline", "playsinline");
    video.setAttribute("webkit-playsinline", "webkit-playsinline");

    if (shouldLoad) {
      video.load();
    }
  }

  _playVideo(video) {
    if (!video) return;

    const play = () => {
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    play();

    if (video.readyState < 2) {
      video.addEventListener("loadeddata", play, { once: true });
      video.addEventListener("canplay", play, { once: true });
    }
  }

  _playPanelVideo(panel, restart = false) {
    const video = panel?.querySelector("video");
    if (!video) return;

    this._prepareVideo(video);

    if (restart) {
      video.currentTime = 0;
    }

    this._playVideo(video);
  }

  _pausePanelVideo(panel) {
    panel?.querySelectorAll("video").forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  }

  _playCurrentWithRetry() {
    const activePanel = this._getPanel(this.currentModule);

    window.requestAnimationFrame(() => {
      this._playPanelVideo(activePanel);
      window.requestAnimationFrame(() => this._playPanelVideo(activePanel));
    });

    [120, 500, 1000, 1800, 3000].forEach((delay) => {
      window.setTimeout(() => this._playPanelVideo(activePanel), delay);
    });
  }
}

function initModuleSwitchers() {
  new ModuleSwitcher("#module-switcher-1");
  new ModuleSwitcher("#module-switcher-2");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initModuleSwitchers);
} else {
  initModuleSwitchers();
}
