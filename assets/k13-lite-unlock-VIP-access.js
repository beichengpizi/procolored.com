// 进度条 Unlock  VIP Access - Subscribe for Special Offers!
const vipProgressBar = document.getElementById("vipProgressBar");
const vipProgressPoints = document.querySelectorAll(
  ".k13-lite-unlock-VIP-access-progress-point"
);
const vipTimelineContainer = document.querySelector(
  ".k13-lite-unlock-VIP-access-timeline-container"
);
const vipStartDateUTC = "2025-09-01T15:00:00+08:00";
const vipFirstPhaseEndUTC = "2025-09-26T15:00:00+08:00";
const vipSecondPhaseEndUTC = "2025-10-15T15:00:00+08:00";
const vipThirdPhaseEndUTC = "2025-11-01T15:00:00+08:00";
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
const vipObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 添加动画类
        vipProgressBar.classList.add("animate");
        vipCalculateProgress(
          vipStartDateUTC,
          vipFirstPhaseEndUTC,
          vipSecondPhaseEndUTC,
          vipThirdPhaseEndUTC,
          vipProgressBar,
          vipProgressPoints
        );
        vipObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

if (vipProgressBar && vipProgressPoints.length > 0 && vipTimelineContainer) {
  vipObserver.observe(vipTimelineContainer);
}
// 计算进度（根据当前日期按比例计算）
function vipCalculateProgress(
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
  // 第一阶段：startDate ~ firstPhaseEnd，0%~10%
  else if (
    nowDateTimestamp >= startDateTimestamp &&
    nowDateTimestamp < firstPhaseEndTimestamp
  ) {
    const totalDays = getDaysDifference(startDate, firstPhaseEnd);
    const passedDays = getDaysDifference(startDate, now);
    progress = 0 + ((passedDays / totalDays) * (10 - 0));
    if (progress > 10) progress = 10;
  } 
  // 第二阶段：firstPhaseEnd ~ secondPhaseEnd，10%~50%
  else if (
    nowDateTimestamp >= firstPhaseEndTimestamp &&
    nowDateTimestamp < secondPhaseEndTimestamp
  ) {
    const totalDays = getDaysDifference(firstPhaseEnd, secondPhaseEnd);
    const passedDays = getDaysDifference(firstPhaseEnd, now);
    progress = 10 + ((passedDays / totalDays) * (50 - 10));
    if (progress > 50) progress = 50;
  }
  // 第三阶段：secondPhaseEnd ~ thirdPhaseEnd，50%~90%
  else if (
    nowDateTimestamp >= secondPhaseEndTimestamp && nowDateTimestamp < thirdPhaseEndTimestamp
  ) {
    const totalDays = getDaysDifference(secondPhaseEnd, thirdPhaseEnd);
    const passedDays = getDaysDifference(secondPhaseEnd, now);
    progress = 50 + ((passedDays / totalDays) * (90 - 50));
    if (progress > 90) progress = 90;
  } else if (nowDateTimestamp >= thirdPhaseEndTimestamp) {
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
    // 4个点：第一个10%，第二个50%，第三个90%，第四个100%
    const pointThresholds = [10, 50, 90, 100];
  progressPoints.forEach((point, index) => {
    if (progress >= pointThresholds[index]) {
      point.classList.add("completed");
    } else {
      point.classList.remove("completed");
    }
  });
}

if (vipProgressBar && vipProgressPoints.length > 0 && vipTimelineContainer) {
  vipCalculateProgress(
    vipStartDateUTC,
          vipFirstPhaseEndUTC,
          vipSecondPhaseEndUTC,
          vipThirdPhaseEndUTC,
          vipProgressBar,
          vipProgressPoints
  );
  // 监听窗口大小变化
  window.addEventListener("resize",  function () {
    if (vipProgressBar) {
      vipCalculateProgress(
        vipStartDateUTC,
          vipFirstPhaseEndUTC,
          vipSecondPhaseEndUTC,
          vipThirdPhaseEndUTC,
          vipProgressBar,
          vipProgressPoints
      );
    }
  });
}
// 初始化进度

// 进度条 Be a First Mover. Get the Best Price 抢占先机，获取最优价格
const bestProgressBar = document.getElementById("bestProgressBar");
const bestProgressPoints = document.querySelectorAll(
  ".k13-lite-get-the-best-price-progress-point"
);
const bestTimelineContainer = document.querySelector(
  ".k13-lite-get-the-best-price-timeline-container"
);
const bestStartDateUTC = "2025-09-01T15:00:00+08:00";
const bestFirstPhaseEndUTC = "2025-09-26T15:00:00+08:00";
const bestSecondPhaseEndUTC = "2025-09-27T15:00:05+08:00";
const bestThirdPhaseEndUTC = "2025-09-27T15:00:10+08:00";

// 创建 Intersection Observer
const bestObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 添加动画类
        bestProgressBar.classList.add("animate");
        bestCalculateProgress(
          bestStartDateUTC,
          bestFirstPhaseEndUTC,
          bestSecondPhaseEndUTC,
          bestThirdPhaseEndUTC,
          bestProgressBar,
          bestProgressPoints
        );
        bestObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

if (bestProgressBar && bestProgressPoints.length > 0 && bestTimelineContainer) {
  bestObserver.observe(bestTimelineContainer);
}

// 计算进度（根据当前日期按比例计算）
function bestCalculateProgress(
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
    } else {
      point.classList.remove("completed");
    }
  });
}
if (bestProgressBar && bestProgressPoints.length > 0 && bestTimelineContainer) {
  // 初始化进度
  bestCalculateProgress(
    bestStartDateUTC,
    bestFirstPhaseEndUTC,
    bestSecondPhaseEndUTC,
    bestThirdPhaseEndUTC,
    bestProgressBar,
    bestProgressPoints
  );

  // 监听窗口大小变化
  window.addEventListener("resize", function () {
    if (bestProgressBar) {
      bestCalculateProgress(
        bestStartDateUTC,
        bestFirstPhaseEndUTC,
        bestSecondPhaseEndUTC,
        bestThirdPhaseEndUTC,
        bestProgressBar,
        bestProgressPoints
      );
    }
  });
}

