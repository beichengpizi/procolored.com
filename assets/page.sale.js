document.querySelectorAll('.mobile-add-to-cart-button').forEach(el => {
	el.addEventListener('click', () => {
		el.parentElement.parentElement.querySelector('.product-card--add-to-cart-button').click();
	});
});

document.querySelectorAll('video[loop-fix]').forEach(el => {
	el.addEventListener(
		'ended',
		e => {
			e.target.currentTime = 0;
			e.target.play();
		},
		false
	);
});
