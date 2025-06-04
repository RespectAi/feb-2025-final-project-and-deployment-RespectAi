# TechMobile - Supabase Integration Guide

This guide will help you set up Supabase for your TechMobile e-commerce project.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: "TechMobile"
5. Enter a secure database password
6. Select a region close to your users
7. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API"
4. Copy your:
   - Project URL
   - Anon (public) key

### 3. Update Configuration

1. Open `lib/supabase.js`
2. Replace the placeholder values:
   \`\`\`javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your actual URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual key
   \`\`\`

### 4. Set Up Database

1. In your Supabase dashboard, go to the SQL Editor
2. Run the SQL scripts in this order:
   - `scripts/01-create-tables.sql` - Creates all necessary tables
   - `scripts/02-seed-products.sql` - Adds sample products
   - `scripts/03-setup-rls.sql` - Sets up Row Level Security

### 5. Test the Integration

1. Open `products-dynamic.html` in your browser
2. You should see products loaded from Supabase
3. Try adding items to cart
4. Test the checkout process

## Features

### Database Tables

- **products**: Store product information (name, price, category, etc.)
- **user_profiles**: Extended user information
- **cart_items**: Shopping cart items for users and guests
- **orders**: Order information
- **order_items**: Individual items in each order

### Key Features

- **Guest Shopping**: Users can shop without creating an account
- **Persistent Cart**: Cart items are saved in the database
- **Order Management**: Complete order processing and storage
- **Row Level Security**: Data is properly secured
- **Real-time Updates**: Cart updates in real-time

### API Functions

- `productsAPI.getAll()` - Get all products or filter by category
- `cartAPI.addItem()` - Add item to cart
- `cartAPI.getItems()` - Get user's cart items
- `cartAPI.removeItem()` - Remove item from cart
- `ordersAPI.createOrder()` - Process and create new order

## Authentication (Optional)

To add user authentication:

1. Enable authentication in Supabase dashboard
2. Configure auth providers (email, Google, etc.)
3. Use `authAPI` functions in `lib/supabase.js`

## Deployment

1. Update the Supabase URL and key in your production environment
2. Deploy your static files to any hosting service
3. Ensure CORS is properly configured in Supabase

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your domain is added to Supabase allowed origins
2. **RLS Errors**: Ensure Row Level Security policies are properly set up
3. **Import Errors**: Make sure you're using a modern browser that supports ES6 modules

### Support

For issues with Supabase integration, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
