document.addEventListener('DOMContentLoaded', () => {
    let cartCount = 0;

    // DOM Элементы (Множественные — теперь ищем по классам)
    const detailButtons = document.querySelectorAll('.btn-detail');
    const addToCartButtons = document.querySelectorAll('.btn-add');
    const closeButtons = document.querySelectorAll('.close-btn');

    // DOM Элементы (Одиночные — модалки и корзина)
    const btnModalAddToCart = document.getElementById('btnModalAddToCart');
    const cartFab = document.getElementById('cartFab');
    const detailModal = document.getElementById('detailModal');
    const cartModal = document.getElementById('cartModal');
    const cartBadge = document.getElementById('cartBadge');

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

    // Добавление в корзину
    function handleAddToCart() {
        cartCount++;
        if (cartFab) cartFab.classList.add('active');
        if (cartBadge) cartBadge.innerText = cartCount;

        // Легкий визуальный отклик (микро-памп кнопки)
        if (cartFab) {
            cartFab.style.transform = 'scale(1.15)';
            setTimeout(() => {
                cartFab.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Слушатели для открытия окон (перебираем ВСЕ кнопки товаров)
    detailButtons.forEach(btn => {
        btn.addEventListener('click', () => openModal(detailModal));
    });

    // Слушатели для добавления в корзину с витрины
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    // Кнопка «Додати в кошик» внутри самого модального окна
    if (btnModalAddToCart) {
        btnModalAddToCart.addEventListener('click', () => {
            handleAddToCart();
            closeModal(detailModal);
        });
    }

    // Открытие корзины при клике на плавающую кнопку (FAB)
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

    // Закрытие по клику на затемненный фон (overlay)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
});