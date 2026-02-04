# Novu Inbox with Event Listeners - Usage Guide

This guide explains how to use the new `renderInboxWithProvider()` function to listen to incoming notifications for tracking and logging purposes.

## Overview

The library now provides two ways to render the Novu Inbox:

1. **`renderInbox()`** - Original implementation (backward compatible, no event listeners)
2. **`renderInboxWithProvider()`** - New implementation with NovuProvider and event listeners support

## Basic Usage

```javascript
// Get the container element
const container = document.getElementById('inbox-container');

// Render inbox with event listeners
window.NovuReact.renderInboxWithProvider(container, {
  // Required Novu configuration
  applicationIdentifier: 'your-app-id',
  subscriberId: 'user-123',
  
  // Optional: HMAC hash for secure mode
  subscriberHash: 'your-hmac-hash',
  
  // Event callbacks for tracking
  onNotificationReceived: (notification) => {
    console.log('New notification received!', notification);
    
    // Example: Track with analytics
    // IMPORTANT: Sanitize PII before logging!
    analytics.track('notification_received', {
      notificationId: notification.id,
      timestamp: new Date().toISOString()
    });
  },
  
  onUnreadCountChanged: (event) => {
    console.log('Unread count changed:', event);
  },
  
  onNotificationsUpdated: (event) => {
    console.log('Notifications list updated:', event);
  }
});
```

## Available Event Callbacks

### 1. `onNotificationReceived(notification)`

Fires when a **new notification arrives** via WebSocket in real-time.

```javascript
onNotificationReceived: (notification) => {
  // notification object contains:
  // - id: string
  // - content: string
  // - subject: string
  // - read: boolean
  // - seen: boolean
  // - createdAt: string
  // ... and more
  
  console.log('New notification:', notification.id);
}
```

### 2. `onUnreadCountChanged(event)`

Fires when the **unread count changes**.

```javascript
onUnreadCountChanged: (event) => {
  // event object contains the updated unread count
  console.log('Unread count:', event);
}
```

### 3. `onNotificationsUpdated(event)`

Fires when the **notifications list updates** (after read, archive, delete, etc.).

```javascript
onNotificationsUpdated: (event) => {
  console.log('Notifications updated:', event);
}
```

## Advanced Example with Analytics Tracking

```javascript
// Initialize with tracking
window.NovuReact.renderInboxWithProvider(
  document.getElementById('inbox-container'),
  {
    applicationIdentifier: 'your-app-id',
    subscriberId: 'user-123',
    
    // Custom appearance (same as renderInbox)
    appearance: {
      variables: {
        colorPrimary: '#FF444F'
      }
    },
    
    // Track incoming notifications
    onNotificationReceived: (notification) => {
      // Send to your analytics service
      // SECURITY: Never log sensitive data or PII
      yourAnalyticsService.track('notification_received', {
        notification_id: notification.id,
        notification_type: notification.type,
        // DO NOT include: notification.content, notification.payload
        timestamp: new Date().toISOString()
      });
      
      // Log to monitoring service
      console.log('[Novu] Notification received:', {
        id: notification.id,
        read: notification.read,
        seen: notification.seen
      });
    },
    
    // Track unread count changes
    onUnreadCountChanged: (event) => {
      // Update UI badge or counter
      updateBadgeCount(event.count);
      
      // Track in analytics
      yourAnalyticsService.track('unread_count_changed', {
        count: event.count
      });
    }
  }
);
```

## Security Best Practices

⚠️ **IMPORTANT SECURITY WARNINGS:**

### 1. Never Log Sensitive Data

```javascript
// ❌ BAD - Logging PII and sensitive content
onNotificationReceived: (notification) => {
  console.log(notification); // May contain user data!
  analytics.track('notification', notification); // Never do this!
}

// ✅ GOOD - Only log safe identifiers
onNotificationReceived: (notification) => {
  console.log('Notification ID:', notification.id);
  analytics.track('notification_received', {
    id: notification.id,
    timestamp: new Date().toISOString()
  });
}
```

### 2. Sanitize Before Logging

```javascript
// ✅ GOOD - Sanitize data before sending to analytics
onNotificationReceived: (notification) => {
  const sanitizedData = {
    id: notification.id,
    type: notification.type,
    read: notification.read,
    seen: notification.seen,
    // Do NOT include: content, subject, payload, actor data
  };
  
  analytics.track('notification_received', sanitizedData);
}
```

### 3. Use HTTPS for Tracking Endpoints

Ensure all tracking/logging endpoints use secure transport (HTTPS).

### 4. Comply with Privacy Regulations

Follow GDPR, CCPA, and other applicable privacy regulations when tracking user data.

## Cleanup

When you're done with the inbox, clean it up:

```javascript
const container = document.getElementById('inbox-container');

// Cleanup and unmount
window.NovuReact.clearInboxWithProvider(container);
```

## Backward Compatibility

The original `renderInbox()` function remains unchanged and is fully backward compatible:

```javascript
// Original function (no event listeners)
window.NovuReact.renderInbox(container, {
  applicationIdentifier: 'your-app-id',
  subscriberId: 'user-123'
});
```

## API Reference

### `renderInboxWithProvider(container, props)`

Renders the Novu Inbox with NovuProvider and event listeners support.

**Parameters:**

- `container` (HTMLElement) - The DOM element to render the Inbox into
- `props` (Object) - Configuration options:
  - `applicationIdentifier` (string, required) - Your Novu application ID
  - `subscriberId` (string) - User/subscriber ID
  - `subscriber` (string|Object) - User/subscriber ID or object
  - `subscriberHash` (string) - HMAC hash for secure mode
  - `appearance` (Object) - Custom appearance configuration
  - `styles` (Object) - Custom styles configuration
  - `colorScheme` (string) - 'light' or 'dark'
  - `placement` (string) - Popover placement
  - `onNotificationReceived` (Function) - Callback for new notifications
  - `onUnreadCountChanged` (Function) - Callback for unread count changes
  - `onNotificationsUpdated` (Function) - Callback for list updates

### `clearInboxWithProvider(container)`

Unmounts and cleans up the inbox.

**Parameters:**

- `container` (HTMLElement) - The DOM element containing the Inbox

## Troubleshooting

### Events not firing?

1. Ensure you're using `renderInboxWithProvider()` not `renderInbox()`
2. Check that WebSocket connection is established (check browser console)
3. Verify your `applicationIdentifier` and `subscriberId` are correct

### Multiple inboxes on the same page?

Each container gets its own React root and event listeners. Just render multiple times with different containers.

```javascript
// Inbox 1
window.NovuReact.renderInboxWithProvider(
  document.getElementById('inbox-1'),
  { /* config */ }
);

// Inbox 2
window.NovuReact.renderInboxWithProvider(
  document.getElementById('inbox-2'),
  { /* config */ }
);
```

## Support

For questions or issues, refer to:
- [Novu Documentation](https://docs.novu.co)
- [Novu React SDK](https://github.com/novuhq/novu/tree/main/packages/react)
