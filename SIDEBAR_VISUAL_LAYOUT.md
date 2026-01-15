# 🎨 Chatbot Sidebar - Visual Layout Guide

## Desktop Layout (≥768px)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [🛡️ Logo] AICyberMentor        Dashboard | Learning | Chatbot      🌙 [User ▼] │
└──────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────┬────────────────────────────────────────────────────────────┐
│                   │                                                            │
│  📜 Chat History  │  AI Security Chatbot  [🟢 Active]        [🧹 Clear Chat] │
│  5 conversations  │  Have a question? Our AI mentor gives you clear answers   │
│  ─────────────────┼────────────────────────────────────────────────────────────┤
│                   │                                                            │
│  [+ New Chat]     │  ┌──────────────────────────────────────────────────────┐ │
│  ─────────────────│  │ Chat Messages Area                                   │ │
│                   │  │                                                      │ │
│  Today            │  │  [AI] 👋 Hello! I'm your AI Security Mentor...     │ │
│  ┌──────────────┐ │  │                                                      │ │
│  │📩 2:30 PM 🗑️│ │  │              [You] What is two-factor auth... 👤   │ │
│  │What is 2FA...│ │  │                                                      │ │
│  │Two-factor... │ │  │  [AI] Two-factor authentication adds...            │ │
│  └──────────────┘ │  │                                                      │ │
│                   │  │              [You] How to spot phishing... 👤      │ │
│  ┌──────────────┐ │  │                                                      │ │
│  │📩 3:45 PM 🗑️│ │  │  [AI] Phishing emails often contain...             │ │
│  │How to spot...│ │  │                                                      │ │
│  │Phishing...   │ │  └──────────────────────────────────────────────────────┘ │
│  └──────────────┘ │  │                                                            │
│                   │  │  ┌──────────────────────────────────────────────────┐ │
│  Yesterday        │  │  │ 💬 Type your message here...       [Send ➤]     │ │
│  ┌──────────────┐ │  │  └──────────────────────────────────────────────────┘ │
│  │📩 10:15 AM🗑️│ │  │  🛡️ Powered by Google Gemini AI • Private           │
│  │Strong pass...│ │  └────────────────────────────────────────────────────────┘
│  │A strong...   │ │                                                            │
│  └──────────────┘ │  Quick Actions:                                            │
│                   │  [🔑 What is 2FA?] [📧 Spot Phishing] [🔒 Passwords]      │
│  ─────────────────│                                                            │
│  [🗑️ Clear All]  │                                                            │
│                   │                                                            │
└───────────────────┴────────────────────────────────────────────────────────────┘
    320px width            Flexible width (remaining space)
```

## Mobile Layout (<768px)

### Sidebar Closed (Default)
```
┌────────────────────────────────────────┐
│  🛡️ AICyberMentor     ☰    🌙  [User]│
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  AI Security Chatbot  [🟢 Active]     │
│  [🧹]                                  │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Chat Messages Area               │ │
│  │                                  │ │
│  │  [AI] 👋 Hello! I'm your AI...  │ │
│  │                                  │ │
│  │         [You] What is 2FA... 👤│ │
│  │                                  │ │
│  │  [AI] Two-factor auth adds...   │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 💬 Type message...    [Send ➤]  │ │
│  └──────────────────────────────────┘ │
│  🛡️ Powered by Gemini AI             │
└────────────────────────────────────────┘

     [📜]  ← Floating button (bottom-left)
```

### Sidebar Open
```
┌─────────────────────┐
│ 📜 Chat History  ✕ │ ← Overlay
│ 5 conversations     │   darkens
│ ────────────────────│   background
│                     │
│ [+ New Chat]        │
│ ────────────────────│
│                     │
│ Today               │
│ ┌─────────────────┐ │
│ │📩 2:30 PM    🗑️│ │
│ │What is 2FA...   │ │
│ │Two-factor...    │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │📩 3:45 PM    🗑️│ │
│ │How to spot...   │ │
│ │Phishing...      │ │
│ └─────────────────┘ │
│                     │
│ Yesterday           │
│ ┌─────────────────┐ │
│ │📩 10:15 AM   🗑️│ │
│ │Strong pass...   │ │
│ │A strong...      │ │
│ └─────────────────┘ │
│                     │
│ ────────────────────│
│ [🗑️ Clear All]     │
└─────────────────────┘
```

## Component Breakdown

### 1. Sidebar Header
```
┌─────────────────────────────────────┐
│ 📜 Chat History            ✕ (mob) │
│ 5 conversations                     │
└─────────────────────────────────────┘
• Gradient background (indigo-purple)
• Icon + Title
• Conversation count
• Close button (mobile only)
```

### 2. New Chat Button
```
┌─────────────────────────────────────┐
│        [+ New Chat]                 │
└─────────────────────────────────────┘
• Full width
• Indigo/Purple background
• White text
• Icon + Label
• Hover: Darker shade
```

### 3. History Item (Default)
```
┌───────────────────────────────────┐
│ 📩 2:30 PM                        │
│ What is two-factor auth...        │
│ Two-factor authentication adds... │
└───────────────────────────────────┘
• White/Slate background
• Rounded corners
• Padding: 12px
• Border: Transparent
• Truncated text with ellipsis
```

### 4. History Item (Hover)
```
┌───────────────────────────────────┐
│ 📩 2:30 PM                     🗑️│
│ What is two-factor auth...        │
│ Two-factor authentication adds... │
└───────────────────────────────────┘
• Light gray/Slate-700 background
• Border: Indigo-200/Purple-600
• Slides 4px to right
• Delete button fades in
• Cursor: pointer
```

### 5. Date Headers
```
Today
─────────────────────────────────────
• Sticky positioning
• Small, semi-bold text
• Gray color
• Top padding
• Background matches sidebar
```

### 6. Clear All Button
```
┌─────────────────────────────────────┐
│     [🗑️ Clear All History]         │
└─────────────────────────────────────┘
• Full width
• Red tint background
• Red text
• Icon + Label
• Hover: Darker red
• Disabled when empty
```

### 7. Empty State
```
┌─────────────────────────────────────┐
│              💬                     │
│         (large icon)                │
│                                     │
│      No chat history yet            │
│   Start a conversation to see       │
│          it here                    │
└─────────────────────────────────────┘
• Centered content
• Large icon (4xl)
• Gray text
• Two-line message
• Friendly tone
```

### 8. Main Chat Header
```
AI Security Chatbot  [🟢 Active]        [🧹 Clear Chat]
Have a question? Our AI mentor gives you clear answers
──────────────────────────────────────────────────────
• Title + Active badge
• Description text
• Clear chat button (right)
• Responsive text sizing
```

### 9. Active Badge
```
[🟢 Active]
• Green background
• Green text
• Small rounded pill
• Dot icon + text
• Hidden by default
• Shows when viewing specific chat
```

### 10. Floating Button (Mobile)
```
    [📜]
