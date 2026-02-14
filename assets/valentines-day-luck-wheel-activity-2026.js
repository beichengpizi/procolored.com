
let origin = "Shopify_US";
let platform = "share_fb";
let activityId = 7;
let isShare = true; // 本月未分享 true 为尚未分享 false为已分享
let isCampaign = false; // 是否是参加活动
let availableChance = 0;
let prizesList=[];
let prizesListMb=[];
let myLucky = null;
let myLuckyMB = null;

// 查询所有奖品
const allPrizeApi = "/procolored/lotteryConfig/getAllPrize";
// 查询抽奖记录
const lotteryRecordsApi = "/procolored/lotteryRecord/getLotteryRecords";
// 查询抽奖机会
const lotteryChanceApi = "/procolored/lotteryChances/getLotteryChance";
// 分享到社媒
const shareToAddLotteryChanceApi =
  "/procolored/lotteryShareRecord/shareToAddLotteryChance";
// 抽奖
const doLotteryApi = "/procolored/lotteryRecord/doLottery";
if (customerId !== "") {
  document.querySelectorAll(".before-winning-box").forEach(function (el) {
    el.style.display = "none";
  });

  document.querySelectorAll(".logined-winning-box").forEach(function (el) {
    el.style.display = "block";
  });
  getLotteryChance(customerId, customerEmail, activityId);
  getUserLotteryRecords(customerId, activityId);
} else {
  document
    .querySelectorAll(".my-prize-content-item-not-logged-in")
    .forEach(function (el) {
      el.style.display = "flex";
    });
  const panelBoxElements = document.querySelectorAll(" .panel-box");
  if (panelBoxElements) {
    panelBoxElements.forEach(function (el) {
      el.style.visibility = "visible";
    });
  }
}
// 打开shopify 登录框
function shopifyLogin() {
  const modalLogin = document.querySelector("modal-login");
  if (modalLogin) {
    console.log("modalLogin", modalLogin);
    const loginForm = modalLogin.showModal(
      modalLogin.fetchForm.login.innerHTML
    );
    modalLogin.loginBindEvent(loginForm.el);
  } else {
    console.warn("modalLogin 元素不存在");
  }
}
// 处理UTC时间为本地时间，兼容iOS，并格式化为"2025/8/14 14:50:50"
function parseUTCToLocal(utcString) {
  if (!utcString) return "";
  // 替换T和Z，兼容iOS
  let iosCompatible = utcString
    .replace(/-/g, "/")
    .replace("T", " ")
    .replace("Z", "");
  // 直接用Date解析
  let date = new Date(iosCompatible + " UTC");
  if (isNaN(date.getTime())) {
    // fallback: 直接用原始字符串
    date = new Date(utcString);
  }
  return date;
}
// 格式化时间为"2025/8/14 14:50:50"
// 补零函数
function padZero(num) {
  return num < 10 ? "0" + num : num;
}
function formatDateToCustomString(date) {
  if (!date || isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = padZero(date.getMonth() + 1);
  const d = padZero(date.getDate());
  const hh = padZero(date.getHours());
  const mm = padZero(date.getMinutes());
  const ss = padZero(date.getSeconds());
  // 补零输出
  return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
}
// 查询个人用户中奖记录
function getUserLotteryRecords(id, activityId) {
  console.log("用户ID:", id);
  // fetch(`${api}${lotteryRecordsApi}?customerId=${id}&activityId=${activityId}&origin=${origin}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // })
  boosterFetch(
    lotteryRecordsApi,
    {
      customerId: id,
      origin: origin,
      activityId: activityId,
    },
    { method: "GET" }
  )
    .then((data) => {
      // 这里可以根据实际需求处理返回的数据
      console.log("查询个人抽奖记录:", data);
      if (data.code === 200) {
        // 成功，获取图片地址
        let result = data.result;
        // 判断如果 result 是空数组，则隐藏 .excellent-work-display-wrapper
        if (Array.isArray(result) && result.length === 0) {
          document
            .querySelectorAll(".my-prize-content-item-logged-in-no-prizes")
            .forEach(function (el) {
              el.style.display = "flex";
            });
          return;
        }
        // 遍历 result 数组，判断每个字段是否存在，存在则输出变量值（中文注释）
        if (Array.isArray(result)) {
          document
            .querySelectorAll(".my-prize-content-item-logged-in-no-prizes")
            .forEach(function (el) {
              el.style.display = "";
            });
          hasPrizesWrapper = document.querySelector(
            ".my-prize-content-item-logged-in.has-prizes"
          );

          if (hasPrizesWrapper) {
            // 先清空原有内容
            hasPrizesWrapper.innerHTML = "";
            result.forEach((item, idx) => {
              // 变量赋值，使用ES6写法
              const prizeLink = item.prizeLink || "";
              const prizeTitle = item.prizeTitle || "";
              const prizePicPc = item.prizePicPc || "";
              const prizePicMobile = item.prizePicMobile || "";
              const prizeType = item.prizeType || "";
              const discountTitle = item.discountTitle;
              const prizeUsageScope = item.prizeUsageScope || "";
              const prizeDescription = item.prizeDescription || "";
              let prizePic = "";
              // const expireAtUTC = null || "";  // 测试奖品时间永久有效
              // const expireAtUTC = '2025-08-07T10:28:16Z' || "";  // 测试奖品过期时间
              const expireAtUTC = item.expireAt || "";
              let expireAtDate = "";
              let expireAt = "";
              let isExpired = false;
              if (expireAtUTC !== "") {
                expireAtDate = this.parseUTCToLocal(expireAtUTC);
                expireAt = expireAtDate
                  ? this.formatDateToCustomString(expireAtDate)
                  : "";

                // 获取当前时间
                const now = new Date();
                // 判断是否已过期
                isExpired = expireAtDate && now > expireAtDate;

                console.log("UTC折扣券失效时间expireAtUTC :", expireAtUTC);
                console.log("本地折扣券失效时间expireAt:", expireAt);
                console.log("当前时间:", this.formatDateToCustomString(now));
                console.log("是否已过期:", isExpired);
              }

              // usageStatus的值，若isExpired为false时为item.usageStatus，若为true时为"Expired"，默认值为"Used"
              const usageStatus = isExpired
                ? "Expired"
                : item.usageStatus || "Used";
              let prizeContent = item.prizeContent || "";
              // 若已过期，脱敏显示前4后4，中间用*替换
              if (
                (isExpired || usageStatus !== "unused") &&
                prizeContent.length > 8
              ) {
                const start = prizeContent.slice(0, 4);
                const end = prizeContent.slice(-4);
                const middle = "*".repeat(prizeContent.length - 8);
                prizeContent = `${start}${middle}${end}`;
              }
              // 判断是否为移动端
              function isMobile() {
                return /Android|webOS|iPhone|iPod|BlackBerry|iPad|Windows Phone|Mobile/i.test(
                  navigator.userAgent
                );
              }

              // 根据设备类型执行不同事件
              if (isMobile()) {
                // 移动端事件
                prizePic = prizePicMobile;
              } else {
                // PC端事件
                prizePic = prizePicPc;
              }

              // 生成DOM结构
              const slideHtml = `
          <div class="my-prize-content-item-logged-in-item ">
            <div class="my-prize-content-item-logged-in-item-content " >
              <div class="prize-detail">
                ${
                  prizeType == 1
                    ? `<a class="prize-img" href="${prizeLink}" target="_blank">
                        <img src="${prizePic}" alt="${prizeTitle}">
                      </a>`
                    : `<div class="prize-img">
                        <img src="${prizePic}" alt="${prizeTitle}">
                      </div>`
                }
                <div class="prize-detail-box">
                  <div class="prize-name">
                    <span class="prize-name-value ">${prizeTitle}</span>
                    <a href="https://chat.quickcep.com/h5.html?platform=others&accessId=7b656e18-cb12-4e09-aa92-8df7c651bd30" target="_blank" class="prize-view ">Contact Us></a>
                  </div>
                  
                   ${
                    prizeDescription !== ""
                      ? `<div class="prize-name-tips">${prizeDescription}</div>`
                      : ""
                  } 
                  
            
                  ${
                    expireAt !== ""
                      ? `<div class="prize-expiration-date">EXP:${expireAt}</div>`
                      : '<div class="prize-expiration-date">Valid for a long time</div>'
                  }
                  
                  <a href="https://chat.quickcep.com/h5.html?platform=others&accessId=7b656e18-cb12-4e09-aa92-8df7c651bd30" class="prize-view-mb ">Contact Us></a>
                </div>
              </div>

            </div>
          </div>
                    `;
              // 插入到swiper-wrapper
              hasPrizesWrapper.insertAdjacentHTML("beforeend", slideHtml);
              document
                .querySelectorAll(".my-prize-content-item-logged-in.has-prizes")
                .forEach(function (el) {
                  el.style.display = "block";
                });
            });
          } else {
            console.warn(
              "未找到 .ugc-week-1-inspiration-users-swiper-container .swiper-wrapper 元素"
            );
          }
        } else {
          console.warn("result 不是数组");
        }
      } else {
        console.error("查询抽奖记录失败:", data.msg);
      }
    })
    .catch((error) => {
      console.error("查询抽奖记录失败:", error);
    });
}
// 查询所有奖品
function getAllPrize(origin, activityId) {

  boosterFetch(
    allPrizeApi,
    {
      origin: origin,
      activityId: activityId,
    },
    { method: "GET" }
  )
    .then((data) => {
      // 这里可以根据实际需求处理返回的数据
      console.log("查询所有奖品结果:", data);
      if (data.code === 200) {
        // 成功，获取图片地址
        let result = data.result;
        // 判断如果 result 是空数组，则隐藏 .excellent-work-display-wrapper
        if (Array.isArray(result) && result.length === 0) {
          const activityPrizesListWrapper = document.querySelector(
            ".activity-prizes-list-container"
          );
          if (activityPrizesListWrapper) {
            activityPrizesListWrapper.style.display = "none";
          }
          return;
        }
        // 遍历 result 数组，判断每个字段是否存在，存在则输出变量值（中文注释）
        if (Array.isArray(result)) {
          // 获取swiper-wrapper容器
          const swiperWrapper = document.querySelector(
            ".prizes-list .swiper-wrapper"
          );
          if (swiperWrapper) {
            // 先清空原有内容
            swiperWrapper.innerHTML = "";
            // 先插入一个默认的奖品slide
            const defaultSlideHtml = `
              <div class="swiper-slide">
                <div class="prize-item">
                  <img
                    src="https://procolored-test-bucket.oss-us-east-1.aliyuncs.com/procolored-expand/2025-08-06/86ddc17f4f6a488486797ea80fd27961.png"
                    alt="Discount Coupon"
                  />
                  <div class="prize-name">Discount Coupon</div>
                </div>
              </div>
                `;
            swiperWrapper.insertAdjacentHTML("beforeend", defaultSlideHtml);

            result.forEach((item, idx) => {
              // 变量赋值，使用ES6写法
              const id = item.id || "";
              const prizeTitle = item.prizeTitle || "";
              const prizePicPc = item.prizePicPc || "";
              const prizePicMobile = item.prizePicMobile || "";
              // 生成DOM结构
              const slideHtml = `
              <div class="swiper-slide">
                <div class="prize-item">
                  <img
                    src="${prizePicPc}"
                    alt="${prizeTitle}"
                  />
                  <div class="prize-name">${prizeTitle}</div>
                </div>
              </div>
                          `;
              // 插入到swiper-wrapper
              swiperWrapper.insertAdjacentHTML("beforeend", slideHtml);
              // initPrizesListSwiper();
            });


          } else {
            console.log("转盘获取奖品列表PC");
                      // 将接口result数据转换成prizesList数组，结构与LuckyWheel奖品配置一致
          prizesList = result.map((item, idx) => {
            // 判定当前端类型
            const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|iPad|Windows Phone|Mobile/i.test(navigator.userAgent);
            let backgrounds = [
              "#FDEDEE",
              "#FFF",
              "#FDEDEE",
              "#FFF",
              "#FFF"
            ];
            const fontTop = isMobile ? 20 : 25;
            const imgTop = isMobile ? 20 : 25;
            const baseObj = {
              background: backgrounds[idx % backgrounds.length],
              fonts: [{
                text: item.prizeTitle
                || "",
                top: fontTop
              }],
              imgs: [
                {
                  src: item.prizePicPc || "",
                  width: "32%",
                  top: imgTop,
                }
              ]
            };

            return baseObj;
          });
          prizesListMb
          console.log('prizesList==',prizesList);
          initLuckyWheel(prizesList)
        
          }
        } else {
          console.warn("result 不是数组");
        }
      } else {
        console.error("查询所有奖品失败:", data.msg);
      }
    })
    .catch((error) => {
      console.error("查询失败:", error);
    });
}
// 查询全部的抽奖记录
function getLotteryRecords() {
  // fetch(`${api}${lotteryRecordsApi}?activityId=${activityId}&origin=${origin}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // })
  boosterFetch(
    lotteryRecordsApi,
    {
      origin: origin,
      activityId: activityId,
    },
    { method: "GET" }
  )
    .then((data) => {
      // 这里可以根据实际需求处理返回的数据
      console.log("查询抽奖记录:", data);
      if (data.code === 200) {
        // 成功，获取图片地址
        let result = data.result;
        // 判断如果 result 是空数组，则隐藏 .excellent-work-display-wrapper
        if (Array.isArray(result) && result.length === 0) {
          const noticeBoxLeftWrapper =
            document.querySelector(".notice-box-left");
          if (noticeBoxLeftWrapper) {
            // noticeBoxLeftWrapper.style.opacity = 0;
          }
          return;
        }
        // 遍历 result 数组，判断每个字段是否存在，存在则输出变量值（中文注释）
        if (Array.isArray(result)) {
          // 获取swiper-wrapper容器
          // 判断是否为移动端，移动端选择第二个.notice-content，否则选择第一个
          let swiperWrapper;
          if (window.innerWidth <= 768) {
            // 移动端
            const noticeContents = document.querySelectorAll(
              ".notice-content .swiper-wrapper"
            );
            swiperWrapper = noticeContents[1] || noticeContents[0];
          } else {
            // PC端
            swiperWrapper = document.querySelector(
              ".notice-content .swiper-wrapper"
            );
          }
          if (swiperWrapper) {
            // 先清空原有内容
            swiperWrapper.innerHTML = "";
            result.forEach((item, idx) => {
              // 变量赋值，使用ES6写法
              // 将email的@前4位转为*显示
              let email = item.customerEmail || "";
              if (email) {
                const atIndex = email.indexOf("@");
                if (atIndex > 0) {
                  const prefixLen = Math.min(4, atIndex);
                  email =
                    "*".repeat(prefixLen) +
                    email.slice(prefixLen, atIndex) +
                    email.slice(atIndex);
                }
              }
              const prizeTitle = item.prizeTitle || "";

              // 生成DOM结构
              const slideHtml = `
<div class="swiper-slide">
                    <div class="Winners-list">${email} just won a ${prizeTitle}</div>
                  </div>
                    `;
              // 插入到swiper-wrapper
              swiperWrapper.insertAdjacentHTML("beforeend", slideHtml);
              initNoticeContentSwiper();
            });
          } else {
            console.warn(
              "未找到 .ugc-week-1-inspiration-users-swiper-container .swiper-wrapper 元素"
            );
          }
        } else {
          console.warn("result 不是数组");
        }
      } else {
        console.error("查询抽奖记录失败:", data.msg);
      }
    })
    .catch((error) => {
      console.error("查询抽奖记录失败:", error);
    });
}
// 查询用户抽奖机会
function getLotteryChance(id, email) {
  // fetch(`${api}${lotteryChanceApi}?customerId=${id}&customerEmail=${email}&activityId=${activityId}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // })
  boosterFetch(
    lotteryChanceApi,
    {
      customerEmail: email,
      customerId: id,
      origin: origin,
      activityId: activityId,
    },
    { method: "GET" }
  )
    .then((data) => {
      // 这里可以根据实际需求处理返回的数据
      console.log("查询用户抽奖机会结果:", data);
      if (data.code === 200) {
        // 成功，获取图片地址
        let result = data.result;
        // 获取logined-winning-box容器
        // 判断是否为移动端，移动端选择第二个.notice-content，否则选择第一个
        let loginedWinningWrapper;
        if (window.innerWidth <= 768) {
          // 移动端
          const loginedWinningContents = document.querySelectorAll(
            ".logined-winning-box"
          );
          loginedWinningWrapper =
            loginedWinningContents[1] || loginedWinningContents[0];
        } else {
          // PC端
          loginedWinningWrapper = document.querySelector(
            ".logined-winning-box"
          );
        }
        // 分别获取 .logined-winning-box-content-title 下的 span
        const chanceSpan = loginedWinningWrapper.querySelector(
          ".logined-winning-box-content-title .Used-opportunities"
        );
        const totalChanceSpan = loginedWinningWrapper.querySelector(
          ".logined-winning-box-content-title .available-chance"
        );
        // 获取 Facebook 分享次数的数字元素
        const fbShareNum = loginedWinningWrapper.querySelector(
          ".logined-winning-box-content-share-item.fb .logined-winning-box-content-share-item-content-num>span"
        );
        // 加载动画
        const loadingSpan = loginedWinningWrapper.querySelector(
          ".logined-winning-box-content-title .logined-winning-box-content-title-loading"
        );

        // 抽奖机会文案值
        const chanceNumSpan = loginedWinningWrapper.querySelector(
          ".logined-winning-box-content-title .logined-winning-box-content-title-num"
        );
        // 抽奖大转盘
        const panelBoxElements = document.querySelectorAll(" .panel-box");
        if (loginedWinningWrapper) {
          // 延迟5秒后执行，等待用户去分享
          // setTimeout(() => {
          // 获取可用次数
          availableChance = (result && result.availableChance) || 0;
          // 获取总共次数
          const totalChance = (result && result.totalChance) || 0;
          const isShareFB = result && result.shareFb ? 1 : 0;
          console.log("是否已分享过", isShareFB);
          console.log("可用抽奖次数", availableChance);
          // 设置剩余抽奖次数
          if (chanceSpan) {
            chanceSpan.textContent = availableChance;
          }
          if (totalChanceSpan) {
            totalChanceSpan.textContent = totalChance;
          }
          if (fbShareNum) {
            fbShareNum.textContent = isShareFB;
          }
          if (loadingSpan) {
            loadingSpan.style.display = "none";
          }
          if (chanceNumSpan) {
            chanceNumSpan.style.display = "inline-block";
          }

          if (panelBoxElements) {
            panelBoxElements.forEach(function (el) {
              el.style.visibility = "visible";
            });
          }

          // }, 5000);
        } else {
          console.warn("未找到 ..logined-winning-box 元素");
        }
      } else {
        console.error("查询用户抽奖机会失败:", data.msg);
      }
    })
    .catch((error) => {
      console.error("查询用户抽奖机会失败:", error);
    });
}
// 分享到社媒
function postShareToAddLotteryChance(id, email, platform, activityId) {
  // 构造请求体
  const postData = {
    customerId: id,
    customerEmail: email,
    platform: platform,
    activityId: activityId
  };
  // // 发送POST请求
  // fetch(`${api}${shareToAddLotteryChanceApi}`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(postData)
  // })
  boosterFetch(
    shareToAddLotteryChanceApi,
    postData,
    { method: "POST" }
  )
    .then((data) => {
      // 这里可以根据实际需求处理返回的数据
      console.log("分享增加抽奖机会结果:", data);
      let result = data.result;
      if (data.code === 200) {
        setTimeout(() => {
          getLotteryChance(id, email, activityId);
        }, 5000);
      }
    })
    .catch((error) => {
      console.error("分享增加抽奖机会请求失败:", error);
      throw error;
    });
}
// 抽奖
function postDoLottery(id, email, activityId) {
  // 抽奖开始时，禁用所有 button-box 的点击事件
  document.querySelectorAll(".button-box").forEach(function (btn) {
    btn.style.pointerEvents = "none";
  });
  // 构造请求体
  // const postData = {
  //   customerId: id,
  //   customerEmail: email,
  //   activityId: activityId,
  //   origin: origin,
  // };
  // // 发送POST请求
  // fetch(`${api}${doLotteryApi}`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(postData)
  // })
  boosterFetch(
    doLotteryApi,
    {
      customerEmail: email,
      customerId: id,
      origin: origin,
      activityId: activityId,
    },
    { method: "POST" }
  )
    .then((data) => {
      // 这里可以根据实际需求处理返回的数据
      console.log("抽奖结果:", data);
      let result = data.result;
      if (data.code === 200) {
        const prizeType = result.prizeType; // 奖品类型 1 全额满减  2 通用折扣券
        const prizeTitle = result.prizeTitle; // 奖品名称
        // const prizeTitle = prizeType == 1 ? result.prizeTitle : 'Discount Coupon'; // 奖品名称
        const prizeContent = result.prizeContent; // 奖品折扣码
        const prizeLink = result.prizeLink; // 奖品链接
        const prizePicPc = result.prizePicPc; // 奖品图片地址 PC端
        const prizePicMobile = result.prizePicMobile; // 奖品图片地址 移动端
        const wheelIndex = result.wheelIndex; // 奖品下标
        const prizeDescription = result.prizeDescription; // 奖品描述
        

        // 生成1-6的随机整数
        const randomInt = wheelIndex || Math.floor(Math.random() * 6) + 1;
        console.log("随机生成的数字:", randomInt);
        // 判断当前是移动端还是PC端
        let isMobile = window.innerWidth <= 768;
        if (isMobile) {
          // 移动端逻辑
          setTimeout(() => {
            myLuckyMB.stop(randomInt);
            // 监听转盘停止事件
            setTimeout(() => {
              // 隐藏已登录中奖弹窗
              const loginedBox = document.querySelector(
                ".lucky-wheel-activity-container-mb .logined-winning-box"
              );
              if (loginedBox) {
                loginedBox.style.display = "none";
              }
              // 显示PC端中奖弹窗
              const afterWinningBox = document.querySelector(
                ".lucky-wheel-activity-container-mb .right-box .after-winning-box"
              );
              // 设置奖品图片
              const prizeImg = afterWinningBox.querySelector(".prize-img img");
              if (prizeImg && prizePicPc) {
                prizeImg.src = prizePicPc;
              }
              // 设置奖品名称
              const prizeName =
                afterWinningBox.querySelector(".prize-item-name");
              if (prizeName && prizeTitle) {
                prizeName.textContent = prizeTitle;
              }
              const prizeTips =
                afterWinningBox.querySelector(".prize-item-tips");
              if (prizeTips && prizeDescription) {
                prizeTips.textContent = prizeDescription;
              }
    
              // 设置折扣码内容
              // const discountCodeContent = afterWinningBox.querySelector('.Discount-code-content');
              // if (discountCodeContent && prizeContent) {
              //   discountCodeContent.textContent = prizeContent;
              // }
              if (afterWinningBox) {
                afterWinningBox.style.display = "block";
              }
              // 设置弹窗奖品图片
              const popUpBox = document.getElementById(
                "pop-up-box-after-winning"
              );
              if (popUpBox) {
                const prizeImg = popUpBox.querySelector(
                  ".pop-up-box-after-winning-wrapper-prize-img img"
                );
                if (prizeImg && prizePicMobile) {
                  prizeImg.src = prizePicMobile;
                }
                const prizeTitleEl = popUpBox.querySelector(
                  ".pop-up-box-after-winning-wrapper-prize-content-title"
                );
                
                if (prizeTitleEl && prizeTitle) {
                  prizeTitleEl.textContent = prizeTitle;
                }
                const prizeTipsEl = popUpBox.querySelector(
                  ".pop-up-box-after-winning-wrapper-prize-content-tips"
                );
                
                if (prizeTipsEl && prizeDescription) {
                  prizeTipsEl.textContent = prizeDescription;
                }
                const prizeCodeEl = popUpBox.querySelector(
                  ".pop-up-box-after-winning-wrapper-prize-discount-box-code"
                );
                if (prizeCodeEl && prizeContent) {
                  prizeCodeEl.textContent = prizeContent;
                }
              }
              console.log("popUpBox", popUpBox);
              const $links = $("#pop-up-box-after-winning");
              $.fancybox.open($links);
              getLotteryChance(customerId, customerEmail, activityId);
              getUserLotteryRecords(customerId, activityId);
              setTimeout(() => {
                myLuckyMB.defaultConfig.speed = 0.3;
                myLuckyMB.play();
                document
                  .querySelectorAll(".button-box")
                  .forEach(function (btn) {
                    btn.style.pointerEvents = "";
                  });
              }, 3000);
            }, 3000);
          }, 1000);
          // 这里可以添加移动端弹窗或展示逻辑
        } else {
          // PC端逻辑
          // 这里可以添加PC端弹窗或展示逻辑
          setTimeout(() => {
            myLucky.stop(randomInt);
            // 监听转盘停止事件
            setTimeout(() => {
              // 隐藏已登录中奖弹窗
              const loginedBox = document.querySelector(".logined-winning-box");
              if (loginedBox) {
                loginedBox.style.display = "none";
              }
              // 显示PC端中奖弹窗
              const afterWinningBox = document.querySelector(
                ".lucky-wheel-activity-container-pc .after-winning-box"
              );
              // 设置奖品图片
              const prizeImg = afterWinningBox.querySelector(".prize-img img");
              if (prizeImg && prizePicPc) {
                prizeImg.src = prizePicPc;
              }
              // 设置奖品名称
              const prizeName =
                afterWinningBox.querySelector(".prize-item-name");
              if (prizeName && prizeTitle) {
                prizeName.textContent = prizeTitle;
              }
              const prizeTips =
              afterWinningBox.querySelector(".prize-item-tips");
            if (prizeTips && prizeDescription) {
              prizeTips.textContent = prizeDescription;
            }
              // 设置折扣码内容
              const discountCodeContent = afterWinningBox.querySelector(
                ".Discount-code-content"
              );
              if (discountCodeContent && prizeContent) {
                discountCodeContent.textContent = prizeContent;
              }
              if (afterWinningBox) {
                afterWinningBox.style.display = "block";
              }
              getLotteryChance(customerId, customerEmail, activityId);
              getUserLotteryRecords(customerId, activityId);
              setTimeout(() => {
                myLucky.defaultConfig.speed = 0.3;
                myLucky.play();
                document
                  .querySelectorAll(".button-box")
                  .forEach(function (btn) {
                    btn.style.pointerEvents = "";
                  });
              }, 3000);
            }, 3000);
          }, 1000);
        }
      } else {
        alert(data.msg);
        if (isMobile) {
          setTimeout(() => {
            myLuckyMB.defaultConfig.speed = 0.3;
            myLuckyMB.play();
            document.querySelectorAll(".button-box").forEach(function (btn) {
              btn.style.pointerEvents = "";
            });
          }, 3000);
        } else {
          setTimeout(() => {
            myLucky.defaultConfig.speed = 0.3;
            myLucky.play();
            document.querySelectorAll(".button-box").forEach(function (btn) {
              btn.style.pointerEvents = "";
            });
          }, 3000);
        }
      }
    })
    .catch((error) => {
      console.error("抽奖请求失败:", error);
      throw error;
    });
}
 getAllPrize(origin, activityId);
document.addEventListener("DOMContentLoaded", function () {
  getLotteryRecords(activityId);
});

// 优化后的复制功能，优先使用 Clipboard API，兼容性处理
function copyTextToClipboard(
  text,
  successMsg = "Copied successfully",
  errorMsg = "Copy failed"
) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      function () {
        alert(successMsg);
      },
      function () {
        alert(errorMsg);
      }
    );
  } else {
    // 兼容旧浏览器
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // 防止页面滚动
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      var successful = document.execCommand("copy");
      alert(successful ? successMsg : errorMsg);
    } catch (err) {
      alert(errorMsg);
    }
    document.body.removeChild(textarea);
  }
}
document
  .querySelectorAll(".logined-winning-box-content-share-item")
  .forEach(function (el) {
    el.onclick = function () {
      // 你要分享的页面链接（可以是图片链接，也可以是你的网站链接）
      let jumpUrl = encodeURIComponent(
        "https://www.procolored.com/cdn/shop/files/DTF-supplier_14_596x_crop_center.png?v=1749632590"
      );
      const shareUrl = encodeURIComponent(
        "https://www.procolored.com/pages/unlock-your-inspiration"
      );
      // 判断当前点击的元素是否包含 fb 类
      if (el.classList.contains("fb")) {
        //Facebook 分享对话框 URL
        console.log("包含 fb");
        jumpUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        postShareToAddLotteryChance(
          customerId,
          customerEmail,
          platform,
          activityId
        );
      } else {
        // 不包含 fb
        console.log("不包含 fb");
      }
      // 跳转到 Facebook 分享页面
      // 在本页弹出框
      window.open(jumpUrl, "_blank", "width=600,height=600,top=100,left=100");
    };
  });

