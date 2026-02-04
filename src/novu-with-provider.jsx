// src/novu-with-provider.jsx
import ReactDOM from "react-dom/client";
import { Inbox, NovuProvider, useNovu } from "@novu/react";
import { useEffect } from "react";
import BellIcon from "./components/BellIcon";

// Store React roots to avoid creating multiple roots for the same container
const rootRegistryWithProvider = new Map();

// Default appearance configuration for the Inbox component
const defaultAppearance = {
	icons: {
		bell: () => <BellIcon />,
	},
	variables: {
		borderRadius: "8px",
		fontSize: "16px",
		colorShadow: "rgba(0, 0, 0, 0.1)",
		colorNeutral: "#1A1523",
		colorCounterForeground: "#ffffff",
		colorCounter: "#FF444F",
		colorSecondaryForeground: "#1A1523",
		colorPrimaryForeground: "#ffffff",
		colorPrimary: "#FF444F",
		colorForeground: "#181C25",
		colorBackground: "#ffffff",
	},
	elements: {
		popoverTrigger: {
			borderRadius: "50%",
			backgroundColor: "rgba(0, 0, 0, 0.04)",
		},
		bellContainer: {
			width: "24px",
			height: "24px",
		},
		bellIcon: {
			width: "24px",
			height: "24px",
		},
		preferences__button: { display: "none" },
		popoverContent: "novu-popover-content",
	},
};

// Default styles configuration for the Inbox component
const defaultStyles = {
	bell: { root: { background: "transparent", color: "black" } },
	popover: { root: { zIndex: 100 } },
};

// Default i18n configuration for the Inbox component
const defaultI18n = {
	poweredBy: "Notifications by",
};

// Default localization configuration for the Inbox component
const defaultLocalization = {
	"inbox.filters.labels.default": "Notifications",
};

/**
 * Internal component that wraps Inbox with event listeners
 * @private
 */
// biome-ignore lint: Internal component not meant to be exported
function InboxWithEventListeners({
	appearance,
	styles,
	colorScheme,
	i18n,
	placement,
	localization,
	onNotificationReceived,
	onUnreadCountChanged,
	onNotificationsUpdated,
	...otherProps
}) {
	const novu = useNovu();

	useEffect(() => {
		// Array to store cleanup functions
		const cleanupFunctions = [];

		// Listen for new notifications received via WebSocket
		if (onNotificationReceived) {
			const unsubscribe = novu.on(
				"notifications.notification_received",
				(event) => {
					/**
					 * SECURITY WARNING: Do not log PII (Personal Identifiable Information)
					 * Sanitize notification data before passing to tracking/logging systems
					 */
					onNotificationReceived(event);
				},
			);
			cleanupFunctions.push(unsubscribe);
		}

		// Listen for unread count changes
		if (onUnreadCountChanged) {
			const unsubscribe = novu.on("notifications.unread", (event) => {
				onUnreadCountChanged(event);
			});
			cleanupFunctions.push(unsubscribe);
		}

		// Listen for notifications list updates
		if (onNotificationsUpdated) {
			const unsubscribe = novu.on(
				"notifications.list.updated",
				(event) => {
					/**
					 * SECURITY WARNING: Do not log PII (Personal Identifiable Information)
					 * Sanitize notification data before passing to tracking/logging systems
					 */
					onNotificationsUpdated(event);
				},
			);
			cleanupFunctions.push(unsubscribe);
		}

		// Cleanup all event listeners on unmount
		return () => {
			cleanupFunctions.forEach((cleanup) => cleanup());
		};
	}, [novu, onNotificationReceived, onUnreadCountChanged, onNotificationsUpdated]);

	return (
		<Inbox
			appearance={appearance}
			styles={styles}
			colorScheme={colorScheme}
			i18n={i18n}
			placement={placement}
			localization={localization}
			{...otherProps}
		/>
	);
}

/**
 * Internal component that wraps Inbox with NovuProvider and event listeners
 * @private
 */
// biome-ignore lint: Internal component not meant to be exported
function InboxWithProvider({
	applicationIdentifier,
	subscriberId,
	subscriber,
	subscriberHash,
	backendUrl,
	socketUrl,
	appearance,
	styles,
	colorScheme,
	i18n,
	placement,
	localization,
	onNotificationReceived,
	onUnreadCountChanged,
	onNotificationsUpdated,
	...otherProps
}) {
	return (
		<NovuProvider
			applicationIdentifier={applicationIdentifier}
			subscriberId={subscriberId}
			subscriber={subscriber}
			subscriberHash={subscriberHash}
			backendUrl={backendUrl}
			socketUrl={socketUrl}
		>
			<InboxWithEventListeners
				appearance={appearance}
				styles={styles}
				colorScheme={colorScheme}
				i18n={i18n}
				placement={placement}
				localization={localization}
				onNotificationReceived={onNotificationReceived}
				onUnreadCountChanged={onUnreadCountChanged}
				onNotificationsUpdated={onNotificationsUpdated}
				{...otherProps}
			/>
		</NovuProvider>
	);
}