• Fixed position
• Bottom-left corner
• 56x56px circular
• Indigo/Purple background
• White icon
• Elevated shadow
• Z-index: 50
• Pulse animation (optional)
```

## Color Palette

### Light Mode
```
Background:     #FFFFFF (White)
Sidebar BG:     #FFFFFF (White)
Text Primary:   #111827 (Gray-900)
Text Secondary: #6B7280 (Gray-500)
Border:         #E5E7EB (Gray-200)
Hover BG:       #F9FAFB (Gray-50)
Accent:         #4F46E5 (Indigo-600)
Success:        #10B981 (Green-500)
Danger:         #EF4444 (Red-500)
```

### Dark Mode
```
Background:     #0F172A (Slate-900)
Sidebar BG:     #1E293B (Slate-800)
Text Primary:   #F1F5F9 (White)
Text Secondary: #94A3B8 (Slate-400)
Border:         #334155 (Slate-700)
Hover BG:       #334155 (Slate-700)
Accent:         #9333EA (Purple-600)
Success:        #10B981 (Green-500)
Danger:         #EF4444 (Red-500)
```

## Spacing & Sizing

### Sidebar
```
Width:          320px (desktop)
Height:         calc(100vh - 180px)
Padding:        12px
Gap:            8px (between items)
```

### History Items
```
Padding:        12px
Border Radius:  8px
Gap:            8px (icon to text)
Min Height:     80px
```

### Buttons
```
Height:         40px
Padding:        12px 16px
Border Radius:  8px
Font Size:      14px
Font Weight:    500
```

### Icons
```
History Item:   14px
Sidebar Header: 16px
Floating Button:20px
Badge Icon:     10px
```

## Transitions & Animations

### Sidebar Slide (Mobile)
```css
transform: translateX(-100%);    /* Hidden */
transform: translateX(0);         /* Visible */
transition: transform 0.3s ease-in-out;
```

### History Item Hover
```css
transform: translateX(0);         /* Default */
transform: translateX(4px);       /* Hover */
transition: all 0.2s ease;
```

### Delete Button Fade
```css
opacity: 0;                       /* Default */
opacity: 1;                       /* Hover */
transition: opacity 0.2s ease;
```

### Button Hover
```css
transition: all 0.3s ease;
• Background color
• Shadow elevation
• Scale (optional)
```

## Responsive Breakpoints

```
Mobile:      < 768px
Tablet:      768px - 1024px
Desktop:     > 1024px
```

### Adjustments by Breakpoint

#### Mobile (<768px)
- Sidebar: Fixed, hidden by default
- Toggle: Floating button visible
- Header: Simplified navigation
- Chat: Full width

#### Tablet (768-1024px)
- Sidebar: Visible, 280px width
- Toggle: Hidden
- Header: Full navigation
- Chat: Flexible width

#### Desktop (>1024px)
- Sidebar: Visible, 320px width
- Toggle: Hidden
- Header: Full navigation
- Chat: Optimal width with max constraints

## Accessibility Features

### Keyboard Navigation
```
Tab:           Navigate between items
Enter/Space:   Select/activate
Escape:        Close sidebar (mobile)
Arrow Keys:    Scroll history list
```

### Screen Reader Support
```html
<button aria-label="Open chat history">
<div role="list" aria-label="Conversation history">
<div role="listitem">
<button aria-label="Delete conversation">
```

### Focus States
```css
:focus-visible {
    outline: 2px solid #4F46E5;
    outline-offset: 2px;
}
```

## Performance Optimizations

1. **Virtual Scrolling**: For 100+ conversations
2. **Lazy Loading**: Load images/previews on demand
3. **Debounced Search**: Prevent excessive queries
4. **Cached Data**: Store in localStorage for faster load
5. **Optimistic Updates**: Instant UI feedback

---

**This sidebar provides a professional, intuitive way to access your chat history! 🎉**
