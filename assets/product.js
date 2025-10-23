if (!customElements.get("variant-selects")) {
  /**
   *  @class
   *  @function VariantSelects
   */
  class VariantSelects extends HTMLElement {
    constructor() {
      super();
      // 读取 data-sticky 属性，判断是否为粘性模式
      this.sticky = this.dataset.sticky;
      // 读取 data-update-url 属性，判断是否需要更新 URL
      this.updateUrl = this.dataset.updateUrl === "true";
      // 读取 data-is-disabled 属性，判断是否禁用某些功能
      this.isDisabledFeature = this.dataset.isDisabled;
      this.addEventListener("change", this.onVariantChange);
      this.other = Array.from(
        document.querySelectorAll("variant-selects")
      ).filter((selector) => {
        return selector != this;
      });

      this.productWrapper = this.closest(".thb-product-detail");
      this.customVariants = this.closest(".product-information").querySelector(
        "custom-variants"
      );
      this.productSlider = this.productWrapper.querySelector(".product-images");
      this.hideVariants = this.dataset.hideVariants === "true";
     
    }

    connectedCallback() {
      this.updateOptions();
      this.updateMasterId();
      this.setDisabled();
      this.setImageSet();
    }

    onVariantChange() {
      console.log("切换变体");
      this.updateOptions();
      this.updateMasterId();
      this.toggleAddButton(false, "", false);
      this.updatePickupAvailability();
      this.removeErrorMessage();
      this.updateVariantText();
      this.setDisabled();

      if (!this.currentVariant) {
        console.log("切换变体", this.currentVariant);
        this.toggleAddButton(true, "", true);
        this.setUnavailable();
      } else {
        this.updateMedia();
        if (this.updateUrl) {
          this.updateURL();
        }
        this.updateVariantInput();
        this.renderProductInfo();
        // 判断当前页面是否存在 custom-variants 元素，如果存在则执行相关事件
        if (this.customVariants) {
          console.log("custom-product-variants 元素已存在");
          this.updateCustomProductVariants();
        } else {
          console.log("custom-product-variants 元素不存在");
        }
        //this.updateShareUrl();
      }

      this.updateOther();
      dispatchCustomEvent("product:variant-change", {
        variant: this.currentVariant,
        sectionId: this.dataset.section,
      });
    }
    updateCustomProductVariants() {
      // 获取 <html> 元素的 data-country 属性，当为 US 时执行
      // const htmlCountry = document.documentElement.getAttribute("data-country");
      let format = theme.settings.money_with_currency_format;
      // 如果 this.format 包含 <span class="money"></span>，则提取 > 和 < 之间的内容作为格式
      const moneySpanMatch = format.match(
        /<span\s+class=["']money["']>(.*?)<\/span>/i
      );
      if (moneySpanMatch) {
        format = moneySpanMatch[1];
      }
      // if (htmlCountry === "US") {
      //   // 这里编写当国家为 US 时需要执行的代码
      //   console.log("当前国家为美国，执行相关逻辑");
      //   // 你可以在这里添加更多需要执行的操作
      //   format = "${{amount}}";
      // }

      const activeCustomVariant = this.customVariants.querySelector(
        ".js-custom-variant.active"
      );
      const productInfoEl = this.closest(".product-information").querySelector(
        ".product-information--inner"
      );
      // 判断当前 productInfoEl 是否包含 class showActivityPrice
      const hasShowActivityPrice =
        productInfoEl && productInfoEl.classList.contains("showActivityPrice");

      if (hasShowActivityPrice) {
        console.log('当前已经设置折扣')
        this.currentAutomaticDiscountVariantData =
          this.getAutomaticDiscountVariantData().find(
            (variant) => variant.id === this.currentVariant.id
          );
        const $reminder = this.closest(".product-information").querySelector(
          "custom-automatic-discount-reminder"
        );
        console.log(
          "自定义属性切换模块对应变体",
          this.currentAutomaticDiscountVariantData
        );

        setTimeout(() => {
          const $finalPrice = $reminder.querySelector("[data-final-price]");
          let moneyValue = "";
          let moneyEl = $finalPrice.querySelector(".money");
          if (moneyEl) {
            moneyValue = moneyEl.textContent;
          } else {
            moneyValue = $finalPrice.textContent.replace(":", "");
          }
          console.log("自定义属性切换模块对应的销售价格", moneyValue);
          let productPriceMoneyEl = activeCustomVariant.querySelector(
            ".custom-product-price .money"
          );
          if (productPriceMoneyEl) {
            productPriceMoneyEl.textContent = moneyValue;
          } else {
            activeCustomVariant.querySelector(
              ".custom-product-price"
            ).textContent = moneyValue;
          }
        }, 100);

        activeCustomVariant.querySelector(
          ".custom-product-price-compare"
        ).innerHTML = window.formatMoney(
          this.currentAutomaticDiscountVariantData.price,
          format
        );
      } else {
        console.log('当前没有设置折扣')
        console.log("this.getVariantData()", this.getVariantData());
        const price = this.currentVariant.price;
        const compare_at_price = this.currentVariant.compare_at_price;
        console.log("自定义产品选择器当前变体原价=", compare_at_price);
        console.log("自定义产品选择器当前变体售价=", price);
        if (compare_at_price > price) { 
          activeCustomVariant.querySelector(".custom-product-price-compare").style.display = "block";
          activeCustomVariant.querySelector(
            ".custom-product-price-compare"
          ).innerHTML = window.formatMoney(compare_at_price, format);
        }else{
          activeCustomVariant.querySelector(".custom-product-price-compare").style.display = "none";
        }
        
        
        activeCustomVariant.querySelector(".custom-product-price").innerHTML =
          window.formatMoney(price, format);
      }
    }
    updateOptions() {
      this.fieldsets = Array.from(this.querySelectorAll("fieldset"));
      this.options = [];
      this.fieldsets.forEach((fieldset, i) => {
        if (fieldset.querySelector("select")) {
          this.options.push(fieldset.querySelector("select").value);
        } else if (fieldset.querySelectorAll("input").length) {
          this.options.push(fieldset.querySelector("input:checked").value);
        }
      });
    }
    updateVariantText() {
      const fieldsets = Array.from(this.querySelectorAll("fieldset"));
      fieldsets.forEach((item, i) => {
        let label = item.querySelector(".form__label__value");
        if (label) {
          label.innerHTML = this.options[i];
        }
      });
    }
    updateMasterId() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options
          .map((option, index) => {
            return this.options[index] === option;
          })
          .includes(false);
      });
    }

    updateOther() {
      if (this.dataset.updateUrl === "false") {
        return;
      }
      if (this.other.length) {
        let fieldsets = this.other[0].querySelectorAll("fieldset"),
          fieldsets_array = Array.from(fieldsets);
        this.options.forEach((option, i) => {
          if (fieldsets_array[i].querySelector("select")) {
            fieldsets_array[i].querySelector(`select`).value = option;
          } else if (fieldsets_array[i].querySelectorAll("input").length) {
            fieldsets_array[i].querySelector(
              `input[value='${option}']`
            ).checked = true;
          }
        });
        this.other[0].updateOptions();
        this.other[0].updateMasterId();
        this.other[0].updateVariantText();
        this.other[0].setDisabled();
      }
    }

    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;

      let productSlider = document.querySelector(
          ".thb-product-detail .product-images"
        ),
        thumbnails = document.querySelector(
          ".thb-product-detail #Product-Thumbnails"
        );

      this.setActiveMedia(
        `#Slide-${this.dataset.section}-${this.currentVariant.featured_media.id}`,
        `#Thumb-${this.dataset.section}-${this.currentVariant.featured_media.id}`,
        productSlider,
        thumbnails
      );
    }
    setActiveMedia(mediaId, thumbId, productSlider, thumbnails) {
      let flkty = Flickity.data(productSlider),
        activeMedia = productSlider.querySelector(mediaId);

      if (flkty && this.hideVariants) {
        if (
          productSlider.querySelector(
            ".product-images__slide.is-initial-selected"
          )
        ) {
          productSlider
            .querySelector(".product-images__slide.is-initial-selected")
            .classList.remove("is-initial-selected");
        }
        [].forEach.call(
          productSlider.querySelectorAll(
            ".product-images__slide-item--variant"
          ),
          function (el) {
            el.classList.remove("is-active");
          }
        );

        activeMedia.classList.add("is-active");
        activeMedia.classList.add("is-initial-selected");

        this.setImageSetMedia();

        if (thumbnails) {
          let activeThumb = thumbnails.querySelector(thumbId);

          if (
            thumbnails.querySelector(".product-thumbnail.is-initial-selected")
          ) {
            thumbnails
              .querySelector(".product-thumbnail.is-initial-selected")
              .classList.remove("is-initial-selected");
          }
          [].forEach.call(
            thumbnails.querySelectorAll(".product-images__slide-item--variant"),
            function (el) {
              el.classList.remove("is-active");
            }
          );

          activeThumb.classList.add("is-active");
          activeThumb.classList.add("is-initial-selected");
        }

        productSlider.reInit(this.imageSetIndex);
        productSlider.selectCell(mediaId);
      } else if (flkty) {
        productSlider.selectCell(mediaId);
      }
    }

    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === "false") return;
      window.history.replaceState(
        {},
        "",
        `${this.dataset.url}?variant=${this.currentVariant.id}`
      );
    }

    updateShareUrl() {
      const shareButton = document.getElementById(
        `Share-${this.dataset.section}`
      );
      if (!shareButton) return;
      shareButton.updateUrl(
        `${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`
      );
    }

    updateVariantInput() {
      const productForms = document.querySelectorAll(
        `#product-form-${this.dataset.section}, #product-form-installment`
      );
      productForms.forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(
          new Event("change", {
            bubbles: true,
          })
        );
      });
    }

    updatePickupAvailability() {
      const pickUpAvailability = document.querySelector(
        ".pickup-availability-wrapper"
      );

      if (!pickUpAvailability) return;

      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailability.fetchAvailability(this.currentVariant.id);
      } else {
        pickUpAvailability.removeAttribute("available");
        pickUpAvailability.innerHTML = "";
      }
    }

    removeErrorMessage() {
      const section = this.closest("section");
      if (!section) return;

      const productForm = section.querySelector("product-form");
      if (productForm) productForm.handleErrorMessage();
    }

    getSectionsToRender() {
      return [
        `price-${this.dataset.section}`,
        `price-${this.dataset.section}--sticky`,
        `product-image-${this.dataset.section}--sticky`,
        `inventory-${this.dataset.section}`,
        `sku-${this.dataset.section}`,
        `quantity-${this.dataset.section}`,
      ];
    }

    renderProductInfo() {
      let sections = this.getSectionsToRender();

      fetch(
        `${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`
      )
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );

          sections.forEach((id) => {
            const destination = document.getElementById(id);
            const source = html.getElementById(id);

            if (source && destination) destination.innerHTML = source.innerHTML;

            const price = document.getElementById(id);
            const price_fixed = document.getElementById(id + "--sticky");

            if (price) price.classList.remove("visibility-hidden");
            if (price_fixed) price_fixed.classList.remove("visibility-hidden");
          });
          console.log(
            ".product-information==",
            this.closest(".product-information")
          );
          console.log(
            ".product-information>.product-information--inner==",
            this.closest(".product-information").querySelector(
              ".product-information--inner"
            )
          );
          console.log(
            "this.getAutomaticDiscountVariantData()==",
            this.getAutomaticDiscountVariantData()
          );
          const productInfoEl = this.closest(
            ".product-information"
          ).querySelector(".product-information--inner");
          // 判断当前 productInfoEl 是否包含 class showActivityPrice
          const hasShowActivityPrice =
            productInfoEl &&
            productInfoEl.classList.contains("showActivityPrice");

          console.log("hasShowActivityPrice ===", hasShowActivityPrice);
          if (hasShowActivityPrice) {
            this.currentAutomaticDiscountVariantData =
              this.getAutomaticDiscountVariantData().find(
                (variant) => variant.id === this.currentVariant.id
              );
            console.log(
              "this.currentAutomaticDiscountVariantData ===",
              this.currentAutomaticDiscountVariantData
            );
            if (
              this.currentAutomaticDiscountVariantData &&
              this.currentAutomaticDiscountVariantData.custom_discount &&
              this.currentAutomaticDiscountVariantData.custom_discount !== 0
            ) {
              // 设置 activity-price-display 可见，daily-price-display 不可见

              if (productInfoEl) {
                // 显示 activity-price-display
                var activityPriceEls = productInfoEl.querySelectorAll(
                  ".activity-price-display"
                );
                activityPriceEls.forEach(function (el) {
                  el.style.display = "block";
                  el.classList.add("show");
                });
                // 给 ProductInfo 添加 showActivityPrice
                productInfoEl.classList.add("showActivityPrice");
                // 隐藏 daily-price-display
                var dailyPriceEls = productInfoEl.querySelectorAll(
                  ".daily-price-display"
                );
                dailyPriceEls.forEach(function (el) {
                  el.style.display = "none";
                });
              }
              // 修复：原生JS没有find方法，需用querySelector
              const $reminder = this.closest(
                ".product-information"
              ).querySelector("custom-automatic-discount-reminder");

              // 在 custom-automatic-discount-reminder 下查找 data-final-price 属性的元素
              // 修复：原生JS没有find方法，需用querySelector

              // 修复：原生JS没有find方法，应该用querySelector
              const $finalPrice = $reminder.querySelector("[data-final-price]");
              // 在 data-final-price 元素下查找 .money 子元素，并获取其文本值
              let moneyValue = "";
              // 修复：原生JS的querySelector返回的是单个元素，不是数组，没有length属性
              // 另外，text() 不是原生JS方法，应该用textContent
              let moneyEl = $finalPrice.querySelector(".money");
              if (moneyEl) {
                moneyValue = moneyEl.textContent;
              } else {
                moneyValue = $finalPrice.textContent.replace(":", "");
              }

              // 隐藏 custom-automatic-discount-reminder 下的 [data-final-price] 元素
              // 修复：原生JS没有css方法，应该直接设置style属性
              $finalPrice.style.display = "none";
              console.log(
                "custom-automatic-discount-reminder 下 data-final-price 的 .money 值:",
                moneyValue
              );

              // 修复：原生JS没有text方法，应该用textContent
              const $productCardPriceAndButton = this.closest(
                ".product-information"
              ).querySelector(".product-price-container");
              const $productAddToCartSticky = document.querySelector(
                "product-add-to-cart-sticky"
              );
              const insMoneyEl =
                $productCardPriceAndButton.querySelector("ins .money");
              const delMoneyEl =
                $productCardPriceAndButton.querySelector(".del .money");
              const $stickyProduct =
                $productAddToCartSticky.querySelector(".product-price ");
              const $stickyProductActivityPrice = $stickyProduct.querySelector(
                ".activity-price-display"
              );
              const $stickyProductDailyPrice = $stickyProduct.querySelector(
                ".daily-price-display"
              );
              $stickyProductActivityPrice.style.display = "block";
              $stickyProductDailyPrice.style.display = "none";

              // 获取 <html> 元素的 data-country 属性，当为 US 时执行
              // const htmlCountry =
              //   document.documentElement.getAttribute("data-country");
              this.currency_code_enabled = theme.settings.currency_code_enabled
              if(this.currency_code_enabled){
                this.format = theme.settings.money_with_currency_format;
              }else{
                this.format = theme.settings.money_format;
              }
             
              // 如果 this.format 包含 <span class="money"></span>，则提取 > 和 < 之间的内容作为格式
              const moneySpanMatch = this.format.match(
                /<span\s+class=["']money["']>(.*?)<\/span>/i
              );
              if (moneySpanMatch) {
                this.format = moneySpanMatch[1];
              }
              // if (htmlCountry === "US") {
              //   // 这里编写当国家为 US 时需要执行的代码
              //   console.log("当前国家为美国，执行相关逻辑");
              //   // 你可以在这里添加更多需要执行的操作
              //   this.format = "${{amount}}";
              // }

              console.log("货币单位", this.format);
              console.log("包含货币", this.currency_code_enabled);
              if (insMoneyEl) {
                insMoneyEl.textContent = moneyValue;
                // 修复：需要判断 $stickyProductActivityPrice.querySelector("ins .money") 是否存在，避免报错
                const stickyInsMoneyEl =
                  $stickyProductActivityPrice.querySelector("ins .money");
                if (stickyInsMoneyEl) {
                  stickyInsMoneyEl.textContent = moneyValue;
                }
              }
              if (delMoneyEl) {
                delMoneyEl.textContent = window.formatMoney(
                  this.currentAutomaticDiscountVariantData.price,
                  this.format
                );
                // 修复：应显示原价（compare_at_price），而不是现价（price）
                // console.log('this.currentAutomaticDiscountVariantData.compare_at_price====',this.currentAutomaticDiscountVariantData.compare_at_price);
                // const stickyDelMoneyEl =
                //   $stickyProductActivityPrice.querySelector("del .money");
                // if (
                //   stickyDelMoneyEl &&
                //   this.currentAutomaticDiscountVariantData.compare_at_price
                // ) {
                //   stickyDelMoneyEl.textContent = window.formatMoney(
                //     this.currentAutomaticDiscountVariantData.compare_at_price,
                //     this.format
                //   );
                // }
              }
            }
          }

          this.toggleAddButton(
            !this.currentVariant.available,
            window.theme.variantStrings.soldOut
          );
        });
    }

    toggleAddButton(disable = true, text = false, modifyClass = true) {
      const productForm = document.getElementById(
        `product-form-${this.dataset.section}`
      );
      if (!productForm) return;

      const submitButtons = document.querySelectorAll(
        ".single-add-to-cart-button"
      );

      if (!submitButtons) return;

      submitButtons.forEach((submitButton) => {
        const submitButtonText = submitButton.querySelector(
          ".single-add-to-cart-button--text"
        );

        if (!submitButtonText) return;
        // console.log('00000000000===',this.currentVariant)
        // console.log('11111111111111111111.selling_plan_allocations===',this.currentVariant.selling_plan_allocations)
        // console.log('22222222222222222222selling_plan_allocations.length===',this.currentVariant.selling_plan_allocations.length)

        if (this.currentVariant.selling_plan_allocations.length == 0) {
          if (disable) {
            submitButton.setAttribute("disabled", "disabled");
            // submitButton.style.opacity = "0";
            if (text) submitButtonText.textContent = text;
          } else {
            submitButton.removeAttribute("disabled");
            // submitButton.style.opacity = "1";
            submitButton.classList.remove("loading");
            submitButtonText.textContent =
              window.theme.variantStrings.addToCart;
          }
        } else {
        }
      });

      if (!modifyClass) return;
    }

    setUnavailable() {
      const submitButtons = document.querySelectorAll(
        ".single-add-to-cart-button"
      );
      const price = document.getElementById(`price-${this.dataset.section}`);
      const price_fixed = document.getElementById(
        `price-${this.dataset.section}--sticky`
      );

      submitButtons.forEach((submitButton) => {
        const submitButtonText = submitButton.querySelector(
          ".single-add-to-cart-button--text"
        );
        if (!submitButton) return;
        submitButtonText.textContent = window.theme.variantStrings.unavailable;
        submitButton.classList.add("sold-out");
      });
      if (price) price.classList.add("visibility-hidden");
      if (price_fixed) price_fixed.classList.add("visibility-hidden");
    }

    setDisabled() {
      if (this.isDisabledFeature != "true") {
        return;
      }
      const variant_data = this.getVariantData();

      if (variant_data) {
        const selected_options = this.currentVariant.options.map(
          (value, index) => {
            return {
              value,
              index: `option${index + 1}`,
            };
          }
        );
        const available_options = this.createAvailableOptionsTree(
          variant_data,
          selected_options
        );

        this.fieldsets.forEach((fieldset, i) => {
          const fieldset_options = Object.values(available_options)[i];

          if (fieldset_options) {
            if (fieldset.querySelector("select")) {
              fieldset_options.forEach((option, option_i) => {
                if (option.isUnavailable) {
                  fieldset.querySelector(
                    "option[value=" + JSON.stringify(option.value) + "]"
                  ).disabled = true;
                } else {
                  fieldset.querySelector(
                    "option[value=" + JSON.stringify(option.value) + "]"
                  ).disabled = false;
                }
              });
            } else if (fieldset.querySelectorAll("input").length) {
              fieldset.querySelectorAll("input").forEach((input, input_i) => {
                input.classList.toggle(
                  "is-disabled",
                  fieldset_options[input_i].isUnavailable
                );
              });
            }
          }
        });
      }
      return true;
    }

    getImageSetName(variant_name) {
      return variant_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-$/, "")
        .replace(/^-/, "");
    }

    setImageSet() {
      if (!this.productSlider) return;

      let dataSetEl = this.productSlider.querySelector("[data-set-name]");
      if (dataSetEl) {
        this.imageSetName = dataSetEl.dataset.setName;
        this.imageSetIndex = this.querySelector(
          '.product-form__input[data-handle="' + this.imageSetName + '"]'
        ).dataset.index;
        this.dataset.imageSetIndex = this.imageSetIndex;
        this.setImageSetMedia();
      }
    }
    setImageSetMedia() {
      if (!this.imageSetIndex) {
        return;
      }

      let setValue = this.getImageSetName(
        this.currentVariant[this.imageSetIndex]
      );
      let group = this.imageSetName + "_" + setValue;
      let selected_set_images = this.productWrapper.querySelectorAll(
          `.product-images__slide[data-set-name="${this.imageSetName}"]`
        ),
        selected_set_thumbs = this.productWrapper.querySelectorAll(
          `.product-thumbnail[data-set-name="${this.imageSetName}"]`
        );

      if (this.hideVariants) {
        // Product images
        this.productWrapper
          .querySelectorAll(".product-images__slide")
          .forEach((thumb) => {
            if (thumb.dataset.group && thumb.dataset.group !== group) {
              thumb.classList.remove("is-active");
            }
          });
        selected_set_images.forEach((thumb) => {
          thumb.classList.toggle("is-active", thumb.dataset.group === group);
        });

        // Product thumbnails
        this.productWrapper
          .querySelectorAll(".product-thumbnail")
          .forEach((thumb) => {
            if (thumb.dataset.group && thumb.dataset.group !== group) {
              thumb.classList.remove("is-active");
            }
          });
        selected_set_thumbs.forEach((thumb) => {
          thumb.classList.toggle("is-active", thumb.dataset.group === group);
        });
      }
    }

    createAvailableOptionsTree(variant_data, selected_options) {
      // Reduce variant array into option availability tree
      return variant_data.reduce(
        (options, variant) => {
          // Check each option group (e.g. option1, option2, option3) of the variant
          Object.keys(options).forEach((index) => {
            if (variant[index] === null) return;

            let entry = options[index].find(
              (option) => option.value === variant[index]
            );

            if (typeof entry === "undefined") {
              // If option has yet to be added to the options tree, add it
              entry = {
                value: variant[index],
                isUnavailable: true,
              };
              options[index].push(entry);
            }

            // Check how many selected option values match a variant
            const countVariantOptionsThatMatchCurrent = selected_options.reduce(
              (count, { value, index }) => {
                return variant[index] === value ? count + 1 : count;
              },
              0
            );

            // Only enable an option if an available variant matches all but one current selected value
            if (
              countVariantOptionsThatMatchCurrent >=
              selected_options.length - 1
            ) {
              entry.isUnavailable =
                entry.isUnavailable && variant.available
                  ? false
                  : entry.isUnavailable;
            }

            // Make sure if a variant is unavailable, disable currently selected option
            if (
              (!this.currentVariant || !this.currentVariant.available) &&
              selected_options.find(
                (option) =>
                  option.value === entry.value && index === option.index
              )
            ) {
              entry.isUnavailable = true;
            }

            // First option is always enabled
            if (index === "option1") {
              entry.isUnavailable =
                entry.isUnavailable && variant.available
                  ? false
                  : entry.isUnavailable;
            }
          });

          return options;
        },
        {
          option1: [],
          option2: [],
          option3: [],
        }
      );
    }

    getVariantData() {
      this.variantData =
        this.variantData ||
        JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }

    getAutomaticDiscountVariantData() {
      const automaticDiscountVariantDataEl = this.closest(
        ".product-information"
      ).querySelector("custom-automatic-discount-reminder");
      this.automaticDiscountVariantData =
        this.automaticDiscountVariantData ||
        JSON.parse(
          automaticDiscountVariantDataEl.querySelector(
            '[type="application/json"]'
          ).textContent
        );
      return this.automaticDiscountVariantData;
    }
  }
  customElements.define("variant-selects", VariantSelects);

  /**
   *  @class
   *  @function VariantRadios
   */
  class VariantRadios extends VariantSelects {
    constructor() {
      super();
    }

    updateOptions() {
      const fieldsets = Array.from(this.querySelectorAll("fieldset"));
      this.options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll("input")).find(
          (radio) => radio.checked
        ).value;
      });
    }
  }

  customElements.define("variant-radios", VariantRadios);
}
if (!customElements.get("custom-automatic-discount-reminder")) {
  /**
   *  @class
   *  @function AutomaticDiscountReminder  自动折扣提醒
   */
  class AutomaticDiscountReminder extends window.HTMLElement {
    constructor() {
      super();
      // 获取 <html> 元素的 data-country 属性，当为 US 时执行
      // const htmlCountry = document.documentElement.getAttribute("data-country");
      this.currency_code_enabled = theme.settings.currency_code_enabled
      if(this.currency_code_enabled){
        this.format = theme.settings.money_with_currency_format;
      }else{
        this.format = theme.settings.money_format;
      }
      
      
      // 如果 this.format 包含 <span class="money"></span>，则提取 > 和 < 之间的内容作为格式
      const moneySpanMatch = this.format.match(
        /<span\s+class=["']money["']>(.*?)<\/span>/i
      );
      if (moneySpanMatch) {
        this.format = moneySpanMatch[1];
      }
      // if (htmlCountry === "US") {
      //   // 这里编写当国家为 US 时需要执行的代码
      //   console.log("当前国家为美国，执行相关逻辑");
      //   // 你可以在这里添加更多需要执行的操作
      //   this.format = "${{amount}}";
      // }

      console.log("货币单位", this.format);
      console.log("包含货币", this.currency_code_enabled);
    }

    connectedCallback() {
      this.variantData = this.getVariantData();
      this.finalSalePriceEl = this.querySelector("[data-final-sale-price]");
      this.finalPriceEl = this.querySelector("[data-final-price]");
      this.bindEvents();
    }

    getVariantData() {
      if (this.variantData) return this.variantData;
      const jsonElement = this.querySelector('[type="application/json"]');
      if (!jsonElement) throw new Error("JSON data element not found");
      return (this.variantData = JSON.parse(jsonElement.textContent));
    }

    findSelectVariant(variantId) {
      return this.variantData.find((variant) => variant.id === variantId);
    }

    bindEvents() {
      document.addEventListener("product:variant-change", ({ detail }) => {
        const { variant } = detail;
        const selectedVariant = this.findSelectVariant(variant.id);
        const customDiscount = selectedVariant?.custom_discount;

        if (this.classList.toggle("hidden", !customDiscount) && !customDiscount)
          // 隐藏元素
          return;
        // console.log('customDiscount===',customDiscount);
        if (customDiscount == 0) {
          this.classList.toggle("hidden", true);
        }

        let discountAmount = 0;
        let finalPrice = selectedVariant.price;

        if (customDiscount.includes("%")) {
          const discountPercentage = parseFloat(customDiscount.split("%")[0]);
          discountAmount = (selectedVariant.price * discountPercentage) / 100;
        } else {
          discountAmount = parseFloat(customDiscount);
        }

        finalPrice -= discountAmount;

        this.finalPriceEl.innerHTML = window.formatMoney(
          finalPrice,
          this.format
        );
        this.finalSalePriceEl.innerHTML = `-${window.formatMoney(
          discountAmount,
          this.format
        )}`;
      });
    }
  }

  window.customElements.define(
    "custom-automatic-discount-reminder",
    AutomaticDiscountReminder
  );
}

if (!customElements.get("product-slider")) {
  /**
   *  @class
   *  @function ProductSlider
   */
  class ProductSlider extends HTMLElement {
    constructor() {
      super();

      this.addEventListener("change", this.setupProductGallery);
    }
    connectedCallback() {
      this.product_container = this.closest(".thb-product-detail");
      this.thumbnail_container = this.product_container.querySelector(
        ".product-thumbnail-container"
      );
      this.video_containers = this.querySelectorAll(
        ".product-single__media-external-video--play"
      );

      this.setOptions();
      // Start Slider
      this.init();
    }
    setOptions() {
      this.hide_variants = this.dataset.hideVariants == "true";
      this.thumbnails =
        this.thumbnail_container.querySelectorAll(".product-thumbnail");
      this.prev_button = this.querySelector(".flickity-prev");
      this.next_button = this.querySelector(".flickity-next");
      this.options = {
        wrapAround: true,
        pageDots: true,
        contain: true,
        adaptiveHeight: true,
        initialIndex: ".is-initial-selected",
        prevNextButtons: false,
        fade: false,
        cellSelector: ".product-images__slide.is-active",
      };
    }
    init() {
      this.flkty = new Flickity(this, this.options);

      this.selectedIndex = this.flkty.selectedIndex;

      // Setup Events
      this.setupEvents();

      // Start Gallery
      this.setupProductGallery();
    }
    reInit(imageSetIndex) {
      this.flkty.destroy();

      this.setOptions();

      this.flkty = new Flickity(this, this.options);

      // Setup Events
      this.setupEvents();

      this.selectedIndex = this.flkty.selectedIndex;
    }
    setupEvents() {
      const _this = this;
      // fix blank image
      window.dispatchEvent(new Event("resize"));
      // end fix
      document.querySelectorAll(".product-thumbnail").forEach((e) => {
        e.addEventListener("click", (ev) => {
          this.flkty.select([...e.parentElement.children].indexOf(e));
        });
      });
      if (this.prev_button) {
        let prev = this.prev_button.cloneNode(true);
        this.prev_button.parentNode.append(prev);
        this.prev_button.remove();
        prev.addEventListener("click", (event) => {
          this.flkty.previous();
        });
        prev.addEventListener("keyup", (event) => {
          this.flkty.previous();
          event.preventDefault();
        });
      }
      if (this.next_button) {
        let next = this.next_button.cloneNode(true);
        this.next_button.parentNode.append(next);
        this.next_button.remove();
        next.addEventListener("click", (event) => {
          this.flkty.next();
        });
        next.addEventListener("keyup", (event) => {
          this.flkty.next();
          event.preventDefault();
        });
      }
      this.video_containers.forEach((container) => {
        container
          .querySelector("button")
          .addEventListener("click", function () {
            container.setAttribute("hidden", "");
          });
      });
      this.flkty.on("settle", function (index) {
        _this.selectedIndex = index;
      });
      // console.log('当前元素：',this,$(this));

      const mobileItemNumber = $(this).siblings(".mobile-item-number")[0]; // 转换为原生 DOM 元素
      // this.closest('.thb-product-detail');
      // console.log('滑块个数：',this.flkty.slides.length,this.flkty);
      mobileItemNumber.innerHTML = `1 / ${this.flkty.slides.length}`;
      this.flkty.on("change", (index) => {
        mobileItemNumber.innerHTML = `${index + 1} / ${
          this.flkty.slides.length
        }`;
        let previous_slide = this.flkty.cells[_this.selectedIndex].element,
          previous_media = previous_slide.querySelector(
            ".product-single__media"
          ),
          active_thumbs = Array.from(this.thumbnails).filter((element) =>
            element.classList.contains("is-active")
          ),
          active_thumb = active_thumbs[index]
            ? active_thumbs[index]
            : active_thumbs[0];

        this.thumbnails.forEach((item, i) => {
          item.classList.remove("is-initial-selected");
        });
        active_thumb.classList.add("is-initial-selected");

        requestAnimationFrame(() => {
          if (active_thumb.offsetParent === null) {
            return;
          }
          const windowHalfHeight = active_thumb.offsetParent.clientHeight / 2,
            windowHalfWidth = active_thumb.offsetParent.clientWidth / 2;
          active_thumb.parentElement.scrollTo({
            left:
              active_thumb.offsetLeft -
              windowHalfWidth +
              active_thumb.clientWidth / 2,
            top:
              active_thumb.offsetTop -
              windowHalfHeight +
              active_thumb.clientHeight / 2,
            behavior: "smooth",
          });
        });

        // Stop previous video
        if (
          previous_media.classList.contains(
            "product-single__media-external-video"
          )
        ) {
          if (previous_media.dataset.provider === "youtube") {
            previous_media.querySelector("iframe").contentWindow.postMessage(
              JSON.stringify({
                event: "command",
                func: "pauseVideo",
                args: "",
              }),
              "*"
            );
          } else if (previous_media.dataset.provider === "vimeo") {
            previous_media.querySelector("iframe").contentWindow.postMessage(
              JSON.stringify({
                method: "pause",
              }),
              "*"
            );
          }
          previous_media
            .querySelector(".product-single__media-external-video--play")
            .removeAttribute("hidden");
        } else if (
          previous_media.classList.contains(
            "product-single__media-native-video"
          )
        ) {
          previous_media.querySelector("video").pause();
        }
      });

      setTimeout(() => {
        let active_thumbs = Array.from(this.thumbnails).filter(
          (element) => element.clientWidth > 0
        );
        active_thumbs.forEach((thumbnail, index) => {
          thumbnail.addEventListener("click", () => {
            this.thumbnailClick(thumbnail, index);
          });
        });
      });
    }
    thumbnailClick(thumbnail, index) {
      [].forEach.call(this.thumbnails, function (el) {
        el.classList.remove("is-initial-selected");
      });
      thumbnail.classList.add("is-initial-selected");
      this.flkty.select(index);
    }
    setDraggable(draggable) {
      this.flkty.options.draggable = draggable;
      this.flkty.updateDraggable();
    }
    selectCell(mediaId) {
      this.flkty.selectCell(mediaId);
    }
    setupProductGallery() {
      if (!this.querySelectorAll(".product-single__media-zoom").length) {
        return;
      }
      this.setEventListeners();
    }
    buildItems() {
      this.activeImages = Array.from(
        this.querySelectorAll(
          ".product-images__slide.is-active .product-single__media-image"
        )
      );

      return this.activeImages.map((item) => {
        let index = [].indexOf.call(
          item.parentNode.parentNode.children,
          item.parentNode
        );

        let activelink = item.querySelector(".product-single__media-zoom");

        activelink.dataset.index = index;
        return {
          src: activelink.getAttribute("href"),
          msrc: activelink.dataset.msrc,
          w: activelink.dataset.w,
          h: activelink.dataset.h,
        };
      });
    }
    setEventListeners() {
      const productSingleMediaObject = this.querySelectorAll(
        ".product-single__media"
      );
      let offsetValue = 0;
      this.links = [];
      for (let i = 0; i < productSingleMediaObject.length; i++) {
        let o = productSingleMediaObject[i];
        let possibleZoomLink = o.children[0];
        if (possibleZoomLink.classList.contains("product-single__media-zoom")) {
          Object.defineProperty(possibleZoomLink, "zoomObjectOffset", {
            value: offsetValue,
          });
          this.links.push(possibleZoomLink);
        } else {
          offsetValue++;
        }
      }
      this.pswpElement = document.querySelectorAll(".pswp")[0];
      this.pswpOptions = {
        maxSpreadZoom: 2,
        loop: false,
        allowPanToNext: false,
        closeOnScroll: false,
        showHideOpacity: false,
        arrowKeys: true,
        history: false,
        captionEl: false,
        fullscreenEl: false,
        zoomEl: false,
        shareEl: false,
        counterEl: true,
        arrowEl: true,
        preloaderEl: true,
        getThumbBoundsFn: () => {
          const thumbnail = this.querySelector(
              ".product-images__slide.is-selected"
            ),
            pageYScroll =
              window.pageYOffset || document.documentElement.scrollTop,
            rect = thumbnail.getBoundingClientRect();
          return {
            x: rect.left,
            y: rect.top + pageYScroll,
            w: rect.width,
          };
        },
      };

      this.links.forEach((link) => {
        link.addEventListener("click", (e) => this.zoomClick(e, link));
      });
    }
    zoomClick(e, link) {
      this.items = this.buildItems();
      this.pswpOptions.index = parseInt(
        link.dataset.index - link["zoomObjectOffset"],
        10
      );
      if (typeof PhotoSwipe !== "undefined") {
        let pswp = new PhotoSwipe(
          this.pswpElement,
          PhotoSwipeUI_Default,
          this.items,
          this.pswpOptions
        );
        pswp.listen("firstUpdate", function () {
          pswp.listen("parseVerticalMargin", function (item) {
            item.vGap = {
              top: 50,
              bottom: 50,
            };
          });
        });
        pswp.init();
      }
      e.preventDefault();
    }
  }
  customElements.define("product-slider", ProductSlider);
}

/**
 *  @class
 *  @function ProductForm
 */
if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.sticky = this.dataset.sticky;
        this.form = document.getElementById(
          `product-form-${this.dataset.section}`
        );
        this.form.querySelector("[name=id]").disabled = false;
        if (!this.sticky) {
          this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        }
        this.cartNotification = document.querySelector("cart-notification");
        this.body = document.body;

        this.hideErrors = this.dataset.hideErrors === "true";
      }

      onSubmitHandler(evt) {
        evt.preventDefault();

        if (!this.form.reportValidity()) {
          return;
        }

        const submitButtons = document.querySelectorAll(
          ".single-add-to-cart-button"
        );

        submitButtons.forEach((submitButton) => {
          if (submitButton.classList.contains("loading")) return;
          submitButton.setAttribute("aria-disabled", true);
          submitButton.classList.add("loading");
        });

        this.handleErrorMessage();

        const config = {
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/javascript",
          },
        };

        let formData = new FormData(this.form);

        formData.append(
          "sections",
          this.getSectionsToRender().map((section) => section.section)
        );
        formData.append("sections_url", window.location.pathname);
        config.body = formData;

        fetch(`${theme.routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {

            if (response.status) {
             
            
              dispatchCustomEvent("product:variant-error", {
                source: "product-form",
                productVariantId: formData.get("id"),
                errors: response.description,
                message: response.message,
              });
            
          
              
              this.handleErrorMessage(response.description);
              return;
            }

            this.renderContents(response);

            dispatchCustomEvent("cart:item-added", {
              product: response.hasOwnProperty("items")
                ? response.items[0]
                : response,
            });
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            submitButtons.forEach((submitButton) => {
              submitButton.classList.remove("loading");
              submitButton.removeAttribute("aria-disabled");
            });
          });
      }

      getSectionsToRender() {
        return [
          {
            id: "Cart",
            section: "main-cart",
            selector: ".thb-cart-form",
          },
          {
            id: "Cart-Drawer",
            section: "cart-drawer",
            selector: ".cart-drawer",
          },
          {
            id: "cart-drawer-toggle",
            section: "cart-bubble",
            selector: ".thb-item-count",
          },
        ];
      }
      renderContents(parsedState) {
        this.getSectionsToRender().forEach((section) => {
          if (!document.getElementById(section.id)) {
            return;
          }
          const elementToReplace =
            document
              .getElementById(section.id)
              .querySelector(section.selector) ||
            document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );

          if (typeof CartDrawer !== "undefined") {
            new CartDrawer();
          }
          if (typeof Cart !== "undefined") {
            new Cart().renderContents(parsedState);
          }
        });

        let product_drawer = document.getElementById("Product-Drawer"),
          search_drawer = document.getElementById("Search-Drawer");

        if (search_drawer.classList.contains("active")) {
          search_drawer.classList.remove("active");
        }
        if (product_drawer && product_drawer.contains(this)) {
          product_drawer.classList.remove("active");
          this.body.classList.remove("open-cc--product");
          if (document.getElementById("Cart-Drawer")) {
            this.body.classList.add("open-cc");
            document.getElementById("Cart-Drawer").classList.add("active");
          }
        } else if (document.getElementById("Cart-Drawer")) {
          this.body.classList.add("open-cc");
          document.getElementById("Cart-Drawer").classList.add("active");
          dispatchCustomEvent("cart-drawer:open");
        }
      }
      getSectionInnerHTML(html, selector = ".shopify-section") {
        return new DOMParser()
          .parseFromString(html, "text/html")
          .querySelector(selector).innerHTML;
      }
      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;
        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}

/**
 *  @class
 *  @function ProductAddToCartSticky
 */
// 检查是否已经注册了名为"product-add-to-cart-sticky"的自定义元素，避免重复注册
if (!customElements.get("product-add-to-cart-sticky")) {
  // 定义ProductAddToCartSticky类，继承自HTMLElement
  class ProductAddToCartSticky extends HTMLElement {
    constructor() {
      super();
      // 获取当前页面产品价格的文本内容（用于后续显示或调试）
      this.selectedText = document.querySelector(
        ".thb-product-detail .product-information ins .money"
      )?.innerText;
      // 判断是否启用动画（依赖body上的class和gsap库是否存在）
      this.animations_enabled =
        document.body.classList.contains("animations-true") &&
        typeof gsap !== "undefined";
      console.log("初始化this.selectedText==", this.selectedText);
    }
    // 当元素插入DOM时自动调用
    connectedCallback() {
      this.setupObservers(); // 设置可见性观察器
      this.setupToggle(); // 设置展开/收起切换逻辑
    }
    // 设置展开/收起切换逻辑
    setupToggle() {
      // 获取展开按钮和内容区域
      const button = this.querySelector(".product-add-to-cart-sticky--inner"),
        content = this.querySelector(".product-add-to-cart-sticky--content");

      // 如果启用动画，使用gsap实现动画效果
      if (this.animations_enabled) {
        // 创建gsap时间线，初始为反向暂停状态
        const tl = gsap.timeline({
          reversed: true,
          paused: true,
          onStart: () => {
            // 动画开始时，给按钮加上sticky-open样式
            button.classList.add("sticky-open");
          },
          onReverseComplete: () => {
            // 动画反向结束时，移除sticky-open样式
            button.classList.remove("sticky-open");
          },
        });

        // 设置内容区域初始状态为可见且高度自适应
        tl.set(
          content,
          {
            display: "block",
            height: "auto",
          },
          "start"
        ).from(
          content,
          {
            height: 0, // 动画从高度0开始
            duration: 0.25, // 动画时长0.25秒
          },
          "start+=0.001"
        );

        // 点击按钮时，切换动画的正向/反向播放，实现展开/收起
        button.addEventListener("click", function () {
          tl.reversed() ? tl.play() : tl.reverse();
          return false; // 阻止默认行为
        });
      } else {
        // 如果未启用动画，直接切换active样式
        // button.addEventListener("click", function () {
        //   content.classList.toggle("active");
        //   return false; // 阻止默认行为
        // });
      }
    }
    // 设置IntersectionObserver，监听表单和footer的可见性，控制吸底条的显示与隐藏
    setupObservers() {
      let _this = this,
        // 创建IntersectionObserver实例，监听目标元素的可见性变化
        observer = new IntersectionObserver(
          function (entries) {
            entries.forEach((entry) => {
              // 监听footer元素
              if (entry.target === footer) {
                if (entry.intersectionRatio > 0) {
                  // footer可见时，隐藏吸底条
                  _this.classList.remove("sticky--visible");
                } else if (entry.intersectionRatio == 0 && _this.formPassed) {
                  // footer不可见且表单已滚动通过，显示吸底条
                  _this.classList.add("sticky--visible");
                  console.log("this.selectedText1===", this.selectedText);
                }
              }
              // 监听产品表单元素
              if (entry.target === form) {
                let boundingRect = form.getBoundingClientRect();

                // 当表单不可见且页面已滚动超过表单底部，显示吸底条
                if (
                  entry.intersectionRatio === 0 &&
                  window.scrollY > boundingRect.top + boundingRect.height
                ) {
                  _this.formPassed = true;
                  _this.classList.add("sticky--visible");
                  console.log("this.selectedText2===", this.selectedText);
                } else if (entry.intersectionRatio === 1) {
                  // 表单完全可见时，隐藏吸底条
                  _this.formPassed = false;
                  _this.classList.remove("sticky--visible");
                }
              }
            });
          },
          {
            threshold: [0, 1], // 仅在完全不可见或完全可见时触发
          }
        ),
        // 获取产品表单和footer元素
        form = document.getElementById(`product-form-${this.dataset.section}`),
        footer = document.getElementById("footer");
      _this.formPassed = false; // 标记表单是否已滚动通过
      observer.observe(form); // 监听表单
      observer.observe(footer); // 监听footer
    }
  }

  // 注册自定义元素
  customElements.define("product-add-to-cart-sticky", ProductAddToCartSticky);
}

/**
 *  @class
 *  @function ProductSidePanelLinks
 */
if (!customElements.get("side-panel-links")) {
  class ProductSidePanelLinks extends HTMLElement {
    constructor() {
      super();
      this.links = this.querySelectorAll("button");
      this.drawer = document.getElementById("Product-Information-Drawer");
      this.buttons = this.drawer.querySelector(".side-panel-content--tabs");
      this.panels = this.drawer
        .querySelector(".side-panel-content--inner")
        .querySelectorAll(".side-panel-content--tab-panel");
      this.body = document.body;
    }
    connectedCallback() {
      this.setupObservers();
    }
    disconnectedCallback() {}
    setupObservers() {
      this.links.forEach((item, i) => {
        item.addEventListener("click", (e) => {
          this.body.classList.add("open-cc");
          this.buttons.toggleActiveClass(i);
          this.drawer.classList.add("active");
        });
      });
    }
  }

  customElements.define("side-panel-links", ProductSidePanelLinks);
}
