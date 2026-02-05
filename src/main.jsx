// src/main.jsx
import ReactDOM from "react-dom/client";
import toast, { Toaster, ToastBar } from "react-hot-toast";

// Default dark toast style to match the design
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
	cursor: "pointer", // Add cursor pointer to indicate it's clickable
};

// Default success icon theme
const defaultSuccessIconTheme = {
	primary: "#00E676",
	secondary: "#000000",
};

// This function will be called to render the Toaster component
export function renderToaster(container, props = {}) {
	if (container) {
		// Merge default styles with user-provided styles
		const mergedProps = {
			position: "top-center",
			reverseOrder: false,
			gutter: 8,
			toastOptions: {
				duration: 3000,
				style: defaultToastStyle,
				success: {
					iconTheme: defaultSuccessIconTheme,
				},
			},
			...props,
		};

		const root = ReactDOM.createRoot(container);
		root.render(
			<Toaster {...mergedProps}>
				{(t) => (
					<div onClick={() => toast.dismiss(t.id)}>
						<ToastBar toast={t} />
					</div>
				)}
			</Toaster>,
		);
	}
}

// Expose toast to the window object with default styling
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

	// Expose the wrapped toast function to the window object
	window.ReactHotToast = wrappedToast;
}
