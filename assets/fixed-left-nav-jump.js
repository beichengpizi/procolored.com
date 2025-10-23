
  (function(){
    const toc = document.getElementById('toc');
    const tocBar = document.getElementById('tocBar');
    const links = Array.from(document.querySelectorAll('.toc__link'));
    const sections = links.map(a => document.querySelector(a.getAttribute('href')));
    const hero = document.getElementById('k13-lite-get-the-best-price');
    let isProgrammaticScroll = false; // 点击锚点触发的平滑滚动期间，抑制进度条抖动
    let programmaticTimer = null;


    // 显示/隐藏逻辑：滚过第一个内容区（hero 的底部）后显示，滚到指定区域（如 s4）底部后隐藏
    // 你可以根据需要将 hideSectionId 改为任意你想要隐藏锚点的区块 id
    const hideSectionId = 'k13-lite-parameter-table'; // 例如滚动到 s4 区域底部后隐藏
    const hideSection = document.getElementById(hideSectionId);

    const toggleTocVisibility = () => {
      const scrollY = window.scrollY;
      const heroBottom = hero.offsetTop + hero.offsetHeight - 1;
      const hideSectionBottom = hideSection.offsetTop + hideSection.offsetHeight;
      const windowBottom = scrollY + window.innerHeight;
      // 只要滚过hero底部且未到指定隐藏区块底部，就显示
      const show = scrollY >= heroBottom && windowBottom < hideSectionBottom - 10;
      toc.classList.toggle('toc--show', show);
    };

    // 点击平滑跳转（进一步确保 offset 定位）
    links.forEach((a, idx) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = sections[idx];
                // 标记为程序触发的滚动，避免进度条在滚动过程中多次被 IO 回调改写
                isProgrammaticScroll = true;
                if(programmaticTimer){ clearTimeout(programmaticTimer); }
                programmaticTimer = setTimeout(()=>{ isProgrammaticScroll = false; }, 900);
        
                // 优先使用 scrollend 结束事件，解除抑制
                if('onscrollend' in window){
                  const off = () => { isProgrammaticScroll = false; window.removeEventListener('scrollend', off, { once:true }); };
                  window.addEventListener('scrollend', off, { once:true });
                }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // 立即设置激活样式（滚动结束后也会被 Observer 校正）
        setActiveByIndex(idx);
        setProgressByIndex(idx);
      }, { passive: false });
    });

    // 设置激活态
    function setActiveByIndex(activeIdx){
      links.forEach((a,i)=>a.classList.toggle('is-active', i===activeIdx));
    }

    // 设置进度（按区块序号线性映射到 0%~100%）
    function setProgressByIndex(idx){
      const pct = (idx) / (sections.length - 1);
      tocBar.style.height = (pct * 100) + '%';
    }

    // 使用 IntersectionObserver 根据滚动自动高亮与进度
    const io = new IntersectionObserver((entries)=>{
        if(isProgrammaticScroll) return; // 在平滑滚动时忽略 IO 回调，避免进度条伸缩
      // 找到视窗内可见度最高的那个 section
      let best = { idx: -1, ratio: 0 };
      for(const entry of entries){
        const idx = sections.indexOf(entry.target);
        if(entry.intersectionRatio > best.ratio){
          best = { idx, ratio: entry.intersectionRatio };
        }
      }
      if(best.idx >= 0){
        setActiveByIndex(best.idx);
        setProgressByIndex(best.idx);
      }
    },{
      root:null,
      threshold: buildThresholds(20), // 更平滑
      rootMargin: '-15% 0px -15% 0px' // 提前/延后切换
    });

    sections.forEach(sec=>io.observe(sec));

    // 初始与滚动时机：控制显示/隐藏
    toggleTocVisibility();
    window.addEventListener('scroll', toggleTocVisibility, { passive:true });
    window.addEventListener('resize', toggleTocVisibility);

    // 工具：生成 0..1 的 thresholds
    function buildThresholds(steps){
      const t = [];
      for(let i=0;i<=steps;i++){ t.push(i/steps); }
      return t;
    }
  })();
