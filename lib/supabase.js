// Supabase configuration - Replace with your actual values
const SUPABASE_URL = "https://amefmrwpyxhnxsaoaqsi.supabase.co" // Replace with your Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZWZtcndweXhobnhzYW9hcXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDQyNjIsImV4cCI6MjA2NDYyMDI2Mn0.N1UHdchft6b_vy_qhSTRLTfIzHOwxD-ho2uQx8cWfZw" // Replace with your Supabase anon key

// Import Supabase client
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js@2"

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Generate session ID for guest users
export function getSessionId() {
  let sessionId = localStorage.getItem("session_id")
  if (!sessionId) {
    sessionId = "guest_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
    localStorage.setItem("session_id", sessionId)
  }
  return sessionId
}

// Get current user or session ID
export function getCurrentUserOrSession() {
  const user = supabase.auth.getUser()
  return user ? user.id : getSessionId()
}

// Products API
export const productsAPI = {
  async getAll(category = null) {
    let query = supabase.from("products").select("*")

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return data
  },

  async getById(id) {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching product:", error)
      return null
    }

    return data
  },
}

// Cart API
export const cartAPI = {
  async getItems() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const sessionId = getSessionId()

    let query = supabase.from("cart_items").select(`
              *,
              products (
                  id,
                  name,
                  price,
                  image_url
              )
          `)

    if (user) {
      query = query.eq("user_id", user.id)
    } else {
      query = query.eq("session_id", sessionId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching cart items:", error)
      return []
    }

    return data
  },

  async addItem(productId, quantity = 1) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const sessionId = getSessionId()

    // Check if item already exists in cart
    let existingQuery = supabase.from("cart_items").select("*").eq("product_id", productId)

    if (user) {
      existingQuery = existingQuery.eq("user_id", user.id)
    } else {
      existingQuery = existingQuery.eq("session_id", sessionId)
    }

    const { data: existing } = await existingQuery.single()

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()

      if (error) {
        console.error("Error updating cart item:", error)
        return null
      }

      return data[0]
    } else {
      // Insert new item
      const insertData = {
        product_id: productId,
        quantity: quantity,
      }

      if (user) {
        insertData.user_id = user.id
      } else {
        insertData.session_id = sessionId
      }

      const { data, error } = await supabase.from("cart_items").insert(insertData).select()

      if (error) {
        console.error("Error adding cart item:", error)
        return null
      }

      return data[0]
    }
  },

  async updateQuantity(itemId, quantity) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()

    if (error) {
      console.error("Error updating cart item quantity:", error)
      return null
    }

    return data[0]
  },

  async removeItem(itemId) {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

    if (error) {
      console.error("Error removing cart item:", error)
      return false
    }

    return true
  },

  async clearCart() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const sessionId = getSessionId()

    let query = supabase.from("cart_items").delete()

    if (user) {
      query = query.eq("user_id", user.id)
    } else {
      query = query.eq("session_id", sessionId)
    }

    const { error } = await query

    if (error) {
      console.error("Error clearing cart:", error)
      return false
    }

    return true
  },
}

// Orders API
export const ordersAPI = {
  async createOrder(orderData) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const sessionId = getSessionId()

    // Get cart items
    const cartItems = await cartAPI.getItems()

    if (cartItems.length === 0) {
      throw new Error("Cart is empty")
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
    const taxAmount = subtotal * 0.08 // 8% tax
    const shippingAmount = subtotal > 0 ? 10 : 0 // $10 shipping
    const totalAmount = subtotal + taxAmount + shippingAmount

    // Create order
    const orderInsertData = {
      total_amount: totalAmount,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      status: "pending",
      shipping_address: orderData.shippingAddress,
      billing_address: orderData.billingAddress,
    }

    if (user) {
      orderInsertData.user_id = user.id
    } else {
      orderInsertData.session_id = sessionId
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderInsertData).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      throw orderError
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.products.price,
      total_price: item.products.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      throw itemsError
    }

    // Clear cart after successful order
    await cartAPI.clearCart()

    return order
  },

  async getOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const sessionId = getSessionId()

    let query = supabase.from("orders").select(`
              *,
              order_items (
                  *,
                  products (
                      name,
                      image_url
                  )
              )
          `)

    if (user) {
      query = query.eq("user_id", user.id)
    } else {
      query = query.eq("session_id", sessionId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return []
    }

    return data
  },
}

// Auth helpers
export const authAPI = {
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (error) {
      console.error("Error signing up:", error)
      throw error
    }

    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error signing in:", error)
      throw error
    }

    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      throw error
    }
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  },
}
