(function () {
    // Handle <video> and its <source> children
    document.addEventListener('lazybeforeunveil', function (e) {
      const el = e.target;
  
      // poster lazyload
      const poster = el.getAttribute('data-poster');
      if (poster) {
        el.setAttribute('poster', poster);
      }
  
      // If it's a VIDEO: move data-src on <video> itself and on its <source> children
      if (el.tagName === 'VIDEO') {
        // Promote <source data-src> to <source src>
        const sources = el.querySelectorAll('source[data-src]');
        sources.forEach(function (s) {
          s.setAttribute('src', s.getAttribute('data-src'));
          s.removeAttribute('data-src');
        });
  
        // Promote <video data-src> to <video src>
        const dataSrc = el.getAttribute('data-src');
        if (dataSrc) {
          el.setAttribute('src', dataSrc);
          el.removeAttribute('data-src');
        }
  
        // Ensure the browser re-evaluates media resource
        el.load();
  
        // If the element is configured for autoplay, start it once it can play
        const wantsAutoplay = el.hasAttribute('autoplay');
        if (wantsAutoplay) {
          const tryPlay = function () {
            // Many browsers require muted for autoplay; you already set muted
            el.play().catch(function () {});
            el.removeEventListener('canplay', tryPlay);
            el.removeEventListener('loadeddata', tryPlay);
          };
          el.addEventListener('canplay', tryPlay);
          el.addEventListener('loadeddata', tryPlay);
        }
      }
    });
  })();