// 复制 .discount-value
// document.querySelectorAll('.copy-icon').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     const discountValue = e.currentTarget.closest('.prize-discount')?.querySelector('.discount-value');
//     if (discountValue) {
//       copyTextToClipboard(discountValue.innerText.trim());
//     }
//   });
// });

// 复制 .Discount-code-content
document.querySelectorAll(".Discount-code-top-copy").forEach(function (el) {
  el.addEventListener("click", function (e) {
    const discountValue = e.currentTarget
      .closest(".discount-code-box")
      ?.querySelector(".Discount-code-content");
    if (discountValue) {
      copyTextToClipboard(discountValue.innerText.trim());
    }
  });
});

// 复制 中奖列表里的折扣码
// 由于 .copy-icon 元素是动态加载的，这里使用事件委托，只监听一次
document.body.addEventListener("click", function (e) {
  // 判断点击的是否为 .prize-discount 下的 .copy-icon
  if (e.target.closest(".prize-discount .copy-icon")) {
    const copyIcon = e.target.closest(".copy-icon");
    const discountValue = copyIcon
      .closest(".prize-discount")
      ?.querySelector(".discount-value");
    if (discountValue) {
      copyTextToClipboard(discountValue.innerText.trim());
    }
  }
});
// 增加移动端 touchend 事件
document.body.addEventListener("touchend", function (e) {
  // 判断点击的是否为 .prize-discount 下的 .copy-icon
  if (e.target.closest(".prize-discount .copy-icon")) {
    // 阻止触摸事件后继续触发点击事件，避免重复弹窗
    e.preventDefault();
    const copyIcon = e.target.closest(".copy-icon");
    const discountValue = copyIcon
      .closest(".prize-discount")
      ?.querySelector(".discount-value");
    if (discountValue) {
      copyTextToClipboard(discountValue.innerText.trim());
    }
  }
});
// 复制 移动端中奖后弹出框的折扣码
// 由于 .copy-icon 元素是动态加载的，这里使用事件委托，只监听一次
// 监听移动端点击事件（touchend），用于复制中奖弹窗中的折扣码
document.body.addEventListener("touchend", function (e) {
  // 判断点击的是否为中奖弹窗里的复制按钮
  if (
    e.target.closest(
      "#pop-up-box-after-winning .pop-up-box-after-winning-wrapper-prize-discount-box-copy-icon"
    )
  ) {
    const copyBox = e.target.closest(
      ".pop-up-box-after-winning-wrapper-prize-discount-box"
    );
    if (copyBox) {
      const discountValue = copyBox.querySelector(
        ".pop-up-box-after-winning-wrapper-prize-discount-box-code"
      );
      if (discountValue) {
        copyTextToClipboard(discountValue.innerText.trim());
      }
    }
  }
});

