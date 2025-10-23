const sectionNamePrefix = '__product_section_for_';
const sectionTitlePrefix = '__product_section_title_for_';
const defaultCursor = document.querySelectorAll('.product-section-title')[0].textContent.trim();
let titleCursor = defaultCursor;

//  处理包含非 ASCII 字符的字符串 如
//  拉丁字母扩展（如 ä, ö, ü, é, ñ） 
//  希腊字母（如 α, β, γ）
//  俄文字母（如 А, Б, В）
//  中文字符（如 中, 国, 汉）
//  日文字符（如 日, 本, 語）
//  韩文字符（如 한, 글, 문）

function toBase64(str) {
	// 将字符串转换为 UTF-8 编码的 Uint8Array
	const encoder = new TextEncoder();
	const uint8Array = encoder.encode(str);
  
	// 将 Uint8Array 转换为 Base64 字符串
	return btoa(String.fromCharCode.apply(null, uint8Array));
  }
function setTitleActive(title) {
	// console.log(title)
	// console.log('btoa转bsae64后==',btoa(title))
	// console.log('toBase64转bsae64后==',toBase64(title))
	document.getElementById(sectionTitlePrefix + toBase64(title)).classList.add('active');
}

function setTitleInactive(title) {
	document.getElementById(sectionTitlePrefix + toBase64(title)).classList.remove('active');
}

setTitleActive(titleCursor);
showProductSection(titleCursor);

function setTitleCursor(newCursor) {
	cursorChangeHook(titleCursor, newCursor);
	titleCursor = newCursor;
}

function cursorChangeHook(oldCursor, newCursor) {
	if (newCursor === oldCursor) return;
	setTitleInactive(oldCursor);
	setTitleActive(newCursor);
	hideProductSection(oldCursor);
	showProductSection(newCursor);
}

async function sleep(ms) {
	return new Promise(r => {
		setTimeout(() => {
			r();
		}, ms);
	});
}

async function showProductSection(title) {
	console.log(`show ${title}`,titleCursor);
	if (toBase64(titleCursor) !== toBase64(title)) {
		await sleep(200);
	}
	let target = document.getElementById(sectionNamePrefix + toBase64(title));
	console.log(sectionNamePrefix + toBase64(title));
	target.style.display = 'flex';
	setTimeout(() => {
		target.style.opacity = 1;
	}, 1);
}

async function hideProductSection(title) {
	console.log(`hide ${title}`);
	let target = document.getElementById(sectionNamePrefix + toBase64(title));
	target.style.opacity = 0;
	setTimeout(() => {
		target.style.display = 'none';
	}, 200);
}

document.querySelectorAll('.left .product-section-title').forEach(el => {
	el.addEventListener('mouseenter', e => {
		setTitleCursor(el.innerText);
	});
});

document.querySelectorAll('.product-section-item[data-link]').forEach(el => {
	el.addEventListener('click', e => {
		if (e.ctrlKey) {
			//console.log('Ctrl key pressed');
			e.preventDefault();
			const targetUrl = el.getAttribute('data-link');
			//console.log('event.target.href', targetUrl);
			const newWindow = window.open(targetUrl, '_blank');
			newWindow.location.href = targetUrl;
		  }else{
			location.href = el.getAttribute('data-link');
		}
		
	});
});

document.querySelectorAll('.product-section-item-mobile[data-link]').forEach(el => {
    el.addEventListener('click', e => {
		if (e.ctrlKey) {
			//console.log('Ctrl key pressed');
			e.preventDefault();
			const targetUrl = el.getAttribute('data-link');
			//console.log('event.target.href', targetUrl);
			const newWindow = window.open(targetUrl, '_blank');
			newWindow.location.href = targetUrl;
		  }else{
			location.href = el.getAttribute('data-link');
		}
    })
})


document.querySelector('.sub-menu.mega-menu-container').addEventListener('mouseleave', e => {
	setTitleCursor(defaultCursor);
});

/* Mobile Part */

document.querySelectorAll('.full-menu-mobile-details').forEach(el => {
	el.addEventListener('click', e => {
		Array.from(document.querySelectorAll('.full-menu-mobile-details[open]'))
			.filter(x => x.innerText !== el.innerText)
			.forEach(elel => {
				elel.open = false;
			});
		if (!el.open) {
			const toScroll = document.querySelector(`li[data-target-title="${el.getAttribute('data-target-title')}"]`);
			if (toScroll !== null) {
				toScroll.scrollIntoView({
					behavior: 'smooth'
				});
			}
		}
	});
});
