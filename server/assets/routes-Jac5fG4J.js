import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { AlertTriangle, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ClipboardList, Download, FileSpreadsheet, FolderPlus, GripVertical, Home, Images, Loader2, Minus, Pencil, Plus, RefreshCw, Settings, Trash2, Wallet, X } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
//#region src/lib/spark/catalog.ts
var raw = [
	[
		"ig-01",
		"Refinish Hardwood Floor",
		2.35,
		"sqft"
	],
	[
		"ig-02",
		"New Hardwoods 1.5\"",
		10,
		"sqft"
	],
	[
		"ig-03",
		"New Hardwoods 2\"",
		4.75,
		"sqft"
	],
	[
		"ig-04",
		"Hardwood Splicing",
		8.4,
		"sqft"
	],
	[
		"ig-05",
		"Vinyl Plank",
		2.5,
		"sqft"
	],
	[
		"ig-06",
		"Carpet",
		1.9,
		"sqft"
	],
	[
		"ig-07",
		"Interior Paint — 2 Tone",
		2.95,
		"sqft"
	],
	[
		"ig-08",
		"Drywall Repair",
		900,
		"1,000 sqft"
	],
	[
		"ig-09",
		"Wallpaper Removal",
		250,
		"room"
	],
	[
		"ig-10",
		"Interior Door — Hollow Slab",
		125,
		"ea."
	],
	[
		"ig-11",
		"Interior Door Hardware (Knob + Hinges + Labor)",
		25,
		"ea."
	],
	[
		"ig-12",
		"Bifold Door with Framing",
		400,
		"ea."
	],
	[
		"ig-13",
		"Interior Door — Pre-hung",
		200,
		"ea."
	],
	[
		"ig-14",
		"Front Entry Door",
		475,
		"ea."
	],
	[
		"ig-15",
		"Front Entry Door Hardware",
		80,
		"ea."
	],
	[
		"ig-16",
		"Exterior Door Hardware",
		75,
		"handle"
	],
	[
		"ig-17",
		"Exterior Insulated Side Door (Installed)",
		500,
		"ea."
	],
	[
		"ig-18",
		"Sliding Glass Door",
		1025,
		"ea."
	],
	[
		"ig-19",
		"Trim Out (Casing, Crown, Baseboard)",
		3.75,
		"LF"
	],
	[
		"ig-20",
		"MISC / Punch List",
		2650,
		"flat"
	],
	[
		"ig-21",
		"Finish Out Labor",
		1350,
		"flat"
	],
	[
		"ig-22",
		"Light Fixtures",
		70,
		"100 sqft"
	],
	[
		"ig-23",
		"Bedbug Spray / Heat Treat",
		475,
		"ea."
	],
	[
		"ig-24",
		"Termite Treatment",
		650,
		"ea."
	],
	[
		"ig-25",
		"Demo",
		1375,
		"variable"
	],
	[
		"ig-26",
		"Haul Off",
		725,
		"load"
	],
	[
		"ig-27",
		"Final Cleaning",
		325,
		"flat"
	],
	[
		"ig-28",
		"Staging",
		.9,
		"sqft"
	],
	[
		"kt-01",
		"Hinges and Pulls",
		275,
		"kitchen"
	],
	[
		"kt-02",
		"Cabinets Uppers",
		125,
		"LF"
	],
	[
		"kt-03",
		"Cabinets Lowers",
		150,
		"LF"
	],
	[
		"kt-04",
		"Cabinet Door Faces Only",
		80,
		"door"
	],
	[
		"kt-05",
		"Cabinets (Labor & Paint)",
		1100,
		"kitchen"
	],
	[
		"kt-06",
		"Granite + 4\" Splash Guard",
		40,
		"LF"
	],
	[
		"kt-07",
		"Backsplash",
		725,
		"house"
	],
	[
		"kt-08",
		"Misc Woodwork",
		500,
		"variable"
	],
	[
		"kt-09",
		"Tile — Large Areas",
		6.45,
		"sqft"
	],
	[
		"kt-10",
		"Tile — Small Areas",
		10,
		"sqft"
	],
	[
		"kt-11",
		"Undermount Kitchen Sink",
		325,
		"ea."
	],
	[
		"kt-12",
		"Microwave / Hood",
		500,
		"ea."
	],
	[
		"kt-13",
		"Range",
		725,
		"ea."
	],
	[
		"kt-14",
		"Wall Oven",
		1075,
		"ea."
	],
	[
		"kt-15",
		"Cooktop",
		550,
		"ea."
	],
	[
		"kt-16",
		"Dishwasher",
		575,
		"ea."
	],
	[
		"kt-17",
		"Fridge",
		1175,
		"ea."
	],
	[
		"ba-01",
		"Granite ($/LF)",
		35,
		"LF"
	],
	[
		"ba-02",
		"New Bottom Vanity",
		125,
		"LF"
	],
	[
		"ba-03",
		"Home Depot Vanity w/ Sink (18\")",
		225,
		"ea."
	],
	[
		"ba-04",
		"Toilet",
		150,
		"ea."
	],
	[
		"ba-05",
		"Tile — Large Areas",
		5.8,
		"sqft"
	],
	[
		"ba-06",
		"Tile — Small Areas",
		10,
		"sqft"
	],
	[
		"ba-07",
		"Reglaze Tub or Chemical Clean",
		350,
		"ea."
	],
	[
		"ba-08",
		"Reglaze Tub + Surround",
		750,
		"ea."
	],
	[
		"ba-09",
		"Reglaze Shower",
		1325,
		"ea."
	],
	[
		"ba-10",
		"Tiled Shower Tear Out + Tile Install",
		3100,
		"ea."
	],
	[
		"ba-11",
		"Tub Tile Surround Tear Out + Tile Install (incl. tub)",
		2250,
		"ea."
	],
	[
		"ba-12",
		"Shower Plastic Insert Tear Out + New Insert",
		825,
		"ea."
	],
	[
		"ba-13",
		"Tub Tear Out + New Insert & Tub",
		1575,
		"ea."
	],
	[
		"ba-14",
		"Undermount Sink",
		150,
		"ea."
	],
	[
		"ba-15",
		"Mirror",
		200,
		"ea."
	],
	[
		"ba-16",
		"HVL (needed if no window)",
		275,
		"ea."
	],
	[
		"as-01",
		"Furnace",
		3350,
		"ea."
	],
	[
		"as-02",
		"Condensing Unit",
		3300,
		"ea."
	],
	[
		"as-03",
		"Package Unit",
		4700,
		"ea."
	],
	[
		"as-04",
		"A-Coil (if no condensing unit)",
		1625,
		"ea."
	],
	[
		"as-05",
		"Ducting (if NO HVAC)",
		3200,
		"ea."
	],
	[
		"as-06",
		"Duct Cleaning — Floor Vents",
		550,
		"ea."
	],
	[
		"as-07",
		"Window Unit Replacement 220",
		575,
		"ea."
	],
	[
		"as-08",
		"Hot Water Heater w/ Expansion Tank",
		1425,
		"ea."
	],
	[
		"as-09",
		"Hot Water Heater Expansion Tank Only",
		200,
		"ea."
	],
	[
		"as-10",
		"Switches / Outlets",
		1400,
		"house"
	],
	[
		"as-11",
		"Standard Electrical",
		1650,
		"house"
	],
	[
		"as-12",
		"Subfloor",
		8.2,
		"sqft"
	],
	[
		"as-13",
		"Framing",
		950,
		"variable"
	],
	[
		"as-14",
		"Structural (Pier)",
		375,
		"pier"
	],
	[
		"as-15",
		"Structural Foam Injection",
		5.85,
		"sqft of affected area"
	],
	[
		"as-16",
		"Roof",
		1100,
		"225 sqft L&M"
	],
	[
		"as-17",
		"Plumbing",
		1e3,
		"variable"
	],
	[
		"as-18",
		"Electrical Panel Swap to 200A",
		2350,
		"ea."
	],
	[
		"as-19",
		"Full Electrical Rewire (to Studs)",
		5.65,
		"sqft"
	],
	[
		"as-20",
		"Full Electrical Rewire (leaving Drywall)",
		9.15,
		"sqft"
	],
	[
		"as-21",
		"Wall Insulation (to Studs)",
		1.2,
		"sqft"
	],
	[
		"as-22",
		"Attic Insulation",
		1225,
		"1,600 sqft house"
	],
	[
		"as-23",
		"New Drywall to Studs (L&M)",
		5.2,
		"sqft"
	],
	[
		"as-24",
		"Aluminum Wiring",
		2450,
		"variable"
	],
	[
		"ex-01",
		"Fence Repair — Chain Link / Wood Gate",
		225,
		"variable"
	],
	[
		"ex-02",
		"Fence Repair — Chain Link",
		275,
		"LF"
	],
	[
		"ex-03",
		"Fence Repair — Privacy 6ft",
		30,
		"LF"
	],
	[
		"ex-04",
		"Landscaping",
		450,
		"variable"
	],
	[
		"ex-05",
		"Vinyl Siding (10'x10')",
		300,
		"square"
	],
	[
		"ex-06",
		"Tuck Pointing",
		225,
		"variable"
	],
	[
		"ex-07",
		"Exterior Paint",
		2.6,
		"sqft"
	],
	[
		"ex-08",
		"Exterior Wood Repair",
		525,
		"variable"
	],
	[
		"ex-09",
		"Siding Repair (10'x10')",
		975,
		"section"
	],
	[
		"ex-10",
		"Tree Trimming",
		450,
		"variable"
	],
	[
		"ex-11",
		"Tree Removal (w/o stump)",
		1450,
		"tree"
	],
	[
		"ex-12",
		"Stump Grinding",
		250,
		"stump"
	],
	[
		"ex-13",
		"Aluminum Window Paint (Int/Ext)",
		700,
		"house"
	],
	[
		"ex-14",
		"Windows (3x5 sash)",
		425,
		"ea."
	],
	[
		"ex-15",
		"Window Repair — Non-Insulated (6x6+)",
		35,
		"sf"
	],
	[
		"ex-16",
		"Window Repair — Insulated (6x6+)",
		40,
		"sf"
	],
	[
		"ex-17",
		"Aluminum Framed Window Pane",
		100,
		"pane"
	],
	[
		"ex-18",
		"Guttering",
		4.15,
		"LF"
	],
	[
		"ex-19",
		"Concrete w/ Demo",
		200,
		"sqft"
	],
	[
		"ex-20",
		"Mowing (summer, every 2 weeks)",
		45,
		"mowing"
	],
	[
		"ex-21",
		"Garage Door — 1 Car",
		975,
		"ea."
	],
	[
		"ex-22",
		"Garage Door — 2 Car (Installed)",
		1225,
		"ea."
	],
	[
		"ex-23",
		"Garage Conversion",
		8850,
		"ea."
	]
];
var SERIAL_IDS = new Set([
	"as-01",
	"as-02",
	"as-03",
	"as-04",
	"as-07",
	"as-08",
	"as-09",
	"kt-12",
	"kt-13",
	"kt-14",
	"kt-15",
	"kt-16",
	"kt-17"
]);
var CATALOG = Object.fromEntries(raw.map(([id, name, cost, unit]) => [id, {
	id,
	name,
	cost,
	unit,
	serial: SERIAL_IDS.has(id)
}]));
var ROOM_TEMPLATES = {
	interior: {
		label: "Interior/General",
		groups: [
			{
				id: "flooring",
				name: "Flooring",
				itemIds: [
					"ig-01",
					"ig-02",
					"ig-03",
					"ig-04",
					"ig-05",
					"ig-06"
				]
			},
			{
				id: "paint",
				name: "Paint & Wall Repair",
				itemIds: [
					"ig-07",
					"ig-08",
					"ig-09"
				]
			},
			{
				id: "doors",
				name: "Doors",
				itemIds: [
					"ig-10",
					"ig-11",
					"ig-12",
					"ig-13",
					"ig-14",
					"ig-15",
					"ig-16",
					"ig-17",
					"ig-18"
				]
			},
			{
				id: "trim",
				name: "Trim & Finishing",
				itemIds: [
					"ig-19",
					"ig-20",
					"ig-21"
				]
			},
			{
				id: "lighting",
				name: "Lighting",
				itemIds: ["ig-22"]
			},
			{
				id: "pest",
				name: "Pest Control",
				itemIds: ["ig-23", "ig-24"]
			},
			{
				id: "cleanup",
				name: "Cleanup & Staging",
				itemIds: [
					"ig-25",
					"ig-26",
					"ig-27",
					"ig-28"
				]
			}
		]
	},
	systems: {
		label: "Systems & Structure",
		groups: [
			{
				id: "hvac",
				name: "HVAC",
				itemIds: [
					"as-01",
					"as-02",
					"as-03",
					"as-04",
					"as-05",
					"as-06",
					"as-07"
				]
			},
			{
				id: "plumbing",
				name: "Plumbing",
				itemIds: ["as-17"]
			},
			{
				id: "electrical",
				name: "Electrical",
				itemIds: [
					"as-10",
					"as-11",
					"as-18",
					"as-19",
					"as-20",
					"as-24"
				]
			},
			{
				id: "wh",
				name: "Water Heater",
				itemIds: ["as-08", "as-09"]
			},
			{
				id: "foundation",
				name: "Foundation & Structure",
				itemIds: [
					"as-12",
					"as-13",
					"as-14",
					"as-15",
					"as-21",
					"as-22",
					"as-23"
				]
			}
		]
	},
	exterior: {
		label: "Exterior",
		groups: [
			{
				id: "roof",
				name: "Roof",
				itemIds: ["as-16"]
			},
			{
				id: "extpaint",
				name: "Exterior Paint & Siding",
				itemIds: [
					"ex-05",
					"ex-06",
					"ex-07",
					"ex-08",
					"ex-09",
					"ex-13"
				]
			},
			{
				id: "windows",
				name: "Windows",
				itemIds: [
					"ex-14",
					"ex-15",
					"ex-16",
					"ex-17"
				]
			},
			{
				id: "garage",
				name: "Garage",
				itemIds: [
					"ex-21",
					"ex-22",
					"ex-23"
				]
			},
			{
				id: "grounds",
				name: "Grounds & Landscaping",
				itemIds: [
					"ex-01",
					"ex-02",
					"ex-03",
					"ex-04",
					"ex-10",
					"ex-11",
					"ex-12",
					"ex-18",
					"ex-19",
					"ex-20"
				]
			}
		]
	},
	kitchen: {
		label: "Kitchen",
		groups: [{
			id: "kitchen",
			name: "Kitchen",
			itemIds: [
				"kt-01",
				"kt-02",
				"kt-03",
				"kt-04",
				"kt-05",
				"kt-06",
				"kt-07",
				"kt-08",
				"kt-09",
				"kt-10",
				"kt-11",
				"kt-12",
				"kt-13",
				"kt-14",
				"kt-15",
				"kt-16",
				"kt-17"
			]
		}]
	},
	bathroom: {
		label: "Bathroom",
		groups: [{
			id: "bathroom",
			name: "Bathroom",
			itemIds: [
				"ba-01",
				"ba-02",
				"ba-03",
				"ba-04",
				"ba-05",
				"ba-06",
				"ba-07",
				"ba-08",
				"ba-09",
				"ba-10",
				"ba-11",
				"ba-12",
				"ba-13",
				"ba-14",
				"ba-15",
				"ba-16"
			]
		}]
	},
	bedroom: {
		label: "Bedroom",
		groups: [
			{
				id: "flooring",
				name: "Flooring",
				itemIds: [
					"ig-01",
					"ig-05",
					"ig-06"
				]
			},
			{
				id: "paint",
				name: "Paint & Wall Repair",
				itemIds: ["ig-07", "ig-08"]
			},
			{
				id: "doors",
				name: "Doors",
				itemIds: [
					"ig-10",
					"ig-11",
					"ig-13"
				]
			},
			{
				id: "trim",
				name: "Trim & Finishing",
				itemIds: ["ig-19"]
			},
			{
				id: "lighting",
				name: "Lighting",
				itemIds: ["ig-22"]
			}
		]
	},
	living: {
		label: "Living/Common",
		groups: [
			{
				id: "flooring",
				name: "Flooring",
				itemIds: [
					"ig-01",
					"ig-05",
					"ig-06"
				]
			},
			{
				id: "paint",
				name: "Paint & Wall Repair",
				itemIds: ["ig-07", "ig-08"]
			},
			{
				id: "doors",
				name: "Doors",
				itemIds: [
					"ig-10",
					"ig-11",
					"ig-13",
					"ig-18"
				]
			},
			{
				id: "trim",
				name: "Trim & Finishing",
				itemIds: ["ig-19"]
			},
			{
				id: "lighting",
				name: "Lighting",
				itemIds: ["ig-22"]
			}
		]
	}
};
var DEFAULT_ROOM_TYPES = [
	"interior",
	"systems",
	"exterior",
	"kitchen",
	"bathroom"
];
//#endregion
//#region src/lib/spark/store.ts
var uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)) + "";
function emptyGroupState() {
	return {
		noAction: false,
		items: {},
		customItems: [],
		customItemState: {},
		deletedItems: []
	};
}
function emptyRoomState(type) {
	const out = {};
	for (const g of ROOM_TEMPLATES[type].groups) out[g.id] = emptyGroupState();
	return out;
}
function makeRoom(type, idx) {
	const tpl = ROOM_TEMPLATES[type];
	const label = type === "interior" || type === "systems" || type === "exterior" || type === "kitchen" ? tpl.label : `${tpl.label} ${idx}`;
	return {
		id: uid(),
		type,
		label
	};
}
function makeProject(name) {
	const rooms = [];
	const state = {};
	const counts = {};
	for (const t of DEFAULT_ROOM_TYPES) {
		counts[t] = (counts[t] ?? 0) + 1;
		const r = makeRoom(t, counts[t]);
		rooms.push(r);
		state[r.id] = emptyRoomState(t);
	}
	return {
		id: uid(),
		name,
		address: "",
		createdAt: Date.now(),
		updatedAt: Date.now(),
		rooms,
		state,
		itemOverrides: {},
		photos: [],
		deal: {
			arv: 0,
			purchasePrice: 0,
			targetMargin: 20,
			holdingPct: 8,
			rule: "margin"
		}
	};
}
function ensureGroup(p, roomId, groupId) {
	if (!p.state[roomId]) p.state[roomId] = {};
	if (!p.state[roomId][groupId]) p.state[roomId][groupId] = emptyGroupState();
	return p.state[roomId][groupId];
}
var useApp = create()(persist((set, get) => ({
	projects: {},
	currentId: null,
	globalPrices: {},
	createProject: (name) => {
		const p = makeProject(name || "New Walkthrough");
		set((s) => ({
			projects: {
				...s.projects,
				[p.id]: p
			},
			currentId: p.id
		}));
		return p.id;
	},
	deleteProject: (id) => set((s) => {
		const { [id]: _, ...rest } = s.projects;
		const ids = Object.keys(rest);
		return {
			projects: rest,
			currentId: s.currentId === id ? ids[0] ?? null : s.currentId
		};
	}),
	selectProject: (id) => set({ currentId: id }),
	renameProject: (id, name) => set((s) => {
		const p = s.projects[id];
		if (!p) return s;
		return { projects: {
			...s.projects,
			[id]: {
				...p,
				name,
				updatedAt: Date.now()
			}
		} };
	}),
	setAddress: (addr) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		return { projects: {
			...s.projects,
			[id]: {
				...s.projects[id],
				address: addr,
				updatedAt: Date.now()
			}
		} };
	}),
	addRoom: (type) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		const r = makeRoom(type, p.rooms.filter((r) => r.type === type).length + 1);
		p.rooms = [...p.rooms, r];
		p.state = {
			...p.state,
			[r.id]: emptyRoomState(type)
		};
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	removeRoom: (roomId) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		p.rooms = p.rooms.filter((r) => r.id !== roomId);
		const { [roomId]: _, ...rest } = p.state;
		p.state = rest;
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	renameRoom: (roomId, label) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		p.rooms = p.rooms.map((r) => r.id === roomId ? {
			...r,
			label
		} : r);
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	toggleItem: (roomId, groupId, itemId) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = structuredClone(s.projects[id]);
		const g = ensureGroup(p, roomId, groupId);
		const map = itemId.startsWith("custom-") ? g.customItemState : g.items;
		const cur = map[itemId] ?? {
			checked: false,
			qty: 1
		};
		const next = !cur.checked;
		map[itemId] = {
			...cur,
			checked: next,
			qty: next ? Math.max(1, cur.qty || 1) : cur.qty
		};
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	setQty: (roomId, groupId, itemId, qty) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = structuredClone(s.projects[id]);
		const g = ensureGroup(p, roomId, groupId);
		const map = itemId.startsWith("custom-") ? g.customItemState : g.items;
		const cur = map[itemId] ?? {
			checked: false,
			qty: 1
		};
		const newQty = Math.max(0, qty);
		map[itemId] = {
			...cur,
			qty: newQty,
			checked: newQty > 0 ? true : cur.checked
		};
		if (newQty === 0) map[itemId].checked = false;
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	setSerial: (roomId, groupId, itemId, serial) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = structuredClone(s.projects[id]);
		const g = ensureGroup(p, roomId, groupId);
		const map = itemId.startsWith("custom-") ? g.customItemState : g.items;
		map[itemId] = {
			...map[itemId] ?? {
				checked: false,
				qty: 1
			},
			serial
		};
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	setNoAction: (roomId, groupId, value) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = structuredClone(s.projects[id]);
		const g = ensureGroup(p, roomId, groupId);
		g.noAction = value;
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	addCustomItem: (roomId, groupId, item) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = structuredClone(s.projects[id]);
		const g = ensureGroup(p, roomId, groupId);
		const cid = "custom-" + uid();
		g.customItems.push({
			id: cid,
			...item
		});
		g.customItemState[cid] = {
			checked: true,
			qty: 1
		};
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	removeCustomItem: (roomId, groupId, itemId) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = structuredClone(s.projects[id]);
		const g = ensureGroup(p, roomId, groupId);
		g.customItems = g.customItems.filter((c) => c.id !== itemId);
		delete g.customItemState[itemId];
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	deleteCatalogItem: (roomId, groupId, itemId) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = structuredClone(s.projects[id]);
		const g = ensureGroup(p, roomId, groupId);
		if (!g.deletedItems.includes(itemId)) g.deletedItems.push(itemId);
		delete g.items[itemId];
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	restoreCatalogItem: (roomId, groupId, itemId) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = structuredClone(s.projects[id]);
		const g = ensureGroup(p, roomId, groupId);
		g.deletedItems = g.deletedItems.filter((d) => d !== itemId);
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	setItemOverride: (itemId, price) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		const o = { ...p.itemOverrides };
		if (price === null || price === void 0) delete o[itemId];
		else o[itemId] = price;
		p.itemOverrides = o;
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	setGlobalPrice: (itemId, price) => set((s) => {
		const g = { ...s.globalPrices };
		if (price === null || price === void 0) delete g[itemId];
		else g[itemId] = price;
		return { globalPrices: g };
	}),
	addPhoto: (photo) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		p.photos = [...p.photos, {
			id: uid(),
			createdAt: Date.now(),
			...photo
		}];
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	removePhoto: (pid) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		p.photos = p.photos.filter((x) => x.id !== pid);
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	reorderPhotos: (ids) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		const map = new Map(p.photos.map((ph) => [ph.id, ph]));
		const next = ids.map((i) => map.get(i)).filter(Boolean);
		for (const ph of p.photos) if (!ids.includes(ph.id)) next.push(ph);
		p.photos = next;
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	updatePhotoCaption: (pid, caption) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		p.photos = p.photos.map((x) => x.id === pid ? {
			...x,
			caption
		} : x);
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	}),
	setDeal: (patch) => set((s) => {
		const id = s.currentId;
		if (!id || !s.projects[id]) return s;
		const p = { ...s.projects[id] };
		p.deal = {
			...p.deal,
			...patch
		};
		p.updatedAt = Date.now();
		return { projects: {
			...s.projects,
			[id]: p
		} };
	})
}), {
	name: "spark-estimator-v1",
	storage: createJSONStorage(() => localStorage),
	version: 1
}));
function resolvePrice(itemId, project, globals) {
	if (project?.itemOverrides[itemId] !== void 0) return project.itemOverrides[itemId];
	if (globals[itemId] !== void 0) return globals[itemId];
	return CATALOG[itemId]?.cost ?? 0;
}
//#endregion
//#region src/lib/spark/calc.ts
function rollupProject(project, globals) {
	if (!project) return {
		rollups: [],
		total: 0,
		reviewed: 0,
		totalGroups: 0,
		lineItemCount: 0
	};
	const rollups = [];
	let total = 0;
	let reviewed = 0;
	let lineItemCount = 0;
	for (const room of project.rooms) {
		const tpl = ROOM_TEMPLATES[room.type];
		for (const g of tpl.groups) {
			const gs = project.state[room.id]?.[g.id] ?? {
				noAction: false,
				items: {},
				customItems: [],
				customItemState: {},
				deletedItems: []
			};
			const lines = [];
			let subtotal = 0;
			let checkedCount = 0;
			for (const itemId of g.itemIds) {
				if (gs.deletedItems?.includes(itemId)) continue;
				const st = gs.items[itemId];
				const item = CATALOG[itemId];
				if (!item) continue;
				if (st?.checked && st.qty > 0) {
					const cost = resolvePrice(itemId, project, globals);
					const lineTotal = cost * st.qty;
					subtotal += lineTotal;
					checkedCount++;
					lineItemCount++;
					lines.push({
						id: itemId,
						name: item.name,
						qty: st.qty,
						unit: item.unit,
						cost,
						total: lineTotal,
						serial: st.serial
					});
				}
			}
			for (const ci of gs.customItems) {
				const st = gs.customItemState[ci.id];
				if (st?.checked && st.qty > 0) {
					const lineTotal = ci.cost * st.qty;
					subtotal += lineTotal;
					checkedCount++;
					lineItemCount++;
					lines.push({
						id: ci.id,
						name: ci.name + " (custom)",
						qty: st.qty,
						unit: ci.unit,
						cost: ci.cost,
						total: lineTotal
					});
				}
			}
			const totalItemCount = g.itemIds.filter((i) => !gs.deletedItems?.includes(i)).length + gs.customItems.length;
			const r = {
				roomId: room.id,
				roomLabel: room.label,
				groupId: g.id,
				groupName: g.name,
				subtotal,
				checkedCount,
				totalItemCount,
				noAction: gs.noAction,
				reviewed: gs.noAction || checkedCount > 0,
				lines
			};
			if (r.reviewed) reviewed++;
			total += subtotal;
			rollups.push(r);
		}
	}
	return {
		rollups,
		total,
		reviewed,
		totalGroups: rollups.length,
		lineItemCount
	};
}
function computeDeal(repairs, deal) {
	const { arv, purchasePrice, targetMargin, holdingPct, rule } = deal;
	const holdingCost = arv * holdingPct / 100;
	let mao = 0;
	if (arv > 0) if (rule === "margin") mao = arv * (1 - targetMargin / 100) - repairs - holdingCost;
	else mao = .7 * arv - repairs;
	let profit = null;
	let marginOnArv = null;
	if (purchasePrice > 0 && arv > 0) {
		profit = arv - purchasePrice - repairs - holdingCost;
		marginOnArv = profit / arv * 100;
	}
	let verdict = "none";
	let verdictLabel = "Set ARV";
	if (arv > 0) {
		marginOnArv ?? mao - 0;
		if (purchasePrice > 0) if (marginOnArv >= targetMargin) {
			verdict = "strong";
			verdictLabel = "Strong";
		} else if (marginOnArv >= targetMargin - 7) {
			verdict = "thin";
			verdictLabel = "Thin";
		} else {
			verdict = "pass";
			verdictLabel = "Pass";
		}
		else if (mao > 0) {
			verdict = "strong";
			verdictLabel = "Offer ≤ " + fmtMoney(Math.max(0, mao));
		} else {
			verdict = "pass";
			verdictLabel = "Pass";
		}
	}
	return {
		mao,
		profit,
		marginOnArv,
		holdingCost,
		verdict,
		verdictLabel
	};
}
function fmtMoney(n) {
	if (!isFinite(n)) return "$0";
	return (n < 0 ? "-" : "") + "$" + Math.round(Math.abs(n)).toLocaleString();
}
function fmtMoney2(n) {
	return "$" + n.toLocaleString(void 0, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
//#endregion
//#region src/lib/spark/export.ts
async function exportProjectZip(project, globals) {
	const { rollups, total } = rollupProject(project, globals);
	const wb = XLSX.utils.book_new();
	const summaryRows = [
		["Spark Estimator — Repair Breakdown"],
		["Project", project.name],
		["Address", project.address || "—"],
		["Generated", (/* @__PURE__ */ new Date()).toLocaleString()],
		[],
		[
			"Room",
			"Group",
			"Item",
			"Qty",
			"Unit",
			"Unit Cost",
			"Line Total",
			"Serial #"
		]
	];
	let lastRoom = "";
	for (const r of rollups) {
		if (r.lines.length === 0) continue;
		if (r.roomLabel !== lastRoom) {
			summaryRows.push([r.roomLabel.toUpperCase()]);
			lastRoom = r.roomLabel;
		}
		for (const ln of r.lines) summaryRows.push([
			r.roomLabel,
			r.groupName,
			ln.name,
			ln.qty,
			ln.unit,
			ln.cost,
			ln.total,
			ln.serial ?? ""
		]);
		summaryRows.push([
			"",
			"",
			`${r.groupName} subtotal`,
			"",
			"",
			"",
			r.subtotal,
			""
		]);
	}
	summaryRows.push([]);
	summaryRows.push([
		"",
		"",
		"GRAND TOTAL",
		"",
		"",
		"",
		total,
		""
	]);
	const ws = XLSX.utils.aoa_to_sheet(summaryRows);
	ws["!cols"] = [
		{ wch: 18 },
		{ wch: 22 },
		{ wch: 40 },
		{ wch: 8 },
		{ wch: 10 },
		{ wch: 12 },
		{ wch: 14 },
		{ wch: 18 }
	];
	XLSX.utils.book_append_sheet(wb, ws, "Estimate");
	const d = project.deal;
	const dealRows = [
		["Deal Analyzer"],
		["ARV", d.arv],
		["Purchase Price", d.purchasePrice],
		["Target Margin %", d.targetMargin],
		["Holding %", d.holdingPct],
		["Rule", d.rule === "margin" ? "Target Margin" : "70% Rule"],
		["Repairs", total]
	];
	XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dealRows), "Deal");
	const xlsxBuf = XLSX.write(wb, {
		type: "array",
		bookType: "xlsx"
	});
	const zip = new JSZip();
	const safeName = (project.name || "spark-estimate").replace(/[^a-z0-9_-]+/gi, "_");
	zip.file(`${safeName}.xlsx`, xlsxBuf);
	if (project.photos.length) {
		const folder = zip.folder("photos");
		for (let i = 0; i < project.photos.length; i++) {
			const b64 = project.photos[i].dataUrl.split(",")[1] ?? "";
			folder.file(`photo-${i + 1}.jpg`, b64, { base64: true });
		}
	}
	let txt = `Spark Estimator\n${project.name}\n${project.address || ""}\n\nGRAND TOTAL: ${fmtMoney2(total)}\n\n`;
	for (const r of rollups) {
		if (!r.lines.length) continue;
		txt += `\n[${r.roomLabel}] ${r.groupName} — ${fmtMoney2(r.subtotal)}\n`;
		for (const ln of r.lines) txt += `  • ${ln.name} × ${ln.qty} ${ln.unit} @ ${fmtMoney2(ln.cost)} = ${fmtMoney2(ln.total)}${ln.serial ? ` [SN: ${ln.serial}]` : ""}\n`;
	}
	zip.file("summary.txt", txt);
	const blob = await zip.generateAsync({ type: "blob" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${safeName}.zip`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
async function compressImage(file, maxDim = 1280, quality = .78) {
	const bmp = await createImageBitmap(file);
	const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
	const w = Math.round(bmp.width * scale);
	const h = Math.round(bmp.height * scale);
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
	return canvas.toDataURL("image/jpeg", quality);
}
//#endregion
//#region src/lib/spark/ocr.ts
var workerPromise = null;
async function getWorker() {
	if (!workerPromise) workerPromise = (async () => {
		const { createWorker } = await import("tesseract.js");
		const worker = await createWorker("eng");
		await worker.setParameters({ tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/ :.#" });
		return worker;
	})();
	return workerPromise;
}
var SERIAL_LABEL_RE = /(?:\b|^)(?:S[ \t]*[\/\\|][ \t]*[NM]|5[ \t]*[\/\\|][ \t]*N|S[ \t]*N|SER(?:IAL)?)[. \t]*(?:NUMBER|NUM|NBR|NO|N|#)?[. \t]*[:#=\-]?[ \t]*([A-Z0-9](?:[A-Z0-9\-\/]|[ \t](?![ \t])){3,22}[A-Z0-9])/gi;
var MODEL_LABEL_RE = /(?:\b|^)(?:MOD(?:EL)?|M[ \t]*\/?[ \t]*N|TYPE|CAT(?:ALOG)?)[. \t]*(?:NUMBER|NUM|NO|N|#)?[. \t]*[:#=\-]?[ \t]*([A-Z0-9](?:[A-Z0-9\-\/]|[ \t](?![ \t])){3,22}[A-Z0-9])/gi;
var TOKEN_RE = /[A-Z0-9](?:[A-Z0-9\-\/]| (?=[A-Z0-9])){4,28}[A-Z0-9]/g;
var STOPWORDS = new Set([
	"MODEL",
	"SERIAL",
	"NUMBER",
	"TYPE",
	"VOLTS",
	"VOLTAGE",
	"WATTS",
	"AMPS",
	"HERTZ",
	"PHASE",
	"MADE",
	"ASSEMBLED",
	"MANUFACTURED",
	"WARNING",
	"CAUTION",
	"DANGER",
	"LISTED",
	"TESTED",
	"RATED",
	"MAX",
	"MIN",
	"INPUT",
	"OUTPUT",
	"REFRIGERANT",
	"CHARGE",
	"COMPRESSOR",
	"MOTOR",
	"FAN",
	"HEATER",
	"COOLING",
	"HEATING",
	"CAPACITY",
	"BTU",
	"BTUH",
	"SEER",
	"EER",
	"HSPF",
	"AFUE",
	"GALLONS",
	"GALLON",
	"TANK",
	"ENERGY",
	"FACTOR",
	"DATE",
	"YEAR",
	"MONTH",
	"USA",
	"CHINA",
	"MEXICO",
	"KOREA",
	"JAPAN",
	"CANADA"
]);
var TRAILING_LABEL_RE = /(MODEL|SERIAL|NUMBER|TYPE|MFG|MFD|DATE|VOLTS?|HERTZ|HZ|AMPS?|PHASE|WATTS?)+$/;
function normalize(raw) {
	let v = raw.replace(/\s+/g, "").replace(/^[-\/.]+|[-\/.]+$/g, "");
	for (let i = 0; i < 2; i++) {
		const next = v.replace(TRAILING_LABEL_RE, "").replace(/[-\/.]+$/g, "");
		if (next === v) break;
		v = next;
	}
	return v;
}
function scoreToken(t) {
	if (STOPWORDS.has(t)) return -100;
	const hasDigit = /\d/.test(t);
	const hasAlpha = /[A-Z]/.test(t);
	let s = t.length;
	if (hasDigit && hasAlpha) s += 10;
	else if (hasDigit) s += 3;
	if (!hasDigit) s -= 6;
	if (!hasAlpha && t.length <= 6) s -= 4;
	if (t.length >= 8 && t.length <= 18) s += 5;
	if (t.length < 6) s -= 4;
	if ((t.match(/[-\/]/g) || []).length > 3) s -= 3;
	if (/(.)\1{4,}/.test(t)) s -= 6;
	if (/^[A-Z]{2,4}\d{4,}/.test(t)) s += 4;
	if (/^\d{4,8}$/.test(t) && t.length <= 8) s -= 3;
	return s;
}
function collectLabeled(text, re, base, reason, found) {
	re.lastIndex = 0;
	let m;
	while ((m = re.exec(text)) !== null) {
		const v = normalize(m[1]);
		if (v.length < 5) continue;
		if (STOPWORDS.has(v)) continue;
		const score = base + scoreToken(v);
		const prev = found.get(v);
		if (!prev || prev.score < score) found.set(v, {
			value: v,
			score,
			reason
		});
	}
}
function parseSerialCandidates(rawText) {
	const text = rawText.toUpperCase().replace(/[“”"`’']/g, "").replace(/[|]/g, "/");
	const found = /* @__PURE__ */ new Map();
	collectLabeled(text, SERIAL_LABEL_RE, 100, "labeled-serial", found);
	collectLabeled(text, MODEL_LABEL_RE, 40, "labeled-model", found);
	const tokens = text.match(TOKEN_RE) || [];
	for (const raw of tokens) {
		const v = normalize(raw);
		if (v.length < 6) continue;
		if (STOPWORDS.has(v)) continue;
		if (found.has(v)) continue;
		if (!/\d/.test(v) || !/[A-Z]/.test(v)) continue;
		const score = scoreToken(v);
		if (score < 10) continue;
		found.set(v, {
			value: v,
			score,
			reason: "token"
		});
	}
	return Array.from(found.values()).sort((a, b) => b.score - a.score).slice(0, 6);
}
async function ocrSerial(file) {
	const worker = await getWorker();
	const url = URL.createObjectURL(file);
	try {
		const { data } = await worker.recognize(url);
		const text = data?.text ?? "";
		return {
			candidates: parseSerialCandidates(text),
			text
		};
	} finally {
		URL.revokeObjectURL(url);
	}
}
//#endregion
//#region src/assets/spark-logo.png
var spark_logo_default = "/assets/spark-logo-CKfuXjIo.png";
//#endregion
//#region src/components/spark/SparkApp.tsx
function SparkApp() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen flex items-center justify-center bg-background",
		children: /* @__PURE__ */ jsx("div", {
			className: "text-muted-foreground text-sm",
			children: "Loading Spark Estimator…"
		})
	});
	return /* @__PURE__ */ jsx(AppInner, {});
}
function AppInner() {
	const projects = useApp((s) => s.projects);
	const currentId = useApp((s) => s.currentId);
	const createProject = useApp((s) => s.createProject);
	const [tab, setTab] = useState("estimate");
	useEffect(() => {
		if (!currentId || !projects[currentId]) if (Object.keys(projects).length === 0) createProject("123 Main St");
		else useApp.getState().selectProject(Object.keys(projects)[0]);
	}, [
		currentId,
		projects,
		createProject
	]);
	const project = currentId ? projects[currentId] : null;
	if (!project) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-[100dvh] bg-background pb-24 text-foreground",
		children: [
			/* @__PURE__ */ jsx(TopBar, {
				project,
				onOpenTab: setTab
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "px-4 pt-4",
				children: [
					tab === "estimate" && /* @__PURE__ */ jsx(EstimateTab, {
						project,
						onGoDeal: () => setTab("deal")
					}),
					tab === "deal" && /* @__PURE__ */ jsx(DealTab, { project }),
					tab === "export" && /* @__PURE__ */ jsx(ExportTab, { project }),
					tab === "photos" && /* @__PURE__ */ jsx(PhotosTab, { project }),
					tab === "review" && /* @__PURE__ */ jsx(ReviewTab, { project })
				]
			}),
			/* @__PURE__ */ jsx(BottomNav, {
				tab,
				setTab
			})
		]
	});
}
function TopBar({ project, onOpenTab }) {
	const [open, setOpen] = useState(false);
	return /* @__PURE__ */ jsxs("header", {
		className: "sticky top-0 z-30 bg-background/85 backdrop-blur border-b",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3 px-4 py-3",
			children: [
				/* @__PURE__ */ jsx("img", {
					src: spark_logo_default,
					alt: "Spark",
					className: "h-9 w-9 rounded-xl shadow-card"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-[10px] tracking-[0.22em] font-semibold text-muted-foreground",
						children: "SPARK ESTIMATOR"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-sm font-semibold text-navy truncate",
						children: project.name
					})]
				}),
				/* @__PURE__ */ jsx("button", {
					"aria-label": "Projects & settings",
					onClick: () => setOpen(true),
					className: "h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary text-navy",
					children: /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ jsx("button", {
					"aria-label": "Export",
					onClick: () => onOpenTab("export"),
					className: "h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary text-navy",
					children: /* @__PURE__ */ jsx(Download, { className: "h-5 w-5" })
				})
			]
		}), open && /* @__PURE__ */ jsx(ProjectsSheet, { onClose: () => setOpen(false) })]
	});
}
function ProjectsSheet({ onClose }) {
	const projects = useApp((s) => s.projects);
	const currentId = useApp((s) => s.currentId);
	const { createProject, selectProject, deleteProject, renameProject } = useApp.getState();
	const [newName, setNewName] = useState("");
	const [renaming, setRenaming] = useState(null);
	const [renameVal, setRenameVal] = useState("");
	const list = Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 bg-black/40 flex items-end",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full bg-background rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-lg font-semibold text-navy",
						children: "Walkthroughs"
					}), /* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "text-muted-foreground p-1",
						children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex gap-2 mb-4",
					children: [/* @__PURE__ */ jsx("input", {
						value: newName,
						onChange: (e) => setNewName(e.target.value),
						placeholder: "e.g. 412 Oak Ave",
						className: "flex-1 px-3 py-2 rounded-lg border bg-card text-sm"
					}), /* @__PURE__ */ jsxs("button", {
						onClick: () => {
							createProject(newName || "Untitled");
							setNewName("");
						},
						className: "px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1",
						children: [/* @__PURE__ */ jsx(FolderPlus, { className: "h-4 w-4" }), " New"]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "space-y-2",
					children: list.map((p) => /* @__PURE__ */ jsx("div", {
						className: `rounded-xl border p-3 ${p.id === currentId ? "border-primary bg-primary/5" : "bg-card"}`,
						children: renaming === p.id ? /* @__PURE__ */ jsxs("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ jsx("input", {
								value: renameVal,
								onChange: (e) => setRenameVal(e.target.value),
								className: "flex-1 px-2 py-1 rounded border text-sm"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => {
									renameProject(p.id, renameVal || p.name);
									setRenaming(null);
								},
								className: "px-2 py-1 rounded bg-primary text-primary-foreground text-xs",
								children: "Save"
							})]
						}) : /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsxs("button", {
									onClick: () => {
										selectProject(p.id);
										onClose();
									},
									className: "flex-1 text-left",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-medium text-sm text-navy truncate",
										children: p.name
									}), /* @__PURE__ */ jsxs("div", {
										className: "text-[11px] text-muted-foreground",
										children: [
											p.address || "No address",
											" · ",
											new Date(p.updatedAt).toLocaleDateString()
										]
									})]
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: () => {
										setRenaming(p.id);
										setRenameVal(p.name);
									},
									className: "p-2 text-muted-foreground",
									"aria-label": "Rename",
									children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
								}),
								list.length > 1 && /* @__PURE__ */ jsx("button", {
									onClick: () => {
										if (confirm(`Delete "${p.name}"? This cannot be undone.`)) deleteProject(p.id);
									},
									className: "p-2 text-danger",
									"aria-label": "Delete",
									children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
								})
							]
						})
					}, p.id))
				})
			]
		})
	});
}
function BottomNav({ tab, setTab }) {
	return /* @__PURE__ */ jsx("nav", {
		className: "fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]",
		children: /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-5",
			children: [
				{
					id: "estimate",
					label: "Estimate",
					icon: /* @__PURE__ */ jsx(Home, { className: "h-5 w-5" })
				},
				{
					id: "deal",
					label: "Deal",
					icon: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" })
				},
				{
					id: "export",
					label: "Export",
					icon: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-5 w-5" })
				},
				{
					id: "photos",
					label: "Photos",
					icon: /* @__PURE__ */ jsx(Images, { className: "h-5 w-5" })
				},
				{
					id: "review",
					label: "Review",
					icon: /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5" })
				}
			].map((it) => {
				const active = tab === it.id;
				return /* @__PURE__ */ jsxs("button", {
					onClick: () => setTab(it.id),
					className: `flex flex-col items-center justify-center gap-1 py-2 ${active ? "text-primary" : "text-muted-foreground"}`,
					children: [/* @__PURE__ */ jsx("div", {
						className: `h-9 w-9 grid place-items-center rounded-xl ${active ? "bg-primary/10" : ""}`,
						children: it.icon
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[10px] font-medium",
						children: it.label
					})]
				}, it.id);
			})
		})
	});
}
function EstimateTab({ project, onGoDeal }) {
	const globals = useApp((s) => s.globalPrices);
	const { total, reviewed, totalGroups, lineItemCount, rollups } = useMemo(() => rollupProject(project, globals), [project, globals]);
	const deal = useMemo(() => computeDeal(total, project.deal), [total, project.deal]);
	const [activeRoomId, setActiveRoomId] = useState(project.rooms[0]?.id ?? "");
	useEffect(() => {
		if (!project.rooms.find((r) => r.id === activeRoomId)) setActiveRoomId(project.rooms[0]?.id ?? "");
	}, [project.rooms, activeRoomId]);
	const activeRoom = project.rooms.find((r) => r.id === activeRoomId);
	const pct = totalGroups ? Math.round(reviewed / totalGroups * 100) : 0;
	const [editAddr, setEditAddr] = useState(false);
	const [addAddr, setAddAddr] = useState(project.address);
	useEffect(() => setAddAddr(project.address), [project.address]);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl bg-card shadow-card border p-5",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-[10px] tracking-[0.22em] font-semibold text-muted-foreground",
						children: "REPAIR ESTIMATE"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "grad-hero-text text-5xl font-black tracking-tight tabular-nums mt-1",
						children: fmtMoney(total)
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-2 flex items-center gap-2",
						children: editAddr ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("input", {
							autoFocus: true,
							value: addAddr,
							onChange: (e) => setAddAddr(e.target.value),
							className: "flex-1 px-2 py-1 rounded border text-sm",
							placeholder: "Property address"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => {
								useApp.getState().setAddress(addAddr);
								setEditAddr(false);
							},
							className: "text-xs px-2 py-1 rounded bg-primary text-primary-foreground",
							children: "Save"
						})] }) : /* @__PURE__ */ jsxs("button", {
							onClick: () => setEditAddr(true),
							className: "flex items-center gap-1.5 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ jsx("span", {
								className: "truncate",
								children: project.address || "Add property address"
							}), /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" })]
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between text-[11px] text-muted-foreground mb-1.5",
							children: [/* @__PURE__ */ jsx("span", { children: "Groups reviewed" }), /* @__PURE__ */ jsxs("span", {
								className: "tabular-nums",
								children: [
									reviewed,
									"/",
									totalGroups
								]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "h-2 rounded-full bg-secondary overflow-hidden",
							children: /* @__PURE__ */ jsx("div", {
								className: "h-full bg-primary rounded-full transition-all duration-300",
								style: { width: `${pct}%` }
							})
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3 mt-4",
						children: [/* @__PURE__ */ jsx(StatCard, {
							label: "Progress",
							value: `${pct}%`,
							sub: `${reviewed}/${totalGroups} groups`
						}), /* @__PURE__ */ jsx(StatCard, {
							label: "Line items",
							value: `${lineItemCount}`,
							sub: "checked"
						})]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: onGoDeal,
						className: "mt-4 w-full grad-hero text-navy-foreground rounded-xl p-3 flex items-center justify-between text-left shadow-lift",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-[10px] tracking-[0.18em] font-semibold opacity-80",
							children: project.deal.purchasePrice > 0 ? "PROJECTED PROFIT" : "MAX ALLOWABLE OFFER"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-2xl font-bold tabular-nums",
							children: project.deal.arv > 0 ? project.deal.purchasePrice > 0 ? fmtMoney(deal.profit ?? 0) : fmtMoney(Math.max(0, deal.mao)) : "Set ARV"
						})] }), /* @__PURE__ */ jsx(VerdictBadge, {
							verdict: deal.verdict,
							label: deal.verdictLabel
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx(RoomTabs, {
				rooms: project.rooms,
				activeId: activeRoomId,
				onChange: setActiveRoomId
			}),
			activeRoom && /* @__PURE__ */ jsx(RoomGroups, {
				room: activeRoom,
				project,
				rollups
			})
		]
	});
}
function StatCard({ label, value, sub }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border bg-card p-3 shadow-card",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "text-[10px] tracking-[0.18em] font-semibold text-muted-foreground",
				children: label.toUpperCase()
			}),
			/* @__PURE__ */ jsx("div", {
				className: "text-2xl font-bold text-navy tabular-nums mt-0.5",
				children: value
			}),
			sub && /* @__PURE__ */ jsx("div", {
				className: "text-[11px] text-muted-foreground",
				children: sub
			})
		]
	});
}
function VerdictBadge({ verdict, label }) {
	const map = {
		strong: "bg-success/90 text-white",
		thin: "bg-warning text-amber-foreground",
		pass: "bg-danger text-white",
		none: "bg-white/15 text-white"
	};
	const icon = verdict === "pass" ? "✕" : verdict === "thin" ? "≈" : verdict === "strong" ? "✓" : "·";
	return /* @__PURE__ */ jsxs("div", {
		className: `px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${map[verdict]}`,
		children: [/* @__PURE__ */ jsx("span", { children: icon }), /* @__PURE__ */ jsx("span", {
			className: "whitespace-nowrap",
			children: label
		})]
	});
}
function RoomTabs({ rooms, activeId, onChange }) {
	const [adding, setAdding] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "-mx-4 px-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex gap-2 overflow-x-auto no-scrollbar pb-1",
			children: [rooms.map((r) => {
				const active = r.id === activeId;
				return /* @__PURE__ */ jsxs("button", {
					onClick: () => onChange(r.id),
					className: `shrink-0 px-3 py-2 text-sm font-medium relative ${active ? "text-navy" : "text-muted-foreground"}`,
					children: [r.label, active && /* @__PURE__ */ jsx("div", { className: "absolute left-2 right-2 -bottom-0.5 h-0.5 rounded-full grad-amber" })]
				}, r.id);
			}), /* @__PURE__ */ jsxs("button", {
				onClick: () => setAdding(true),
				className: "shrink-0 px-3 py-2 text-sm font-medium text-primary flex items-center gap-1",
				children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), " Room"]
			})]
		}), adding && /* @__PURE__ */ jsx(AddRoomSheet, { onClose: () => setAdding(false) })]
	});
}
function AddRoomSheet({ onClose }) {
	const addRoom = useApp((s) => s.addRoom);
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-40 bg-black/40 flex items-end",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full bg-background rounded-t-3xl p-5",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ jsx("h3", {
				className: "text-lg font-semibold text-navy mb-3",
				children: "Add a room"
			}), /* @__PURE__ */ jsx("div", {
				className: "space-y-2",
				children: [
					{
						type: "bathroom",
						label: "Bathroom",
						desc: "Add another bathroom"
					},
					{
						type: "bedroom",
						label: "Bedroom",
						desc: "Separate finish costs"
					},
					{
						type: "living",
						label: "Living / Common",
						desc: "Family, dining, hall"
					}
				].map((o) => /* @__PURE__ */ jsxs("button", {
					onClick: () => {
						addRoom(o.type);
						onClose();
					},
					className: "w-full text-left rounded-xl border p-3 bg-card hover:bg-secondary flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
						className: "font-medium text-navy",
						children: o.label
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xs text-muted-foreground",
						children: o.desc
					})] }), /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 text-muted-foreground" })]
				}, o.type))
			})]
		})
	});
}
function RoomGroups({ room, project, rollups }) {
	const tpl = ROOM_TEMPLATES[room.type];
	const removeRoom = useApp((s) => s.removeRoom);
	const renameRoom = useApp((s) => s.renameRoom);
	const [editingName, setEditingName] = useState(false);
	const [nameVal, setNameVal] = useState(room.label);
	useEffect(() => setNameVal(room.label), [room.label]);
	return /* @__PURE__ */ jsxs("section", {
		className: "space-y-3",
		children: [(room.type === "bathroom" || room.type === "bedroom" || room.type === "living") && /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between text-xs text-muted-foreground",
			children: [editingName ? /* @__PURE__ */ jsxs("div", {
				className: "flex gap-1 flex-1",
				children: [/* @__PURE__ */ jsx("input", {
					value: nameVal,
					onChange: (e) => setNameVal(e.target.value),
					className: "flex-1 px-2 py-1 rounded border text-sm"
				}), /* @__PURE__ */ jsx("button", {
					onClick: () => {
						renameRoom(room.id, nameVal || room.label);
						setEditingName(false);
					},
					className: "text-xs px-2 py-1 rounded bg-primary text-primary-foreground",
					children: "Save"
				})]
			}) : /* @__PURE__ */ jsxs("button", {
				onClick: () => setEditingName(true),
				className: "flex items-center gap-1",
				children: ["Rename room ", /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" })]
			}), /* @__PURE__ */ jsxs("button", {
				onClick: () => {
					if (confirm(`Remove ${room.label}?`)) removeRoom(room.id);
				},
				className: "text-danger flex items-center gap-1",
				children: [/* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }), " Remove"]
			})]
		}), tpl.groups.map((g) => {
			const rollup = rollups.find((r) => r.roomId === room.id && r.groupId === g.id);
			return /* @__PURE__ */ jsx(GroupCard, {
				room,
				groupId: g.id,
				groupName: g.name,
				rollup,
				project,
				itemIds: g.itemIds
			}, g.id);
		})]
	});
}
function GroupCard({ room, groupId, groupName, rollup, project, itemIds }) {
	const [open, setOpen] = useState(false);
	const setNoAction = useApp((s) => s.setNoAction);
	const groupState = project.state[room.id]?.[groupId];
	const visibleCount = itemIds.filter((id) => !groupState?.deletedItems?.includes(id)).length + (groupState?.customItems.length ?? 0);
	return /* @__PURE__ */ jsxs("div", {
		className: `rounded-2xl border bg-card shadow-card overflow-hidden ${rollup.reviewed ? "border-primary/50" : ""}`,
		children: [/* @__PURE__ */ jsxs("button", {
			onClick: () => setOpen((v) => !v),
			className: "w-full px-4 py-3 flex items-center gap-3 text-left",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("div", {
						className: "font-semibold text-navy",
						children: groupName
					}), rollup.reviewed && /* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold",
						children: [/* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }), " Reviewed"]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "text-[11px] text-muted-foreground mt-0.5",
					children: [
						rollup.checkedCount,
						"/",
						visibleCount,
						" checked · ",
						fmtMoney(rollup.subtotal)
					]
				})]
			}), open ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-5 w-5 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-5 w-5 text-muted-foreground" })]
		}), open && /* @__PURE__ */ jsxs("div", {
			className: "border-t",
			children: [
				/* @__PURE__ */ jsxs("label", {
					className: "flex items-center justify-between px-4 py-2.5 text-sm",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-muted-foreground",
						children: "No action needed"
					}), /* @__PURE__ */ jsx(Toggle, {
						checked: !!groupState?.noAction,
						onChange: (v) => setNoAction(room.id, groupId, v)
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "divide-y",
					children: [itemIds.filter((id) => !groupState?.deletedItems?.includes(id)).map((id) => /* @__PURE__ */ jsx(LineItemRow, {
						room,
						groupId,
						itemId: id
					}, id)), (groupState?.customItems ?? []).map((ci) => /* @__PURE__ */ jsx(LineItemRow, {
						room,
						groupId,
						itemId: ci.id,
						custom: ci
					}, ci.id))]
				}),
				/* @__PURE__ */ jsx(AddCustomItem, {
					room,
					groupId
				})
			]
		})]
	});
}
function Toggle({ checked, onChange }) {
	return /* @__PURE__ */ jsx("button", {
		onClick: () => onChange(!checked),
		className: `relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary"}`,
		role: "switch",
		"aria-checked": checked,
		children: /* @__PURE__ */ jsx("span", { className: `absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}` })
	});
}
function LineItemRow({ room, groupId, itemId, custom }) {
	const project = useApp((s) => s.currentId ? s.projects[s.currentId] : null);
	const globals = useApp((s) => s.globalPrices);
	const toggleItem = useApp((s) => s.toggleItem);
	const setQty = useApp((s) => s.setQty);
	const setSerial = useApp((s) => s.setSerial);
	const setItemOverride = useApp((s) => s.setItemOverride);
	const removeCustomItem = useApp((s) => s.removeCustomItem);
	const deleteCatalogItem = useApp((s) => s.deleteCatalogItem);
	if (!project) return null;
	const isCustom = !!custom;
	const item = isCustom ? {
		id: custom.id,
		name: custom.name,
		cost: custom.cost,
		unit: custom.unit,
		serial: false
	} : CATALOG[itemId];
	if (!item) return null;
	const state = isCustom ? project.state[room.id]?.[groupId]?.customItemState[itemId] : project.state[room.id]?.[groupId]?.items[itemId];
	const checked = state?.checked ?? false;
	const qty = state?.qty ?? 1;
	const price = isCustom ? item.cost : resolvePrice(itemId, project, globals);
	const overridden = !isCustom && project.itemOverrides[itemId] !== void 0;
	const total = checked ? price * qty : 0;
	const [showPrice, setShowPrice] = useState(false);
	const [priceInput, setPriceInput] = useState(price.toString());
	useEffect(() => setPriceInput(price.toString()), [price]);
	return /* @__PURE__ */ jsx("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ jsx("button", {
					onClick: () => toggleItem(room.id, groupId, itemId),
					className: `mt-0.5 h-5 w-5 rounded-md border-2 grid place-items-center shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-muted-foreground/40"}`,
					"aria-label": checked ? "Uncheck" : "Check",
					children: checked && /* @__PURE__ */ jsx(Check, {
						className: "h-3.5 w-3.5 text-primary-foreground",
						strokeWidth: 3
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1 min-w-0",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex items-baseline gap-2",
							children: /* @__PURE__ */ jsxs("div", {
								className: "text-[14px] text-navy font-medium leading-tight",
								children: [item.name, isCustom && /* @__PURE__ */ jsx("span", {
									className: "ml-1 text-[10px] uppercase tracking-wider text-amber font-semibold",
									children: "custom"
								})]
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => setShowPrice((v) => !v),
								className: `tabular-nums ${overridden ? "text-primary font-medium" : ""}`,
								children: [
									fmtMoney2(price),
									" / ",
									item.unit,
									overridden && " *"
								]
							}), checked && /* @__PURE__ */ jsxs("span", {
								className: "text-foreground font-semibold tabular-nums",
								children: ["= ", fmtMoney(total)]
							})]
						}),
						checked && /* @__PURE__ */ jsxs("div", {
							className: "mt-2 flex items-center gap-3",
							children: [
								/* @__PURE__ */ jsx(QtyStepper, {
									value: qty,
									onChange: (n) => setQty(room.id, groupId, itemId, n)
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-muted-foreground",
									children: item.unit
								}),
								!isCustom && CATALOG[itemId]?.serial && /* @__PURE__ */ jsx(SerialScanner, {
									value: state?.serial ?? "",
									onChange: (v) => setSerial(room.id, groupId, itemId, v)
								})
							]
						}),
						showPrice && /* @__PURE__ */ jsxs("div", {
							className: "mt-2 flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-muted-foreground",
									children: "Override $"
								}),
								/* @__PURE__ */ jsx("input", {
									value: priceInput,
									onChange: (e) => setPriceInput(e.target.value),
									type: "number",
									step: "0.01",
									className: "flex-1 min-w-0 px-2 py-1 rounded border text-xs tabular-nums"
								}),
								!isCustom && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("button", {
									onClick: () => {
										const n = parseFloat(priceInput);
										if (!isNaN(n)) setItemOverride(itemId, n);
										setShowPrice(false);
									},
									className: "text-xs px-2 py-1 rounded bg-primary text-primary-foreground",
									children: "Save"
								}), overridden && /* @__PURE__ */ jsx("button", {
									onClick: () => {
										setItemOverride(itemId, null);
										setShowPrice(false);
									},
									className: "text-xs px-2 py-1 rounded border",
									children: "Reset"
								})] })
							]
						})
					]
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: () => {
						if (isCustom) removeCustomItem(room.id, groupId, itemId);
						else if (confirm("Remove this item from this project?")) deleteCatalogItem(room.id, groupId, itemId);
					},
					className: "text-muted-foreground/60 p-1",
					"aria-label": "Remove",
					children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
				})
			]
		})
	});
}
function QtyStepper({ value, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center bg-secondary rounded-lg overflow-hidden",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(Math.max(0, value - 1)),
				className: "h-9 w-9 grid place-items-center text-primary",
				"aria-label": "Decrease",
				children: /* @__PURE__ */ jsx(Minus, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ jsx("input", {
				value,
				onChange: (e) => {
					const n = parseFloat(e.target.value);
					if (!isNaN(n)) onChange(n);
					else if (e.target.value === "") onChange(0);
				},
				inputMode: "decimal",
				className: "w-14 h-9 text-center bg-transparent tabular-nums font-medium text-navy outline-none"
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value + 1),
				className: "h-9 w-9 grid place-items-center text-primary",
				"aria-label": "Increase",
				children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })
			})
		]
	});
}
function AddCustomItem({ room, groupId }) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [cost, setCost] = useState("");
	const [unit, setUnit] = useState("ea.");
	const addCustomItem = useApp((s) => s.addCustomItem);
	if (!open) return /* @__PURE__ */ jsxs("button", {
		onClick: () => setOpen(true),
		className: "w-full text-left px-4 py-2.5 text-sm text-primary font-medium flex items-center gap-1 border-t",
		children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), " Add custom line item"]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "border-t p-4 space-y-2 bg-secondary/30",
		children: [
			/* @__PURE__ */ jsx("input", {
				placeholder: "Item name",
				value: name,
				onChange: (e) => setName(e.target.value),
				className: "w-full px-2 py-2 rounded border text-sm"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ jsx("input", {
					placeholder: "Cost",
					type: "number",
					value: cost,
					onChange: (e) => setCost(e.target.value),
					className: "flex-1 px-2 py-2 rounded border text-sm tabular-nums"
				}), /* @__PURE__ */ jsx("input", {
					placeholder: "Unit",
					value: unit,
					onChange: (e) => setUnit(e.target.value),
					className: "w-24 px-2 py-2 rounded border text-sm"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					onClick: () => {
						const c = parseFloat(cost);
						if (!name || isNaN(c)) return;
						addCustomItem(room.id, groupId, {
							name,
							cost: c,
							unit: unit || "ea."
						});
						setName("");
						setCost("");
						setOpen(false);
					},
					className: "px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm",
					children: "Add"
				}), /* @__PURE__ */ jsx("button", {
					onClick: () => setOpen(false),
					className: "px-3 py-1.5 rounded border text-sm",
					children: "Cancel"
				})]
			})
		]
	});
}
function DealTab({ project }) {
	const globals = useApp((s) => s.globalPrices);
	const { total } = useMemo(() => rollupProject(project, globals), [project, globals]);
	const setDeal = useApp((s) => s.setDeal);
	const d = project.deal;
	const deal = useMemo(() => computeDeal(total, d), [total, d]);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl shadow-lift grad-hero text-navy-foreground p-5",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-[10px] tracking-[0.22em] font-semibold opacity-75",
						children: "MAXIMUM ALLOWABLE OFFER"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "text-5xl font-black tabular-nums mt-1",
						children: fmtMoney(Math.max(0, deal.mao))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-1 text-sm opacity-80",
						children: ["using ", d.rule === "margin" ? `${d.targetMargin}% target margin` : "the 70% rule"]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ jsx(RuleChip, {
							active: d.rule === "margin",
							onClick: () => setDeal({ rule: "margin" }),
							label: "Target margin"
						}), /* @__PURE__ */ jsx(RuleChip, {
							active: d.rule === "seventy",
							onClick: () => setDeal({ rule: "seventy" }),
							label: "70% rule"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex items-center justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-[10px] tracking-[0.18em] opacity-70 font-semibold",
							children: "VERDICT"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-lg font-bold",
							children: deal.verdictLabel
						})] }), /* @__PURE__ */ jsx(VerdictBadge, {
							verdict: deal.verdict,
							label: deal.verdictLabel
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "text-center text-xs text-muted-foreground italic",
				children: "“The most important number in the deal.”"
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl border bg-card shadow-card p-4 space-y-4",
				children: [
					/* @__PURE__ */ jsx(DealInput, {
						label: "After Repair Value (ARV)",
						value: d.arv,
						onChange: (v) => setDeal({ arv: v })
					}),
					/* @__PURE__ */ jsx(DealInput, {
						label: "Purchase price (optional)",
						value: d.purchasePrice,
						onChange: (v) => setDeal({ purchasePrice: v })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsx(DealInput, {
							label: "Target margin %",
							value: d.targetMargin,
							onChange: (v) => setDeal({ targetMargin: v }),
							small: true
						}), /* @__PURE__ */ jsx(DealInput, {
							label: "Holding+selling %",
							value: d.holdingPct,
							onChange: (v) => setDeal({ holdingPct: v }),
							small: true
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl border bg-card shadow-card p-4",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-[10px] tracking-[0.18em] text-muted-foreground font-semibold mb-2",
						children: "BREAKDOWN"
					}),
					/* @__PURE__ */ jsx(Row, {
						k: "Repairs (from estimate)",
						v: fmtMoney(total)
					}),
					/* @__PURE__ */ jsx(Row, {
						k: "Holding + selling costs",
						v: fmtMoney(deal.holdingCost)
					}),
					/* @__PURE__ */ jsx(Row, {
						k: "MAO",
						v: fmtMoney(Math.max(0, deal.mao)),
						bold: true
					}),
					d.purchasePrice > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Row, {
						k: "Projected profit",
						v: fmtMoney(deal.profit ?? 0)
					}), /* @__PURE__ */ jsx(Row, {
						k: "Margin on ARV",
						v: deal.marginOnArv !== null ? `${deal.marginOnArv.toFixed(1)}%` : "—"
					})] })
				]
			})
		]
	});
}
function RuleChip({ active, onClick, label }) {
	return /* @__PURE__ */ jsx("button", {
		onClick,
		className: `text-xs px-3 py-1.5 rounded-full font-medium border ${active ? "bg-white text-navy border-white" : "bg-transparent text-white/85 border-white/30"}`,
		children: label
	});
}
function DealInput({ label, value, onChange, small }) {
	const [v, setV] = useState(value.toString());
	useEffect(() => setV(value.toString()), [value]);
	return /* @__PURE__ */ jsxs("label", {
		className: "block",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1",
			children: label
		}), /* @__PURE__ */ jsx("input", {
			value: v,
			onChange: (e) => {
				setV(e.target.value);
				const n = parseFloat(e.target.value);
				onChange(isNaN(n) ? 0 : n);
			},
			inputMode: "decimal",
			className: `w-full px-3 py-2.5 rounded-lg border bg-card tabular-nums font-medium text-navy ${small ? "text-base" : "text-xl"}`
		})]
	});
}
function Row({ k, v, bold }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between py-2 border-b last:border-0",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-sm text-muted-foreground",
			children: k
		}), /* @__PURE__ */ jsx("span", {
			className: `tabular-nums ${bold ? "text-lg font-bold text-navy" : "text-sm text-foreground"}`,
			children: v
		})]
	});
}
function ExportTab({ project }) {
	const globals = useApp((s) => s.globalPrices);
	const { total, rollups, lineItemCount } = useMemo(() => rollupProject(project, globals), [project, globals]);
	const [busy, setBusy] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx("h2", {
				className: "text-2xl font-bold text-navy",
				children: "Export"
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl border bg-card shadow-card p-4",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-[10px] tracking-[0.18em] text-muted-foreground font-semibold",
						children: "SUMMARY"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3 mt-2",
						children: [/* @__PURE__ */ jsx(StatCard, {
							label: "Total",
							value: fmtMoney(total)
						}), /* @__PURE__ */ jsx(StatCard, {
							label: "Items",
							value: `${lineItemCount}`,
							sub: "line items"
						})]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: async () => {
							setBusy(true);
							try {
								await exportProjectZip(project, globals);
							} finally {
								setBusy(false);
							}
						},
						disabled: busy,
						className: "mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50",
						children: [/* @__PURE__ */ jsx(Download, { className: "h-5 w-5" }), busy ? "Packaging…" : "Download ZIP (XLSX + photos)"]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-[11px] text-muted-foreground mt-2",
						children: "Includes a styled .xlsx breakdown, all photos, and a plain-text summary."
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl border bg-card shadow-card p-4",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-[10px] tracking-[0.18em] text-muted-foreground font-semibold mb-2",
					children: "ROOMS"
				}), rollups.filter((r) => r.lines.length > 0).map((r) => /* @__PURE__ */ jsxs("div", {
					className: "py-2 border-b last:border-0",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-navy font-medium",
							children: [
								r.roomLabel,
								" · ",
								r.groupName
							]
						}), /* @__PURE__ */ jsx("span", {
							className: "tabular-nums",
							children: fmtMoney(r.subtotal)
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-[11px] text-muted-foreground",
						children: [r.lines.length, " items"]
					})]
				}, r.roomId + r.groupId))]
			})
		]
	});
}
async function processWithRetry(file, onAttempt, maxAttempts = 3) {
	let lastErr;
	for (let i = 1; i <= maxAttempts; i++) {
		onAttempt(i);
		try {
			const dataUrl = await compressImage(file);
			if (!dataUrl || !dataUrl.startsWith("data:image")) throw new Error("Invalid image data");
			return dataUrl;
		} catch (e) {
			lastErr = e;
			await new Promise((r) => setTimeout(r, 400 * Math.pow(2, i - 1)));
		}
	}
	throw lastErr instanceof Error ? lastErr : /* @__PURE__ */ new Error("Upload failed");
}
function PhotosTab({ project }) {
	const addPhoto = useApp((s) => s.addPhoto);
	const removePhoto = useApp((s) => s.removePhoto);
	const reorderPhotos = useApp((s) => s.reorderPhotos);
	const updateCaption = useApp((s) => s.updatePhotoCaption);
	const inputRef = useRef(null);
	const [queue, setQueue] = useState([]);
	const [lightboxIdx, setLightboxIdx] = useState(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 180,
		tolerance: 8
	} }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const ids = useMemo(() => project.photos.map((p) => p.id), [project.photos]);
	const runJob = async (jobId) => {
		const job = queue.find((j) => j.id === jobId);
		if (!job) return;
		setQueue((q) => q.map((j) => j.id === jobId ? {
			...j,
			status: "processing",
			error: void 0
		} : j));
		try {
			addPhoto({ dataUrl: await processWithRetry(job.file, (n) => {
				setQueue((q) => q.map((j) => j.id === jobId ? {
					...j,
					attempts: n
				} : j));
			}) });
			setQueue((q) => q.map((j) => j.id === jobId ? {
				...j,
				status: "done"
			} : j));
			setTimeout(() => {
				setQueue((q) => {
					const target = q.find((j) => j.id === jobId);
					if (target) URL.revokeObjectURL(target.previewUrl);
					return q.filter((j) => j.id !== jobId);
				});
			}, 1200);
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Upload failed";
			setQueue((q) => q.map((j) => j.id === jobId ? {
				...j,
				status: "error",
				error: msg
			} : j));
		}
	};
	const enqueue = (files) => {
		const jobs = files.map((f) => ({
			id: Math.random().toString(36).slice(2),
			name: f.name || "photo.jpg",
			file: f,
			status: "queued",
			attempts: 0,
			previewUrl: URL.createObjectURL(f)
		}));
		setQueue((q) => [...q, ...jobs]);
		(async () => {
			for (const j of jobs) await runJob(j.id);
		})();
	};
	const retry = (jobId) => {
		setQueue((q) => q.map((j) => j.id === jobId ? {
			...j,
			status: "queued",
			attempts: 0,
			error: void 0
		} : j));
		runJob(jobId);
	};
	const dismiss = (jobId) => {
		setQueue((q) => {
			const t = q.find((j) => j.id === jobId);
			if (t) URL.revokeObjectURL(t.previewUrl);
			return q.filter((j) => j.id !== jobId);
		});
	};
	const onDragEnd = (e) => {
		const { active, over } = e;
		if (!over || active.id === over.id) return;
		const oldIdx = ids.indexOf(String(active.id));
		const newIdx = ids.indexOf(String(over.id));
		if (oldIdx < 0 || newIdx < 0) return;
		reorderPhotos(arrayMove(ids, oldIdx, newIdx));
	};
	const uploading = queue.some((j) => j.status === "queued" || j.status === "processing");
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-baseline justify-between",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "text-2xl font-bold text-navy",
					children: "Photos"
				}), /* @__PURE__ */ jsxs("span", {
					className: "text-xs text-muted-foreground",
					children: [
						project.photos.length,
						" photo",
						project.photos.length === 1 ? "" : "s"
					]
				})]
			}),
			/* @__PURE__ */ jsxs("button", {
				onClick: () => inputRef.current?.click(),
				disabled: uploading,
				className: "w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50",
				children: [uploading ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsx(Camera, { className: "h-5 w-5" }), uploading ? "Saving…" : "Capture / upload"]
			}),
			/* @__PURE__ */ jsx("input", {
				ref: inputRef,
				type: "file",
				accept: "image/*",
				capture: "environment",
				multiple: true,
				className: "hidden",
				onChange: (e) => {
					const files = Array.from(e.target.files ?? []);
					if (files.length) enqueue(files);
					if (inputRef.current) inputRef.current.value = "";
				}
			}),
			queue.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "space-y-2 rounded-2xl border border-border bg-card p-2",
				children: queue.map((j) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 p-2 rounded-xl bg-secondary/40",
					children: [
						/* @__PURE__ */ jsx("img", {
							src: j.previewUrl,
							alt: "",
							className: "h-12 w-12 rounded-lg object-cover bg-muted"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-sm font-medium truncate",
								children: j.name
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [
									j.status === "queued" && /* @__PURE__ */ jsx(Fragment, { children: "Queued…" }),
									j.status === "processing" && /* @__PURE__ */ jsxs(Fragment, { children: [
										/* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
										"Compressing",
										j.attempts > 1 ? ` · retry ${j.attempts - 1}` : ""
									] }),
									j.status === "done" && /* @__PURE__ */ jsx("span", {
										className: "text-green-600",
										children: "Saved ✓"
									}),
									j.status === "error" && /* @__PURE__ */ jsxs("span", {
										className: "text-destructive flex items-center gap-1",
										children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3" }), j.error || "Failed"]
									})
								]
							})]
						}),
						j.status === "error" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
							onClick: () => retry(j.id),
							className: "h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1",
							children: [/* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }), "Retry"]
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => dismiss(j.id),
							className: "h-8 w-8 grid place-items-center rounded-lg text-muted-foreground",
							"aria-label": "Dismiss",
							children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
						})] })
					]
				}, j.id))
			}),
			project.photos.length === 0 ? /* @__PURE__ */ jsx("div", {
				className: "text-center text-sm text-muted-foreground py-12 border border-dashed rounded-2xl",
				children: "No photos yet — capture to start a per-property gallery"
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
				className: "text-xs text-muted-foreground",
				children: "Long-press a photo to drag and reorder."
			}), /* @__PURE__ */ jsx(DndContext, {
				sensors,
				collisionDetection: closestCenter,
				onDragEnd,
				children: /* @__PURE__ */ jsx(SortableContext, {
					items: ids,
					strategy: rectSortingStrategy,
					children: /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-3 gap-2",
						children: project.photos.map((p, idx) => /* @__PURE__ */ jsx(SortablePhoto, {
							id: p.id,
							src: p.dataUrl,
							onOpen: () => setLightboxIdx(idx),
							onRemove: () => removePhoto(p.id)
						}, p.id))
					})
				})
			})] }),
			lightboxIdx !== null && project.photos[lightboxIdx] && /* @__PURE__ */ jsx(Lightbox, {
				photos: project.photos,
				index: lightboxIdx,
				onClose: () => setLightboxIdx(null),
				onChange: setLightboxIdx,
				onCaption: (id, c) => updateCaption(id, c),
				onRemove: (id) => {
					removePhoto(id);
					setLightboxIdx((i) => {
						if (i === null) return null;
						const nextLen = project.photos.length - 1;
						if (nextLen <= 0) return null;
						return Math.min(i, nextLen - 1);
					});
				}
			})
		]
	});
}
function SortablePhoto({ id, src, onOpen, onRemove }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
	return /* @__PURE__ */ jsxs("div", {
		ref: setNodeRef,
		style: {
			transform: CSS.Transform.toString(transform),
			transition,
			zIndex: isDragging ? 50 : void 0
		},
		className: `relative aspect-square rounded-lg overflow-hidden bg-secondary touch-none select-none ${isDragging ? "ring-2 ring-primary shadow-lg" : ""}`,
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: onOpen,
				className: "absolute inset-0 w-full h-full",
				"aria-label": "Open photo",
				children: /* @__PURE__ */ jsx("img", {
					src,
					className: "w-full h-full object-cover pointer-events-none",
					alt: ""
				})
			}),
			/* @__PURE__ */ jsx("div", {
				...attributes,
				...listeners,
				className: "absolute top-1 left-1 h-7 w-7 grid place-items-center rounded-full bg-black/55 text-white cursor-grab active:cursor-grabbing",
				"aria-label": "Drag to reorder",
				children: /* @__PURE__ */ jsx(GripVertical, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: (e) => {
					e.stopPropagation();
					onRemove();
				},
				className: "absolute top-1 right-1 h-7 w-7 grid place-items-center rounded-full bg-black/55 text-white",
				"aria-label": "Remove photo",
				children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
			})
		]
	});
}
function Lightbox({ photos, index, onClose, onChange, onCaption, onRemove }) {
	const photo = photos[index];
	if (!photo) return null;
	const prev = () => onChange(Math.max(0, index - 1));
	const next = () => onChange(Math.min(photos.length - 1, index + 1));
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 bg-black/90 flex flex-col",
		onClick: onClose,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between p-3 text-white",
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "h-9 w-9 grid place-items-center rounded-full bg-white/10",
						children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "text-sm",
						children: [
							index + 1,
							" / ",
							photos.length
						]
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => onRemove(photo.id),
						className: "h-9 w-9 grid place-items-center rounded-full bg-white/10",
						"aria-label": "Delete",
						children: /* @__PURE__ */ jsx(Trash2, { className: "h-5 w-5" })
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-1 flex items-center justify-center px-2",
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: prev,
						disabled: index === 0,
						className: "h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white disabled:opacity-30",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ jsx("img", {
						src: photo.dataUrl,
						alt: "",
						className: "max-h-[70vh] max-w-full mx-2 object-contain rounded-lg"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: next,
						disabled: index === photos.length - 1,
						className: "h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white disabled:opacity-30",
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "p-3",
				onClick: (e) => e.stopPropagation(),
				children: /* @__PURE__ */ jsx("input", {
					type: "text",
					defaultValue: photo.caption ?? "",
					onBlur: (e) => onCaption(photo.id, e.target.value),
					placeholder: "Add a caption…",
					className: "w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/50 text-sm"
				})
			})
		]
	});
}
function ReviewTab({ project }) {
	const globals = useApp((s) => s.globalPrices);
	const { rollups, total, reviewed, totalGroups, lineItemCount } = useMemo(() => rollupProject(project, globals), [project, globals]);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx("h2", {
				className: "text-2xl font-bold text-navy",
				children: "Review"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ jsx(StatCard, {
						label: "Total",
						value: fmtMoney(total)
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Groups",
						value: `${reviewed}/${totalGroups}`
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Items",
						value: `${lineItemCount}`
					})
				]
			}),
			rollups.filter((r) => r.lines.length > 0 || r.noAction).map((r) => /* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl border bg-card shadow-card p-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between items-baseline mb-2",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
						className: "text-[10px] tracking-[0.18em] text-muted-foreground font-semibold",
						children: r.roomLabel.toUpperCase()
					}), /* @__PURE__ */ jsx("div", {
						className: "font-semibold text-navy",
						children: r.groupName
					})] }), /* @__PURE__ */ jsx("div", {
						className: "tabular-nums font-bold text-navy",
						children: fmtMoney(r.subtotal)
					})]
				}), r.noAction && r.lines.length === 0 ? /* @__PURE__ */ jsx("div", {
					className: "text-xs text-muted-foreground italic",
					children: "No action needed"
				}) : /* @__PURE__ */ jsx("ul", {
					className: "space-y-1.5",
					children: r.lines.map((ln) => /* @__PURE__ */ jsxs("li", {
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-foreground truncate pr-2",
							children: [
								ln.name,
								" ",
								/* @__PURE__ */ jsxs("span", {
									className: "text-muted-foreground tabular-nums text-xs",
									children: [
										"× ",
										ln.qty,
										" ",
										ln.unit
									]
								})
							]
						}), /* @__PURE__ */ jsx("span", {
							className: "tabular-nums text-muted-foreground",
							children: fmtMoney(ln.total)
						})]
					}, ln.id))
				})]
			}, r.roomId + r.groupId)),
			rollups.every((r) => r.lines.length === 0 && !r.noAction) && /* @__PURE__ */ jsx("div", {
				className: "text-center text-sm text-muted-foreground py-12 border border-dashed rounded-2xl",
				children: "Nothing checked yet. Go to Estimate to start your walkthrough."
			})
		]
	});
}
function SerialScanner({ value, onChange }) {
	const fileRef = useRef(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	const [candidates, setCandidates] = useState([]);
	const onPick = async (file) => {
		if (!file) return;
		setError(null);
		setCandidates([]);
		setBusy(true);
		try {
			const { candidates } = await ocrSerial(file);
			if (candidates.length === 0) setError("No serial detected. Try a sharper, closer photo.");
			else if (candidates.length === 1 || candidates[0].score >= candidates[1].score + 30) {
				onChange(candidates[0].value);
				setCandidates(candidates.slice(1));
			} else setCandidates(candidates);
		} catch (e) {
			setError("Scan failed. Type the serial manually.");
		} finally {
			setBusy(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex-1 min-w-0",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ jsx("input", {
						value,
						onChange: (e) => onChange(e.target.value),
						placeholder: "Serial #",
						className: "flex-1 min-w-0 px-2 py-1 rounded border text-xs tabular-nums"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						disabled: busy,
						"aria-label": "Scan serial number from photo",
						className: "h-7 px-2 rounded border bg-background hover:bg-muted active:bg-muted/70 disabled:opacity-50 grid place-items-center",
						children: busy ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin text-muted-foreground" }) : /* @__PURE__ */ jsx(Camera, { className: "h-3.5 w-3.5 text-primary" })
					}),
					/* @__PURE__ */ jsx("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						capture: "environment",
						className: "hidden",
						onChange: (e) => onPick(e.target.files?.[0])
					})
				]
			}),
			busy && /* @__PURE__ */ jsx("div", {
				className: "mt-1 text-[10px] text-muted-foreground",
				children: "Reading data plate…"
			}),
			error && /* @__PURE__ */ jsx("div", {
				className: "mt-1 text-[10px] text-danger",
				children: error
			}),
			candidates.length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "mt-1.5 flex flex-wrap items-center gap-1",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[10px] text-muted-foreground mr-0.5",
						children: value ? "Other:" : "Pick:"
					}),
					candidates.map((c) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							onChange(c.value);
							setCandidates([]);
						},
						className: "px-1.5 py-0.5 rounded border bg-background text-[10px] tabular-nums hover:bg-muted",
						children: c.value
					}, c.value)),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setCandidates([]),
						className: "text-[10px] text-muted-foreground px-1",
						"aria-label": "Dismiss suggestions",
						children: "×"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var SplitComponent = SparkApp;
//#endregion
export { SplitComponent as component };
