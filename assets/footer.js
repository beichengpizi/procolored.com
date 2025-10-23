/**
 *  @class
 *  @function ThemeFooter
 */

if (!customElements.get("theme-footer")) {
  class ThemeFooter extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.animations_enabled =
        document.body.classList.contains("animations-true") &&
        typeof gsap !== "undefined";

      if (document.body.classList.contains("template-product-quick-view")) {
        this.animations_enabled = false;
      }
      if (!this.animations_enabled) {
        return;
      }
      this.content = document.getElementById("main-content");
      this.wrapper = document.getElementById("wrapper");
      this.footer_bg = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--color-footer-bg");
      this.radius = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--block-border-radius");
      this.setupAnimations();
    }
    setupAnimations() {
      let mm = gsap.matchMedia();
      this.wrapper.style.backgroundColor = this.footer_bg;
      mm.add(
        {
          // set up any number of arbitrarily-named conditions. The function below will be called when ANY of them match.
          isDesktop: `(min-width: 768px)`,
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // context.conditions has a boolean property for each condition defined above indicating if it's matched or not.
          let { isDesktop, isMobile, reduceMotion } = context.conditions;

          gsap.to(this.content, {
            clipPath:
              !isDesktop || reduceMotion
                ? `inset(0px 0% 0% round 0`
                : `inset(0px 4% 0% round ${this.radius})`,
            duration: 0.5,
            inherit: false,
            ease: "none",
            scrollTrigger: {
              trigger: this,
              fastScrollEnd: true,
              scrub: 1,
              start: () => `top bottom`,
              end: () => `bottom bottom`,
            },
          });
        }
      );
    }
  }
  customElements.define("theme-footer", ThemeFooter);
}

// logo 自动播放
let logoAutoPlay = () => {
  let timer;
  if (window.innerWidth < 768) {
    // document.querySelector(".logo-list--inner.swipe-on-mobile").scrollTo({left: 20,  behavior: "smooth"})
    let logoWrap = document.querySelector(".logo-list--inner.swipe-on-mobile");
    if (logoWrap) {
      let aLength = logoWrap.querySelectorAll(".logo-list--logo").length;
      let index = 0;
      let fn = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          // console.log((index * (126 + 15) + (index>0?24:0)),index)
          logoWrap.scrollTo({
            left: index * (126 + 15) + (index>0?24:0)-24,
            behavior: "smooth",
          });
          index++;
          if (index >= aLength - 1) {
            index = 0;
          }
          fn();
        }, 1000);
      };
      fn();
      logoWrap.addEventListener("touchstart", () => {
        clearTimeout(timer);
      });
      logoWrap.addEventListener("touchend", () => {
        index = Math.floor(logoWrap.scrollLeft / (126+15))+1;
        if (index >= aLength - 1) {
          index = 0;
        }
        fn();
      });
      logoWrap.addEventListener("touchcancel", () => {
        index = Math.floor(logoWrap.scrollLeft / (126+15))+1;
        if (index >= aLength - 1) {
          index = 0;
        }
        fn();
      });
    }
  } else {
    clearTimeout(timer);
  }
};

function fe__debounce(fn, delay = 1000) {
  let timer;
  return function () {
    window.clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      window.clearTimeout(timer);
    }, delay);
  };
}

// 进行函数防抖
let logoDebounce = fe__debounce(logoAutoPlay);
logoDebounce();
// 监听resize事件
window.addEventListener("resize", logoDebounce);
