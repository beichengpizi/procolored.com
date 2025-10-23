  if (typeof countDownDate !== 'undefined') {
    var x = setInterval(function() {
      var countdown_el = document.getElementById("coupon_countdown");
      var now = new Date().getTime();
      var distance = countDownDate - now;
      if (distance < 0) {
        clearInterval(x);
        countdown_el.style.display = "none";
      } else {
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        countdown_el.querySelector(".days").innerHTML = days;
        countdown_el.querySelector(".hours").innerHTML = hours;
        countdown_el.querySelector(".mins").innerHTML = minutes;
        countdown_el.querySelector(".secs").innerHTML = seconds;
      }
    }, 1000);
  }