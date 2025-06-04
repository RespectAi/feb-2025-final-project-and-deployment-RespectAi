// Enhanced cart functionality with Supabase integration
import { cartAPI, productsAPI } from "../lib/supabase.js"

// Cart state
let cartItems = []
let isLoading = false

// Initialize cart on page load
document.addEventListener("DOMContentLoaded", async () => {
  await loadCartItems()
  setupCartEventListeners()
})

// Load cart items from Supabase
async function loadCartItems() {
  if (isLoading) return

  isLoading = true
  try {
    cartItems = await cartAPI.getItems()
    updateCartDisplay()
  } catch (error) {
    console.error("Error loading cart:", error)
    // Fallback to localStorage for offline functionality
    const localCart = localStorage.getItem("cart")
    if (localCart) {
      cartItems = JSON.parse(localCart)
      updateCartDisplay()
    }
  } finally {
    isLoading = false
  }
}

// Update cart display
function updateCartDisplay() {
  updateCartCount()
  updateCartSidebar()
  updateCheckoutPage()
}

// Update cart count in header
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count")
  if (cartCountElement) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    cartCountElement.textContent = totalItems

    // Add animation for cart count update
    cartCountElement.classList.add("animate-pulse")
    setTimeout(() => {
      cartCountElement.classList.remove("animate-pulse")
    }, 500)
  }
}

