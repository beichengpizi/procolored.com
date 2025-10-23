// 进度条 How to Unlock Your Hidden Edition 如何解锁隐藏版本
const editionProgressBar = document.getElementById("editionProgressBar");
const editionProgressPoints = document.querySelectorAll(
  ".how-to-unlock-your-hidden-edition-progress-point"
);
const editionTimelineContainer = document.querySelector(
  ".how-to-unlock-your-hidden-edition-timeline-container"
);
const editionStartDateUTC = "2025-09-01T21:00:00-08:00";
const editionFirstPhaseEndUTC = "2025-10-10T21:00:00-08:00";
const editionSecondPhaseEndUTC = "2025-10-20T21:00:00-08:00";
const editionThirdPhaseEndUTC = "2025-10-31T21:00:00-08:00";

function formatUtcTime(v) {
  let date = new Date(v);
  return (
    date.getFullYear() +
    "/" +
    (date.getMonth() + 1) +
    "/" +
    (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
    " " +
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
    ":" +
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
    ":" +
    (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds())
  );
}
// 创建 Intersection Observer
const editionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 添加动画类
        editionProgressBar.classList.add("animate");
        editionCalculateProgress(
          editionStartDateUTC,
          editionFirstPhaseEndUTC,
          editionSecondPhaseEndUTC,
          editionThirdPhaseEndUTC,
          editionProgressBar,
          editionProgressPoints
        );
        editionObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);
if (
  editionProgressBar &&
  editionProgressPoints.length > 0 &&
  editionTimelineContainer
) {
  editionObserver.observe(editionTimelineContainer);
}

