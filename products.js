// ========================================
// PRODUCTS PAGE JAVASCRIPT
// ========================================

(function() {
    // ========================================
    // CART STATE (with localStorage persistence)
    // ========================================
    var cart = JSON.parse(localStorage.getItem('casaroCart')) || [];
    
    function saveCart() {
        localStorage.setItem('casaroCart', JSON.stringify(cart));
    }

    // ========================================
    // PRODUCT DATA
    // ========================================
    var sofaColors = [
        { id: 1, name: 'Xám', code: '#878377', folder: '1' },
        { id: 2, name: 'Đen', code: '#121212', folder: '2' },
        { id: 3, name: 'Trắng kem', code: '#fff6da', folder: '3' },
        { id: 4, name: 'Đỏ', code: '#901923', folder: '4' },
        { id: 5, name: 'Nâu', code: '#5e4230', folder: '5' },
        { id: 6, name: 'Xanh navy', code: '#394668', folder: '6' },
        { id: 7, name: 'Xanh lá đậm', code: '#265c51', folder: '7' },
        { id: 8, name: 'Xanh ngọc', code: '#0f9b8e', folder: '8' }
    ];

    var sofaSizes = [
        { size: '80cm x 1m85', original: 1689000, sale: 1299000 },
        { size: '1m x 1m85', original: 1949000, sale: 1499000 },
        { size: '1m2 x 1m85', original: 2209000, sale: 1699000 },
        { size: '1m5 x 1m85', original: 2599000, sale: 1999000 }
    ];

    // Generate products array
    var products = [];

    // Add sofa products (each color is a product)
    sofaColors.forEach(function(color) {
        products.push({
            id: 'sofa-' + color.id,
            type: 'sofa',
            name: 'Sofa Gấp Gọn Đa Năng',
            color: color.name,
            colorCode: color.code,
            folder: color.folder,
            description: 'Chất liệu vải cao cấp, khung sườn chắc chắn chịu lực, thiết kế thông minh tiết kiệm diện tích. Phù hợp mọi không gian nhà ở sang trọng.',
            originalPrice: 1689000,
            salePrice: 1299000,
            discount: 23,
            sizes: sofaSizes,
            gift: 'Tặng kèm 2 gối tựa',
            image: 'assets/images/sofagapgon/' + color.folder + '.1.png'
        });
    });

    // Add pillow products (each color is a product) - using .5 images
    sofaColors.forEach(function(color) {
        products.push({
            id: 'pillow-' + color.id,
            type: 'pillow',
            name: 'Gối Tựa Lẻ',
            color: color.name,
            colorCode: color.code,
            folder: color.folder,
            description: 'Gối tựa cao cấp, chất liệu vải mềm mại, đàn hồi tốt. Phù hợp kết hợp với sofa hoặc sử dụng riêng.',
            originalPrice: 159000,
            salePrice: 95400,
            discount: 40,
            sizes: null,
            gift: null,
            image: 'assets/images/sofagapgon/' + color.folder + '.5.png',
            isPillow: true
        });
    });

    // ========================================
    // DOM ELEMENTS
    // ========================================
    var productsGrid = document.getElementById('productsGrid');
    var filterBtns = document.querySelectorAll('.filter-btn');
    var productModal = document.getElementById('productModal');
    var productModalOverlay = document.getElementById('productModalOverlay');
    var productModalClose = document.getElementById('productModalClose');
    var modalMainImg = document.getElementById('modalMainImg');
    var modalThumbs = document.getElementById('modalThumbs');
    var modalBadge = document.getElementById('modalBadge');
    var modalTitle = document.getElementById('modalTitle');
    var modalDesc = document.getElementById('modalDesc');
    var modalPriceOriginal = document.getElementById('modalPriceOriginal');
    var modalPriceSale = document.getElementById('modalPriceSale');
    var modalDiscount = document.getElementById('modalDiscount');
    var modalSizeOption = document.getElementById('modalSizeOption');
    var modalSizeOptions = document.getElementById('modalSizeOptions');
    var modalLegsOption = document.getElementById('modalLegsOption');
    var modalLegsOptions = document.getElementById('modalLegsOptions');
    var modalOrderBtn = document.getElementById('modalOrderBtn');
    var modalCartBtn = document.getElementById('modalCartBtn');

    var orderModal = document.getElementById('orderModal');
    var orderModalOverlay = document.getElementById('orderModalOverlay');
    var orderModalClose = document.getElementById('orderModalClose');
    var orderForm = document.getElementById('orderForm');
    var orderSummary = document.getElementById('orderSummary');
    var submitOrderBtn = document.getElementById('submitOrderBtn');

    var successModal = document.getElementById('successModal');
    var successModalOverlay = document.getElementById('successModalOverlay');
    var successMessage = document.getElementById('successMessage');
    var successContinue = document.getElementById('successContinue');

    // Cart DOM Elements
    var cartSidebar = document.getElementById('cartSidebar');
    var cartOverlay = document.getElementById('cartOverlay');
    var cartClose = document.getElementById('cartClose');
    var cartBody = document.getElementById('cartBody');
    var cartFooter = document.getElementById('cartFooter');
    var cartEmpty = document.getElementById('cartEmpty');
    var cartTotalPrice = document.getElementById('cartTotalPrice');
    var cartCount = document.querySelector('.cart-count');
    var cartBtn = document.getElementById('cartBtn');
    var cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
    var continueShopping = document.getElementById('continueShopping');

    var currentProduct = null;
    var selectedSize = null;
    var selectedLegs = { legs: 4, extra: 0 };

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    // ========================================
    // CART FUNCTIONS
    // ========================================
    function addToCart() {
        var basePrice = selectedSize ? selectedSize.sale : currentProduct.salePrice;
        var legsExtra = selectedLegs ? selectedLegs.extra : 0;
        var totalPrice = basePrice + legsExtra;
        
        var item = {
            id: generateId(),
            productId: currentProduct.id,
            name: currentProduct.name,
            type: currentProduct.type,
            size: selectedSize ? selectedSize.size : null,
            color: currentProduct.color,
            colorCode: currentProduct.folder,
            legs: selectedLegs && currentProduct.type === 'sofa' ? selectedLegs.legs : null,
            legsExtra: legsExtra,
            originalPrice: (selectedSize ? selectedSize.original : currentProduct.originalPrice) + legsExtra,
            salePrice: totalPrice,
            image: currentProduct.image,
            gift: currentProduct.gift,
            quantity: 1
        };
        
        cart.push(item);
        saveCart();
        updateCartUI();
        closeProductModal();
        openCart();
    }

    function removeFromCart(id) {
        cart = cart.filter(function(item) {
            return item.id !== id;
        });
        saveCart();
        updateCartUI();
    }

    function clearCart() {
        cart = [];
        saveCart();
        updateCartUI();
    }

    function getCartTotal() {
        return cart.reduce(function(total, item) {
            return total + (item.salePrice * item.quantity);
        }, 0);
    }

    function updateCartUI() {
        // Update cart count
        var totalItems = cart.reduce(function(sum, item) {
            return sum + item.quantity;
        }, 0);
        cartCount.textContent = totalItems;

        // Show/hide empty state
        if (cart.length === 0) {
            cartEmpty.style.display = 'flex';
            cartBody.style.display = 'none';
            cartFooter.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartBody.style.display = 'block';
            cartFooter.style.display = 'block';
            renderCartItems();
        }

        // Update total
        cartTotalPrice.textContent = formatPrice(getCartTotal());
    }

    function renderCartItems() {
        cartBody.innerHTML = cart.map(function(item) {
            var variantText = item.color;
            if (item.size) variantText += ' / ' + item.size;
            if (item.legs) variantText += ' / ' + item.legs + ' chân';
            
            return '<div class="cart-item" data-id="' + item.id + '">' +
                '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-img">' +
                '<div class="cart-item-info">' +
                    '<h4 class="cart-item-name">' + item.name + '</h4>' +
                    '<p class="cart-item-variant">' + variantText + '</p>' +
                    '<p class="cart-item-price">' + formatPrice(item.salePrice) + '</p>' +
                '</div>' +
                '<button type="button" class="cart-item-remove" data-id="' + item.id + '" aria-label="Xóa">' +
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                        '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' +
                    '</svg>' +
                '</button>' +
            '</div>';
        }).join('');

        // Attach remove event listeners
        var removeButtons = cartBody.querySelectorAll('.cart-item-remove');
        removeButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                removeFromCart(this.dataset.id);
            });
        });
    }

    // ========================================
    // CART SIDEBAR CONTROLS
    // ========================================
    function openCart() {
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartSidebar.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // RENDER PRODUCTS
    // ========================================
    function renderProducts(filter) {
        var filteredProducts = products;
        
        if (filter && filter !== 'all') {
            filteredProducts = products.filter(function(p) {
                return p.type === filter;
            });
        }

        productsGrid.innerHTML = filteredProducts.map(function(product) {
            var giftBadge = product.gift ? 
                '<div class="product-card-gift">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                        '<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>' +
                    '</svg>' +
                    product.gift +
                '</div>' : '';

            return '<div class="product-card" data-id="' + product.id + '">' +
                '<div class="product-card-image">' +
                    '<img src="' + product.image + '" alt="' + product.name + ' - ' + product.color + '">' +
                    '<span class="product-card-badge">Giảm ' + product.discount + '%</span>' +
                    giftBadge +
                '</div>' +
                '<div class="product-card-info">' +
                    '<p class="product-card-category">' + (product.type === 'sofa' ? 'Ghế Sofa' : 'Gối') + '</p>' +
                    '<h3 class="product-card-title">' + product.name + '</h3>' +
                    '<p class="product-card-color">Màu: ' + product.color + '</p>' +
                    '<div class="product-card-price">' +
                        '<span class="product-card-price-original">' + formatPrice(product.originalPrice) + '</span>' +
                        '<span class="product-card-price-sale">' + formatPrice(product.salePrice) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');

        // Attach click events
        var cards = productsGrid.querySelectorAll('.product-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var productId = this.dataset.id;
                var product = products.find(function(p) { return p.id === productId; });
                if (product) {
                    openProductModal(product);
                }
            });
        });
    }

    // ========================================
    // PRODUCT MODAL
    // ========================================
    function openProductModal(product) {
        currentProduct = product;
        selectedSize = product.sizes ? product.sizes[0] : null;

        // Set badge
        modalBadge.textContent = product.gift || '';

        // Set title and description
        modalTitle.textContent = product.name + ' - Màu ' + product.color;
        modalDesc.textContent = product.description;

        // Set price
        updateModalPrice();

        // Set main image
        modalMainImg.src = product.image;
        modalMainImg.alt = product.name;

        // Set thumbnails
        modalThumbs.innerHTML = '';
        if (product.isPillow) {
            // Pillow only has 1 image (.5)
            var img = document.createElement('img');
            img.src = 'assets/images/sofagapgon/' + product.folder + '.5.png';
            img.alt = product.name + ' - ' + product.color;
            img.classList.add('active');
            modalThumbs.appendChild(img);
        } else {
            // Sofa has 4 images (.1 to .4)
            for (var i = 1; i <= 4; i++) {
                var img = document.createElement('img');
                img.src = 'assets/images/sofagapgon/' + product.folder + '.' + i + '.png';
                img.alt = product.name + ' - Góc ' + i;
                if (i === 1) img.classList.add('active');
                modalThumbs.appendChild(img);
            }
        }

        // Attach thumbnail events
        var thumbs = modalThumbs.querySelectorAll('img');
        thumbs.forEach(function(thumb) {
            thumb.addEventListener('click', function() {
                thumbs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                modalMainImg.src = this.src;
            });
        });

        // Set size options (only for sofa)
        if (product.sizes) {
            modalSizeOption.style.display = 'block';
            modalSizeOptions.innerHTML = product.sizes.map(function(s, index) {
                return '<button type="button" class="modal-size-btn' + (index === 0 ? ' active' : '') + '" ' +
                    'data-original="' + s.original + '" data-sale="' + s.sale + '">' +
                    s.size + '</button>';
            }).join('');

            // Attach size events
            var sizeBtns = modalSizeOptions.querySelectorAll('.modal-size-btn');
            sizeBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    sizeBtns.forEach(function(b) { b.classList.remove('active'); });
                    this.classList.add('active');
                    selectedSize = {
                        size: this.textContent,
                        original: parseInt(this.dataset.original),
                        sale: parseInt(this.dataset.sale)
                    };
                    updateModalPrice();
                });
            });
        } else {
            modalSizeOption.style.display = 'none';
        }

        // Set legs options (only for sofa)
        if (product.type === 'sofa') {
            modalLegsOption.style.display = 'block';
            selectedLegs = { legs: 4, extra: 0 };
            
            // Reset legs buttons
            var legsBtns = modalLegsOptions.querySelectorAll('.modal-legs-btn');
            legsBtns.forEach(function(btn, index) {
                btn.classList.toggle('active', index === 0);
            });

            // Attach legs events
            legsBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    legsBtns.forEach(function(b) { b.classList.remove('active'); });
                    this.classList.add('active');
                    selectedLegs = {
                        legs: parseInt(this.dataset.legs),
                        extra: parseInt(this.dataset.extra)
                    };
                    updateModalPrice();
                });
            });
        } else {
            modalLegsOption.style.display = 'none';
            selectedLegs = { legs: 0, extra: 0 };
        }

        // Show modal
        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateModalPrice() {
        var original = selectedSize ? selectedSize.original : currentProduct.originalPrice;
        var sale = selectedSize ? selectedSize.sale : currentProduct.salePrice;
        
        // Add extra for legs (only for sofa)
        if (selectedLegs && selectedLegs.extra > 0) {
            original += selectedLegs.extra;
            sale += selectedLegs.extra;
        }
        
        var discount = Math.round((1 - (selectedSize ? selectedSize.sale : currentProduct.salePrice) / (selectedSize ? selectedSize.original : currentProduct.originalPrice)) * 100);

        modalPriceOriginal.textContent = formatPrice(original);
        modalPriceSale.textContent = formatPrice(sale);
        modalDiscount.textContent = 'Giảm ' + discount + '%';
    }

    function closeProductModal() {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // ORDER MODAL
    // ========================================
    function openOrderModal(fromCart) {
        var items = [];
        var total = 0;
        
        if (fromCart && cart.length > 0) {
            items = cart;
            total = getCartTotal();
        } else if (currentProduct) {
            var basePrice = selectedSize ? selectedSize.sale : currentProduct.salePrice;
            var legsExtra = selectedLegs ? selectedLegs.extra : 0;
            total = basePrice + legsExtra;
            
            items = [{
                name: currentProduct.name,
                color: currentProduct.color,
                size: selectedSize ? selectedSize.size : null,
                legs: selectedLegs && currentProduct.type === 'sofa' ? selectedLegs.legs : null,
                salePrice: total,
                gift: currentProduct.gift
            }];
        }

        orderSummary.innerHTML = '<div class="summary-title">Đơn hàng của bạn</div>' +
            items.map(function(item) {
                var variantText = 'Màu ' + item.color;
                if (item.size) variantText += ' - ' + item.size;
                if (item.legs) variantText += ' - ' + item.legs + ' chân';
                
                return '<div class="summary-item">' +
                    '<span class="summary-item-name">' + item.name + '</span>' +
                    '<span class="summary-item-variant">' + variantText + '</span>' +
                    '<span class="summary-item-price">' + formatPrice(item.salePrice) + '</span>' +
                '</div>' +
                (item.gift ? '<div class="summary-item"><span class="summary-item-variant" style="color:#c5a059;">🎁 ' + item.gift + '</span></div>' : '');
            }).join('') +
            '<div class="summary-total">' +
                '<span>Tổng cộng:</span>' +
                '<span>' + formatPrice(total) + '</span>' +
            '</div>';

        closeProductModal();
        closeCart();
        orderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeOrderModal() {
        orderModal.classList.remove('active');
        document.body.style.overflow = '';
        orderForm.reset();
        submitOrderBtn.classList.remove('loading');
    }

    // ========================================
    // SUCCESS MODAL
    // ========================================
    function openSuccessModal(customerName) {
        var name = customerName || 'bạn';
        successMessage.textContent = 'Cảm ơn ' + name + '. Casaro Sofa sẽ liên hệ lại với bạn ngay để xác nhận đơn hàng.';
        successModal.classList.add('active');
    }

    function closeSuccessModal() {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // ORDER SUBMISSION
    // ========================================
    function submitOrder(e) {
        e.preventDefault();

        var formData = {
            name: document.getElementById('orderName').value,
            phone: document.getElementById('orderPhone').value,
            address: document.getElementById('orderAddress').value,
            items: cart.length > 0 ? cart : [currentProduct],
            total: cart.length > 0 ? getCartTotal() : (selectedSize ? selectedSize.sale : currentProduct.salePrice) + (selectedLegs ? selectedLegs.extra : 0)
        };

        submitOrderBtn.classList.add('loading');

        setTimeout(function() {
            console.log('Order submitted:', formData);
            closeOrderModal();
            openSuccessModal(formData.name);
            clearCart();
        }, 1500);
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    // Filter buttons
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            renderProducts(this.dataset.filter);
        });
    });

    // Product modal
    productModalClose.addEventListener('click', closeProductModal);
    productModalOverlay.addEventListener('click', closeProductModal);
    modalOrderBtn.addEventListener('click', function() {
        openOrderModal(false);
    });
    modalCartBtn.addEventListener('click', addToCart);

    // Cart sidebar controls
    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    continueShopping.addEventListener('click', closeCart);
    cartCheckoutBtn.addEventListener('click', function() {
        if (cart.length > 0) {
            openOrderModal(true);
        }
    });

    // Order modal
    orderModalClose.addEventListener('click', closeOrderModal);
    orderModalOverlay.addEventListener('click', closeOrderModal);
    orderForm.addEventListener('submit', submitOrder);

    // Success modal
    successModalOverlay.addEventListener('click', closeSuccessModal);
    successContinue.addEventListener('click', closeSuccessModal);

    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
            closeOrderModal();
            closeSuccessModal();
            closeCart();
        }
    });

    // Header scroll effect
    var header = document.getElementById('luxuryHeader');
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu
    var menuToggle = document.getElementById('menuToggle');
    var mainNav = document.getElementById('mainNav');
    var navClose = document.getElementById('navClose');
    var navOverlay = document.getElementById('navOverlay');
    
    function closeMenu() {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
    
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    navClose.addEventListener('click', closeMenu);
    navOverlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking nav links
    var navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
        link.addEventListener('click', closeMenu);
    });

    // ========================================
    // INITIALIZE
    // ========================================
    renderProducts('all');
    updateCartUI();

})();
