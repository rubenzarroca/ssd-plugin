import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { SpecJson, TasksJson, ApiDocsJson } from "../types.js";

export class ArtifactReader {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async readSpec(featureName: string): Promise<SpecJson | null> {
    try {
      const specPath = join(this.projectRoot, "specs", featureName, "spec.json");
      const raw = await readFile(specPath, "utf-8");
      return JSON.parse(raw) as SpecJson;
    } catch {
      return null;
    }
  }

  async readTasks(featureName: string): Promise<TasksJson | null> {
    try {
      const tasksPath = join(this.projectRoot, "specs", featureName, "tasks.json");
      const raw = await readFile(tasksPath, "utf-8");
      return JSON.parse(raw) as TasksJson;
    } catch {
      return null;
    }
  }

  async readConstitution(): Promise<string | null> {
    try {
      const constitutionPath = join(this.projectRoot, "constitution.md");
      return await readFile(constitutionPath, "utf-8");
    } catch {
      return null;
    }
  }

  async readApiDocs(serviceName: string): Promise<ApiDocsJson | null> {
    try {
      const docsPath = join(this.projectRoot, ".sdd", "api-docs", `${serviceName}.json`);
      const raw = await readFile(docsPath, "utf-8");
      return JSON.parse(raw) as ApiDocsJson;
    } catch {
      return null;
    }
  }

  async listApiDocs(): Promise<ApiDocsJson[]> {
    try {
      const docsDir = join(this.projectRoot, ".sdd", "api-docs");
      const files = await readdir(docsDir);
      const jsonFiles = files.filter((f) => f.endsWith(".json"));

      const results: ApiDocsJson[] = [];
      for (const file of jsonFiles) {
        try {
          const raw = await readFile(join(docsDir, file), "utf-8");
          results.push(JSON.parse(raw) as ApiDocsJson);
        } catch {
          // Skip malformed files
        }
      }
      return results;
    } catch {
      return [];
    }
  }
}
