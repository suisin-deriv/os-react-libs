// src/index.jsx
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { Inbox } from "@novu/react";

// Import the helper functions from our library files
import { renderToaster } from "./main.jsx";
import { renderInbox, clearInbox } from "./novu.jsx";
import {
	renderInboxWithProvider,
	clearInboxWithProvider,
} from "./novu-with-provider.jsx";

// Default toast style (copied from main.jsx)
const defaultToastStyle = {
	background: "#000000",
	color: "#ffffff",
	padding: "0 20px",
	borderRadius: "12px",
	boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
	fontSize: "18px",
	fontWeight: "500",
	minWidth: "300px",
	height: "fit-content",
	minHeight: "48px",
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-start",
	textAlign: "left",
	gap: "16px",
	cursor: "pointer",
};

// Default success icon theme (copied from main.jsx)
const defaultSuccessIconTheme = {
	primary: "#00E676",
	secondary: "#000000",
};

// Expose libraries to the window object
if (typeof window !== "undefined") {
	// Create a wrapper around the original toast function to apply default styles
	const originalToast = toast;

	// Create a new toast function that applies default styles
	const wrappedToast = (message, options = {}) => {
		return originalToast(message, {
			style: defaultToastStyle,
			duration: 3000, // Set default duration to 3000ms
			...options,
		});
	};

	// Copy all methods from the original toast
	Object.keys(originalToast).forEach((key) => {
		if (typeof originalToast[key] === "function") {
			wrappedToast[key] = (message, options = {}) => {
				const mergedOptions = {
					style: defaultToastStyle,
					duration: 3000, // Set default duration to 3000ms
					...options,
				};

				// Apply default success icon theme for success toasts
				if (key === "success" && !options.iconTheme) {
					mergedOptions.iconTheme = defaultSuccessIconTheme;
				}

				return originalToast[key](message, mergedOptions);
			};
		} else {
			wrappedToast[key] = originalToast[key];
		}
	});

	// Add dismiss method to the wrapped toast
	wrappedToast.dismiss = originalToast.dismiss;

	// Expose the libraries to the window object
	window.ReactLibs = {
		// React Hot Toast
		ReactHotToast: {
			toast: wrappedToast,
			Toaster,
			ToastBar,
			renderToaster,
		},

		// Novu React
		NovuReact: {
			Inbox,
			renderInbox,
			clearInbox,
			renderInboxWithProvider,
			clearInboxWithProvider,
		},
	};

	// Also expose individual libraries for backward compatibility
	window.ReactHotToast = wrappedToast;
	window.NovuReact = {
		Inbox,
		renderInbox,
		clearInbox,
		renderInboxWithProvider,
		clearInboxWithProvider,
	};
}

// No ESM exports to allow for proper Fast Refresh
