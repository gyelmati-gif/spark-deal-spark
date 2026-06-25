import JSZip from "jszip";
import * as XLSX from "xlsx";
import type { Project } from "./store";
import { rollupProject, fmtMoney2 } from "./calc";

export async function exportProjectZip(
  project: Project,
  globals: Record<string, number>,
  options: { returnBlob?: boolean } = {},
): Promise<Blob | void> {
  const { rollups, total } = rollupProject(project, globals);
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows: (string | number)[][] = [
    ["Spark Estimator — Repair Breakdown"],
    ["Project", project.name],
    ["Address", project.address || "—"],
    ["Generated", new Date().toLocaleString()],
    [],
    ["Room", "Group", "Item", "Qty", "Unit", "Unit Cost", "Line Total", "Serial #"],
  ];
  // Group by room
  let lastRoom = "";
  for (const r of rollups) {
    if (r.lines.length === 0) continue;
    if (r.roomLabel !== lastRoom) {
      summaryRows.push([r.roomLabel.toUpperCase()]);
      lastRoom = r.roomLabel;
    }
    for (const ln of r.lines) {
      summaryRows.push([
        r.roomLabel,
        r.groupName,
        ln.name,
        ln.qty,
        ln.unit,
        ln.cost,
        ln.total,
        ln.serial ?? "",
      ]);
    }
    summaryRows.push(["", "", `${r.groupName} subtotal`, "", "", "", r.subtotal, ""]);
  }
  summaryRows.push([]);
  summaryRows.push(["", "", "GRAND TOTAL", "", "", "", total, ""]);

  const ws = XLSX.utils.aoa_to_sheet(summaryRows);
  ws["!cols"] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 40 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Estimate");

  // Deal sheet
  const d = project.deal;
  const dealRows: (string | number)[][] = [
    ["Deal Analyzer"],
    ["ARV", d.arv],
    ["Purchase Price", d.purchasePrice],
    ["Target Margin %", d.targetMargin],
    ["Holding %", d.holdingPct],
    ["Rule", d.rule === "margin" ? "Target Margin" : "70% Rule"],
    ["Repairs", total],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dealRows), "Deal");

  const xlsxBuf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

  const zip = new JSZip();
  const safeName = (project.name || "spark-estimate").replace(/[^a-z0-9_-]+/gi, "_");
  zip.file(`${safeName}.xlsx`, xlsxBuf);

  // Photos
  if (project.photos.length) {
    const folder = zip.folder("photos")!;
    for (let i = 0; i < project.photos.length; i++) {
      const p = project.photos[i];
      const b64 = p.dataUrl.split(",")[1] ?? "";
      folder.file(`photo-${i + 1}.jpg`, b64, { base64: true });
    }
  }

  // Plain text summary
  let txt = `Spark Estimator\n${project.name}\n${project.address || ""}\n\nGRAND TOTAL: ${fmtMoney2(
    total,
  )}\n\n`;
  for (const r of rollups) {
    if (!r.lines.length) continue;
    txt += `\n[${r.roomLabel}] ${r.groupName} — ${fmtMoney2(r.subtotal)}\n`;
    for (const ln of r.lines)
      txt += `  • ${ln.name} × ${ln.qty} ${ln.unit} @ ${fmtMoney2(ln.cost)} = ${fmtMoney2(ln.total)}${ln.serial ? ` [SN: ${ln.serial}]` : ""}\n`;
  }
  zip.file("summary.txt", txt);

  const blob = await zip.generateAsync({ type: "blob" });
  if (options.returnBlob) return blob;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function compressImage(file: File, maxDim = 1280, quality = 0.78): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}