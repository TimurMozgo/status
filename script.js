document.addEventListener('DOMContentLoaded', () => {
    // Наш массив корзины, где будут храниться объекты товаров
    let cart = []; 

    // DOM Элементы витрины
    const detailButtons = document.querySelectorAll('.btn-detail');
    const addToCartButtons = document.querySelectorAll('.btn-add');
    const closeButtons = document.querySelectorAll('.close-btn');

    // DOM Элементы окон и корзины
    const btnModalAddToCart = document.getElementById('btnModalAddToCart');
    const cartFab = document.getElementById('cartFab');
    const detailModal = document.getElementById('detailModal');
    const cartModal = document.getElementById('cartModal');
    const cartBadge = document.getElementById('cartBadge');
    
    // Динамические элементы корзины
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalValue = document.getElementById('cartTotalValue');

    // Элементы динамической карусели в модалке
    const carouselTrack = document.getElementById('modalCarouselTrack');
    const carouselDots = document.getElementById('modalCarouselDots');
    const carouselContainer = detailModal ? detailModal.querySelector('.carousel-container') : null;

    // Функция открытия модального окна
    function openModal(modalElement) {
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden'; // Запрещаем скролл фона
    }

    // Функция закрытия модального окна
    function closeModal(modalElement) {
        modalElement.classList.remove('active');
        document.body.style.overflow = 'auto'; // Возвращаем скролл
    }

    // Функция отрисовки и пересчета корзины
    function renderCart() {
        if (!cartItemsContainer || !cartTotalValue || !cartBadge) return;
        
        cartItemsContainer.innerHTML = ''; // Очищаем контейнер перед перерисовкой
        let totalSum = 0;
        let totalCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div style="color: #aaa; text-align: center; padding: 20px 0;">Кошик порожній</div>';
        } else {
            cart.forEach((item, index) => {
                totalSum += item.price * item.quantity;
                totalCount += item.quantity;

                // Создаем HTML-код для каждого товара в корзине
                const itemHtml = `
                    <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <img src="${item.img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                        <div class="cart-item-info" style="flex: 1; margin-left: 12px;">
                            <div class="product-title" style="font-size: 14px; margin-bottom: 4px; color: #fff;">${item.title}</div>
                            <div style="color: #aaa; font-size: 13px;">${item.quantity} шт. x ${item.price.toLocaleString()} ₴</div>
                        </div>
                        <button class="remove-item-btn" data-index="${index}" style="background: transparent; border: none; color: #ff5b5b; font-size: 22px; cursor: pointer; padding: 0 5px;">&times;</button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }

        // Обновляем общую сумму и счетчик на кнопке (FAB)
        cartTotalValue.innerText = `${totalSum.toLocaleString()} ₴`;
        cartBadge.innerText = totalCount;
        
        if (totalCount > 0) {
            cartFab.classList.add('active');
        } else {
            cartFab.classList.remove('active');
        }

        // Вешаем слушатели на кнопки удаления (крестики внутри корзины)
        const removeButtons = cartItemsContainer.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }

    // Добавление товара в массив
    function addItemToCart(title, price, img) {
        const existingItem = cart.find(item => item.title === title);
        
        if (existingItem) {
            existingItem.quantity++; // Если такой товар уже есть, просто апаем количество
        } else {
            cart.push({ title, price, img, quantity: 1 }); // Если новый — добавляем объект
        }
        
        renderCart();

        // Микро-памп кнопки корзины
        if (cartFab) {
            cartFab.style.transform = 'scale(1.15)';
            setTimeout(() => { cartFab.style.transform = 'scale(1)'; }, 200);
        }
    }

    // Удаление товара из корзины
    function removeFromCart(index) {
        cart.splice(index, 1);
        renderCart();
    }

    // Функция сборки динамической карусели и логики индикаторов-точек
    function setupModalCarousel(imagesArray) {
        if (!carouselTrack || !carouselDots) return;

        // Полный сброс старых данных
        carouselTrack.innerHTML = '';
        carouselDots.innerHTML = '';

        if (!imagesArray || imagesArray.length === 0 || imagesArray[0] === "") return;

        // Генерируем слайды и точки
        imagesArray.forEach((imgUrl, index) => {
            const img = document.createElement('img');
            img.src = imgUrl.trim();
            img.classList.add('carousel-slide');
            carouselTrack.appendChild(img);

            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active'); // Первая точка активна сразу
            carouselDots.appendChild(dot);
        });

        // Следим за свайпом и переключаем точки
        if (carouselContainer) {
            carouselContainer.scrollLeft = 0; // Всегда сбрасываем скролл в начало при генерации

            carouselContainer.onscroll = () => {
                const width = carouselContainer.clientWidth;
                const currentIndex = Math.round(carouselContainer.scrollLeft / width);
                
                const dots = carouselDots.querySelectorAll('.dot');
                dots.forEach((dot, idx) => {
                    if (idx === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            };
        }
    }

    // Считываем данные с карточки товара на витрине при клике на "Додати"
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const title = card.querySelector('.product-title').innerText;
            const img = card.querySelector('.product-img img').getAttribute('src');
            
            const priceText = card.querySelector('.product-price').innerText;
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            
            addItemToCart(title, price, img);
        });
    });

    // Открытие модалки по клику на "Детальніше" с динамической сборкой картинок
    detailButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const title = card.querySelector('.product-title').innerText;
            const priceText = card.querySelector('.product-price').innerText;
            
            // Парсим массив картинок из data-images="img1.jpg, img2.jpg"
            const imagesAttr = card.getAttribute('data-images');
            const images = imagesAttr ? imagesAttr.split(',') : [];

            if (detailModal) {
                detailModal.querySelector('.product-title').innerText = title;
                detailModal.querySelector('.product-price').innerText = priceText;
                
                // Запускаем сборку карусели для этого конкретного товара
                setupModalCarousel(images);
                openModal(detailModal);
            }
        });
    });

    // Добавление в корзину прямо из модального окна «Детальніше»
    if (btnModalAddToCart && detailModal) {
        btnModalAddToCart.addEventListener('click', () => {
            const title = detailModal.querySelector('.product-title').innerText;
            const priceText = detailModal.querySelector('.product-price').innerText;
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            
            // Берем первую картинку из сгенерированной карусели в качестве превью для корзины
            const firstSlide = detailModal.querySelector('.carousel-slide');
            const img = firstSlide ? firstSlide.getAttribute('src') : '';

            addItemToCart(title, price, img);
            closeModal(detailModal);
        });
    }

    // Открытие корзины при клике на плавающий FAB
    if (cartFab) {
        cartFab.addEventListener('click', () => openModal(cartModal));
    }

    // Универсальный обработчик для кнопок закрытия (крестиков)
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) closeModal(targetModal);
        });
    });

    // Закрытие окон по клику на затемненный фон (overlay)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Первичная инициализация пустой корзины при старте страницы
    renderCart();
});