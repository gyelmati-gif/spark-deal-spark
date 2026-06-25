import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CATALOG, DEFAULT_ROOM_TYPES, ROOM_TEMPLATES, type RoomType } from "./catalog";

export type CustomItem = {
  id: string; // custom-<uuid>
  name: string;
  cost: number;
  unit: string;
};

export type ItemState = {
  checked: boolean;
  qty: number;
  serial?: string;
};

export type GroupState = {
  noAction: boolean;
  items: Record<string, ItemState>;
  customItems: CustomItem[];
  customItemState: Record<string, ItemState>;
  deletedItems: string[]; // catalog item ids removed from this group in this project
};

export type Room = {
  id: string;
  type: RoomType;
  label: string;
};

export type Photo = {
  id: string;
  dataUrl: string; // compressed JPEG
  caption?: string;
  createdAt: number;
};

export type DealInputs = {
  arv: number;
  purchasePrice: number;
  targetMargin: number; // % e.g. 20
  holdingPct: number; // % of ARV
  rule: "margin" | "seventy";
};

export type Project = {
  id: string;
  name: string;
  address: string;
  createdAt: number;
  updatedAt: number;
  rooms: Room[];
  // roomId -> groupId -> GroupState
  state: Record<string, Record<string, GroupState>>;
  itemOverrides: Record<string, number>; // catalog itemId -> price
  photos: Photo[];
  deal: DealInputs;
};

type AppState = {
  projects: Record<string, Project>;
  currentId: string | null;
  globalPrices: Record<string, number>; // override catalog default for all projects
  hasOnboarded: boolean;
  setOnboarded: (v: boolean) => void;
  // actions
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  setAddress: (addr: string) => void;
  addRoom: (type: RoomType) => void;
  removeRoom: (roomId: string) => void;
  renameRoom: (roomId: string, label: string) => void;
  toggleItem: (roomId: string, groupId: string, itemId: string) => void;
  setQty: (roomId: string, groupId: string, itemId: string, qty: number) => void;
  setSerial: (roomId: string, groupId: string, itemId: string, serial: string) => void;
  setNoAction: (roomId: string, groupId: string, value: boolean) => void;
  addCustomItem: (roomId: string, groupId: string, item: Omit<CustomItem, "id">) => void;
  removeCustomItem: (roomId: string, groupId: string, itemId: string) => void;
  deleteCatalogItem: (roomId: string, groupId: string, itemId: string) => void;
  restoreCatalogItem: (roomId: string, groupId: string, itemId: string) => void;
  setItemOverride: (itemId: string, price: number | null) => void;
  setGlobalPrice: (itemId: string, price: number | null) => void;
  addPhoto: (photo: Omit<Photo, "id" | "createdAt">) => void;
  removePhoto: (id: string) => void;
  reorderPhotos: (ids: string[]) => void;
  updatePhotoCaption: (id: string, caption: string) => void;
  setDeal: (patch: Partial<DealInputs>) => void;
};

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)) + "";

function emptyGroupState(): GroupState {
  return {
    noAction: false,
    items: {},
    customItems: [],
    customItemState: {},
    deletedItems: [],
  };
}

function emptyRoomState(type: RoomType): Record<string, GroupState> {
  const out: Record<string, GroupState> = {};
  for (const g of ROOM_TEMPLATES[type].groups) out[g.id] = emptyGroupState();
  return out;
}

function makeRoom(type: RoomType, idx: number): Room {
  const tpl = ROOM_TEMPLATES[type];
  const label =
    type === "interior" || type === "systems" || type === "exterior" || type === "kitchen"
      ? tpl.label
      : `${tpl.label} ${idx}`;
  return { id: uid(), type, label };
}

function makeProject(name: string): Project {
  const rooms: Room[] = [];
  const state: Record<string, Record<string, GroupState>> = {};
  const counts: Partial<Record<RoomType, number>> = {};
  for (const t of DEFAULT_ROOM_TYPES) {
    counts[t] = (counts[t] ?? 0) + 1;
    const r = makeRoom(t, counts[t]!);
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
    deal: { arv: 0, purchasePrice: 0, targetMargin: 20, holdingPct: 8, rule: "margin" },
  };
}

