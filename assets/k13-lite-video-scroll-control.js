        // 视频滚动控制主类
        class VideoScrollController {
            constructor() {
                // 关键DOM元素获取
                this.videoSection = document.getElementById('videoSection');
                this.videoContainer = document.querySelector('.video-container');
                this.videoPlayer = document.getElementById('videoPlayer');
                this.progressBar = document.getElementById('progressBar');
                this.currentTimeSpan = document.getElementById('currentTime');
                this.totalTimeSpan = document.getElementById('totalTime');
                // this.scrollIndicator = document.getElementById('scrollIndicator');
                this.playPauseBtn = document.getElementById('playPauseBtn');
                this.playStatus = document.getElementById('playStatus');
                this.debugBtn = document.getElementById('debugBtn');

                // 状态变量
                this.isVideoPlaying = false;    // 视频区域是否处于激活状态
                this.isScrollLocked = false;    // 页面滚动是否被锁定
                this.lastScrollTime = 0;        // 上一次滚动时间戳
                this.scrollThreshold = 200;     // 滚动阈值（未用，可扩展）
                this.seekStep = 0.4;            // 每次滚动快进/快退的秒数
                this.videoDuration = 0;         // 视频总时长
                this.isMobile = this.detectMobile(); // 是否为移动端

                // 平滑跳帧相关
                this.targetTime = null;         // 目标跳转时间
                this.seekAnimationFrame = null; // requestAnimationFrame句柄

                this.init();
            }

            // 初始化流程
            init() {
                this.setVideoSource();              // 设置视频源（区分移动/桌面）
                this.setupVideoPlayer();            // 绑定视频事件
                this.setupIntersectionObserver();   // 监听视频区域可见性
                this.setupEventListeners();         // 绑定滚动/触摸/键盘等事件
                this.updateProgressBar();           // 初始化进度条
            }

            // 绑定视频播放器相关事件
            setupVideoPlayer() {
                // 元数据加载完成，获取视频总时长
                this.videoPlayer.addEventListener('loadedmetadata', () => {
                    this.videoDuration = this.videoPlayer.duration;
                    // this.totalTimeSpan.textContent = this.formatTime(this.videoDuration);
                    this.updateProgressBar();
                });

                // 视频播放进度更新
                this.videoPlayer.addEventListener('timeupdate', () => {
                    // this.currentTimeSpan.textContent = this.formatTime(this.videoPlayer.currentTime);
                    this.updateProgressBar();
                });

                // // 视频播放状态变更
                // this.videoPlayer.addEventListener('play', () => {
                //     this.playStatus.textContent = '▶️ 播放中';
                // });

                // this.videoPlayer.addEventListener('pause', () => {
                //     this.playStatus.textContent = '⏸️ 已暂停';
                // });

                // // 视频播放结束，自动解锁滚动
                // this.videoPlayer.addEventListener('ended', () => {
                //     this.unlockScroll();
                //     this.playStatus.textContent = '⏹️ 播放完毕';
                // });

                // // 播放/暂停按钮
                // this.playPauseBtn.addEventListener('click', () => {
                //     this.togglePlayPause();
                // });

                // // 调试锁定按钮
                // this.debugBtn.addEventListener('click', () => {
                //     this.manualLockScroll();
                // });
            }

            // 使用Intersection Observer检测视频区域是否进入视窗
            setupIntersectionObserver() {
                const options = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.1 // 10%可见即触发
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.onVideoSectionVisible();
                        } else {
                            this.onVideoSectionHidden();
                        }
                    });
                }, options);

                observer.observe(this.videoSection);
            }

            // 绑定滚轮、触摸、键盘、滚动等事件
            setupEventListeners() {
                // PC端滚轮事件，控制视频快进/快退
                document.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

                // 移动端触摸事件
                let startY = 0;
                let startTime = 0;

                // 记录触摸起点
                document.addEventListener('touchstart', (e) => {
                    startY = e.touches[0].clientY;
                    startTime = Date.now();
                }, { passive: true });

                // 锁定滚动时阻止页面滑动
                document.addEventListener('touchmove', (e) => {
                    if (this.isScrollLocked) {
                        e.preventDefault();
                    }
                }, { passive: false });

                // 触摸结束，判断滑动方向和距离，控制视频
                document.addEventListener('touchend', (e) => {
                    const endY = e.changedTouches[0].clientY;
                    const endTime = Date.now();
                    const deltaY = startY - endY;
                    const deltaTime = endTime - startTime;

                    // 快速滑动且距离足够才触发
                    if (Math.abs(deltaY) > 30 && deltaTime < 500) {
                        if (deltaY > 0) {
                            this.handleScrollDown();
                        } else {
                            this.handleScrollUp();
                        }
                    }
                }, { passive: true });

                // 键盘方向键支持
                document.addEventListener('keydown', (e) => {
                    if (this.isScrollLocked) {
                        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                            e.preventDefault();
                            this.handleScrollDown();
                        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                            e.preventDefault();
                            this.handleScrollUp();
                        }
                    }
                });

                // 实时检测视频播放器位置，动态锁定/解锁滚动
                document.addEventListener('scroll', (e) => {
                    if (this.isScrollLocked) {
                        // 滚动被锁定时，强制让视频播放器保持在视窗顶部
                        const videoRect = this.videoPlayer.getBoundingClientRect();
                        if (Math.abs(videoRect.top) > 5) {
                            e.preventDefault();
                            const currentScrollTop = window.pageYOffset;
                            const newScrollTop = currentScrollTop + videoRect.top;
                            window.scrollTo(0, newScrollTop);
                        }
                    } else if (this.isVideoPlaying && !this.isScrollLocked) {
                        // 视频激活但未锁定时，若播放器到达顶部则自动锁定
                        if (this.isVideoPlayerAtTop()) {
                            console.log('🔒 滚动时检测到视频播放器位于视窗顶部，锁定滚动');
                            this.lockScroll();
                        }
                    }
                }, { passive: false });
            }

            // 平滑跳帧方法，避免直接跳变造成卡顿
            smoothSeek(targetTime) {
                if (this.seekAnimationFrame) {
                    cancelAnimationFrame(this.seekAnimationFrame);
                    this.seekAnimationFrame = null;
                }
                const current = this.videoPlayer.currentTime;
                const diff = targetTime - current;
                if (Math.abs(diff) < 0.01) {
                    this.videoPlayer.currentTime = targetTime;
                    return;
                }
                // 以每帧0.08s为步进，约12.5帧内完成0.5s跳转
                const step = Math.sign(diff) * Math.min(0.08, Math.abs(diff));
                this.videoPlayer.currentTime = current + step;
                this.seekAnimationFrame = requestAnimationFrame(() => this.smoothSeek(targetTime));
            }

            // 处理PC端滚轮事件
            handleWheel(e) {
                if (this.isScrollLocked) {
                    e.preventDefault();

                    const now = Date.now();
                    // 防抖，避免滚动过快
                    if (now - this.lastScrollTime < 80) {
                        return;
                    }

                    if (e.deltaY > 0) {
                        this.handleScrollDown();
                    } else {
                        this.handleScrollUp();
                    }

                    this.lastScrollTime = now;
                }
            }

            // 快进
            handleScrollDown() {
                // 计算目标时间，不能超过视频总时长
                let newTime = Math.min(this.videoPlayer.currentTime + this.seekStep, this.videoDuration);
                // 取消未完成的平滑跳帧
                if (this.seekAnimationFrame) {
                    cancelAnimationFrame(this.seekAnimationFrame);
                    this.seekAnimationFrame = null;
                }
                this.smoothSeek(newTime);

                // 播放到结尾自动解锁滚动
                if (newTime >= this.videoDuration) {
                    console.log('🎬 视频播放完毕，解锁滚动');
                    this.unlockScroll();
                }
            }

            // 快退
            handleScrollUp() {
                // 计算目标时间，不能小于0
                let newTime = Math.max(this.videoPlayer.currentTime - this.seekStep, 0);
                // 取消未完成的平滑跳帧
                if (this.seekAnimationFrame) {
                    cancelAnimationFrame(this.seekAnimationFrame);
                    this.seekAnimationFrame = null;
                }
                this.smoothSeek(newTime);

                // 回到开头自动解锁滚动
                if (newTime <= 0) {
                    console.log('🔄 视频回到开始位置，解锁滚动');
                    this.unlockScroll();
                }
            }

            // 切换播放/暂停
            togglePlayPause() {
                if (this.videoPlayer.paused) {
                    this.videoPlayer.play();
                    this.playPauseBtn.textContent = '⏸️';
                    this.playStatus.textContent = '▶️ 播放中';
                } else {
                    this.videoPlayer.pause();
                    this.playPauseBtn.textContent = '▶️';
                    this.playStatus.textContent = '⏸️ 已暂停';
                }
            }

            // 更新进度条宽度
            updateProgressBar() {
                if (this.videoDuration > 0) {
                    const progress = (this.videoPlayer.currentTime / this.videoDuration) * 100;
                    this.progressBar.style.width = progress + '%';
                }
            }

            // Intersection Observer回调：视频区域进入视窗
            onVideoSectionVisible() {
                if (!this.isVideoPlaying) {
                    this.isVideoPlaying = true;
                    console.log('🎬 视频区域进入可视区域');
                    // 延迟检测，避免滚动动画未完成
                    setTimeout(() => {
                        if (this.isVideoPlayerAtTop()) {
                            console.log('🔒 视频播放器位于视窗顶部，锁定滚动');
                            this.lockScroll();
                        } else {
                            console.log('⚠️ 视频播放器未位于视窗顶部，等待用户滚动');
                        }
                    }, 100);
                }
            }

            // Intersection Observer回调：视频区域离开视窗
            onVideoSectionHidden() {
                if (this.isVideoPlaying) {
                    this.isVideoPlaying = false;
                    console.log('🎬 视频区域离开可视区域，解锁滚动');
                    this.unlockScroll();
                }
            }

            // 锁定页面滚动，使视频播放器始终固定在视窗顶部
            lockScroll() {
                this.isScrollLocked = true;
                document.body.style.overflow = 'hidden';
                // this.scrollIndicator.textContent = '滚动状态: 已锁定';
                // this.scrollIndicator.className = 'scroll-indicator scroll-locked';

                // 计算目标滚动位置，使视频播放器顶端对齐视窗
                const targetScrollTop = window.pageYOffset + this.videoPlayer.getBoundingClientRect().top;

                // 延迟滚动，确保动画流畅
                setTimeout(() => {
                    window.scrollTo({
                        top: targetScrollTop,
                        behavior: 'smooth'
                    });
                }, 100);

                // 定时器持续校正，防止用户误操作导致偏移
                this.scrollMonitor = setInterval(() => {
                    if (this.isScrollLocked) {
                        const videoRect = this.videoPlayer.getBoundingClientRect();
                        if (Math.abs(videoRect.top) > 5) {
                            const currentScrollTop = window.pageYOffset;
                            const newScrollTop = currentScrollTop + videoRect.top;
                            window.scrollTo(0, newScrollTop);
                        }
                    }
                }, 50);
            }

            // 解锁页面滚动，恢复正常
            unlockScroll() {
                this.isScrollLocked = false;
                this.isVideoPlaying = false;
                document.body.style.overflow = '';
                // this.scrollIndicator.textContent = '滚动状态: 正常';
                // this.scrollIndicator.className = 'scroll-indicator scroll-unlocked';

                // 清除定时器
                if (this.scrollMonitor) {
                    clearInterval(this.scrollMonitor);
                    this.scrollMonitor = null;
                }

                // 取消任何未完成的平滑跳帧
                if (this.seekAnimationFrame) {
                    cancelAnimationFrame(this.seekAnimationFrame);
                    this.seekAnimationFrame = null;
                }

                console.log('🔓 滚动已解锁，页面可以正常滚动');

                // 再次延迟恢复，防止样式未及时生效
                setTimeout(() => {
                    if (!this.isScrollLocked) {
                        document.body.style.overflow = '';
                        console.log('✅ 滚动状态已完全重置');
                    }
                }, 100);
            }

            // 格式化时间（mm:ss）
            formatTime(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins}:${secs.toString().padStart(2, '0')}`;
            }

            // 重置视频到开头
            resetVideo() {
                if (this.seekAnimationFrame) {
                    cancelAnimationFrame(this.seekAnimationFrame);
                    this.seekAnimationFrame = null;
                }
                this.videoPlayer.currentTime = 0;
                this.updateProgressBar();
            }

            // 检测是否为移动端
            detectMobile() {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.innerWidth <= 768;
            }

            // 根据设备类型设置视频源
            setVideoSource() {
                if (this.isMobile) {
                    console.log('📱 移动端：使用移动端视频源');
                    this.videoPlayer.src = 'https://cdn.shopify.com/videos/c/o/v/d0c7c9bb2b2141a4900a51aff02151a2.mp4';
                } else {
                    console.log('💻 桌面端：使用桌面端视频源');
                    this.videoPlayer.src = 'https://cdn.shopify.com/videos/c/o/v/817f2dbad92f47ff9a449c13ab6adf02.mp4';
                }
            }

            // 判断视频播放器是否已到达视窗顶部（允许一定阈值）
            isVideoPlayerAtTop() {
                const videoRect = this.videoPlayer.getBoundingClientRect();
                const threshold = 100;
                return videoRect.top <= threshold && videoRect.top >= -threshold;
            }

            // 手动锁定/解锁滚动（调试用）
            manualLockScroll() {
                if (!this.isScrollLocked) {
                    console.log('🔒 手动触发滚动锁定');
                    this.isVideoPlaying = true;
                    this.lockScroll();
                } else {
                    console.log('🔓 手动解锁滚动');
                    this.unlockScroll();
                }
            }

     
        }

        // 页面加载完成后初始化控制器
        document.addEventListener('DOMContentLoaded', () => {
            new VideoScrollController();

            // 关键功能说明日志
            console.log('🎬 视频滚动控制已启动！');
            console.log('📱 向下滚动或滑动快进视频（每次0.5秒）');
            console.log('🔄 向上滚动或滑动快退视频（每次0.5秒）');
            console.log('🎥 点击播放/暂停按钮控制视频播放');
            console.log('🔒 只有当视频播放器位于视窗顶部时才锁定滚动');
            console.log('🖥️ 视频全屏展示，移动端和桌面端使用不同视频源');
            console.log('🔧 点击右上角红色🔒按钮可手动锁定/解锁滚动（调试用）');
            console.log('✅ 已修复：视频播放完毕或回退到开始时页面可正常滚动');
        });

        // 页面滚动时实现section视差动画
        // window.addEventListener('scroll', () => {
        //     const scrolled = window.pageYOffset;
        //     const parallax = scrolled * 0.5;

        //     const sections = document.querySelectorAll('.section');
        //     sections.forEach((section, index) => {
        //         const speed = 0.1 + (index * 0.05);
        //         section.style.transform = `translateY(${parallax * speed}px)`;
        //     });
        // });