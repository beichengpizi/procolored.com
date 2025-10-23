$(function () {
  // Tab选项卡的初项选择激活
  $(".tab-title-1 .title-item:first").addClass("title-active");
  $(".tab-title-2 .title-item:first").addClass("title-active");
  $(".title-box .title-li:first").addClass("li-active");
  $(".mt-mb-swiper-wrapper .swiper-slide:first .title-slide:first").addClass(
    "slide-active"
  );
  $(".tab-content .tab-mod:first").show();
  $(".mt-tab-mod .mod-content:first").show();

  // What's New和Weeky Sale2个部分的选项卡标题切换
  $(".tab-title .title-item").click(function () {
    $(this).addClass("title-active").siblings().removeClass("title-active");
    $(".tab-content .tab-mod")
      .eq($(".tab-title .title-item").index(this))
      .show()
      .siblings(".tab-content .tab-mod")
      .hide();
  });

  // PC端-Materials选项卡标题切换
  $(".title-box .title-li").click(function () {
    $(this).addClass("li-active").siblings().removeClass("li-active");
    $(".mt-tab-mod .mod-content")
      .eq($(".title-box .title-li").index(this))
      .show()
      .siblings(".mt-tab-mod .mod-content")
      .hide();
  });

  // MB端-Materials选项卡标题切换
  $(".mt-mb-swiper-wrapper .swiper-slide").click(function () {
    $(this)
      .children(".title-slide")
      .addClass("slide-active")
      .siblings()
      .removeClass("slide-active");
    $(this)
      .siblings(".swiper-slide")
      .children(".title-slide")
      .removeClass("slide-active");
    $(".mt-tab-mod .mod-content")
      .eq($(".mt-mb-swiper-wrapper .swiper-slide").index(this))
      .show()
      .siblings(".mt-tab-mod .mod-content")
      .hide();
  });

  // Shop Categories部分的显示更多按钮
  $(".categories").each(function () {
    var $parent = $(this).children(".categories-box");
    var $children = $parent.children(".coll-url");
    var $showM = $(".btn-box-show-more");
    var $showL = $(".btn-box-show-less");
    var limit = 8;
    if ($children.length <= 8) {
      $showM.hide();
    }
    var $hiddenDivs = $parent.children().slice(limit);
    $hiddenDivs.hide();
    $showM.click(function () {
      $($hiddenDivs).slideDown();
      $(this).hide();
      $(this).siblings(".btn-box-show-less").show();
    });
    $showL.click(function () {
      $($hiddenDivs).slideUp();
      $(this).hide();
      $(this).siblings(".btn-box-show-more").show();
    });
  });

  // Materials-Tab部分的显示更多按钮
  $(".mod-content").each(function () {
    var $parent = $(this).children(".mod-box");
    var $children = $parent.children(".mod-product-item");
    var $showMtM = $(this)
      .children(".mt-show-btn")
      .children(".mt-btn-box-show-more");
    var $showMtL = $(this)
      .children(".mt-show-btn")
      .children(".mt-btn-box-show-less");
    var limit = 10;
    if ($children.length <= 10) {
      $showMtM.hide();
    }
    var $hiddenDivs = $parent.children().slice(limit);
    $hiddenDivs.hide();
    $showMtM.click(function () {
      $($hiddenDivs).slideDown();
      $(this).hide();
      $(this).siblings(".mt-btn-box-show-less").show();
    });
    $showMtL.click(function () {
      $($hiddenDivs).slideUp();
      $(this).hide();
      $(this).siblings(".mt-btn-box-show-more").show();
    });
  });
});

// What‘s New部分的swiper初始化
var mySwiper = new Swiper(".swiper-ctn-1", {
  slidesPerView: 2.2,
  slidesPerGroup: 1,
  spaceBetween: 6,
  grabCursor: true,
  breakpoints: {
    498: {
      slidesPerView: 2.5,
      spaceBetween: 10,
    },
    598: {
      slidesPerView: 3,
      spaceBetween: 10,
    },
    898: {
      slidesPerView: 4,
      spaceBetween: 10,
    },
    1024: {
      slidesPerView: 5,
      spaceBetween: 16,
    },
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    //   dynamicBullets: true,
    dynamicMainBullets: 2,
    clickable: true,
  },
});

// Weeky Sale部分的swiper初始化
var mySwiper = new Swiper(".swiper-ctn-2", {
  slidesPerView: 2.2,
  slidesPerGroup: 1,
  spaceBetween: 6,
  grabCursor: true,
  breakpoints: {
    498: {
      slidesPerView: 2.5,
      spaceBetween: 10,
    },
    598: {
      slidesPerView: 3,
      spaceBetween: 10,
    },
    898: {
      slidesPerView: 4,
      spaceBetween: 10,
    },
    1024: {
      slidesPerView: 5,
      spaceBetween: 16,
    },
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    //   dynamicBullets: true,
    dynamicMainBullets: 2,
    clickable: true,
  },
});

// Materials-Tab部分的移动端Tab标题的swiper初始化
var mySwiper = new Swiper(".mt-tab-title-swiper", {
  slidesPerView: "auto",
  spaceBetween: 10,
});

var mySwiper = new Swiper(".swiper-sticky-nav", {
  slidesPerView: "auto",
});