function ensureGroup(p: Project, roomId: string, groupId: string) {
  if (!p.state[roomId]) p.state[roomId] = {};
  if (!p.state[roomId][groupId]) p.state[roomId][groupId] = emptyGroupState();
  return p.state[roomId][groupId];
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      projects: {},
      currentId: null,
      globalPrices: {},

      createProject: (name) => {
        const p = makeProject(name || "New Walkthrough");
        set((s) => ({
          projects: { ...s.projects, [p.id]: p },
          currentId: p.id,
        }));
        return p.id;
      },
      deleteProject: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.projects;
          const ids = Object.keys(rest);
          return {
            projects: rest,
            currentId: s.currentId === id ? ids[0] ?? null : s.currentId,
          };
        }),
      selectProject: (id) => set({ currentId: id }),
      renameProject: (id, name) =>
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          return { projects: { ...s.projects, [id]: { ...p, name, updatedAt: Date.now() } } };
        }),
      setAddress: (addr) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          return {
            projects: { ...s.projects, [id]: { ...s.projects[id], address: addr, updatedAt: Date.now() } },
          };
        }),
      addRoom: (type) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          const idx = p.rooms.filter((r) => r.type === type).length + 1;
          const r = makeRoom(type, idx);
          p.rooms = [...p.rooms, r];
          p.state = { ...p.state, [r.id]: emptyRoomState(type) };
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      removeRoom: (roomId) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          p.rooms = p.rooms.filter((r) => r.id !== roomId);
          const { [roomId]: _, ...rest } = p.state;
          p.state = rest;
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      renameRoom: (roomId, label) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          p.rooms = p.rooms.map((r) => (r.id === roomId ? { ...r, label } : r));
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      toggleItem: (roomId, groupId, itemId) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = structuredClone(s.projects[id]) as Project;
          const g = ensureGroup(p, roomId, groupId);
          const isCustom = itemId.startsWith("custom-");
          const map = isCustom ? g.customItemState : g.items;
          const cur = map[itemId] ?? { checked: false, qty: 1 };
          const next = !cur.checked;
          map[itemId] = { ...cur, checked: next, qty: next ? Math.max(1, cur.qty || 1) : cur.qty };
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      setQty: (roomId, groupId, itemId, qty) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = structuredClone(s.projects[id]) as Project;
          const g = ensureGroup(p, roomId, groupId);
          const map = itemId.startsWith("custom-") ? g.customItemState : g.items;
          const cur = map[itemId] ?? { checked: false, qty: 1 };
          const newQty = Math.max(0, qty);
          map[itemId] = { ...cur, qty: newQty, checked: newQty > 0 ? true : cur.checked };
          if (newQty === 0) map[itemId].checked = false;
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      setSerial: (roomId, groupId, itemId, serial) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = structuredClone(s.projects[id]) as Project;
          const g = ensureGroup(p, roomId, groupId);
          const map = itemId.startsWith("custom-") ? g.customItemState : g.items;
          map[itemId] = { ...(map[itemId] ?? { checked: false, qty: 1 }), serial };
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      setNoAction: (roomId, groupId, value) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = structuredClone(s.projects[id]) as Project;
          const g = ensureGroup(p, roomId, groupId);
          g.noAction = value;
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      addCustomItem: (roomId, groupId, item) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = structuredClone(s.projects[id]) as Project;
          const g = ensureGroup(p, roomId, groupId);
          const cid = "custom-" + uid();
          g.customItems.push({ id: cid, ...item });
          g.customItemState[cid] = { checked: true, qty: 1 };
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      removeCustomItem: (roomId, groupId, itemId) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = structuredClone(s.projects[id]) as Project;
          const g = ensureGroup(p, roomId, groupId);
          g.customItems = g.customItems.filter((c) => c.id !== itemId);
          delete g.customItemState[itemId];
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      deleteCatalogItem: (roomId, groupId, itemId) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = structuredClone(s.projects[id]) as Project;
          const g = ensureGroup(p, roomId, groupId);
          if (!g.deletedItems.includes(itemId)) g.deletedItems.push(itemId);
          delete g.items[itemId];
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      restoreCatalogItem: (roomId, groupId, itemId) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = structuredClone(s.projects[id]) as Project;
          const g = ensureGroup(p, roomId, groupId);
          g.deletedItems = g.deletedItems.filter((d) => d !== itemId);
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      setItemOverride: (itemId, price) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          const o = { ...p.itemOverrides };
          if (price === null || price === undefined) delete o[itemId];
          else o[itemId] = price;
          p.itemOverrides = o;
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      setGlobalPrice: (itemId, price) =>
        set((s) => {
          const g = { ...s.globalPrices };
          if (price === null || price === undefined) delete g[itemId];
          else g[itemId] = price;
          return { globalPrices: g };
        }),
      addPhoto: (photo) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          p.photos = [...p.photos, { id: uid(), createdAt: Date.now(), ...photo }];
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      removePhoto: (pid) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          p.photos = p.photos.filter((x) => x.id !== pid);
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      reorderPhotos: (ids) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          const map = new Map(p.photos.map((ph) => [ph.id, ph]));
          const next = ids.map((i) => map.get(i)).filter(Boolean) as Photo[];
          for (const ph of p.photos) if (!ids.includes(ph.id)) next.push(ph);
          p.photos = next;
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      updatePhotoCaption: (pid, caption) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          p.photos = p.photos.map((x) => (x.id === pid ? { ...x, caption } : x));
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
      setDeal: (patch) =>
        set((s) => {
          const id = s.currentId;
          if (!id || !s.projects[id]) return s;
          const p = { ...s.projects[id] };
          p.deal = { ...p.deal, ...patch };
          p.updatedAt = Date.now();
          return { projects: { ...s.projects, [id]: p } };
        }),
    }),
    {
      name: "spark-estimator-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

// resolve price for a catalog item via override -> global -> default
export function resolvePrice(itemId: string, project: Project | null | undefined, globals: Record<string, number>): number {
  if (project?.itemOverrides[itemId] !== undefined) return project.itemOverrides[itemId];
  if (globals[itemId] !== undefined) return globals[itemId];
  return CATALOG[itemId]?.cost ?? 0;
}

export function getCurrent(state: AppState): Project | null {
  return state.currentId ? state.projects[state.currentId] ?? null : null;
}