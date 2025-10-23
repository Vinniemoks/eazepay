# AfriPay Universal Theme Colors

## Brand Colors

### Primary Colors
- **Royal Gold**: `#DAA520` - Main brand color
- **Royal Gold Light**: `#FFD700` - Highlights
- **Royal Gold Dark**: `#B8860B` - Depth

### Secondary Colors
- **Royal Purple**: `#8344FF` - Secondary brand color
- **Royal Purple Light**: `#9B66FF` - Highlights
- **Royal Purple Dark**: `#6B2FE0` - Depth

### Accent Colors
- **Royal Blue**: `#0066CC` - Accent color
- **Royal Blue Light**: `#3B82F6` - Highlights
- **Royal Blue Dark**: `#004E92` - Depth

## Gradients

### Primary Gradients
```css
--gradient-gold-purple: linear-gradient(135deg, #DAA520 0%, #8344FF 100%);
--gradient-purple-blue: linear-gradient(135deg, #8344FF 0%, #3B82F6 100%);
--gradient-royal: linear-gradient(135deg, #DAA520 0%, #8344FF 50%, #0066CC 100%);
```

### Premium Gradients
```css
--premium-gold: linear-gradient(135deg, #BF953F, #FCF6BA, #AA771C);
--premium-purple: linear-gradient(135deg, #4A0083, #6F1AB6, #9332EA);
--premium-blue: linear-gradient(135deg, #004E92, #0074D9, #00A6FF);
```

## Where Colors Are Applied

### Web Portal (Main Website)
- Logo: Gold-Purple gradient background
- Title: Gold-Purple gradient text
- Buttons: Gold-Purple gradient background
- Hero badge: Gold border with purple text
- Feature cards: Gold borders with hover effects
- Stats: Gold-Purple gradient text

### Customer Portal
- Login page: Gold-Purple gradient theme
- Buttons: Gold-Purple gradient
- Cards: Gold accent borders
- Background: Subtle gold-purple gradient overlay

### Agent Portal
- Login page: Gold-Purple gradient theme
- Dashboard stats: Gold-Purple gradient values
- Quick actions: Gold-Purple-Blue gradients
- Activity timeline: Gradient icons
- Charts: Gold line colors

### Admin Portal
- Similar gold-purple theme throughout
- Gradient text headers
- Themed buttons and cards

## Animations

All portals include:
- Fade-in effects
- Slide-in animations
- Scale animations
- Glow effects on hover
- Gradient shift animations
- Pulse animations

## Files Using Theme

1. `services/shared/styles/variables.css` - Color definitions
2. `services/shared/styles/global.css` - Global styles & animations
3. `services/web-portal/public/assets/styles.css` - Web portal styles
4. `services/customer-portal/src/index.css` - Customer portal import
5. `services/agent-portal/src/index.css` - Agent portal import
6. `services/admin-portal/src/index.css` - Admin portal import
7. `services/shared/styles/dashboard.css` - Dashboard component styles

## Viewing the Theme

### Web Portal
```bash
cd services/web-portal
npx serve public -p 8080
# Open http://localhost:8080
```

### Customer Portal
```bash
cd services/customer-portal
npm run dev
# Open http://localhost:3001 (or next available port)
```

### Agent Portal
```bash
cd services/agent-portal
npm run dev
# Open http://localhost:3002 (or next available port)
```

### Admin Portal
```bash
cd services/admin-portal
npm run dev
# Open http://localhost:3001 (or next available port)
```

## Browser Cache Issues

If you don't see the new colors:

1. **Hard refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Clear Vite cache**: `rm -rf node_modules/.vite` in portal directory
3. **Disable cache**: Open DevTools (F12) → Network tab → Check "Disable cache"
4. **Incognito mode**: Open in private/incognito window
5. **Clear browser cache**: Settings → Clear browsing data

## Color Consistency

All portals now share the same color system through:
- Shared CSS variables in `services/shared/styles/variables.css`
- Imported global styles in each portal's `index.css`
- Consistent gradient definitions
- Unified animation system
