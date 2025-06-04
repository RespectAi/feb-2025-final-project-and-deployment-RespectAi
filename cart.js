// Import Supabase functions
import { cartAPI, productsAPI } from "./lib/supabase.js"

// Cart functionality with Supabase
let cartItems = []

// Update cart count on page load
document.addEventListener("DOMContentLoaded", () => {
  loadCartItems()
})

async function loadCartItems() {
  try {
    cartItems = await cartAPI.getItems()
    updateCartCount()
    updateCartItems()
  } catch (error) {
    console.error("Error loading cart items:", error)
    // Fallback to localStorage for offline functionality
    cartItems = JSON.parse(localStorage.getItem("cart")) || []
    updateCartCount()
    updateCartItems()
  }
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count")
  if (cartCount) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = totalItems
  }
}

function updateCartItems() {
  const cartItemsContainer = document.getElementById("cart-items")
  const cartSubtotal = document.getElementById("cart-subtotal")
  const cartTax = document.getElementById("cart-tax")
  const cartTotal = document.getElementById("cart-total")

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = ""
    let subtotal = 0

    cartItems.forEach((item, index) => {
      const price = item.products ? item.products.price : item.price
      const name = item.products ? item.products.name : item.name
      const image = item.products ? item.products.image_url : item.image

      subtotal += price * item.quantity
      const itemElement = document.createElement("div")
      itemElement.className = "flex items-center justify-between py-2 border-b"
      itemElement.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${image}" alt="${name}" class="w-16 h-16 object-cover rounded">
                    <div>
                        <h4 class="font-medium">${name}</h4>
                        <p class="text-gray-600">$${price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.id || index}')" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            `
      cartItemsContainer.appendChild(itemElement)
    })

    // Calculate totals
    const tax = subtotal * 0.08 // 8% tax
    const shipping = subtotal > 0 ? 10 : 0 // $10 shipping if there are items
    const total = subtotal + tax + shipping

    // Update summary
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`
    if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`
  }
}

async function addToCart(productId, quantity = 1) {
  try {
    // If productId is an object (legacy support), extract the data
    if (typeof productId === "object") {
      const { name, price, image } = productId
      // For legacy support, create a temporary product
      const tempProduct = { name, price, image_url: image }
      cartItems.push({
        id: Date.now().toString(),
        quantity: 1,
        products: tempProduct,
      })
      localStorage.setItem("cart", JSON.stringify(cartItems))
    } else {
      // Add item via Supabase
      await cartAPI.addItem(productId, quantity)
      await loadCartItems() // Reload cart items
    }

    // Show notification
    const product = await productsAPI.getById(productId)
    const productName = product ? product.name : "Item"
    showNotification(`${productName} added to cart!`)
  } catch (error) {
    console.error("Error adding to cart:", error)
    showNotification("Error adding item to cart")
  }
}

async function removeFromCart(itemId) {
  try {
    if (typeof itemId === "string" && itemId.length > 10) {
      // Remove via Supabase
      await cartAPI.removeItem(itemId)
    } else {
      // Remove from local array (legacy support)
      cartItems.splice(Number.parseInt(itemId), 1)
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }

    await loadCartItems()
  } catch (error) {
    console.error("Error removing from cart:", error)
    showNotification("Error removing item from cart")
  }
}

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

function proceedToCheckout() {
  // Hide cart sidebar
  toggleCart()

  // Navigate to checkout page
  window.location.href = "checkout.html"
}

function showNotification(message) {
  const notification = document.createElement("div")
  notification.className =
    "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0 z-50"
  notification.textContent = message
  document.body.appendChild(notification)

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateY(100%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Export functions for use in other files
window.addToCart = addToCart
window.removeFromCart = removeFromCart
window.toggleCart = toggleCart
window.updateCartCount = updateCartCount
window.updateCartItems = updateCartItems
window.proceedToCheckout = proceedToCheckout
window.loadCartItems = loadCartItems
