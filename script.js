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

    const fullscreenTrack = document.getElementById('fullscreenTrack');
    const fullscreenContainer = document.getElementById('fullscreenContainer');
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    
    // Динамические элементы корзины
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalValue = document.getElementById('cartTotalValue');

    // Аи ассистент
    const aiChatFab = document.getElementById('aiChatFab');
    const aiChatModal = document.getElementById('aiChatModal');
    const closeAiChatBtn = document.getElementById('closeAiChatBtn');
    const aiChatSendBtn = document.getElementById('aiChatSendBtn');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatMessages = document.getElementById('aiChatMessages');

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
        if (!carouselTrack || !carouselDots || !fullscreenTrack) return;

        // Полный сброс старых данных в обеих каруселях
        carouselTrack.innerHTML = '';
        carouselDots.innerHTML = '';
        fullscreenTrack.innerHTML = '';

        if (!imagesArray || imagesArray.length === 0 || imagesArray[0] === "") return;

        // Настройки контейнера модалки
        if (carouselContainer) {
            carouselContainer.style.overflowX = 'auto';
            carouselContainer.style.overflowY = 'hidden';
            carouselContainer.style.scrollSnapType = 'x mandatory';
            carouselContainer.style.scrollBehavior = 'smooth';
            carouselContainer.style.display = 'block';
            carouselContainer.scrollLeft = 0; 
        }
        
        carouselTrack.style.display = 'flex';
        carouselTrack.style.flexDirection = 'row';
        carouselTrack.style.width = '100%';
        carouselTrack.style.height = '100%';

        // Генерируем слайды параллельно для двух каруселей
        imagesArray.forEach((imgUrl, index) => {
            const trimmedUrl = imgUrl.trim();

            // Слайд для маленькой карусели в модалке
            const img = document.createElement('img');
            img.src = trimmedUrl;
            img.classList.add('carousel-slide');
            img.setAttribute('data-index', index); // Маркируем индекс слайда
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.flexShrink = '0';
            img.style.scrollSnapAlign = 'start';
            img.style.objectFit = 'contain';
            carouselTrack.appendChild(img);

            // Слайд для полноэкранной карусели
            const fullscreenSlide = document.createElement('div');
            fullscreenSlide.classList.add('fullscreen-slide');
            
            const fsImg = document.createElement('img');
            fsImg.src = trimmedUrl;
            
            fullscreenSlide.appendChild(fsImg);
            fullscreenTrack.appendChild(fullscreenSlide);

            // Точка-индикатор
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active'); 
            carouselDots.appendChild(dot);
        });

        // Следим за скроллом маленькой карусели
        if (carouselContainer) {
            carouselContainer.onscroll = () => {
                const width = carouselContainer.clientWidth;
                if (width === 0) return;
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

    // Открытие чата
    if (aiChatFab && aiChatModal) {
        aiChatFab.addEventListener('click', (e) => {
            e.preventDefault();
            aiChatModal.classList.add('active'); 
            
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }
            
            setTimeout(() => {
                if (aiChatInput) aiChatInput.focus();
            }, 350);
        });
    }

    // Жесткое закрытие чата по клику на выделенный крестик
    if (closeAiChatBtn && aiChatModal) {
        closeAiChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            aiChatModal.classList.remove('active');
        });
    }

    // Закрытие чата по клику на пустую область вокруг него
    if (aiChatModal) {
        aiChatModal.addEventListener('click', (e) => {
            if (e.target === aiChatModal) {
                aiChatModal.classList.remove('active');
            }
        });
    }

    // Функция отправки сообщения
    async function sendUserMessage() {
        const text = aiChatInput.value.trim();
        if (!text) return;

        // 1. Моментально відображаємо повідомлення користувача в чаті
        const userMsgDiv = document.createElement('div');
        userMsgDiv.classList.add('msg', 'message-user');
        userMsgDiv.textContent = text;
        aiChatMessages.appendChild(userMsgDiv);

        // Очищаємо поле введення і скроллимо вниз
        aiChatInput.value = '';
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        // Включаємо вібровідгук кліку для Telegram
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        // 2. Створюємо плашку очікування "STATUS AI думає..."
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('msg', 'message-ai');
        typingDiv.style.fontStyle = 'italic';
        typingDiv.style.opacity = '0.7';
        typingDiv.textContent = '...';
        aiChatMessages.appendChild(typingDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        try {
            // 3. Відправляємо POST-запит на твій тестовий вебхук n8n
            const response = await fetch('https://tiktiok.xyz/webhook/370e426a-157a-4fd2-b46c-9e71d9bb17dd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: text,
                    // Унікальний ID користувача з TG для збереження пам'яті в n8n
                    chat_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'demo_session_1' 
                })
            });

            // Видаляємо плашку очікування
            typingDiv.remove();

            if (!response.ok) throw new Error('Сервер повернув помилку');

            // Отримуємо відповідь від n8n
            const data = await response.json();
            
            // Забираємо текст відповіді (перевіряємо різні філди, які може повернути n8n)
            const aiText = data.output || data.response || data.text || JSON.stringify(data);

            // 4. Рендерим чистий український текст відповіді нашого Аудитора
            const aiMsgDiv = document.createElement('div');
            aiMsgDiv.classList.add('msg', 'message-ai');
            aiMsgDiv.textContent = aiText; 
            aiChatMessages.appendChild(aiMsgDiv);
            
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
            
            // Вібровідгук успішного отримання відповіді
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

        } catch (error) {
            console.error('Помилка вебхука n8n:', error);
            typingDiv.remove();
            
            // Якщо вебхук вимкнений або впав — видаємо солідну помилку
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('msg', 'message-ai');
            errorDiv.textContent = 'Вибачте, виникла помилка зв\'язку з сервером сервісу. Спробуйте надіслати повідомлення ще раз.';
            aiChatMessages.appendChild(errorDiv);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }
    }

    // Слухачі подій (залишаються, але тепер вони викликають нову асинхронну функцію)
    if (aiChatSendBtn) {
        aiChatSendBtn.addEventListener('click', sendUserMessage);
    }

    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
    }

    // Первичная инициализация пустой корзины при старте страницы
    renderCart();
});