// Update cart sidebar
function updateCartSidebar() {
  const cartItemsContainer = document.getElementById("cart-items")
  const cartSubtotal = document.getElementById("cart-subtotal")
  const cartTax = document.getElementById("cart-tax")
  const cartTotal = document.getElementById("cart-total")

  if (!cartItemsContainer) return

  // Clear existing items
  cartItemsContainer.innerHTML = ""

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Your cart is empty</p>
                <button onclick="toggleCart()" class="mt-4 text-indigo-600 hover:text-indigo-800">
                    Continue Shopping
                </button>
            </div>
        `
    if (cartSubtotal) cartSubtotal.textContent = "$0.00"
    if (cartTax) cartTax.textContent = "$0.00"
    if (cartTotal) cartTotal.textContent = "$0.00"
    return
  }

  let subtotal = 0

  cartItems.forEach((item, index) => {
    const price = item.products ? item.products.price : item.price
    const name = item.products ? item.products.name : item.name
    const image = item.products ? item.products.image_url : item.image

    subtotal += price * item.quantity

    const itemElement = document.createElement("div")
    itemElement.className = "flex items-center justify-between py-3 border-b border-gray-200"
    itemElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <img src="${image}" alt="${name}" class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${name}</h4>
                    <p class="text-sm text-gray-600">$${price.toFixed(2)} × ${item.quantity}</p>
                    <p class="text-sm font-medium text-gray-900">$${(price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
            <button onclick="removeFromCart('${item.id || index}')" 
                    class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                <i class="fas fa-trash text-sm"></i>
            </button>
        `
    cartItemsContainer.appendChild(itemElement)
  })

  // Calculate totals
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 0 ? 10 : 0 // $10 shipping
  const total = subtotal + tax + shipping

  // Update totals
  if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`
  if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`
  if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`
}

// Update checkout page if present
function updateCheckoutPage() {
  const checkoutItems = document.getElementById("checkout-cart-items")
  const checkoutSubtotal = document.getElementById("checkout-subtotal")
  const checkoutTax = document.getElementById("checkout-tax")
  const checkoutTotal = document.getElementById("checkout-total")

  if (!checkoutItems) return

  checkoutItems.innerHTML = ""
  let subtotal = 0

  cartItems.forEach((item) => {
    const price = item.products ? item.products.price : item.price
    const name = item.products ? item.products.name : item.name
    const image = item.products ? item.products.image_url : item.image

    subtotal += price * item.quantity

    checkoutItems.innerHTML += `
            <div class="flex items-center space-x-4 py-3">
                <img src="${image}" alt="${name}" class="w-16 h-16 object-cover rounded">
                <div class="flex-1">
                    <h3 class="font-medium">${name}</h3>
                    <p class="text-gray-600">$${price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <span class="font-semibold">$${(price * item.quantity).toFixed(2)}</span>
            </div>
        `
  })

  const tax = subtotal * 0.08
  const shipping = subtotal > 0 ? 10 : 0
  const total = subtotal + tax + shipping

  if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`
  if (checkoutTax) checkoutTax.textContent = `$${tax.toFixed(2)}`
  if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`
}

// Add item to cart
async function addToCart(productId, quantity = 1) {
  if (isLoading) return

  try {
    // Show loading state
    showNotification("Adding to cart...", "info")

    // Handle legacy calls with product data
    if (typeof productId === "string" && !productId.match(/^\d+$/)) {
      // This is likely a legacy call with product name
      const product = await findProductByName(productId)
      if (product) {
        productId = product.id
      } else {
        throw new Error("Product not found")
      }
    }

    await cartAPI.addItem(productId, quantity)
    await loadCartItems()

    // Get product name for notification
    const product = await productsAPI.getById(productId)
    const productName = product ? product.name : "Item"

    showNotification(`${productName} added to cart!`, "success")

    // Auto-open cart sidebar briefly
    if (!isCartOpen()) {
      toggleCart()
      setTimeout(() => {
        if (isCartOpen()) {
          toggleCart()
        }
      }, 2000)
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    showNotification("Error adding item to cart", "error")
  }
}

// Remove item from cart
async function removeFromCart(itemId) {
  if (isLoading) return

  try {
    if (typeof itemId === "string" && itemId.length > 10) {
      await cartAPI.removeItem(itemId)
    } else {
      // Handle legacy array index removal
      const index = Number.parseInt(itemId)
      if (cartItems[index]) {
        if (cartItems[index].id) {
          await cartAPI.removeItem(cartItems[index].id)
        } else {
          cartItems.splice(index, 1)
          localStorage.setItem("cart", JSON.stringify(cartItems))
        }
      }
    }

    await loadCartItems()
    showNotification("Item removed from cart", "info")
  } catch (error) {
    console.error("Error removing from cart:", error)
    showNotification("Error removing item", "error")
  }
}

// Helper function to find product by name (for legacy support)
async function findProductByName(name) {
  try {
    const products = await productsAPI.getAll()
    return products.find((p) => p.name.toLowerCase().includes(name.toLowerCase()))
  } catch (error) {
    console.error("Error finding product:", error)
    return null
  }
}

// Cart sidebar toggle
function toggleCart() {
  const cartSidebar = document.getElementById("cart-sidebar")
  const cartOverlay = document.getElementById("cart-overlay")

  if (cartSidebar && cartOverlay) {
    const isOpen = !cartSidebar.classList.contains("translate-x-full")

    if (isOpen) {
      cartSidebar.classList.add("translate-x-full")
      cartOverlay.classList.add("hidden")
    } else {
      cartSidebar.classList.remove("translate-x-full")
      cartOverlay.classList.remove("hidden")
      loadCartItems() // Refresh cart when opening
    }
  }
}

// Check if cart is open
function isCartOpen() {
  const cartSidebar = document.getElementById("cart-sidebar")
  return cartSidebar && !cartSidebar.classList.contains("translate-x-full")
}

// Proceed to checkout
function proceedToCheckout() {
  if (cartItems.length === 0) {
    showNotification("Your cart is empty", "warning")
    return
  }

  toggleCart()
  window.location.href = "checkout.html"
}

// Setup event listeners
function setupCartEventListeners() {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button")
  const mobileMenu = document.getElementById("mobile-menu")

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

  // Close cart when clicking overlay
  const cartOverlay = document.getElementById("cart-overlay")
  if (cartOverlay) {
    cartOverlay.addEventListener("click", toggleCart)
  }
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div")

  const bgColor =
    {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
    }[type] || "bg-gray-500"

  notification.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-full opacity-0 z-50`
  notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === "success" ? "check" : type === "error" ? "exclamation-triangle" : "info"}-circle"></i>
            <span>${message}</span>
        </div>
    `

  document.body.appendChild(notification)

  // Trigger animation
  setTimeout(() => {
    notification.classList.remove("translate-y-full", "opacity-0")
  }, 100)

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.add("translate-y-full", "opacity-0")
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Export functions for global use
window.addToCart = addToCart
window.removeFromCart = removeFromCart
window.toggleCart = toggleCart
window.proceedToCheckout = proceedToCheckout
window.loadCartItems = loadCartItems
