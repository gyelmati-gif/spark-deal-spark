// Spark Estimator catalog: 108 line items, 5 sections, 19 groups.
export type CatalogItem = {
  id: string;
  name: string;
  cost: number;
  unit: string;
  serial?: boolean; // show serial number field
};

const raw: Array<[string, string, number, string]> = [
  ["ig-01","Refinish Hardwood Floor",2.35,"sqft"],
  ["ig-02",'New Hardwoods 1.5"',10.0,"sqft"],
  ["ig-03",'New Hardwoods 2"',4.75,"sqft"],
  ["ig-04","Hardwood Splicing",8.4,"sqft"],
  ["ig-05","Vinyl Plank",2.5,"sqft"],
  ["ig-06","Carpet",1.9,"sqft"],
  ["ig-07","Interior Paint — 2 Tone",2.95,"sqft"],
  ["ig-08","Drywall Repair",900,"1,000 sqft"],
  ["ig-09","Wallpaper Removal",250,"room"],
  ["ig-10","Interior Door — Hollow Slab",125,"ea."],
  ["ig-11","Interior Door Hardware (Knob + Hinges + Labor)",25,"ea."],
  ["ig-12","Bifold Door with Framing",400,"ea."],
  ["ig-13","Interior Door — Pre-hung",200,"ea."],
  ["ig-14","Front Entry Door",475,"ea."],
  ["ig-15","Front Entry Door Hardware",80,"ea."],
  ["ig-16","Exterior Door Hardware",75,"handle"],
  ["ig-17","Exterior Insulated Side Door (Installed)",500,"ea."],
  ["ig-18","Sliding Glass Door",1025,"ea."],
  ["ig-19","Trim Out (Casing, Crown, Baseboard)",3.75,"LF"],
  ["ig-20","MISC / Punch List",2650,"flat"],
  ["ig-21","Finish Out Labor",1350,"flat"],
  ["ig-22","Light Fixtures",70,"100 sqft"],
  ["ig-23","Bedbug Spray / Heat Treat",475,"ea."],
  ["ig-24","Termite Treatment",650,"ea."],
  ["ig-25","Demo",1375,"variable"],
  ["ig-26","Haul Off",725,"load"],
  ["ig-27","Final Cleaning",325,"flat"],
  ["ig-28","Staging",0.9,"sqft"],
  ["kt-01","Hinges and Pulls",275,"kitchen"],
  ["kt-02","Cabinets Uppers",125,"LF"],
  ["kt-03","Cabinets Lowers",150,"LF"],
  ["kt-04","Cabinet Door Faces Only",80,"door"],
  ["kt-05","Cabinets (Labor & Paint)",1100,"kitchen"],
  ["kt-06",'Granite + 4" Splash Guard',40,"LF"],
  ["kt-07","Backsplash",725,"house"],
  ["kt-08","Misc Woodwork",500,"variable"],
  ["kt-09","Tile — Large Areas",6.45,"sqft"],
  ["kt-10","Tile — Small Areas",10,"sqft"],
  ["kt-11","Undermount Kitchen Sink",325,"ea."],
  ["kt-12","Microwave / Hood",500,"ea."],
  ["kt-13","Range",725,"ea."],
  ["kt-14","Wall Oven",1075,"ea."],
  ["kt-15","Cooktop",550,"ea."],
  ["kt-16","Dishwasher",575,"ea."],
  ["kt-17","Fridge",1175,"ea."],
  ["ba-01","Granite ($/LF)",35,"LF"],
  ["ba-02","New Bottom Vanity",125,"LF"],
  ["ba-03",'Home Depot Vanity w/ Sink (18")',225,"ea."],
  ["ba-04","Toilet",150,"ea."],
  ["ba-05","Tile — Large Areas",5.8,"sqft"],
  ["ba-06","Tile — Small Areas",10,"sqft"],
  ["ba-07","Reglaze Tub or Chemical Clean",350,"ea."],
  ["ba-08","Reglaze Tub + Surround",750,"ea."],
  ["ba-09","Reglaze Shower",1325,"ea."],
  ["ba-10","Tiled Shower Tear Out + Tile Install",3100,"ea."],
  ["ba-11","Tub Tile Surround Tear Out + Tile Install (incl. tub)",2250,"ea."],
  ["ba-12","Shower Plastic Insert Tear Out + New Insert",825,"ea."],
  ["ba-13","Tub Tear Out + New Insert & Tub",1575,"ea."],
  ["ba-14","Undermount Sink",150,"ea."],
  ["ba-15","Mirror",200,"ea."],
  ["ba-16","HVL (needed if no window)",275,"ea."],
  ["as-01","Furnace",3350,"ea."],
  ["as-02","Condensing Unit",3300,"ea."],
  ["as-03","Package Unit",4700,"ea."],
  ["as-04","A-Coil (if no condensing unit)",1625,"ea."],
  ["as-05","Ducting (if NO HVAC)",3200,"ea."],
  ["as-06","Duct Cleaning — Floor Vents",550,"ea."],
  ["as-07","Window Unit Replacement 220",575,"ea."],
  ["as-08","Hot Water Heater w/ Expansion Tank",1425,"ea."],
  ["as-09","Hot Water Heater Expansion Tank Only",200,"ea."],
  ["as-10","Switches / Outlets",1400,"house"],
  ["as-11","Standard Electrical",1650,"house"],
  ["as-12","Subfloor",8.2,"sqft"],
  ["as-13","Framing",950,"variable"],
  ["as-14","Structural (Pier)",375,"pier"],
  ["as-15","Structural Foam Injection",5.85,"sqft of affected area"],
  ["as-16","Roof",1100,"225 sqft L&M"],
  ["as-17","Plumbing",1000,"variable"],
  ["as-18","Electrical Panel Swap to 200A",2350,"ea."],
  ["as-19","Full Electrical Rewire (to Studs)",5.65,"sqft"],
  ["as-20","Full Electrical Rewire (leaving Drywall)",9.15,"sqft"],
  ["as-21","Wall Insulation (to Studs)",1.2,"sqft"],
  ["as-22","Attic Insulation",1225,"1,600 sqft house"],
  ["as-23","New Drywall to Studs (L&M)",5.2,"sqft"],
  ["as-24","Aluminum Wiring",2450,"variable"],
  ["ex-01","Fence Repair — Chain Link / Wood Gate",225,"variable"],
  ["ex-02","Fence Repair — Chain Link",275,"LF"],
  ["ex-03","Fence Repair — Privacy 6ft",30,"LF"],
  ["ex-04","Landscaping",450,"variable"],
  ["ex-05","Vinyl Siding (10'x10')",300,"square"],
  ["ex-06","Tuck Pointing",225,"variable"],
  ["ex-07","Exterior Paint",2.6,"sqft"],
  ["ex-08","Exterior Wood Repair",525,"variable"],
  ["ex-09","Siding Repair (10'x10')",975,"section"],
  ["ex-10","Tree Trimming",450,"variable"],
  ["ex-11","Tree Removal (w/o stump)",1450,"tree"],
  ["ex-12","Stump Grinding",250,"stump"],
  ["ex-13","Aluminum Window Paint (Int/Ext)",700,"house"],
  ["ex-14","Windows (3x5 sash)",425,"ea."],
  ["ex-15","Window Repair — Non-Insulated (6x6+)",35,"sf"],
  ["ex-16","Window Repair — Insulated (6x6+)",40,"sf"],
  ["ex-17","Aluminum Framed Window Pane",100,"pane"],
  ["ex-18","Guttering",4.15,"LF"],
  ["ex-19","Concrete w/ Demo",200,"sqft"],
  ["ex-20","Mowing (summer, every 2 weeks)",45,"mowing"],
  ["ex-21","Garage Door — 1 Car",975,"ea."],
  ["ex-22","Garage Door — 2 Car (Installed)",1225,"ea."],
  ["ex-23","Garage Conversion",8850,"ea."],
];

