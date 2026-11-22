export const BEGIN: string;
export const END: string;
export interface InstallReport {
  copied: string[];
  identical: string[];
  conflicts: { file: string; installed: string; package: string }[];
  preserved: string[];
  claudeMd: "unchanged" | "appended" | "created";
}
export function installOps(root: string): InstallReport;
