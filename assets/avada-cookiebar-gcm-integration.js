window.dataLayer = window.dataLayer || [];
window.AVADA_COOKIES_BAR = window.AVADA_COOKIES_BAR || {};
function gtag() {window.dataLayer.push(arguments)}
function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
    }
    return {};
  }
window.AVADA_COOKIE_CONSENT = getCookie('avada_cookie_consent');
!AVADA_COOKIE_CONSENT.marketing && gtag("set", "ads_data_redaction", true);
gtag("set", "url_passthrough", true);
gtag("consent", "default", {
  ad_storage: !AVADA_COOKIE_CONSENT.marketing ? "denied" : "granted",
  ad_user_data: !AVADA_COOKIE_CONSENT.marketing ? "denied" : "granted",
  ad_personalization: !AVADA_COOKIE_CONSENT.marketing ? "denied" : "granted",
  analytics_storage: !AVADA_COOKIE_CONSENT.analytics ? "denied" : "granted",
  functionality_storage: !AVADA_COOKIE_CONSENT.functional ? "denied" : "granted",
  personalization_storage: !AVADA_COOKIE_CONSENT.functional ? "denied" : "granted",
  security_storage: "granted",
  wait_for_update: 500
});