// 由于动态加载slide后，Swiper的自动轮播会失效，需要在数据渲染完成后重新初始化Swiper实例
let prizesListSwiper = null;
function initPrizesListSwiper() {
  if (prizesListSwiper) {
    prizesListSwiper.destroy(true, true);
  }
  prizesListSwiper = new Swiper(".prizes-list", {
    loop: true,
    direction: 'vertical',
  slidesPerView: 'auto',

 
    loopedSlides: 10, // slidesPerView设置为非整数（如1.2）时，可能会出现循环问题添加此行，指定循环所需的额外幻灯片数量
    spaceBetween: 20,
    observer: true, //开启动态检查器，监测swiper和slide
    observeParents: true, //监测Swiper 的祖/父元素
    freeMode: true,
    speed: 5000, //设置为0以实现立即停止
    allowTouchMove: false, // 禁止拖动
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      stopOnLastSlide: false,
      waitForTransition: true,
    },
    on: {},
    breakpoints: {
      //当宽度小于等于1024时显示
      1024: {
        slidesPerView: 3.5,
        spaceBetween: 15,
      },
      //当宽度小于等于768时显示
      768: {
        slidesOffsetBefore: 24,
        slidesOffsetAfter: 24,
        slidesPerView: 2.3,
        spaceBetween: 10,
      },
    },
  });
}

