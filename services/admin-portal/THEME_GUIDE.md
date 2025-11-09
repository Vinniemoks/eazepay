## 🎨 Eazepay Theme Guide

### Royal Yellow & Gold Color System

#### Primary Colors
```
Gold 50:  #FFFBEB  ░░░░░░░░  Lightest
Gold 100: #FEF3C7  ░░░░░░░░
Gold 200: #FDE68A  ░░░░░░░░
Gold 300: #FCD34D  ░░░░░░░░
Gold 400: #FBBF24  ████████  Base Yellow
Gold 500: #F59E0B  ████████  PRIMARY GOLD ⭐
Gold 600: #D97706  ████████
Gold 700: #B45309  ████████
Gold 800: #92400E  ████████
Gold 900: #78350F  ████████  Darkest
```

#### Royal Gold Accent
```
Royal 500: #FFC107  ████████  ROYAL GOLD 👑
```

### Usage Examples

#### Buttons
```jsx
// Primary Button
<button style={{
  background: 'linear-gradient(135deg, #F59E0B, #FFC107)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '10px',
  border: 'none',
  fontWeight: '600',
  cursor: 'pointer'
}}>
  Click Me
</button>
```

#### Cards
```jsx
// Card with theme
<div style={{
  background: theme.background.paper,
  border: `1px solid ${theme.border}`,
  borderRadius: '16px',
  padding: '24px',
  boxShadow: `0 4px 12px ${theme.shadow}`
}}>
  Content
</div>
```

#### Icons with Gold Background
```jsx
<div style={{
  width: '48px',
  height: '48px',
  background: `${theme.primary}15`,  // 15% opacity
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px'
}}>
  👑
</div>
```

### Theme Modes

#### Light Mode
- Background: #FAFAFA (very light gray)
- Paper: #FFFFFF (white)
- Text: #171717 (almost black)
- Border: #E5E5E5 (light gray)

#### Dark Mode
- Background: #0A0A0A (almost black)
- Paper: #171717 (dark gray)
- Text: #FAFAFA (very light gray)
- Border: #404040 (medium gray)

### Brightness Adjustment

```jsx
// Use the theme hook
const { brightness, setBrightness } = useTheme();

// Adjust brightness
setBrightness(10);  // Brighter
setBrightness(-10); // Darker
```

### Auto-Adjust Schedule
- 🌅 Morning (6-12): +10 brightness
- ☀️ Afternoon (12-18): 0 brightness
- 🌆 Evening (18-22): -10 brightness
- 🌙 Night (22-6): -20 brightness

### Best Practices

1. **Always use theme colors**
   ```jsx
   const { theme } = useTheme();
   color: theme.text.primary  // ✅ Good
   color: '#000000'           // ❌ Bad
   ```

2. **Use gradients for primary actions**
   ```jsx
   background: `linear-gradient(135deg, ${theme.primary}, ${theme.royal})`
   ```

3. **Add opacity for subtle backgrounds**
   ```jsx
   background: `${theme.primary}15`  // 15% opacity
   ```

4. **Smooth transitions**
   ```jsx
   transition: 'all 0.3s ease'
   ```

5. **Consistent spacing**
   - Small: 8px
   - Medium: 16px
   - Large: 24px
   - XL: 32px

### Component Examples

#### Stat Card
```jsx
<StatCard
  icon="👥"
  label="Total Users"
  value="1,234"
  change="+12%"
  trend="up"
/>
```

#### Navigation Link
```jsx
<NavLink
  to="/dashboard"
  style={({ isActive }) => ({
    color: isActive ? theme.primary : theme.text.secondary,
    background: isActive ? `${theme.primary}15` : 'transparent',
    padding: '12px 16px',
    borderRadius: '8px'
  })}
>
  Dashboard
</NavLink>
```

### Accessibility

- Minimum contrast ratio: 4.5:1
- Focus indicators: 2px solid primary
- Keyboard navigation: Full support
- Screen reader: Semantic HTML + ARIA

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```
