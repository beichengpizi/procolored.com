/**
 *  @class
 *  @function SlideShow
 */
if (!customElements.get('slide-show')) {
  class SlideShow extends HTMLElement {
    constructor() {
      super();
      const slideshow = this;
      let
        parent_section = slideshow.closest('.shopify-section'),
        dots = slideshow.dataset.dots === 'true',
        slideshow_slides = Array.from(slideshow.querySelectorAll('.carousel__slide')),
        autoplay = slideshow.dataset.autoplay == 'false' ? false : parseInt(slideshow.dataset.autoplay, 10),
        align = slideshow.dataset.align == 'center' ? 'center' : 'left',
        fade = slideshow.dataset.fade == 'true',
        pageDots = slideshow.dataset.dots == 'true',
        prev_button = slideshow.querySelector('.flickity-prev'),
        next_button = slideshow.querySelector('.flickity-next'),
        header = document.querySelector('theme-header'),
        custom_dots = slideshow.querySelector('.flickity-custom-dots'),
        custom_navigation = slideshow.querySelector('.flickity-custom-navigation'),
        autoplay_progress = slideshow.querySelector('.slideshow--autoplay-progress'),
        progress_bar = slideshow.parentNode.querySelector('.flickity-progress--bar'),
        animations = [],
        rightToLeft = document.dir === 'rtl',
        animations_enabled = document.body.classList.contains('animations-true') && typeof gsap !== 'undefined',
        selectedIndex = 0,
        args = {
          wrapAround: true,
          cellAlign: align,
          pageDots: pageDots,
          contain: true,
          fade: fade,
          autoPlay: autoplay,
          rightToLeft: rightToLeft,
          prevNextButtons: false,
          cellSelector: '.carousel__slide',
          on: {}
        };

      this.paused = false;

      // 优化自动播放逻辑
      if (autoplay) {
        this.autoplayTimer = null;
        this.startAutoplay = () => {
          if (!this.paused) {
            this.autoplayTimer = setInterval(() => {
              if (!this.paused) {
                this.next();
              }
            }, autoplay);
          }
        };
        this.stopAutoplay = () => {
          if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
          }
        };
      }

      if (custom_dots) {
        args.pageDots = false;
      }

      // 优化图片加载
      if (slideshow.classList.contains('image-with-text-slideshow--content')) {
        let main_slideshow = slideshow.parentNode.querySelector('.image-with-text-slideshow--image');
        args.draggable = false;
        args.asNavFor = main_slideshow;
        
        // 预加载下一张图片
        args.on.change = (index) => {
          const nextIndex = (index + 1) % slideshow_slides.length;
          const nextSlide = slideshow_slides[nextIndex];
          if (nextSlide) {
            const img = nextSlide.querySelector('img[loading="lazy"]');
            if (img) {
              img.loading = 'eager';
            }
          }
        };
      }

      if (slideshow.classList.contains('image-with-text-slideshow--image')) {
        let image_slideshow_slides = slideshow.querySelectorAll('.image-with-text-slideshow--image-media');

        if (image_slideshow_slides.length && image_slideshow_slides[0].classList.contains('desktop-height-auto')) {
          args.adaptiveHeight = true;
        }
      }

      // 优化响应式高度调整
      if (slideshow.classList.contains('image-with-text-slideshow--content') ||
          slideshow.classList.contains('customer-reviews--content') ||
          slideshow.classList.contains('customer-reviews--image')) {
        args.adaptiveHeight = true;
        
        // 添加resize监听
        const resizeObserver = new ResizeObserver(() => {
          if (this.flkty) {
            this.flkty.resize();
          }
        });
        
        slideshow_slides.forEach(slide => {
          resizeObserver.observe(slide);
        });
      }

      if (slideshow.classList.contains('customer-reviews--carousel')) {
        args.wrapAround = false;
        args.adaptiveHeight = false;
        args.resize = true;
        args.on.ready = function() {
          let flkty = this;
          flkty.resize();
          document.fonts.ready.then(() => {
            flkty.resize();
          });
        };
      }
      
      if (slideshow.classList.contains('collection-grid__carousel')) {
        args.wrapAround = false;
      }

      // 主轮播图优化
      if (slideshow.classList.contains('main-slideshow')) {
        if (animations_enabled) {
          this.prepareAnimations(slideshow, animations);
        }

        args.on = {
          staticClick: function() {
            this.unpausePlayer();
          },
          ready: function() {
            let flkty = this;

            // 透明头部padding处理
            if (header?.classList.contains('transparent--true')) {
              const sections = Array.from(document.querySelector('#main-content').querySelectorAll(':scope > .shopify-section'));
              const index = sections.indexOf(parent_section);

              if (index === 0 && slideshow.classList.contains('section-spacing--disable-top')) {
                slideshow.classList.add('slideshow--top');
              }
            }

            // 动画处理
            if (animations_enabled) {
              slideshow.animateSlides(0, slideshow, animations);
            }

            // 自动播放进度
            if (autoplay && autoplay_progress && animations_enabled) {
              slideshow.setupAutoplayProgress(slideshow);
            }

            // 字体加载后重新计算尺寸
            document.fonts.ready.then(() => {
              flkty.resize();
            });

            // 视频支持
            const video_container = flkty.cells[0].element.querySelector('.slideshow__slide-video-bg');
            if (video_container) {
              if (video_container.querySelector('iframe')) {
                video_container.querySelector('iframe').onload = () => {
                  slideshow.videoPlay(video_container);
                };
              } else if (video_container.querySelector('video')) {
                video_container.querySelector('video').onloadstart = () => {
                  slideshow.videoPlay(video_container);
                };
              }
            }
          },
          change: function(index) {
            let flkty = this;
            const previousIndex = fizzyUIUtils.modulo(flkty.selectedIndex - 1, flkty.slides.length);

            // 动画处理
            if (animations_enabled) {
              slideshow.animateReverse(previousIndex, slideshow, animations);
              slideshow.animateSlides(index, slideshow, animations);
            }

            // 颜色变化
            const color_text = getComputedStyle(this.selectedElement).getPropertyValue('--color-text');
            if (autoplay_progress && animations_enabled) {
              autoplay_progress.style.setProperty('--color-body', color_text);
            }
            
            const dots = slideshow.querySelector('.flickity-page-dots');
            if (dots) {
              dots.style.setProperty('--color-body', color_text);
            }

            // 自定义导航
            if (custom_navigation) {
              custom_navigation.querySelector('.flickity-custom-navigation--current').innerHTML = this.selectedIndex + 1;
            }

            // 自动播放进度
            if (autoplay) {
              if (flkty.player.state !== 'paused') {
                flkty.stopPlayer();
                flkty.playPlayer();
              }

              if (autoplay_progress && animations_enabled) {
                slideshow.autoPlayProgressTL.progress(0);

                if (flkty.player.state !== 'paused') {
                  slideshow.autoPlayProgressTL.play();
                }
              }
            }

            // 视频处理
            const video_container_prev = flkty.cells[previousIndex].element.querySelector('.slideshow__slide-video-bg');
            if (video_container_prev) {
              slideshow.videoPause(video_container_prev);
            }

            const video_container = flkty.cells[index].element.querySelector('.slideshow__slide-video-bg');
            if (video_container) {
              const iframe = video_container.querySelector('iframe');
              if (iframe) {
                if (iframe.classList.contains('lazyload')) {
                  iframe.addEventListener('lazybeforeunveil', () => slideshow.videoPlay(video_container));
                  lazySizes.loader.checkElems();
                } else {
                  slideshow.videoPlay(video_container);
                }
              } else if (video_container.querySelector('video')) {
                slideshow.videoPlay(video_container);
              }
            }
          }
        };

        if (slideshow.classList.contains('desktop-height-image') || slideshow.classList.contains('mobile-height-image')) {
          args.adaptiveHeight = true;
        }
      }

      // Media with tabs
      if (slideshow.classList.contains('media-with-tabs--media')) {
        args.draggable = false;
        args.on = {
          staticClick: function() {
            this.unpausePlayer();
          },
          ready: function() {
            const video_container = this.cells[0].element.querySelector('.media-with-tabs--media--video');
            if (video_container) {
              video_container.querySelector('video').onloadstart = () => {
                slideshow.videoPlay(video_container);
              };
            }
          },
          change: function(index) {
            const previousIndex = fizzyUIUtils.modulo(this.selectedIndex - 1, this.slides.length);

            const video_container_prev = this.cells[previousIndex].element.querySelector('.media-with-tabs--media--video');
            if (video_container_prev) {
              slideshow.videoPause(video_container_prev);
            }

            const video_container = this.cells[index].element.querySelector('.media-with-tabs--media--video');
            if (video_container) {
              slideshow.videoPlay(video_container);
            }
          }
        };
      }

      // 公告栏颜色变化
      if (slideshow.classList.contains('announcement-bar--use-colors-true')) {
        args.on.change = function(index) {
          const container = slideshow.closest('.announcement-bar');
          const color_text = this.selectedElement.dataset.color;
          const color_bg = this.selectedElement.dataset.bg;

          container.style.setProperty('--color-announcement-bar-bg', color_bg);
          container.style.setProperty('--color-announcement-bar-text', color_text);
        };
      }

      // 产品轮播
      if (slideshow.classList.contains('products')) {
        args.wrapAround = false;
        args.on.ready = function() {
          if (next_button) {
            window.addEventListener('resize.center_arrows', () => {
              slideshow.centerArrows(this, slideshow, prev_button, next_button);
            });
            window.dispatchEvent(new Event('resize.center_arrows'));
          }
        };
      }

      // 进度条
      if (progress_bar) {
        // 禁用循环播放
        args.wrapAround = false;
        // 滚动时更新进度条
        args.on.scroll = function(progress) {
          // 限制进度值在0-1之间
          progress = Math.max(0, Math.min(1, progress));
          // 设置进度条宽度
          progress_bar.style.width = `${progress * 100}%`;
        };
      }

      // 自定义点
      if (custom_dots) {
        args.on = {
          ready: function() {
            const dots = custom_dots.querySelectorAll('li');
            dots.forEach((dot, i) => {
              dot.addEventListener('click', () => {
                this.select(i);
              });
            });
            dots[this.selectedIndex].classList.add('is-selected');
          },
          change: function() {
            const dots = custom_dots.querySelectorAll('li');
            dots.forEach(dot => {
              dot.classList.remove('is-selected');
            });
            dots[this.selectedIndex].classList.add('is-selected');
          }
        };
      }

      // 客户评价
      if (slideshow.classList.contains('customer-reviews--carousel')) {
        args.on.ready = function() {
          if (next_button) {
            window.addEventListener('resize.center_arrows', () => {
              slideshow.centerArrows(this, slideshow, prev_button, next_button);
            });
            window.dispatchEvent(new Event('resize.center_arrows'));
          }
        };
      }

      // 初始化
      this.flkty = new Flickity(slideshow, args);
      selectedIndex = this.flkty.selectedIndex;
      slideshow.dataset.initiated = 'true';

      // 箭头事件
      if (prev_button) {
        prev_button.addEventListener('click', () => {
          this.flkty.previous();
        });
        prev_button.addEventListener('keyup', () => {
          this.flkty.previous();
        });
        next_button.addEventListener('click', () => {
          this.flkty.next(); 
        });
        next_button.addEventListener('keyup', () => {
          this.flkty.next();
        });
      }

      // 主题编辑器
      if (Shopify.designMode) {
        slideshow.addEventListener('shopify:block:select', (event) => {
          const index = slideshow_slides.indexOf(event.target);
          this.flkty.select(index);
        });
      }
    }

    setupAutoplayProgress(slideshow) {
      slideshow.autoPlayProgressTL = gsap.timeline({
        inherit: false
      });
      
      slideshow.autoPlayProgressTL
        .fromTo(slideshow.querySelector('.thb-slideshow-progress--svg circle'), 
          { drawSVG: 0 },
          { 
            duration: parseInt(slideshow.dataset.autoplay, 10) / 1000,
            ease: 'none',
            drawSVG: true
          }
        );

      slideshow.addEventListener('mouseenter', () => {
        slideshow.autoPlayProgressTL.pause().progress(0);
      });

      slideshow.addEventListener('mouseleave', () => {
        slideshow.autoPlayProgressTL.play();
      });
    }

    videoPause(video_container) {
      requestAnimationFrame(() => {
        video_container.querySelector('video')?.pause();
      });
    }

    videoPlay(video_container) {
      requestAnimationFrame(() => {
        video_container.querySelector('video')?.play();
      });
    }

    prepareAnimations(slideshow, animations) {
      if (!slideshow.dataset.animationsReady) {
        const splittext = new SplitText(
          slideshow.querySelectorAll('.slideshow__slide-heading, p:not(.subheading)'),
          {
            type: 'lines',
            linesClass: 'line-child'
          }
        );

        const mask = new SplitText(
          slideshow.querySelectorAll('.slideshow__slide-heading, p:not(.subheading)'),
          {
            type: 'lines',
            linesClass: 'line-parent'
          }
        );

        slideshow.querySelectorAll('.slideshow__slide').forEach((item, i) => {
          const tl = gsap.timeline({ paused: true });
          let button_offset = 0;

          animations[i] = tl;

          if (slideshow.dataset.transition == 'zoom') {
            tl.to(
              item.querySelectorAll('.slideshow__slide-bg, .slideshow__slide-video-bg'),
              {
                duration: 1.5,
                scale: 1
              },
              "start"
            );
          }

          if (item.querySelector('.inline-badge')) {
            tl.fromTo(
              item.querySelector('.inline-badge'),
              { opacity: 0 },
              { duration: 0.5, opacity: 1 },
              0
            );
            button_offset += 0.2;
          }

          if (item.querySelector('.subheading')) {
            tl.fromTo(
              item.querySelector('.subheading'),
              { opacity: 0 },
              { duration: 0.5, opacity: 1 },
              0
            );
            button_offset += 0.5;
          }

          if (item.querySelector('h1')) {
            const h1_duration = 1 + ((item.querySelectorAll('.slideshow__slide-heading .line-child').length - 1) * 0.1);
            tl
              .set(item.querySelectorAll('.slideshow__slide-heading'), { opacity: 1 }, 0)
              .from(item.querySelectorAll('.slideshow__slide-heading .line-child'), {
                duration: h1_duration,
                yPercent: 120,
                stagger: 0.1,
                rotation: '3deg'
              }, 0);
            button_offset += h1_duration;
          }

          if (item.querySelector('p.split-text')) {
            const p_duration = 1 + ((item.querySelectorAll('p.split-text .line-child').length - 1) * 0.05);
            tl
              .set(item.querySelectorAll('p.split-text'), { opacity: 1 }, 0)
              .from(item.querySelectorAll('p:not(.subheading) .line-child'), {
                duration: p_duration,
                yPercent: 120,
                stagger: 0.1,
                rotation: '3deg'
              }, 0);
            button_offset += p_duration;
          }

          if (item.querySelectorAll('.button, .text-button').length) {
            tl.fromTo(
              item.querySelectorAll('.button, .text-button'),
              { y: '100%' },
              {
                duration: 0.5,
                y: '0%',
                stagger: 0.1
              },
              button_offset * 0.2
            );
          }

          item.dataset.timeline = tl;
        });

        slideshow.dataset.animationsReady = 'true';
      }
    }

    animateSlides(i, slideshow, animations) {
      const flkty = Flickity.data(slideshow);
      document.fonts.ready.then(() => {
        animations[i]?.restart();
      });
    }

    animateReverse(i, slideshow, animations) {
      animations[i]?.reverse();
    }

    centerArrows(flickity, slideshow, prev_button, next_button) {
      const first_cell = flickity.cells[0];
      let max_height = 0;
      let image_height = 0;

      if (first_cell.element.querySelector('.product-featured-image')) {
        image_height = first_cell.element.querySelector('.product-featured-image').clientHeight;
      } else if (first_cell.element.querySelector('.gallery--item')) {
        image_height = flickity.cells[1]?.element.querySelector('.product-featured-image')?.clientHeight || 0;
      }

      if (slideshow.classList.contains('customer-reviews--carousel')) {
        if (first_cell.element.querySelector('.customer-reviews--product')) {
          image_height = flickity.cells[1]?.element.querySelector('.customer-reviews--product')?.clientHeight || 0;
        }
      }

      if (image_height > 0) {
        flickity.cells.forEach(item => {
          max_height = Math.max(max_height, item.size.height);
        });

        if (max_height > image_height) {
          const difference = (max_height - image_height) / -2;
          prev_button.style.transform = `translateY(${difference}px)`;
          next_button.style.transform = `translateY(${difference}px)`;
        }
      }
    }
  }

  customElements.define('slide-show', SlideShow);
}
