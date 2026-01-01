
if (!customElements.get('new-product-card')) {
  class NewProductCard extends HTMLElement {
    constructor() {
      super();
      window.__CART_ADD_LOCK__ = false;
      this.swatches = this.querySelector('.product-card-swatches');
      this.image = this.querySelector('.product-featured-image-link .product-primary-image');
      this.additional_images = this.querySelectorAll('.product-secondary-image');
      this.additional_images_nav = this.querySelectorAll('.product-secondary-images-nav li');
      this.quick_add = this.querySelector('.product-card--add-to-cart-button-simple');
    }
    connectedCallback() {
      if (this.swatches) {
        this.enableSwatches(this.swatches, this.image);
      }
      if (this.additional_images) {
        this.enableAdditionalImages();
      }
      if (this.quick_add) {
        this.enableQuickAdd();
      }
    }
    enableAdditionalImages() {
      let image_length = this.additional_images.length;
      let images = this.additional_images;
      let nav = this.additional_images_nav;
      let image_container = this.querySelector('.product-featured-image');
      const mousemove = function (e) {
        let l = e.offsetX;
        let w = this.getBoundingClientRect().width;
        let prc = l / w;
        let sel = Math.floor(prc * image_length);
        let selimg = images[sel];
        images.forEach((image, index) => {
          if (image.classList.contains('hover')) {
            image.classList.remove('hover');
            if (nav.length) {
              nav[index].classList.remove('active');
            }
          }
        });
        if (selimg) {
          if (!selimg.classList.contains('hover')) {
            selimg.classList.add('hover');
            if (nav.length) {
              nav[sel].classList.add('active');
            }
          }
        }

      };
      const mouseleave = function (e) {
        images.forEach((image, index) => {
          image.classList.remove('hover');
          if (nav.length) {
            nav[index].classList.remove('active');
          }
        });
      };
      if (image_container) {
        image_container.addEventListener('touchstart', mousemove, {
          passive: true
        });
        image_container.addEventListener('touchmove', mousemove, {
          passive: true
        });
        image_container.addEventListener('touchend', mouseleave, {
          passive: true
        });
        image_container.addEventListener('mouseenter', mousemove, {
          passive: true
        });
        image_container.addEventListener('mousemove', mousemove, {
          passive: true
        });
        image_container.addEventListener('mouseleave', mouseleave, {
          passive: true
        });
      }

      images.forEach(function (image) {
        window.addEventListener('load', (event) => {
          lazySizes.loader.unveil(image);
        });
      });
    }
    enableSwatches(swatches, image) {
      let swatch_list = swatches.querySelectorAll('.product-card-swatch'),
        org_srcset = image ? image.dataset.srcset : '';

      swatch_list.forEach((swatch, index) => {
        window.addEventListener('load', (event) => {
          let image = new Image();
          image.srcset = swatch.dataset.srcset;
          lazySizes.loader.unveil(image);
        });
        swatch.addEventListener('mouseover', function () {

          [].forEach.call(swatch_list, function (el) {
            el.classList.remove('active');
          });
          if (image) {
            if (swatch.dataset.srcset) {
              image.setAttribute('srcset', swatch.dataset.srcset);
            } else {
              image.setAttribute('srcset', org_srcset);
            }
          }

          swatch.classList.add('active');
        });
        swatch.addEventListener('click', function (evt) {
          window.location.href = this.dataset.href;
          evt.preventDefault();
        });
      });
    }
    enableQuickAdd() {
      this.quick_add.addEventListener('click', this.quickAdd.bind(this));
    }

    quickAdd(evt) {
      evt.preventDefault();

      // ✅ 全局互斥锁（关键）
      if (window.__CART_ADD_LOCK__) {
        return;
      }
      window.__CART_ADD_LOCK__ = true;

      console.log('clicked', this);

      this.quick_add.classList.add('loading');
      this.quick_add.setAttribute('aria-disabled', true);

      const config = {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/javascript'
        }
      };

      let formData = new FormData(this.form);
      formData.append('id', this.quick_add.dataset.productId);
      formData.append('quantity', 1);

      if (this.quick_add.dataset.sellingPlanId) {
        formData.append('selling_plan', this.quick_add.dataset.sellingPlanId);
      }

      formData.append(
        'sections',
        this.getSectionsToRender().map(s => s.section)
      );
      formData.append('sections_url', window.location.pathname);

      config.body = formData;

      fetch(`${theme.routes.cart_add_url}`, config)
        .then(res => res.json())
        .then(res => {
          if (res.status) return;

          this.renderContents(res);

          dispatchCustomEvent('cart:item-added', {
            product: res.items ? res.items[0] : res
          });
        })
        .catch(console.error)
        .finally(() => {
          window.__CART_ADD_LOCK__ = false; // 🔓 解锁
          this.quick_add.classList.remove('loading');
          this.quick_add.removeAttribute('aria-disabled');
        });
    }

    getSectionsToRender() {
      return [{
        id: 'Cart',
        section: 'main-cart',
        selector: '.thb-cart-form'
      },
      {
        id: 'Cart-Drawer',
        section: 'cart-drawer',
        selector: '.cart-drawer'
      },
      {
        id: 'cart-drawer-toggle',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      }];
    }
    renderContents(parsedState) {
      this.getSectionsToRender().forEach((section => {
        if (!document.getElementById(section.id)) {
          return;
        }
        const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
        elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        if (typeof CartDrawer !== 'undefined') {
          new CartDrawer();
        }
        if (typeof Cart !== 'undefined') {
          new Cart().renderContents(parsedState);
        }
      }));


      if (document.getElementById('Cart-Drawer')) {
        document.body.classList.add('open-cc');
        document.getElementById('Cart-Drawer').classList.add('active');

        dispatchCustomEvent('cart-drawer:open');
      }

    }
    getSectionInnerHTML(html, selector = '.shopify-section') {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
    // 在 ProductCard 类中添加一个静态方法 quickAddStatic,外部调用 quickAdd 方法
    static quickAddStatic(productId, form) {
      // 实例化 ProductCard 类：在 quickAddStatic 方法中，创建一个新的 ProductCard 实例，并设置必要的属性
      const productCard = new ProductCard();
      productCard.quick_add = {
        dataset: { productId },
        disabled: false,
        classList: {
          add: (className) => {},
          remove: (className) => {}
        },
        setAttribute: (name, value) => {}
      };
      productCard.quickAdd(new Event('click'));
    }
  
  

  }
  customElements.define('new-product-card', NewProductCard);
}
