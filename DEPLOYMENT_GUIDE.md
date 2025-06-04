# Deploying Supabase Integration to Netlify

## Step 1: Update Your Supabase Configuration

1. Open `lib/supabase.js`
2. Replace the placeholder values with your actual Supabase credentials:

\`\`\`javascript
const SUPABASE_URL = "https://your-project-id.supabase.co"
const SUPABASE_ANON_KEY = "your-actual-anon-key"
\`\`\`

## Step 2: Upload Files to Your Netlify Site

Upload these new/updated files to your Netlify deployment:

### New Files to Add:
- `lib/supabase.js` - Supabase client configuration
- `js/cart-enhanced.js` - Enhanced cart with database integration
- `js/products-loader.js` - Dynamic product loading

### Files to Update:
- `index.html` - Updated with new script imports
- `products.html` - Enhanced with dynamic loading
- `checkout.html` - Updated checkout process

## Step 3: File Structure

Your Netlify site should have this structure:
\`\`\`
/
├── index.html (updated)
├── products.html (updated)
├── checkout.html (updated)
├── lib/
│   └── supabase.js (new)
├── js/
│   ├── cart-enhanced.js (new)
│   └── products-loader.js (new)
└── [other existing files...]
\`\`\`

## Step 4: Test the Integration

1. Visit your live site: https://grand-figolla-b1a8ae.netlify.app
2. Check browser console for any errors
3. Test adding items to cart
4. Verify products load from database
5. Test checkout process

## Step 5: Verify Database Connection

The site will:
- Load featured products from Supabase on the home page
- Store cart items in the database (persistent across sessions)
- Process orders through the database
- Fall back to static content if database is unavailable

## Troubleshooting

If you encounter issues:

1. **Check Supabase credentials** in `lib/supabase.js`
2. **Verify RLS policies** are set up correctly
3. **Check browser console** for JavaScript errors
4. **Ensure CORS is enabled** in Supabase settings

## Environment Variables (Optional)

For better security, you can use Netlify environment variables:

1. In Netlify dashboard, go to Site Settings > Environment Variables
2. Add:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

3. Update `lib/supabase.js` to use environment variables:
\`\`\`javascript
const SUPABASE_URL = process.env.SUPABASE_URL || "fallback-url"
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "fallback-key"
\`\`\`

Your TechMobile site will now be fully integrated with Supabase!