// items that should expose a serial number field (HVAC, water heater, kitchen appliances)
const SERIAL_IDS = new Set<string>([
  "as-01","as-02","as-03","as-04","as-07", // HVAC
  "as-08","as-09", // water heater
  "kt-12","kt-13","kt-14","kt-15","kt-16","kt-17", // kitchen appliances
]);

export const CATALOG: Record<string, CatalogItem> = Object.fromEntries(
  raw.map(([id, name, cost, unit]) => [
    id,
    { id, name, cost, unit, serial: SERIAL_IDS.has(id) },
  ]),
);

export type RoomType =
  | "interior"
  | "systems"
  | "exterior"
  | "kitchen"
  | "bathroom"
  | "bedroom"
  | "living";

export type SectionId = "interior" | "systems" | "exterior" | "kitchen" | "bathroom";

export type GroupDef = {
  id: string;
  name: string;
  itemIds: string[];
};

export const ROOM_TEMPLATES: Record<RoomType, { label: string; groups: GroupDef[] }> = {
  interior: {
    label: "Interior/General",
    groups: [
      { id: "flooring", name: "Flooring", itemIds: ["ig-01","ig-02","ig-03","ig-04","ig-05","ig-06"] },
      { id: "paint", name: "Paint & Wall Repair", itemIds: ["ig-07","ig-08","ig-09"] },
      { id: "doors", name: "Doors", itemIds: ["ig-10","ig-11","ig-12","ig-13","ig-14","ig-15","ig-16","ig-17","ig-18"] },
      { id: "trim", name: "Trim & Finishing", itemIds: ["ig-19","ig-20","ig-21"] },
      { id: "lighting", name: "Lighting", itemIds: ["ig-22"] },
      { id: "pest", name: "Pest Control", itemIds: ["ig-23","ig-24"] },
      { id: "cleanup", name: "Cleanup & Staging", itemIds: ["ig-25","ig-26","ig-27","ig-28"] },
    ],
  },
  systems: {
    label: "Systems & Structure",
    groups: [
      { id: "hvac", name: "HVAC", itemIds: ["as-01","as-02","as-03","as-04","as-05","as-06","as-07"] },
      { id: "plumbing", name: "Plumbing", itemIds: ["as-17"] },
      { id: "electrical", name: "Electrical", itemIds: ["as-10","as-11","as-18","as-19","as-20","as-24"] },
      { id: "wh", name: "Water Heater", itemIds: ["as-08","as-09"] },
      { id: "foundation", name: "Foundation & Structure", itemIds: ["as-12","as-13","as-14","as-15","as-21","as-22","as-23"] },
    ],
  },
  exterior: {
    label: "Exterior",
    groups: [
      { id: "roof", name: "Roof", itemIds: ["as-16"] },
      { id: "extpaint", name: "Exterior Paint & Siding", itemIds: ["ex-05","ex-06","ex-07","ex-08","ex-09","ex-13"] },
      { id: "windows", name: "Windows", itemIds: ["ex-14","ex-15","ex-16","ex-17"] },
      { id: "garage", name: "Garage", itemIds: ["ex-21","ex-22","ex-23"] },
      { id: "grounds", name: "Grounds & Landscaping", itemIds: ["ex-01","ex-02","ex-03","ex-04","ex-10","ex-11","ex-12","ex-18","ex-19","ex-20"] },
    ],
  },
  kitchen: {
    label: "Kitchen",
    groups: [
      { id: "kitchen", name: "Kitchen", itemIds: ["kt-01","kt-02","kt-03","kt-04","kt-05","kt-06","kt-07","kt-08","kt-09","kt-10","kt-11","kt-12","kt-13","kt-14","kt-15","kt-16","kt-17"] },
    ],
  },
  bathroom: {
    label: "Bathroom",
    groups: [
      { id: "bathroom", name: "Bathroom", itemIds: ["ba-01","ba-02","ba-03","ba-04","ba-05","ba-06","ba-07","ba-08","ba-09","ba-10","ba-11","ba-12","ba-13","ba-14","ba-15","ba-16"] },
    ],
  },
  bedroom: {
    label: "Bedroom",
    groups: [
      { id: "flooring", name: "Flooring", itemIds: ["ig-01","ig-05","ig-06"] },
      { id: "paint", name: "Paint & Wall Repair", itemIds: ["ig-07","ig-08"] },
      { id: "doors", name: "Doors", itemIds: ["ig-10","ig-11","ig-13"] },
      { id: "trim", name: "Trim & Finishing", itemIds: ["ig-19"] },
      { id: "lighting", name: "Lighting", itemIds: ["ig-22"] },
    ],
  },
  living: {
    label: "Living/Common",
    groups: [
      { id: "flooring", name: "Flooring", itemIds: ["ig-01","ig-05","ig-06"] },
      { id: "paint", name: "Paint & Wall Repair", itemIds: ["ig-07","ig-08"] },
      { id: "doors", name: "Doors", itemIds: ["ig-10","ig-11","ig-13","ig-18"] },
      { id: "trim", name: "Trim & Finishing", itemIds: ["ig-19"] },
      { id: "lighting", name: "Lighting", itemIds: ["ig-22"] },
    ],
  },
};

export const DEFAULT_ROOM_TYPES: RoomType[] = [
  "interior",
  "systems",
  "exterior",
  "kitchen",
  "bathroom",
];