// 由于动态加载slide后，Swiper的自动轮播会失效，需要在数据渲染完成后重新初始化Swiper实例
let noticeContentSwiper = null;
function initNoticeContentSwiper() {
  if (noticeContentSwiper) {
    noticeContentSwiper.destroy(true, true);
  }
  // 判断当前是PC端还是移动端，PC端使用.notice-content-pc，移动端使用.notice-content-mb
  let noticeContentSelector =
    window.innerWidth <= 768 ? ".notice-content-mb" : ".notice-content-pc";
  noticeContentSwiper = new Swiper(noticeContentSelector, {
    loop: true,
    direction: 'vertical',
  slidesPerView: 5,
    loopedSlides: 10, // slidesPerView设置为非整数（如1.2）时，可能会出现循环问题添加此行，指定循环所需的额外幻灯片数量
    spaceBetween: 20,
    observer: true, //开启动态检查器，监测swiper和slide
    observeParents: true, //监测Swiper 的祖/父元素
    freeMode: true,
    speed: 5000, //设置为0以实现立即停止
    allowTouchMove: false, // 禁止拖动
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      stopOnLastSlide: false,
      waitForTransition: true,
    },
    on: {},
    breakpoints: {
      //当宽度小于等于1024时显示
      1024: {
        slidesPerView: 5,
        spaceBetween: 15,
      },
      //当宽度小于等于768时显示
      768: {
        slidesPerView: 5,
        spaceBetween: 8,
      },
    },
  });
}

