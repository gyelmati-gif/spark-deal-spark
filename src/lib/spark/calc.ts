import { CATALOG, ROOM_TEMPLATES } from "./catalog";
import type { GroupState, Project } from "./store";
import { resolvePrice } from "./store";

export type GroupRollup = {
  roomId: string;
  roomLabel: string;
  groupId: string;
  groupName: string;
  subtotal: number;
  checkedCount: number;
  totalItemCount: number;
  reviewed: boolean;
  noAction: boolean;
  lines: Array<{
    id: string;
    name: string;
    qty: number;
    unit: string;
    cost: number;
    total: number;
    serial?: string;
  }>;
};

export function rollupProject(
  project: Project | null | undefined,
  globals: Record<string, number>,
) {
  if (!project)
    return { rollups: [] as GroupRollup[], total: 0, reviewed: 0, totalGroups: 0, lineItemCount: 0 };
  const rollups: GroupRollup[] = [];
  let total = 0;
  let reviewed = 0;
  let lineItemCount = 0;
  for (const room of project.rooms) {
    const tpl = ROOM_TEMPLATES[room.type];
    for (const g of tpl.groups) {
      const gs: GroupState = project.state[room.id]?.[g.id] ?? {
        noAction: false,
        items: {},
        customItems: [],
        customItemState: {},
        deletedItems: [],
      };
      const lines: GroupRollup["lines"] = [];
      let subtotal = 0;
      let checkedCount = 0;
      // catalog items
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
            serial: st.serial,
          });
        }
      }
      // custom items
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
            total: lineTotal,
          });
        }
      }
      const totalItemCount =
        g.itemIds.filter((i) => !gs.deletedItems?.includes(i)).length + gs.customItems.length;
      const r: GroupRollup = {
        roomId: room.id,
        roomLabel: room.label,
        groupId: g.id,
        groupName: g.name,
        subtotal,
        checkedCount,
        totalItemCount,
        noAction: gs.noAction,
        reviewed: gs.noAction || checkedCount > 0,
        lines,
      };
      if (r.reviewed) reviewed++;
      total += subtotal;
      rollups.push(r);
    }
  }
  return { rollups, total, reviewed, totalGroups: rollups.length, lineItemCount };
}

export type DealResult = {
  mao: number;
  profit: number | null;
  marginOnArv: number | null;
  holdingCost: number;
  verdict: "strong" | "thin" | "pass" | "none";
  verdictLabel: string;
};

export function computeDeal(
  repairs: number,
  deal: Project["deal"],
): DealResult {
  const { arv, purchasePrice, targetMargin, holdingPct, rule } = deal;
  const holdingCost = (arv * holdingPct) / 100;
  let mao = 0;
  if (arv > 0) {
    if (rule === "margin") {
      mao = arv * (1 - targetMargin / 100) - repairs - holdingCost;
    } else {
      mao = 0.7 * arv - repairs;
    }
  }
  let profit: number | null = null;
  let marginOnArv: number | null = null;
  if (purchasePrice > 0 && arv > 0) {
    profit = arv - purchasePrice - repairs - holdingCost;
    marginOnArv = (profit / arv) * 100;
  }
  let verdict: DealResult["verdict"] = "none";
  let verdictLabel = "Set ARV";
  if (arv > 0) {
    const m = marginOnArv ?? ((mao - 0) >= 0 ? targetMargin : 0);
    if (purchasePrice > 0) {
      if (marginOnArv! >= targetMargin) {
        verdict = "strong";
        verdictLabel = "Strong";
      } else if (marginOnArv! >= targetMargin - 7) {
        verdict = "thin";
        verdictLabel = "Thin";
      } else {
        verdict = "pass";
        verdictLabel = "Pass";
      }
    } else {
      if (mao > 0) {
        verdict = "strong";
        verdictLabel = "Offer ≤ " + fmtMoney(Math.max(0, mao));
      } else {
        verdict = "pass";
        verdictLabel = "Pass";
      }
    }
    void m;
  }
  return { mao, profit, marginOnArv, holdingCost, verdict, verdictLabel };
}

export function fmtMoney(n: number) {
  if (!isFinite(n)) return "$0";
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.round(Math.abs(n)).toLocaleString();
}

export function fmtMoney2(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}