/**
 * Renders the Novu Inbox component with NovuProvider wrapper and event listeners support.
 * This version allows you to listen to incoming notifications for tracking and logging purposes.
 *
 * @param {HTMLElement} container - The DOM element to render the Inbox into
 * @param {Object} props - Configuration options
 * @param {string} props.applicationIdentifier - Your Novu application identifier (required)
 * @param {string} [props.subscriberId] - The subscriber/user ID (deprecated, use subscriber instead)
 * @param {string|Object} [props.subscriber] - The subscriber/user ID or subscriber object
 * @param {string} [props.subscriberHash] - HMAC hash for secure mode
 * @param {string} [props.backendUrl] - Custom backend URL
 * @param {string} [props.socketUrl] - Custom WebSocket URL
 * @param {Object} [props.appearance] - Custom appearance configuration
 * @param {Object} [props.styles] - Custom styles configuration
 * @param {string} [props.colorScheme='light'] - Color scheme ('light' or 'dark')
 * @param {Object} [props.i18n] - Internationalization configuration
 * @param {string} [props.placement='bottom-end'] - Popover placement
 * @param {Object} [props.localization] - Localization strings
 * @param {Function} [props.onNotificationReceived] - Callback when a new notification is received via WebSocket
 * @param {Function} [props.onUnreadCountChanged] - Callback when unread count changes
 * @param {Function} [props.onNotificationsUpdated] - Callback when notifications list updates
 *
 * @example
 * // Basic usage with event tracking
 * renderInboxWithProvider(document.getElementById('inbox-container'), {
 *   applicationIdentifier: 'your-app-id',
 *   subscriberId: 'user-123',
 *   onNotificationReceived: (notification) => {
 *     // Track incoming notification (sanitize PII before logging!)
 *     console.log('New notification:', notification);
 *   },
 *   onUnreadCountChanged: (count) => {
 *     console.log('Unread count:', count);
 *   }
 * });
 *
 * @example
 * // With custom appearance and secure mode
 * renderInboxWithProvider(container, {
 *   applicationIdentifier: 'your-app-id',
 *   subscriberId: 'user-123',
 *   subscriberHash: 'hmac-hash',
 *   appearance: {
 *     variables: {
 *       colorPrimary: '#FF0000'
 *     }
 *   },
 *   onNotificationReceived: (notification) => {
 *     // Send to analytics (remember to sanitize!)
 *     analytics.track('notification_received', {
 *       id: notification.id,
 *       // Do NOT include: notification.content, notification.payload
 *     });
 *   }
 * });
 */
export function renderInboxWithProvider(container, props = {}) {
	if (!container) {
		console.error("renderInboxWithProvider: container is required");
		return;
	}

	if (!props.applicationIdentifier) {
		console.error(
			"renderInboxWithProvider: applicationIdentifier is required",
		);
		return;
	}

	if (!props.subscriberId && !props.subscriber) {
		console.error(
			"renderInboxWithProvider: subscriberId or subscriber is required",
		);
		return;
	}

	const {
		appearance: userAppearance = {},
		styles = defaultStyles,
		colorScheme = "light",
		i18n = defaultI18n,
		placement = "bottom-end",
		localization = defaultLocalization,
		onNotificationReceived,
		onUnreadCountChanged,
		onNotificationsUpdated,
		...otherProps
	} = props;

	// Create a new appearance object that merges the user's appearance with the default
	// but always uses our built-in bell icon
	const appearance = {
		...defaultAppearance,
		...userAppearance,
		icons: {
			...defaultAppearance.icons,
			...(userAppearance.icons || {}),
			// Always override the bell icon with our React component
			bell: () => <BellIcon />,
		},
	};

	// Get existing root or create a new one
	let root;
	if (rootRegistryWithProvider.has(container)) {
		root = rootRegistryWithProvider.get(container);
	} else {
		root = ReactDOM.createRoot(container);
		rootRegistryWithProvider.set(container, root);
	}

	// Render the Inbox with NovuProvider and event listeners
	root.render(
		<InboxWithProvider
			appearance={appearance}
			styles={styles}
			colorScheme={colorScheme}
			i18n={i18n}
			placement={placement}
			localization={localization}
			onNotificationReceived={onNotificationReceived}
			onUnreadCountChanged={onUnreadCountChanged}
			onNotificationsUpdated={onNotificationsUpdated}
			{...otherProps}
		/>,
	);
}

/**
 * Clears and unmounts the Inbox component rendered with renderInboxWithProvider
 *
 * @param {HTMLElement} container - The DOM element containing the Inbox
 *
 * @example
 * clearInboxWithProvider(document.getElementById('inbox-container'));
 */
export function clearInboxWithProvider(container) {
	if (container) {
		if (rootRegistryWithProvider.has(container)) {
			const root = rootRegistryWithProvider.get(container);
			root.unmount();
			rootRegistryWithProvider.delete(container);
		}
		container.innerHTML = "";
	}
}