// 页面初次加载时初始化
initNoticeContentSwiper();
function initLuckyWheel(){
  myLucky = new LuckyCanvas.LuckyWheel("#my-lucky", {
    width: "452px",
    height: "452px",
    blocks: [
      {
        padding: "36px",
        imgs: [
          {
            src: "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/20260206-093322.png?v=1770341926",
            width: "100%",
          },
        ],
      },
    ],
    prizes: prizesList,
    buttons: [
      {
        radius: "60px",
        imgs: [
          {
            src: "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/20260206-093313.png?v=1770341926",
            width: "100%",
            top: "-85px",
          },
        ],
      },
    ],
    defaultConfig: {
      offsetDegree: -360 / 6 / 2,
      accelerationTime: 2500,
      decelerationTime: 2500,
      speed: 0.3,
    },
    defaultStyle:{
      fontColor:"#420C0E",
      fontSize:"12px", // PC font size 12px
      fontStyle:'Mulish'
    },
    //当点击抽奖按钮时, 触发该回调, 此时你可以决定是否要开始游戏
    start: function () {},
  });
   myLuckyMB = new LuckyCanvas.LuckyWheel("#my-lucky-mb", {
    width: "295px",
    height: "295px",
    blocks: [
      {
        padding: "26px",
        imgs: [
          {
            src: "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/20260206-093322.png?v=1770341926",
            width: "100%",
          },
        ],
      },
    ],
    prizes: prizesList,
    buttons: [
      {
        radius: "40px",
        imgs: [
          {
            src: "https://cdn.shopify.com/s/files/1/0509/3454/6613/files/20260206-093313.png?v=1770341926",
            width: "100%",
            top: "-55px",
          },
        ],
      },
    ],
    defaultConfig: {
      offsetDegree: -360 / 6 / 2,
      accelerationTime: 2500,
      decelerationTime: 2500,
      speed: 0.3,
    },
    defaultStyle:{
      fontColor:"#420C0E",
      fontSize:"8px", // Mobile font size 8px
      fontStyle:'Mulish'
    },
    start: function () {},
  });
  console.log('prizesList2222222==',prizesList);
  // 初始化转动
  myLucky.play();
  myLuckyMB.play();          

}




