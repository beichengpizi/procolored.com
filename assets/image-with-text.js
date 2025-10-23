if (!customElements.get("fe-modal")) {
  class Modal extends HTMLElement {
    constructor() {
      super();
      this._modalVisible = false;
      this._modal;
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>
            /* The Modal (background) */
            .modal {
                display: none; 
                position: fixed; 
                z-index: 1000000; 
                left: 0;
                top: 0;
                width: 100%; 
                height: 100%; 
                overflow: auto; 
                background-color: rgba(0,0,0,0.4); 
                align-items:center;
            }
            

            /* Modal Content */
            .modal-content {
                border-radius: 10px;
                position: relative;
                background-color: #fefefe;
                margin: auto;
                padding: 0;
                border: 1px solid #888;
                width: 80%;
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
                -webkit-animation-name: animatetop;
                -webkit-animation-duration: 0.4s;
                animation-name: animatetop;
                animation-duration: 0.4s
            }

            /* Add Animation */
            @-webkit-keyframes animatetop {
                from {top:-300px; opacity:0} 
                to {top:0; opacity:1}
            }

            @keyframes animatetop {
                from {top:-300px; opacity:0}
                to {top:0; opacity:1}
            }

            /* The Close Button */
            .close {
                color: #000;
                float: right;
                font-size: 28px;
                font-weight: bold;
            }

            .close:hover,
            .close:focus {
              color: #000;
              opacity: 0.6;
              text-decoration: none;
              cursor: pointer;
            }

            .modal-header {
              padding: 0 20px;
              color: #000;
              box-sizing: border-box;
              min-height: 60px;
            }

            .modal-body {padding: 0 40px 40px; box-sizing: border-box;
              height: calc(100vh - 45px - 100px)
            }

        </style>
       
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header"><span class="close">&times;</span><slot name="header"></slot></div>
                <div class="modal-body"><slot><slot></div>
            </div>
        </div>
        `;
    }
    connectedCallback() {
      this._modal = this.shadowRoot.querySelector(".modal");
      // this.shadowRoot.querySelector("button").addEventListener('click', this._showModal.bind(this));
      this.shadowRoot
        .querySelector(".close")
        .addEventListener("click", this._hideModal.bind(this));
    }
    disconnectedCallback() {
      // this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
      this.shadowRoot
        .querySelector(".close")
        .removeEventListener("click", this._hideModal);
    }
    _showModal() {
      this._modalVisible = true;
      this._modal.style.display = "flex";
    }
    _hideModal() {
      typeof this.beforeClose === "function" && this.beforeClose();
      this._modalVisible = false;
      this._modal.style.display = "none";
    }
    appendBody(el) {
      this.shadowRoot.querySelector(".modal-body").appendChild(el);
    }
    show(beforeShow) {
      typeof beforeShow === "function" && beforeShow();
      this._showModal();
    }
    close() {
      this._hideModal();
    }
  }
  customElements.define("fe-modal", Modal);
}

if (!window.isInitImageWithTextPlay) {
  window.isInitImageWithTextPlay = true;

  document.addEventListener("click", (e) => {
    let target = e.target;
    if (target.classList.contains("js-play-btn")) {
      let parent = target.parentElement;
      let input = parent.querySelector(".js-play-hidden");
      let {
        allow,
        allowfullscreen,
        class: className,
        frameborder,
        src,
        tabindex,
        title,
      } = input.dataset || {};
      let iframe = document.createElement("iframe");
      iframe.setAttribute("class", className);
      iframe.setAttribute("allow", allow);
      iframe.setAttribute("allowfullscreen", allowfullscreen);
      iframe.setAttribute("frameborder", frameborder);
      iframe.setAttribute("tabindex", tabindex);
      iframe.setAttribute("title", title);
      iframe.setAttribute("src", src);
      iframe.setAttribute("style", "width: 100%;height: 100%");
      // document.body.appendChild(iframe)

      // let feModal = parent.querySelector(".fe-modal");
      let clearFeModal = () => {
        document.querySelectorAll(".js-fe-modal")?.forEach((el) => {
          el.close();
          el.remove();
        });
      };
      clearFeModal();
      let feModal = document.createElement("fe-modal");
      feModal.classList.add("js-fe-modal");
      document.body.appendChild(feModal);
      feModal.appendBody(iframe);
      feModal.beforeClose = () => feModal.remove();
      feModal.show();
    }
  });
}

function __20240305waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/* 2024-03-01 fix */
function __20240301fix_mobile_video_func() {
  let child_no = 1;
  __20240305waitForElm(
    '#main-content div[id$="__8ba47ba3-de7f-4f0a-b30d-6f2a540748c3"].shopify-section .flickity-slider .slideshow__slide:nth-child(' +
      child_no +
      ") video"
  ).then((elm) => {
    let __20240301fix_mobile_video = elm.cloneNode(true);
    __20240301fix_mobile_video.removeChild(
      __20240301fix_mobile_video.children[1]
    );
    __20240301fix_mobile_video.children[0].src ="https://cdn.shopify.com/videos/c/o/v/54099cf8c19c42128faaa32cf97f99ff.mp4";
    __20240301fix_mobile_video.removeAttribute("poster");
    __20240301fix_mobile_video.removeAttribute("loop");
    __20240301fix_mobile_video.setAttribute("autoplay", "autoplay");
    __20240301fix_mobile_video.id = "unstoppable-dtf-printer-mobile-video";
    document
      .querySelector(
        '#main-content div[id$="__8ba47ba3-de7f-4f0a-b30d-6f2a540748c3"].shopify-section .flickity-slider .slideshow__slide:nth-child(' +
          child_no +
          ") .slideshow__slide-video-bg"
      )
      .appendChild(__20240301fix_mobile_video);
    __20240301fix_mobile_video.addEventListener(
      "ended",
      (e) => {
        e.target.currentTime = 0;
        e.target.play();
      },
      false
    );
  });

  // __20240301fix_mobile_video.play();
}

__20240301fix_mobile_video_func();
/* 2024-03-01 fix end */

var __20240304slide_link_fix__startX;
var __20240304slide_link_fix__startY;

/* 2024-03-02 add link */
function __20240302slide_link_func() {
  // let links = {
  //   2: "https://www.procolored.com/products/13-dual-heads-dtf-pro-a3-dtf-printer-direct-to-film-printer-upgrade",
  //   3: "https://www.procolored.com/products/13-single-head-dtf-printer-roll",
  // };
  // Object.keys(links).forEach((i) => {
  //   let slide = document.querySelector(
  //     '#main-content div[id$="__8ba47ba3-de7f-4f0a-b30d-6f2a540748c3"].shopify-section .flickity-slider .slideshow__slide:nth-child(' +
  //       i +
  //       ")"
  //   );
  //   slide.addEventListener("click", () => {
  //     location.href = links[i];
  //   });
  // });

  // slide.addEventListener('mousedown', event => {
  //   __20240304slide_link_fix__startX = event.pageX;
  //   __20240304slide_link_fix__startY = event.pageY;
  // });

  // slide.addEventListener('mouseup', event => {
  //   const diffX = Math.abs(event.pageX - __20240304slide_link_fix__startX);
  //   const diffY = Math.abs(event.pageY - __20240304slide_link_fix__startY);

  //   if (diffX < delta && diffY < delta) {
  //     // Clicked.
  //     location.href = 'https://www.procolored.com/products/13-dual-heads-dtf-pro-a3-dtf-printer-direct-to-film-printer-upgrade';
  //   }
  // });
}

__20240302slide_link_func();

function __20240305video_slide_height_fix() {
  // // let video_slide_no = 3;
  // let slides = Array.from(
  //   document.querySelectorAll(
  //     '#main-content div[id$="__8ba47ba3-de7f-4f0a-b30d-6f2a540748c3"].shopify-section .flickity-slider .slideshow__slide'
  //   )
  // );
  // let first_ref_height = slides[0].querySelector('.slideshow__slide-inner').offsetHeight;
  // let viewport_slide = document.querySelector(
  //   '#main-content div[id$="__8ba47ba3-de7f-4f0a-b30d-6f2a540748c3"].shopify-section .flickity-viewport'
  // );
  // // );
  // // let video_slide = document.querySelector(
  // //   '#main-content div[id$="__8ba47ba3-de7f-4f0a-b30d-6f2a540748c3"].shopify-section .flickity-slider .slideshow__slide:nth-child(' +
  // //     video_slide_no +
  // //     ")"
  // // );
  // console.log(first_ref_height);
  // viewport_slide.style.height = first_ref_height + "px";
  // slides.slice(1).forEach((slide) => {
  //   slide.style.height = first_ref_height + "px";
  // });
  // window.addEventListener("resize", (r) => {
  //   viewport_slide.style.height = slides[0].querySelector('.slideshow__slide-inner').offsetHeight + 'px';
  // });
}

__20240305video_slide_height_fix();
