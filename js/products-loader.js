// Dynamic product loading for existing pages
import { productsAPI } from "../lib/supabase.js"

// Load featured products for home page
export async function loadFeaturedProducts() {
  try {
    const featuredProducts = await productsAPI.getFeatured(4)
    const featuredContainer = document.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4.gap-8")

    if (featuredContainer && featuredProducts.length > 0) {
      // Clear existing static products
      featuredContainer.innerHTML = ""

      featuredProducts.forEach((product) => {
        const productCard = createProductCard(product)
        featuredContainer.appendChild(productCard)
      })
    }
  } catch (error) {
    console.error("Error loading featured products:", error)
    // Keep static products as fallback
  }
}

// Load products for products page
export async function loadProductsPage(category = null) {
  try {
    const products = await productsAPI.getAll(category)
    const productsContainer = document.querySelector(
      ".products-grid, .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4.gap-8",
    )

    if (productsContainer && products.length > 0) {
      // Clear existing products
      productsContainer.innerHTML = ""

      products.forEach((product) => {
        const productCard = createProductCard(product)
        productsContainer.appendChild(productCard)
      })
    }
  } catch (error) {
    console.error("Error loading products:", error)
    // Keep static products as fallback
  }
}

// Create product card element
function createProductCard(product) {
  const productCard = document.createElement("div")
  productCard.className =
    "bg-white rounded-lg overflow-hidden shadow-md product-card transition duration-300 hover:shadow-lg"

  // Determine badge
  let badge = ""
  if (product.is_featured) {
    badge =
      '<div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">FEATURED</div>'
  } else if (product.stock_quantity <= 5) {
    badge =
      '<div class="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">LOW STOCK</div>'
  } else if (product.discount_percentage > 0) {
    badge = `<div class="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">${product.discount_percentage}% OFF</div>`
  }

  // Calculate discounted price
  const originalPrice = product.price
  const discountedPrice =
    product.discount_percentage > 0 ? originalPrice * (1 - product.discount_percentage / 100) : originalPrice

  productCard.innerHTML = `
        <div class="relative">
            <img src="${product.image_url}" alt="${product.name}" class="w-full h-48 object-cover">
            ${badge}
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-lg mb-1">${product.name}</h3>
            <div class="flex items-center mb-2">
                <div class="flex text-yellow-400">
                    ${generateStarRating(4.5)} <!-- You can add rating to your database -->
                </div>
                <span class="text-gray-600 text-sm ml-2">(${Math.floor(Math.random() * 100) + 10} reviews)</span>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <span class="font-bold text-lg">$${discountedPrice.toFixed(2)}</span>
                    ${product.discount_percentage > 0 ? `<span class="text-sm text-gray-500 line-through ml-2">$${originalPrice.toFixed(2)}</span>` : ""}
                </div>
                <button onclick="addToCart('${product.id}')" 
                        class="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition duration-300"
                        ${product.stock_quantity === 0 ? "disabled" : ""}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            ${product.stock_quantity === 0 ? '<p class="text-red-600 text-sm mt-2">Out of Stock</p>' : ""}
            ${product.stock_quantity <= 5 && product.stock_quantity > 0 ? `<p class="text-orange-600 text-sm mt-2">Only ${product.stock_quantity} left!</p>` : ""}
        </div>
    `

  return productCard
}

// Generate star rating HTML
function generateStarRating(rating) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  let starsHTML = ""

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>'
  }

  // Half star
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>'
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>'
  }

  return starsHTML
}

// Initialize product loading based on current page
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname

  if (currentPage.includes("index.html") || currentPage === "/" || currentPage === "") {
    // Load featured products for home page
    loadFeaturedProducts()
  } else if (currentPage.includes("products.html")) {
    // Load all products for products page
    loadProductsPage()
  }
})

// Export for global use
window.loadFeaturedProducts = loadFeaturedProducts
window.loadProductsPage = loadProductsPage
