// Cart functionality
let cart = [];
let cartOpen = false;

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    cartOpen = !cartOpen;
    
    if (cartOpen) {
        cartSidebar.classList.remove('translate-x-full');
        cartOverlay.classList.remove('hidden');
    } else {
        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
    }
}

function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${name} added to cart`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTax = document.getElementById('checkout-tax');
    const checkoutTotal = document.getElementById('checkout-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="flex items-center space-x-4">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
            <div class="flex-1">
                <h3 class="font-medium">${item.name}</h3>
                <p class="text-gray-600">$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <button onclick="removeFromCart(${index})" class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Update subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    
    // Update checkout items if on checkout page
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => `
            <div class="flex items-center space-x-4">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                <div class="flex-1">
                    <h3 class="font-medium">${item.name}</h3>
                    <p class="text-gray-600">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <span class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        
        // Update checkout totals
        const tax = subtotal * 0.1; // 10% tax
        const shipping = subtotal > 0 ? 10 : 0; // $10 shipping if items in cart
        const total = subtotal + tax + shipping;
        
        checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        checkoutTax.textContent = `$${tax.toFixed(2)}`;
        checkoutTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// Page navigation
function showPage(pageName, category = null) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        if (category) {
            // Handle category filtering if needed
            console.log(`Showing ${pageName} with category: ${category}`);
        }
    }
    
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }
}

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.remove('translate-y-full', 'opacity-0');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Checkout functionality
function processOrder() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    
    // Validate form
    let isValid = true;
    formData.forEach((value, key) => {
        if (!value) {
            isValid = false;
            const input = document.getElementById(key);
            input.classList.add('border-red-500');
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields');
        return;
    }
    
    // Process order
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    
    // Simulate order processing
    showNotification('Processing your order...');
    
    setTimeout(() => {
        // Clear cart
        cart = [];
        updateCart();
        
        // Show success message
        showNotification('Order placed successfully!');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }, 2000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Show home page by default
    showPage('home');
    
    // Initialize cart
    updateCart();
});
