document.querySelectorAll('[data-href]').forEach(el => {
    el.addEventListener('click', c => {
        location.href = el.getAttribute('data-href');
    })
})

document.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', c => {
        window.open(el.getAttribute('data-open'));
    })
})

document.querySelectorAll('[data-anchor]').forEach(el => {
    el.addEventListener('click', e => {
        document.getElementById(el.getAttribute('data-anchor')).scrollIntoView({
            behavior: 'smooth'
        });
    })
})