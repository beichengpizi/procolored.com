class SocialShare {
  constructor() {
    // 定义各个社交平台的分享链接模板
    this.platforms = {
      facebookLike: (url) => `https://${url}`,
      facebook: (url) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: (url, text) =>
        `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || '')}`,
      twitterFollow: (url) => `https://x.com/${encodeURIComponent(url)}`,
      followTwitter: (url) =>
        `https://x.com/intent/follow?screen_name=${encodeURIComponent(url)}`,
      instagramFollow: (url) =>
        `https://www.instagram.com/${encodeURIComponent(url)}`,
      tiktokFollow: (url) => `https://www.tiktok.com/${encodeURIComponent(url)}`
    }
  }

  // 打开分享链接
  share(platform, { url, text = '' } = {}) {
    if (!url) {
      console.error('URL is required for sharing.')
      return
    }

    // 根据平台生成分享链接
    const shareUrl = this.platforms[platform]?.(url, text)

    if (shareUrl) {
      const left = window.screen.width / 2 - 600 / 2
      const top = window.screen.height / 2 - 400 / 2
      // window.open(shareUrl, '_blank', 'noopener,noreferrer')
      window.open(
        shareUrl,
        platform,
        `width=600,height=400,left=${left},top=${top},resizable=yes,scrollbars=yes`
      )
    } else {
      console.error(
        `Sharing on ${platform} is not supported or the URL could not be generated.`
      )
    }
  }
}

export default SocialShare
