// Cart functionality
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateCartItems();
});

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cartItems.length;
    }
}

function updateCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cartItems.forEach((item, index) => {
            subtotal += item.price;
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center justify-between py-2 border-b';
            itemElement.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                    <div>
                        <h4 class="font-medium">${item.name}</h4>
                        <p class="text-gray-600">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // Calculate totals
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 0 ? 10 : 0; // $10 shipping if there are items
        const total = subtotal + tax + shipping;

        // Update summary
        if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}

function addToCart(name, price, image) {
    // Add item to cart array
    cartItems.push({ name, price, image });
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart count and items
    updateCartCount();
    updateCartItems();
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0 z-50';
    notification.textContent = `${name} added to cart!`;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount();
    updateCartItems();
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        const isOpen = !cartSidebar.classList.contains('translate-x-full');
        
        if (isOpen) {
            cartSidebar.classList.add('translate-x-full');
            cartOverlay.classList.add('hidden');
        } else {
            cartSidebar.classList.remove('translate-x-full');
            cartOverlay.classList.remove('hidden');
            updateCartItems();
        }
    }
}

function proceedToCheckout() {
    // Hide cart sidebar
    toggleCart();
    
    // Navigate to checkout page
    window.location.href = 'checkout.html';
}

// Export functions for use in other files
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.updateCartCount = updateCartCount;
window.updateCartItems = updateCartItems;
window.proceedToCheckout = proceedToCheckout; 