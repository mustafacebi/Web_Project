/* =================================================================
   ANA ÇALIŞTIRMA KODU (Tüm sayfalarda çalışır)
   ================================================================= */

// DOMContentLoaded olayı, sayfanın tüm HTML'i yüklendiğinde tetiklenir.
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sepet Simgesi Güncelleme (Her sayfada)
    updateCartIcon();
    
    // 2. Sepete Ekleme Olayı (Sadece Ürün Detay sayfasında)
    const addToCartButton = document.querySelector('.btn-add-to-cart');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', (e) => {
            e.preventDefault();
            addProductToCart();
        });
    }

    // 3. Sepet Sayfası Çizme Olayı (Sadece Sepet sayfasında)
    if (window.location.pathname.includes('sepet.html')) {
        displayCartItems();
    }

    // 4. Mobil Menü (Hamburger) Tıklama Olayı (Her sayfada)
    const menuToggleButton = document.querySelector('.menu-toggle');
    const navWrapper = document.querySelector('.nav-wrapper');
    
    if (menuToggleButton && navWrapper) {
        menuToggleButton.addEventListener('click', () => {
            // 'nav-wrapper' elementine 'active' sınıfını ekle veya kaldır
            // CSS'de ".nav-wrapper.active { display: block; }" kuralı bunu bekliyor
            navWrapper.classList.toggle('active');
        });
    // ... (4. Mobil Menü kodu burada biter) ...
        }

        // 5. ÜRÜN DETAY SAYFASI RESİM GALERİSİ
        const mainImage = document.querySelector('.main-product-image');
        const thumbnails = document.querySelectorAll('.thumbnail-images img');

        // Eğer bu elementler sayfada varsa (yani urun-detay.html'deyiz):
        if (mainImage && thumbnails.length > 0) {
            
            // Sayfa yüklendiğinde ilk küçük resmi "aktif" olarak işaretle
            thumbnails[0].classList.add('active-thumbnail');
            
            // Her bir küçük resme (thumbnail) tıklama özelliği ekle
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    
                    // 1. Tıklanan küçük resmin 'data-large-src' özelliğinden yeni resim URL'sini al
                    const newImageSrc = thumbnail.dataset.largeSrc;
                    
                    // 2. Ana resmin 'src' özelliğini bu yeni URL ile değiştir
                    mainImage.src = newImageSrc;
                    
                    // 3. Tüm küçük resimlerden 'active' sınıfını kaldır
                    thumbnails.forEach(t => t.classList.remove('active-thumbnail'));
                    
                    // 4. Sadece tıklanan küçük resme 'active' sınıfını ekle
                    thumbnail.classList.add('active-thumbnail');
                });
            });
        }
        
    }); // <-- DOMContentLoaded'in kapanış parantezi (Bunun üstüne ekleyin)
    


/* =================================================================
   YARDIMCI FONKSİYONLAR (Tüm sepet mantığı)
   ================================================================= */

// ---- Sepet Hafıza Fonksiyonları ----

/**
 * Tarayıcı hafızasından (localStorage) sepeti getiren fonksiyon.
 */
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

/**
 * Sepeti tarayıcı hafızasına (localStorage) kaydeden fonksiyon.
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ---- Genel Sepet Fonksiyonları ----

/**
 * Header'daki sepet ikonundaki sayıyı güncelleyen fonksiyon.
 */
function updateCartIcon() {
    const cart = getCart();
    const cartCountElement = document.getElementById('cart-count');
    
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
}

/**
 * (Ürün Detay Sayfası) Ürün bilgilerini alıp sepete ekleyen fonksiyon.
 */
function addProductToCart() {
    const productTitle = document.querySelector('.product-info h1').textContent;
    const productPrice = document.querySelector('.detail-price').textContent;
    const productImage = document.querySelector('.main-product-image').src;
    
    const newProduct = {
        name: productTitle,
        price: productPrice,
        image: productImage
    };
    
    const cart = getCart();
    cart.push(newProduct);
    saveCart(cart);
    
    updateCartIcon();
    alert(productTitle + ' sepetinize eklendi!');
}


/* =================================================================
   SEPET.HTML SAYFASI FONKSİYONLARI
   ================================================================= */

/**
 * (Sepet Sayfası) Sepet ürünlerini HTML olarak ekrana çizen fonksiyon.
 */
function displayCartItems() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    
    if (!container) return; // Güvenlik kontrolü

    container.innerHTML = ''; 

    if (cart.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
        
        cart.forEach((product, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="cart-item-info">
                    <h4>${product.name}</h4>
                    <p class="cart-item-price">${product.price}</p>
                    <button class="remove-item-btn" data-index="${index}">Kaldır</button>
                </div>
            `;
            container.appendChild(cartItemElement);
        });
        
        addRemoveButtonListeners();
    }
    
    updateCartSummary();
}

/**
 * (Sepet Sayfası) Sipariş Özeti'ni (Ara Toplam, Genel Toplam) günceller.
 */
function updateCartSummary() {
    const subtotalElement = document.getElementById('summary-subtotal');
    const totalElement = document.getElementById('summary-total');
    if (!subtotalElement || !totalElement) return;

    const cart = getCart();
    const kargoUcreti = 29.99;
    let araToplam = 0;
    
    cart.forEach(product => {
        const priceString = product.price.replace(' TL', '').replace(',', '.');
        const priceNumber = parseFloat(priceString);
        if (!isNaN(priceNumber)) araToplam += priceNumber;
    });
    
    const genelToplam = araToplam + kargoUcreti;
    
    subtotalElement.textContent = araToplam.toFixed(2) + ' TL';
    totalElement.textContent = genelToplam.toFixed(2) + ' TL';
}

/**
 * (Sepet Sayfası) Tüm "Kaldır" butonlarına tıklama dinleyicisi ekler.
 */
function addRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const indexToRemove = parseInt(e.target.dataset.index);
            removeProductFromCart(indexToRemove);
        });
    });
}

/**
 * (Sepet Sayfası) Sepetten bir ürünü index'ine göre kaldıran fonksiyon.
 */
function removeProductFromCart(indexToRemove) {
    let cart = getCart();
    cart.splice(indexToRemove, 1);
    saveCart(cart);
    displayCartItems();
    updateCartIcon();
}