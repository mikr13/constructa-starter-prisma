Dialog
A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.

import * as React from "react";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import "./styles.css";

const DialogDemo = () => (
	<Dialog.Root>
		<Dialog.Trigger asChild>
			<button className="Button violet">Edit profile</button>
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay className="DialogOverlay" />
			<Dialog.Content className="DialogContent">
				<Dialog.Title className="DialogTitle">Edit profile</Dialog.Title>
				<Dialog.Description className="DialogDescription">
					Make changes to your profile here. Click save when you're done.
				</Dialog.Description>
				<fieldset className="Fieldset">
					<label className="Label" htmlFor="name">
						Name
					</label>
					<input className="Input" id="name" defaultValue="Pedro Duarte" />
				</fieldset>
				<fieldset className="Fieldset">
					<label className="Label" htmlFor="username">
						Username
					</label>
					<input className="Input" id="username" defaultValue="@peduarte" />
				</fieldset>
				<div
					style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}
				>
					<Dialog.Close asChild>
						<button className="Button green">Save changes</button>
					</Dialog.Close>
				</div>
				<Dialog.Close asChild>
					<button className="IconButton" aria-label="Close">
						<Cross2Icon />
					</button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
);

export default DialogDemo;
Features
Supports modal and non-modal modes.

Focus is automatically trapped within modal.

Can be controlled or uncontrolled.

Manages screen reader announcements with Title and Description components.

Esc closes the component automatically.

Component Reference Links
Version: 1.1.15

Size: 17.93 kB

View source
Report an issue
ARIA design pattern
Installation
Install the component from your command line.

npm install @radix-ui/react-dialog
Anatomy
Import all parts and piece them together.

import { Dialog } from "radix-ui";

export default () => (
	<Dialog.Root>
		<Dialog.Trigger />
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content>
				<Dialog.Title />
				<Dialog.Description />
				<Dialog.Close />
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
);
API Reference
Root
Contains all the parts of a dialog.

Prop	Type	Default
defaultOpen
boolean
No default value
open
boolean
No default value
onOpenChange
function
No default value
modal
boolean
true
Trigger
The button that opens the dialog.

Prop	Type	Default
asChild
boolean
false
Data attribute	Values
[data-state]	"open" | "closed"
Portal
When used, portals your overlay and content parts into the body.

Prop	Type	Default
forceMount
boolean
No default value
container
HTMLElement
document.body
Overlay
A layer that covers the inert portion of the view when the dialog is open.

Prop	Type	Default
asChild
boolean
false
forceMount
boolean
No default value
Data attribute	Values
[data-state]	"open" | "closed"
Content
Contains content to be rendered in the open dialog.

Prop	Type	Default
asChild
boolean
false
forceMount
boolean
No default value
onOpenAutoFocus
function
No default value
onCloseAutoFocus
function
No default value
onEscapeKeyDown
function
No default value
onPointerDownOutside
function
No default value
onInteractOutside
function
No default value
Data attribute	Values
[data-state]	"open" | "closed"
Close
The button that closes the dialog.

Prop	Type	Default
asChild
boolean
false
Title
An accessible title to be announced when the dialog is opened.

If you want to hide the title, wrap it inside our Visually Hidden utility like this <VisuallyHidden asChild>.

Prop	Type	Default
asChild
boolean
false
Description
An optional accessible description to be announced when the dialog is opened.

If you want to hide the description, wrap it inside our Visually Hidden utility like this <VisuallyHidden asChild>. If you want to remove the description entirely, remove this part and pass aria-describedby={undefined} to Dialog.Content.

Prop	Type	Default
asChild
boolean
false
Examples
Close after asynchronous form submission
Use the controlled props to programmatically close the Dialog after an async operation has completed.

import * as React from "react";
import { Dialog } from "radix-ui";

const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

export default () => {
	const [open, setOpen] = React.useState(false);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger>Open</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content>
					<form
						onSubmit={(event) => {
							wait().then(() => setOpen(false));
							event.preventDefault();
						}}
					>
						{/** some inputs */}
						<button type="submit">Submit</button>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};
Scrollable overlay
Move the content inside the overlay to render a dialog with overflow.

// index.jsx
import { Dialog } from "radix-ui";
import "./styles.css";

export default () => {
	return (
		<Dialog.Root>
			<Dialog.Trigger />
			<Dialog.Portal>
				<Dialog.Overlay className="DialogOverlay">
					<Dialog.Content className="DialogContent">...</Dialog.Content>
				</Dialog.Overlay>
			</Dialog.Portal>
		</Dialog.Root>
	);
};
/* styles.css */
.DialogOverlay {
	background: rgba(0 0 0 / 0.5);
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: grid;
	place-items: center;
	overflow-y: auto;
}

.DialogContent {
	min-width: 300px;
	background: white;
	padding: 30px;
	border-radius: 4px;
}
Custom portal container
Customise the element that your dialog portals into.

import * as React from "react";
import { Dialog } from "radix-ui";

export default () => {
	const [container, setContainer] = React.useState(null);
	return (
		<div>
			<Dialog.Root>
				<Dialog.Trigger />
				<Dialog.Portal container={container}>
					<Dialog.Overlay />
					<Dialog.Content>...</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			<div ref={setContainer} />
		</div>
	);
};
Accessibility
Adheres to the Dialog WAI-ARIA design pattern.

Keyboard Interactions
Key	Description
Opens/closes the dialog.
Opens/closes the dialog.
Moves focus to the next focusable element.
Moves focus to the previous focusable element.
Closes the dialog and moves focus to Dialog.Trigger.
Custom APIs
Create your own API by abstracting the primitive parts into your own component.

Abstract the overlay and the close button
This example abstracts the Dialog.Overlay and Dialog.Close parts.

Usage
import { Dialog, DialogTrigger, DialogContent } from "./your-dialog";

export default () => (
	<Dialog>
		<DialogTrigger>Dialog trigger</DialogTrigger>
		<DialogContent>Dialog Content</DialogContent>
	</Dialog>
);
Implementation
// your-dialog.jsx
import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Cross1Icon } from "@radix-ui/react-icons";

export const DialogContent = React.forwardRef(
	({ children, ...props }, forwardedRef) => (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay />
			<DialogPrimitive.Content {...props} ref={forwardedRef}>
				{children}
				<DialogPrimitive.Close aria-label="Close">
					<Cross1Icon />
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	),
);

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;