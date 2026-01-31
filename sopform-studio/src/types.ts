export type StageId = "req" | "design" | "plan" | "impl" | "release" | "ops";

export interface Snapshot {
  ts: number;
  note?: string;
  stages: Record<StageId, Record<string, string>>;
}

export interface Project {
  id: string;
  name: string;
  updatedAt: number;
  stages: Record<StageId, Record<string, string>>;
  history: Snapshot[];
}

export interface AppData {
  schemaVersion: number;
  projects: Project[];
  activeProjectId?: string;
}
