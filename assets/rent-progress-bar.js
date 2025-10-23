class RentProgressBar extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    const width = this.getAttribute('data-width') || 0;
    const description = this.getAttribute('description') || '';
    const description2 = this.getAttribute('description2') || '';
    // 设置HTML结构
    this.shadow.innerHTML = `
      <div class="progress-bar-background">
        <div class="progress-bar"></div>
      </div>

    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .progress-bar-background {
        width: 100%;
        height: 10px;
        background-color: #e0e0e0;
        border-radius: 5px;
      }

      .progress-bar {
        height: 10px;
        background-color: #f7931e;
        border-radius: 5px;
        width: 0%;
        transition: width 3s ease-in-out;
      }
      p {
        color: #000;
        font-size: 18px;
        margin-top: 10px;
        margin-bottom: 0;
        line-height: 1.1;
      }

      @media (max-width: 768px) {
        p {
          font-size: 14px;
        }
      }
    `;
    this.shadow.appendChild(style);

    this.initObserver(width);
  }

  initObserver(width) {
    const bar = this.shadow.querySelector('.progress-bar');
    
    const callback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bar.style.width = `${width}%`;
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.1
    });

    observer.observe(this);
  }
}

window.customElements.define('rent-progress-bar', RentProgressBar);