// 统一抽奖按钮点击事件处理
function handleLotteryButtonClick(e) {
  // 阻止事件冒泡，防止多次触发
  e.stopPropagation();
  // 这里可以根据实际需求添加更多逻辑
  if (customerId !== "") {
    if (availableChance > 0) {
      // console.log('是否已加载myLucky', myLucky);
      // 判断是否为移动端
      if (
        /Android|webOS|iPhone|iPod|BlackBerry|iPad|Windows Phone|Mobile/i.test(
          navigator.userAgent
        )
      ) {
        myLuckyMB.init();
        console.log("开始游戏（移动端）");
        myLuckyMB.defaultConfig.speed = 5;
        myLuckyMB.play();
      } else {
        myLucky.init();
        console.log("开始游戏（PC端）");
        myLucky.defaultConfig.speed = 5;
        myLucky.play();
      }
      TriplePixel('custom', 'lucky_draw_GO_click', {
        'value': 1
      });
      postDoLottery(customerId, customerEmail, activityId);
    } else {
      alert(
        "There are no available chances to participate in the lottery.\n Please obtain a chance first."
      );
      TriplePixel('custom', 'lucky_draw_GO_click', {
        'value': 1
      });
      console.log("没有抽奖机会");
    }
  } else {
    TriplePixel('custom', 'lucky_draw_CTA_click', {
      'value':1
    });
    console.log("打开登录页面");
    shopifyLogin();
  }
}

