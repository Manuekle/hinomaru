import { Drawer as DrawerPrimitive } from "vaul-svelte";

import Root from "./drawer.svelte";
import Content from "./drawer-content.svelte";
import Description from "./drawer-description.svelte";
import Footer from "./drawer-footer.svelte";
import Header from "./drawer-header.svelte";
import Overlay from "./drawer-overlay.svelte";
import Title from "./drawer-title.svelte";

const Trigger = DrawerPrimitive.Trigger;
const Portal = DrawerPrimitive.Portal;
const Close = DrawerPrimitive.Close;

export {
	Root,
	Content,
	Description,
	Footer,
	Header,
	Overlay,
	Portal,
	Title,
	Trigger,
	Close,
	//
	Root as Drawer,
	Content as DrawerContent,
	Description as DrawerDescription,
	Footer as DrawerFooter,
	Header as DrawerHeader,
	Overlay as DrawerOverlay,
	Portal as DrawerPortal,
	Title as DrawerTitle,
	Trigger as DrawerTrigger,
	Close as DrawerClose,
};
