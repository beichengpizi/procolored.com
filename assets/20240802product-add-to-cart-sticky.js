function __20240802waitForElm(selector) {
	return new Promise(resolve => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver(mutations => {
			if (document.querySelector(selector)) {
				observer.disconnect();
				resolve(document.querySelector(selector));
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	});
}

__20240802waitForElm('[data-shopify="payment-button"] .shopify-cleanslate + .shopify-payment-button__button').then(el => {
	console.log('payment button rendered');
	console.log(el);
	const clone = document.querySelector('[data-shopify="payment-button"]').cloneNode(true);
	const clickTarget = document.querySelector('[data-shopify="payment-button"] .shopify-cleanslate + .shopify-payment-button__button [role="button"]');
	clone.addEventListener('click', e => {
		clickTarget.click();
	});
	document.querySelector('.product-add-to-cart-sticky-l1800 .right-box').appendChild(clone);
});

const __20240802priceObserver = new MutationObserver(m => {
	if (m.length === 1) {
		const mm = m[0];
		while (document.querySelector('.product-add-to-cart-sticky-l1800 .product-price').firstChild) document.querySelector('.product-add-to-cart-sticky-l1800 .product-price').firstChild.remove();
		while (document.querySelector('.product-price.duplicate').firstChild) document.querySelector('.product-price.duplicate').firstChild.remove();
		mm.addedNodes.forEach(e => document.querySelector('.product-add-to-cart-sticky-l1800 .product-price').appendChild(e.cloneNode(true)));
		mm.addedNodes.forEach(e => document.querySelector('.product-price.duplicate').appendChild(e.cloneNode(true)));
	}
});

__20240802priceObserver.observe(document.querySelector('.product-information--inner .product-price-container div'), {
	subtree: true,
	childList: true
});