// 计算进度（根据当前日期按比例计算）
function editionCalculateProgress(
  startDateUTC,
  firstPhaseEndUTC,
  secondPhaseEndUTC,
  thirdPhaseEndUTC,
  progressBar,
  progressPoints
) {
  // 如果 progressBar 为空，直接返回，防止报错
  if (!progressBar) {
    return;
  }
  const now = formatUtcTime(new Date().toUTCString());
  const nowDateTimestamp = new Date(now).getTime();
  const startDate = formatUtcTime(startDateUTC);
  const firstPhaseEnd = formatUtcTime(firstPhaseEndUTC);
  const secondPhaseEnd = formatUtcTime(secondPhaseEndUTC);
  const thirdPhaseEnd = formatUtcTime(thirdPhaseEndUTC);

  // 新增对应的时间戳（毫秒数）
  const startDateTimestamp = new Date(startDate).getTime();
  const firstPhaseEndTimestamp = new Date(firstPhaseEnd).getTime();
  const secondPhaseEndTimestamp = new Date(secondPhaseEnd).getTime();
  const thirdPhaseEndTimestamp = new Date(thirdPhaseEnd).getTime();

  // 计算天数差
  const getDaysDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  };

  let progress = 0;
  // 进度规则：
  // 未到startDate，进度为0
  if (nowDateTimestamp < startDateTimestamp) {
    progress = 0;
  }
   // 第一阶段：startDate ~ firstPhaseEnd，0%~15%
  else if (
    nowDateTimestamp >= startDateTimestamp &&
    nowDateTimestamp < firstPhaseEndTimestamp
  ) {
    const totalDays = getDaysDifference(startDate, firstPhaseEnd);
    const passedDays = getDaysDifference(startDate, now);
    progress = 0 + ((passedDays / totalDays) * (15 - 0));
    if (progress > 15) progress = 15;
  } 
  // 第二阶段：firstPhaseEnd ~ secondPhaseEnd，15%~50%
  else if (
    nowDateTimestamp >= firstPhaseEndTimestamp &&
    nowDateTimestamp < secondPhaseEndTimestamp
  ) {
    const totalDays = getDaysDifference(firstPhaseEnd, secondPhaseEnd);
    const passedDays = getDaysDifference(firstPhaseEnd, now);
    progress = 15 + ((passedDays / totalDays) * (50 - 15));
    if (progress > 50) progress = 50;
  }
  // 第三阶段：secondPhaseEnd ~ thirdPhaseEnd，50%~85%
  else if (
    nowDateTimestamp >= secondPhaseEndTimestamp && nowDateTimestamp < thirdPhaseEndTimestamp
  ) {
    const totalDays = getDaysDifference(secondPhaseEnd, thirdPhaseEnd);
    const passedDays = getDaysDifference(secondPhaseEnd, now);
    progress = 50 + ((passedDays / totalDays) * (85 - 50));
    if (progress > 85) progress = 85;
  } 
  // 超过thirdPhaseEnd，进度为85%~100%
  else if (nowDateTimestamp >= thirdPhaseEndTimestamp) {
    progress = 100;
  }

  // 确保进度在0-100之间
  progress = Math.max(0, Math.min(100, progress));
  console.log("进度==", progress);

  // 判断是否为移动端
  const isMobile = window.innerWidth <= 768;

  // 根据设备类型设置不同的transform-origin和transform
  if (isMobile) {
    console.log("移动端");
    progressBar.style.transformOrigin = "top";
    progressBar.style.transform = `scaleY(${progress / 100})`;
    progressBar.style.height = `${progress}%`;
  } else {
    console.log("pc端");
    progressBar.style.width = `${progress}%`;
    progressBar.style.transformOrigin = "left";
    progressBar.style.transform = `scaleX(${progress / 100})`;
  }

    // 更新点的状态
    // 4个点：第一个15%，第二个50%，第三个85%，第四个100%
    const pointThresholds = [15, 50, 85, 100];
  progressPoints.forEach((point, index) => {
    if (progress >= pointThresholds[index]) {
      point.classList.add("completed");
      // 获取当前点的祖先元素
      const progressBarAncestor = point.closest(
        ".how-to-unlock-your-hidden-edition-content-bottom-progress-bar"
      );
      if (progressBarAncestor) {
        const dateSection = progressBarAncestor.querySelector(
          ".how-to-unlock-your-hidden-edition-date-section"
        );
        if (dateSection) {
          const datePoints = dateSection.querySelectorAll(".date-point");
          const currentDatePoint = datePoints[index];
          if (currentDatePoint) {
            const joinButton = currentDatePoint.querySelector(
              ".how-to-unlock-your-hidden-edition-join-button"
            );
            if (joinButton) {
              joinButton.classList.add("active");
            }
          }
        }
        const dateSection_mb = progressBarAncestor.querySelector(
          ".how-to-unlock-your-hidden-edition-progress-text-container"
        );
        if (dateSection_mb) {
          const datePoints_mb = dateSection_mb.querySelectorAll(
            ".progress-text-item"
          );
          const currentDatePoint_mb = datePoints_mb[index];
          if (currentDatePoint_mb) {
            const joinButton_mb = currentDatePoint_mb.querySelector(
              ".how-to-unlock-your-hidden-edition-join-button"
            );
            if (joinButton_mb) {
              joinButton_mb.classList.add("active");
            }
          }
        }
      }
    } else {
      point.classList.remove("completed");
    }
  });
}

if (
  editionProgressBar &&
  editionProgressPoints.length > 0 &&
  editionTimelineContainer
) {
  // 初始化进度
  editionCalculateProgress(
    editionStartDateUTC,
    editionFirstPhaseEndUTC,
    editionSecondPhaseEndUTC,
    editionThirdPhaseEndUTC,
    editionProgressBar,
    editionProgressPoints
  );

  // 监听窗口大小变化
  window.addEventListener("resize",function () {
    if (editionProgressBar) {
      editionCalculateProgress(
        editionStartDateUTC,
        editionFirstPhaseEndUTC,
        editionSecondPhaseEndUTC,
        editionThirdPhaseEndUTC,
        editionProgressBar,
        editionProgressPoints
      );
    }
  } );
}
