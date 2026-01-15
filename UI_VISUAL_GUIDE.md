# Chatbot UI - Visual Guide

## 🎨 Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo] AICyberMentor        🌙  [User ▼]  [Logout]             │
│  Dashboard | My Learning | Chatbot | Settings                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  AI Security Chatbot  [📜 5 saved]        [🗑️ Clear History]    │
│  Have a question? Our AI mentor gives you...                     │
├──────────────────────────────────────────────────────────────────┤
│  ℹ️  Chat History: Your conversations are automatically saved... │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Chat Area                                                        │
│                                                                   │
│  ✅ Welcome back! Restored 5 previous conversations.             │
│                                                                   │
│  ┌────────────────────────────────────┐                          │
│  │ AI  Hello! I'm your AI Security... │                          │
│  │     2:30 PM                         │                          │
│  └────────────────────────────────────┘                          │
│                                                                   │
│                      ┌──────────────────────────────────┐  👤   │
│                      │ What is two-factor authentication?│       │
│                      │                              2:31 PM│      │
│                      └──────────────────────────────────┘       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ AI  Two-factor authentication (2FA) adds an extra...│        │
│  │     2:31 PM                                          │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  💬 Type your message here...                          [Send ➤]  │
└──────────────────────────────────────────────────────────────────┘

Quick Actions:
[What is 2FA?] [Password Best Practices] [Phishing Prevention]
```

## 🎯 Key UI Elements

### 1. Header Section
- **Title**: "AI Security Chatbot" (3xl, bold)
- **Badge**: Shows conversation count (e.g., "📜 5 saved")
  - Hidden when count = 0
  - Indigo background in light mode
  - Purple background in dark mode
- **Clear Button**: Red color, disabled when no history
  - Desktop: "Clear History"
  - Mobile: Icon only (🗑️)

### 2. Info Alert (Blue Banner)
```
┌────────────────────────────────────────────────────────┐
│ ℹ️  Chat History: Your conversations are automatically │
│    saved and will be restored when you return. Use the │
│    "Clear History" button to delete all saved messages.│
└────────────────────────────────────────────────────────┘
```
- Blue background (indigo-50/indigo-900)
- Info circle icon
- Explanation text
- Always visible

### 3. Loading State
```
┌──────────────────────────────────────────┐
│                                          │
│         🔄 Loading your chat history...  │
│                                          │
└──────────────────────────────────────────┘
```
- Centered in chat area
- Spinning icon animation
- Indigo color scheme

### 4. Welcome Back Notification
```
┌────────────────────────────────────────────────────────┐
│ ✅ Welcome back! Restored 5 previous conversations.    │
└────────────────────────────────────────────────────────┘
```
- Green background (green-50/green-900)
- Check circle icon
- Shows at top of chat when history loads
- Dynamic count (1 conversation / 5 conversations)

### 5. Message Bubbles

#### User Message (Right-aligned)
```
                      ┌──────────────────────────┐  👤
                      │ Your question here...    │
                      │                   2:30 PM│
                      └──────────────────────────┘
```
- Indigo/Purple background
- White text
- Rounded corners (tr corner not rounded)
- Timestamp below (right-aligned)
- User icon

#### AI Response (Left-aligned)
```
┌──────────────────────────────────────┐
│ AI  AI response with detailed info...│
│     • Bullet points supported        │
│     • **Bold text** rendered         │
│     • `code snippets` formatted      │
│     2:31 PM                           │
└──────────────────────────────────────┘
```
- White/Slate background
- Gray/White text
- Rounded corners (tl corner not rounded)
- AI badge icon
- Timestamp below (left-aligned)
- Supports markdown formatting

#### Error Message (Left-aligned)
```
┌──────────────────────────────────────┐
│ ⚠️  Sorry, something went wrong...   │
│     2:32 PM                           │
└──────────────────────────────────────┘
```
- Red background
- Warning icon
- Timestamp below

### 6. Typing Indicator
```
┌────────────────┐
│ AI  • • •      │
└────────────────┘
```
- Three animated dots
- Indigo/Purple color
- Shows while waiting for response

### 7. Success Notification (Clear History)
```
┌────────────────────────────────────────────────────────┐
│ ✅ Success! Your chat history has been cleared.        │
└────────────────────────────────────────────────────────┘
```
- Green background
- Check circle icon
- Auto-dismisses after 3 seconds

### 8. Input Area
```
┌──────────────────────────────────────────────────┐
│ 💬 Type your message here...       [Send ➤]     │
└──────────────────────────────────────────────────┘
```
- Sticky at bottom
- White/Slate background
- Send button (indigo/purple)
- Disabled while processing

## 🌈 Color Scheme

### Light Mode
- **Background**: White (bg-white)
- **Text**: Gray-900 (text-gray-900)
- **Primary**: Indigo-600 (bg-indigo-600)
- **Success**: Green-50 (bg-green-50)
- **Error**: Red-50 (bg-red-50)
- **Info**: Indigo-50 (bg-indigo-50)

### Dark Mode
- **Background**: Slate-900 (dark:bg-slate-900)
- **Text**: White (dark:text-white)
- **Primary**: Purple-600 (dark:bg-purple-600)
- **Success**: Green-900/20 (dark:bg-green-900/20)
- **Error**: Red-900/20 (dark:bg-red-900/20)
- **Info**: Indigo-900/20 (dark:bg-indigo-900/20)

## 📱 Responsive Design

### Desktop (≥768px)
- Full navigation labels
- "Clear History" text visible
- Wider message bubbles (max-w-2xl)
- Side-by-side layout

### Mobile (<768px)
- Icon-only navigation
- Clear button shows icon only
- Narrower message bubbles
- Stacked layout

## 🎭 Animations

1. **Theme Toggle**: Smooth fade transition
2. **Typing Dots**: Bounce animation
3. **Loading Spinner**: Rotate animation
4. **Button Hover**: Scale & color transition
5. **Message Appear**: Slide-in effect
6. **Badge Count**: Fade in/out

## ⌨️ Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line (not implemented yet)
- **Escape**: Clear input (not implemented yet)

## 🔔 User Feedback

### Visual Feedback:
- ✅ Success (green) - History loaded, history cleared
- ℹ️ Info (blue) - Feature explanation
- ⚠️ Warning (yellow) - Not implemented yet
- ❌ Error (red) - API failures, network errors
- 🔄 Loading (indigo) - Data fetching

### Interactive States:
- **Hover**: Button color darkens
- **Focus**: Input border highlights
- **Active**: Button press effect
- **Disabled**: Reduced opacity (50%)
- **Loading**: Spinner animation

---

**All features are fully responsive and theme-aware!** 🎨
