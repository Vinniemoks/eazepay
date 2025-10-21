# Complete App Flows - Design Document

## Overview

This document details the comprehensive design for Eazepay applications across all platforms (Mobile iOS/Android, Desktop Windows/macOS/Linux) for all stakeholder types: Customers, Agents, Admins, and Superusers.

## Architecture

### Platform-Specific Considerations

**Mobile (iOS/Android)**:
- Native navigation patterns (bottom tabs for main sections)
- Biometric authentication integration
- Offline-first architecture with sync
- Push notifications
- Camera for QR code scanning
- Native share functionality

**Desktop (Windows/macOS/Linux)**:
- Sidebar navigation
- Multi-window support
- Keyboard shortcuts
- System tray integration
- Native menus
- Larger screen real estate for data tables

### Common Design Principles

1. **Consistency**: Same flows across platforms with platform-specific UI
2. **Security**: Biometric/PIN for sensitive operations
3. **Offline Support**: Queue operations when offline
4. **Real-time Updates**: WebSocket for live balance updates
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Localization**: English and Swahili support

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN' | 'SUPERUSER';
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'ACTIVE';
  profilePicture?: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  kycDocuments: Document[];
  createdAt: Date;
  lastLoginAt: Date;
}
```

### Wallet Model
```typescript
interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: 'KES';
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN';
  dailyLimit: number;
  monthlyLimit: number;
}
```

### Transaction Model
```typescript
interface Transaction {
  id: string;
  type: 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAWAL' | 'COMMISSION';
  amount: number;
  fee: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  fromUserId: string;
  toUserId: string;
  description: string;
  reference: string;
  createdAt: Date;
  completedAt?: Date;
}
```


## Screen Flows

### 1. Customer Flow

#### 1.1 Welcome & Onboarding (First Launch)

**Screens**:
- Splash Screen (2 seconds)
- Welcome Carousel (3 slides explaining features)
- Get Started Screen

**Welcome Carousel Content**:
1. "Send Money Instantly" - Image of phone with money transfer
2. "Pay with QR Code" - Image of QR code scanning
3. "Secure & Fast" - Image of biometric authentication

**Get Started Screen**:
- "Welcome to Eazepay" heading
- "Secure mobile payments made easy" subheading
- "Create Account" button (primary)
- "Login" button (secondary)
- Language selector (EN/SW)

#### 1.2 Customer Registration

**Screen 1: Basic Information**
- Full Name (text input)
- Email Address (email input with validation)
- Phone Number (phone input with country code +254)
- Password (password input with strength indicator)
- Confirm Password
- "I agree to Terms & Conditions" checkbox
- "Next" button

**Screen 2: Verification**
- "Enter verification code sent to [phone]"
- 6-digit OTP input
- Countdown timer (60 seconds)
- "Resend Code" link
- "Verify" button

**Screen 3: KYC Documents**
- "Complete Your Profile" heading
- Document type selector (National ID, Passport, Huduma)
- Document number input
- "Upload Front" button with camera/gallery option
- "Upload Back" button (for ID cards)
- Selfie capture button
- "Submit for Verification" button

**Screen 4: Pending Verification**
- Success checkmark animation
- "Account Created Successfully!"
- "Your documents are being verified"
- "This usually takes 24-48 hours"
- "You'll receive a notification once approved"
- "Continue to App" button (limited access)

#### 1.3 Customer Login

**Login Screen**:
- Eazepay logo
- "Welcome Back" heading
- Email/Phone input
- Password input with show/hide toggle
- "Remember Me" checkbox
- "Login" button
- "Forgot Password?" link
- "Use Biometric" button (if enabled)
- "Don't have an account? Register" link

**2FA Screen** (if enabled):
- "Verify It's You" heading
- Biometric prompt (fingerprint/Face ID)
- OR 6-digit OTP input
- "Verify" button
- "Use different method" link


#### 1.4 Customer Dashboard

**Mobile Layout** (Bottom Tab Navigation):
- Home Tab
- Transactions Tab
- QR Code Tab
- Profile Tab

**Desktop Layout** (Sidebar Navigation):
- Dashboard (selected)
- Send Money
- Transactions
- QR Code
- Settings

**Home Screen Content**:

**Header**:
- Profile picture (left)
- "Hello, [First Name]" greeting
- Notification bell icon (right)
- Settings gear icon (right)

**Balance Card** (prominent, gradient background):
- "Available Balance" label
- "KES [amount]" large text
- Eye icon to show/hide balance
- "Last updated: [time]" small text

**Quick Actions** (4 buttons in grid):
1. Send Money (icon: arrow up)
2. Request Money (icon: arrow down)
3. Add Money (icon: plus)
4. Pay Bill (icon: document)

**Recent Transactions** (list):
- Section header: "Recent Transactions" with "See All" link
- Transaction items (last 5):
  - Icon (send/receive indicator)
  - Name/Description
  - Date & Time
  - Amount (+ for receive, - for send)
  - Status badge

**Promotional Banner** (optional):
- Swipeable carousel
- "Refer a friend and earn KES 100"
- "New feature: Pay bills directly"

#### 1.5 Send Money Flow

**Screen 1: Recipient Selection**
- "Send Money To" heading
- Search bar: "Phone number or name"
- Recent recipients list (with avatars)
- "Enter New Number" button
- Contacts list (with permission)

**Screen 2: Amount Entry**
- Recipient info card (name, phone, avatar)
- Large amount input with currency
- Quick amount buttons (100, 500, 1000, 5000)
- Available balance display
- Fee calculation display
- Description/Note input (optional)
- "Continue" button

**Screen 3: Confirmation**
- "Confirm Transaction" heading
- Summary card:
  - To: [Recipient name & phone]
  - Amount: KES [amount]
  - Fee: KES [fee]
  - Total: KES [total]
  - Description: [note]
- "Confirm with [Biometric/PIN]" button
- "Cancel" button

**Screen 4: Processing**
- Loading animation
- "Processing your transaction..."
- Progress indicator

**Screen 5: Success/Failure**
- Success: Checkmark animation, "Money Sent Successfully!"
- Failure: X animation, "Transaction Failed"
- Transaction details
- "Share Receipt" button
- "Done" button
- "Try Again" button (if failed)


#### 1.6 Receive Money & QR Code

**QR Code Screen**:
- "Receive Money" heading
- Large QR code display (center)
- User's name and phone number
- "Share QR Code" button
- "Request Specific Amount" toggle
- Amount input (if toggle enabled)
- "My QR Code" save to gallery button

**Request Money Screen**:
- "Request Money From" heading
- Recipient phone input
- Amount input
- Reason/Description input
- "Send Request" button
- Pending requests list

#### 1.7 Transaction History

**Transactions Screen**:
- "Transactions" heading
- Filter chips: All, Sent, Received, Pending
- Date range selector
- Search bar
- Transaction list (paginated):
  - Date separator headers
  - Transaction cards:
    - Icon & type
    - Recipient/Sender name
    - Description
    - Amount (colored by type)
    - Status badge
    - Time
- "Load More" button
- "Export" button (PDF/CSV)

**Transaction Detail Screen**:
- Transaction ID
- Status with icon
- Amount (large)
- Fee breakdown
- From/To details
- Date & Time
- Description
- Reference number
- "Share Receipt" button
- "Report Issue" button
- "Download Receipt" button

### 2. Agent Flow

#### 2.1 Agent Registration

**Screen 1: Business Information**
- Business Name
- Business Registration Number
- Business Type (dropdown)
- Business Location (with map)
- Owner Full Name
- Owner ID Number
- "Next" button

**Screen 2: Document Upload**
- Business License upload
- Owner ID upload (front & back)
- Business premises photo
- "Submit Application" button

**Screen 3: Pending Approval**
- "Application Submitted"
- "Your application is under review"
- "Estimated approval time: 2-3 business days"
- Application reference number
- "Track Status" button


#### 2.2 Agent Dashboard

**Mobile Layout** (Bottom Tabs):
- Home
- Customers
- Transactions
- Reports
- Profile

**Desktop Layout** (Sidebar):
- Dashboard
- Customer Service
- Float Management
- Transactions
- Reports
- Settings

**Agent Home Screen**:

**Header**:
- Agent ID badge
- Business name
- Notification bell

**Float Balance Card**:
- "Float Balance" label
- KES [amount] (large)
- "Low Balance" warning (if < threshold)
- "Request Top-Up" button

**Today's Summary Cards** (3 cards):
1. Transactions Today
   - Count: [number]
   - Value: KES [amount]
2. Commission Earned
   - Today: KES [amount]
   - This Month: KES [amount]
3. Pending Actions
   - Count: [number]
   - "View" link

**Quick Actions** (4 buttons):
1. Deposit Cash
2. Withdraw Cash
3. Customer Lookup
4. Request Float

**Performance Metrics**:
- This Week chart (bar chart)
- Top Customers list
- Commission breakdown (pie chart)

#### 2.3 Agent Customer Service

**Customer Lookup Screen**:
- "Find Customer" heading
- Phone number input with search
- Recent customers list
- "Scan QR Code" button

**Customer Details Screen**:
- Customer info card (name, phone, photo)
- Account status badge
- Current balance (masked, show with permission)
- "Deposit Cash" button
- "Withdraw Cash" button
- Transaction history with customer

**Deposit Flow**:
1. Enter amount
2. Calculate commission
3. Show confirmation (customer + agent balances)
4. Request customer PIN/biometric
5. Process transaction
6. Show receipt with commission earned

**Withdraw Flow**:
1. Enter amount
2. Verify customer has sufficient balance
3. Calculate commission
4. Show confirmation
5. Request customer PIN/biometric
6. Process transaction
7. Show receipt


#### 2.4 Agent Float Management

**Float Management Screen**:
- Current float balance (large)
- Float history graph (7 days)
- "Request Top-Up" button
- Pending top-up requests
- Float transaction history

**Request Top-Up Screen**:
- Amount input
- Payment method selection (M-Pesa, Bank Transfer)
- "Submit Request" button
- Estimated processing time

### 3. Admin Flow

#### 3.1 Admin Dashboard

**Desktop Layout** (Primary - Sidebar):
- Dashboard
- Users
- Agents
- Transactions
- Access Requests
- Reports
- Audit Logs
- Settings

**Mobile Layout** (Adapted):
- Bottom tabs for main sections
- Hamburger menu for secondary items

**Admin Dashboard Screen**:

**KPI Cards** (4 cards):
1. Total Users
   - Count with trend
   - New today
2. Active Agents
   - Count with trend
   - Pending approval
3. Transaction Volume
   - Today's total
   - Percentage change
4. System Health
   - Status indicator
   - Uptime percentage

**Pending Actions** (priority list):
- KYC Verifications (count)
- Agent Applications (count)
- Access Requests (count)
- Reported Issues (count)

**Charts & Analytics**:
- User Growth (line chart, 30 days)
- Transaction Volume (bar chart, 7 days)
- Revenue Breakdown (pie chart)
- Top Agents (leaderboard)

**Recent Activity Feed**:
- Real-time activity log
- User registrations
- Large transactions
- System alerts

#### 3.2 Admin User Management

**Users List Screen**:
- Search bar (name, email, phone)
- Filters: Status, Role, KYC Status, Date Range
- Sort options
- User table/list:
  - Avatar
  - Name
  - Email/Phone
  - Role badge
  - Status badge
  - KYC status
  - Registration date
  - Actions menu

**User Detail Screen**:
- User profile card
- Account information
- KYC documents viewer
- Transaction summary
- Activity log
- Action buttons:
  - Approve KYC
  - Reject KYC
  - Suspend Account
  - Reset Password
  - View Transactions

**KYC Verification Screen**:
- Document viewer (zoom, rotate)
- Document details
- Verification checklist
- Approve/Reject buttons
- Rejection reason input
- Notes field


#### 3.3 Admin Transaction Monitoring

**Transactions Screen**:
- Real-time transaction feed
- Filters: Type, Status, Amount Range, Date
- Suspicious transaction highlights
- Transaction table:
  - ID
  - Type
  - From/To
  - Amount
  - Fee
  - Status
  - Date/Time
  - Actions

**Transaction Detail Screen**:
- Full transaction details
- User information (both parties)
- Timeline of transaction states
- Related transactions
- Action buttons:
  - Reverse Transaction
  - Block User
  - Flag as Suspicious
  - Add Note

**Analytics Screen**:
- Transaction trends
- Peak hours heatmap
- Average transaction value
- Success rate
- Fraud detection alerts

#### 3.4 Admin Agent Management

**Agents List Screen**:
- Search and filters
- Agent table:
  - Business name
  - Agent ID
  - Owner name
  - Location
  - Status
  - Performance rating
  - Commission rate
  - Actions

**Agent Detail Screen**:
- Business information
- Owner details
- Documents viewer
- Performance metrics
- Transaction history
- Customer feedback
- Action buttons:
  - Approve Application
  - Adjust Commission
  - Suspend Agent
  - View Reports

**Agent Applications Screen**:
- Pending applications list
- Application review workflow
- Document verification
- Approve/Reject with notes

### 4. Superuser Flow

#### 4.1 Superuser Dashboard

**Dashboard Screen**:
- System health overview
- All KPIs (expanded view)
- Real-time metrics
- Alert center
- Quick actions for critical operations

**System Health Panel**:
- Service status (all microservices)
- Database health
- API response times
- Error rates
- Active users count


#### 4.2 Superuser Admin Management

**Admin Management Screen**:
- Admin list with full details
- "Create Admin" button
- Admin roles and permissions matrix
- Activity logs per admin

**Create Admin Screen**:
- Admin details form
- Role selection (Manager, Employee)
- Department selection
- Permission assignment (checkboxes)
- Manager assignment (if Employee)
- "Create Admin" button

**Admin Detail Screen**:
- Admin profile
- Assigned permissions
- Activity history
- Performance metrics
- "Edit Permissions" button
- "Suspend Admin" button

#### 4.3 Superuser System Configuration

**Configuration Screen** (Tabs):

**Tab 1: General Settings**
- Platform name
- Support email/phone
- Maintenance mode toggle
- Feature flags

**Tab 2: Transaction Settings**
- Fee structure configuration
- Transaction limits (per user type)
- Daily/Monthly limits
- Minimum/Maximum amounts

**Tab 3: Integration Settings**
- M-Pesa configuration
- Bank integration settings
- SMS provider settings
- Email provider settings
- Payment gateway settings

**Tab 4: Security Settings**
- Password policy
- Session timeout
- 2FA requirements
- IP whitelist
- Rate limiting

**Tab 5: Notification Settings**
- Email templates
- SMS templates
- Push notification settings
- Notification triggers

#### 4.4 Superuser Analytics & Reports

**Analytics Dashboard**:
- Comprehensive KPIs
- Custom date range selector
- Export all data button

**Reports Section**:
- Financial Reports
- User Reports
- Transaction Reports
- Agent Performance Reports
- System Usage Reports
- Audit Reports

**Report Builder**:
- Select report type
- Choose metrics
- Set filters
- Schedule automated reports
- Export formats (PDF, Excel, CSV)


## Component Library

### Common Components

#### Buttons
- Primary Button (blue, full width or auto)
- Secondary Button (outlined)
- Danger Button (red, for destructive actions)
- Icon Button (circular, icon only)
- Text Button (no background)

#### Input Fields
- Text Input (with label, placeholder, error state)
- Password Input (with show/hide toggle)
- Phone Input (with country code selector)
- Amount Input (with currency symbol)
- Search Input (with search icon)
- OTP Input (6 digits, auto-focus)

#### Cards
- Balance Card (gradient background)
- Transaction Card (with icon, amount, status)
- User Card (with avatar, name, details)
- Summary Card (with icon, value, trend)
- Info Card (with icon, title, description)

#### Lists
- Transaction List (with date separators)
- User List (with avatars and badges)
- Notification List (with read/unread states)

#### Modals
- Confirmation Modal (with yes/no buttons)
- Info Modal (with OK button)
- Form Modal (with form fields and submit)
- Bottom Sheet (mobile, slides from bottom)

#### Navigation
- Bottom Tab Bar (mobile, 4-5 tabs)
- Sidebar (desktop, collapsible)
- Top Navigation Bar (with back button, title, actions)
- Breadcrumbs (desktop, for deep navigation)

#### Feedback
- Toast Notifications (success, error, info, warning)
- Loading Spinner (full screen or inline)
- Progress Bar (for multi-step processes)
- Empty State (with illustration and message)
- Error State (with retry button)

#### Data Display
- Table (sortable, filterable, paginated)
- Chart (line, bar, pie, donut)
- Badge (status indicators)
- Avatar (with fallback initials)
- QR Code (with share option)

## Error Handling

### Error Types and Messages

**Network Errors**:
- "No internet connection. Please check your network."
- "Connection timeout. Please try again."
- "Server is unreachable. Please try later."

**Authentication Errors**:
- "Invalid email or password."
- "Your session has expired. Please login again."
- "Account is suspended. Contact support."

**Transaction Errors**:
- "Insufficient balance. Please add money."
- "Transaction limit exceeded."
- "Recipient not found."
- "Transaction failed. Please try again."

**Validation Errors**:
- "Please enter a valid email address."
- "Password must be at least 8 characters."
- "Phone number is invalid."
- "Amount must be greater than 0."

### Error Recovery

1. **Retry Mechanism**: Automatic retry for network errors (3 attempts)
2. **Offline Queue**: Queue transactions when offline
3. **Error Logging**: Log all errors to Sentry
4. **User Feedback**: Clear error messages with actionable steps
5. **Fallback UI**: Show cached data when possible


## Testing Strategy

### Unit Tests
- API client functions
- State management logic
- Utility functions
- Form validation
- Data transformations

### Integration Tests
- Authentication flow
- Transaction processing
- Offline sync
- Push notifications
- Biometric authentication

### E2E Tests
- Complete user registration
- Send money flow
- Agent deposit/withdrawal
- Admin user approval
- Superuser configuration

### Platform-Specific Tests

**Mobile**:
- Biometric authentication
- Camera/QR scanning
- Push notifications
- Offline mode
- Deep linking

**Desktop**:
- Window management
- Keyboard shortcuts
- System tray
- Auto-updates
- Multi-window support

## Performance Considerations

### Mobile Optimization
- Image lazy loading
- List virtualization
- Code splitting
- Bundle size < 10MB
- App launch time < 3 seconds
- Smooth 60fps animations

### Desktop Optimization
- Efficient data tables (virtual scrolling)
- Cached API responses
- Optimistic UI updates
- Background sync
- Memory management

### API Optimization
- Request batching
- Response caching
- Pagination (20 items per page)
- Debounced search
- WebSocket for real-time updates

## Security Measures

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all API calls
- Implement certificate pinning
- Secure storage for tokens
- No sensitive data in logs

### Authentication
- JWT with short expiry (1 hour)
- Refresh token rotation
- Biometric authentication
- 2FA for sensitive operations
- Auto-logout after inactivity

### Authorization
- Role-based access control
- Permission checks on every action
- Audit logging for admin actions
- Rate limiting per user
- IP-based restrictions for admin


## Accessibility

### WCAG 2.1 AA Compliance

**Visual**:
- Color contrast ratio ≥ 4.5:1
- Text size adjustable
- No information conveyed by color alone
- Focus indicators visible
- Sufficient touch target size (44x44px)

**Screen Reader Support**:
- Semantic HTML/native components
- ARIA labels for custom components
- Meaningful alt text for images
- Proper heading hierarchy
- Form labels associated with inputs

**Keyboard Navigation**:
- All interactive elements keyboard accessible
- Logical tab order
- Skip navigation links
- Keyboard shortcuts documented
- No keyboard traps

**Motion & Animation**:
- Respect prefers-reduced-motion
- No auto-playing videos
- Pausable animations
- No flashing content

## Localization

### Supported Languages
- English (default)
- Swahili

### Localization Strategy
- Use i18n library (react-i18next)
- Store translations in JSON files
- Support RTL languages (future)
- Format dates/numbers per locale
- Currency formatting (KES)

### Translation Keys Structure
```
{
  "common": {
    "login": "Login",
    "logout": "Logout",
    "cancel": "Cancel",
    "confirm": "Confirm"
  },
  "dashboard": {
    "title": "Dashboard",
    "balance": "Available Balance",
    "recentTransactions": "Recent Transactions"
  },
  "errors": {
    "networkError": "No internet connection",
    "invalidCredentials": "Invalid email or password"
  }
}
```

## Deployment & Updates

### Mobile App Updates
- Over-the-air updates for minor changes
- App store updates for major versions
- Force update for critical security fixes
- Update notification in-app
- Changelog display

### Desktop App Updates
- Auto-update on launch
- Background download
- Update notification
- Manual update check option
- Rollback capability

## Monitoring & Analytics

### Metrics to Track
- Daily/Monthly active users
- User retention rate
- Transaction success rate
- Average transaction value
- App crash rate
- API response times
- Feature usage statistics
- User journey completion rates

### Analytics Events
- User registration completed
- Login successful
- Transaction initiated
- Transaction completed
- Transaction failed
- Feature used
- Error occurred
- App opened
- App backgrounded

### Crash Reporting
- Sentry integration
- Automatic crash reports
- User feedback collection
- Stack traces
- Device information
- App version tracking

---

## Design Rationale

This design prioritizes:
1. **User Experience**: Intuitive flows with minimal steps
2. **Security**: Multiple layers of authentication and authorization
3. **Performance**: Optimized for speed and efficiency
4. **Accessibility**: Usable by everyone
5. **Scalability**: Can handle growth in users and features
6. **Maintainability**: Clean architecture and reusable components