// 绑定静态元素
// 兼容移动端点击事件
function bindLotteryButtonEvents() {
  // 判断是否为移动端
  const isMobile =
    /Android|webOS|iPhone|iPod|BlackBerry|iPad|Windows Phone|Mobile/i.test(
      navigator.userAgent
    );
  // 事件类型
  const events = isMobile ? ["touchend"] : ["click", "touchend"];

  // 通用绑定函数
  function bindBtnEvents(btn) {
    events.forEach(function (evt) {
      btn.removeEventListener(evt, handleLotteryButtonClick);
      btn.addEventListener(evt, handleLotteryButtonClick, { passive: false });
    });
  }

  // 绑定 activity-button
  document.querySelectorAll(".activity-button").forEach(bindBtnEvents);

  // 绑定 button-box
  document.querySelectorAll(".button-box").forEach(bindBtnEvents);

  // 绑定未登录按钮
  let notLoggedInBtn = document.querySelector(
    ".my-prize-content-item-not-logged-in-button"
  );
  if (notLoggedInBtn) {
    bindBtnEvents(notLoggedInBtn);
  }
}

// 初始绑定
document.addEventListener("DOMContentLoaded", function () {
  bindLotteryButtonEvents();
});

// 监听DOM变化，动态绑定新加载的按钮
const observer = new MutationObserver(function (mutationsList) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      // 新增节点时重新绑定
      bindLotteryButtonEvents();
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// 解决移动端点击时背景闪烁问题，使用 touchstart 阻止点击高亮
document.addEventListener("DOMContentLoaded", function () {
  var faqItems = document.querySelectorAll(".ugc-faq-container-content-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(
      ".ugc-faq-container-content-item-question"
    );
    // 阻止移动端点击高亮（闪烁）
    question.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault(); // 阻止默认的点击高亮
        // 手动触发点击事件
        this.click();
      },
      { passive: false }
    );
    question.addEventListener("click", function (e) {
      // 如果当前item已激活，则移除active，实现随时切换
      if (item.classList.contains("active")) {
        item.classList.remove("active");
      } else {
        // 移除所有的active
        faqItems.forEach(function (i) {
          i.classList.remove("active");
        });
        // 给当前点击的item添加active
        item.classList.add("active");
      }
    });
  });
});
