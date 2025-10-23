document.querySelectorAll('.product-single__media img').forEach(e => {
    const zoom = e.parentElement.querySelector('[title="Zoom"]');
    if (zoom !== null) {
        e.addEventListener('click', () => {
            zoom.click()
            console.log(zoom.getAttribute('href'), e.getAttribute('src'))
        });
    }
})

document.querySelector('.jdgm-widget.jdgm-widget').addEventListener('click', e => {
    document.querySelector('#judgeme_product_reviews').scrollIntoView();
})

const feModalStyle = document.createElement('style')
feModalStyle.innerText = `
.modal-header:not(html) {
    min-height: 60px;
}

.modal-body:not(html) {
    height: calc(100vh - 45px - 100px);
    padding: 0 40px 40px;
}
`
console.log('shadowroot', document.querySelector('.js-fe-modal').shadowRoot)
document.querySelector('.js-fe-modal').shadowRoot.appendChild(feModalStyle);