// 等待页面加载完成
document.addEventListener("DOMContentLoaded", function () {
  // 页面加载完成后的操作可以写在这里
  if ($(".k13-lite-get-the-best-price-countdown-box [data-countdown]")) {
    $(".k13-lite-get-the-best-price-countdown-box [data-countdown]").each(
      function () {
        const UTCDate_end = $(this).data("countdown-end"); // 活动截止倒计时
        console.log("UTCDate_end==", UTCDate_end);
        const finalDate_end = formatUtcTime(UTCDate_end);
        const finalDate2 = finalDate_end ? finalDate_end : null;
        const timestamp_end = finalDate2
          ? new Date(finalDate2).getTime()
          : null;
        const currentTimestamp = new Date().getTime();
        let format;
        const style = $(this).data("countdown-style");
        console.log("活动截止本地时间==", finalDate_end);

        $(this)
          .countdown(finalDate2)
          .on("update.countdown", function (event) {
            if (style == 1) {
              format =
                "<span>%D</span>:<span>%H</span>:<span>%M</span>:<span>%S</span>";
            } else if (style == 2) {
              format =
                '<div class="k13-lite-get-the-best-price-time-block">' +
                '<div class="k13-lite-get-the-best-price-time-value">%D</div>' +
                '<div class="k13-lite-get-the-best-price-time-label">Days</div>' +
                "</div>" +
                '<div class="k13-lite-get-the-best-price-time-block">' +
                '<div class="k13-lite-get-the-best-price-time-value">%H</div>' +
                '<div class="k13-lite-get-the-best-price-time-label">Hours</div>' +
                "</div>" +
                '<div class="k13-lite-get-the-best-price-time-block">' +
                '<div class="k13-lite-get-the-best-price-time-value">%M</div>' +
                '<div class="k13-lite-get-the-best-price-time-label">Minutes</div>' +
                "</div>" +
                '<div class="k13-lite-get-the-best-price-time-block">' +
                '<div class="k13-lite-get-the-best-price-time-value">%S</div>' +
                '<div class="k13-lite-get-the-best-price-time-label">Seconds</div>' +
                "</div>";
            }
            $(this).html(event.strftime(format));
          })
          .on("finish.countdown", function (event) {
            $(this)
              .parents(".super-early-bird-countdown-date")
              .css("display", "none");
          });
      }
    );
  }

  if ($(".k13-lite-unlock-VIP-access-countdown-box [data-countdown]")) {
    $(".k13-lite-unlock-VIP-access-countdown-box [data-countdown]").each(
      function () {
        const UTCDate_end = $(this).data("countdown-end"); // 活动截止倒计时
        console.log("UTCDate_end==", UTCDate_end);
        const finalDate_end = formatUtcTime(UTCDate_end);
        const finalDate2 = finalDate_end ? finalDate_end : null;
        const timestamp_end = finalDate2
          ? new Date(finalDate2).getTime()
          : null;
        const currentTimestamp = new Date().getTime();
        let format;
        const style = $(this).data("countdown-style");
        console.log("活动截止本地时间==", finalDate_end);

        $(this)
          .countdown(finalDate2)
          .on("update.countdown", function (event) {
            if (style == 1) {
              format =
                "<span>%D</span>:<span>%H</span>:<span>%M</span>:<span>%S</span>";
            } else if (style == 2) {
              format =
                '<div class="k13-lite-unlock-VIP-access-time-block">' +
                '<div class="k13-lite-unlock-VIP-access-time-value">%D</div>' +
                '<div class="k13-lite-unlock-VIP-access-time-label">Days</div>' +
                "</div>" +
                '<div class="k13-lite-unlock-VIP-access-time-block">' +
                '<div class="k13-lite-unlock-VIP-access-time-value">%H</div>' +
                '<div class="k13-lite-unlock-VIP-access-time-label">Hours</div>' +
                "</div>" +
                '<div class="k13-lite-unlock-VIP-access-time-block">' +
                '<div class="k13-lite-unlock-VIP-access-time-value">%M</div>' +
                '<div class="k13-lite-unlock-VIP-access-time-label">Minutes</div>' +
                "</div>" +
                '<div class="k13-lite-unlock-VIP-access-time-block">' +
                '<div class="k13-lite-unlock-VIP-access-time-value">%S</div>' +
                '<div class="k13-lite-unlock-VIP-access-time-label">Seconds</div>' +
                "</div>";
            }
            $(this).html(event.strftime(format));
          })
          .on("finish.countdown", function (event) {
            $(this)
              .parents(".super-early-bird-countdown-date")
              .css("display", "none");
          });
      }
    );
  }
});
