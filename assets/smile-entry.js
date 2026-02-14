// smile-entry.js - Smile.io 集成入口文件
// 此文件用于在 Shopify 主题中一次性加载所有 Smile.io 功能

// 加载基础库
import './smile-config.js';
import './smile-fetch.js';
import './smile-utils.js';
import './smile-member-api.js';

// 加载组件
import './smile-loading.js';
import './smile-modal.js';
import './smile-social-share.js';

// 注册所有 Smile.io 自定义元素
import './smile-member-account.js';
import './smile-member-coupon.js';
import './smile-member-earn-point.js';
import './smile-member-gift-card.js';
import './smile-member-point-store.js';
import './smile-member-points-transactions.js';

console.log('Smile.io 源代码已加载');
