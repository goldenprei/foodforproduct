"use client";

import { useState } from "react";

export function ImportPanel() {
  const [directory, setDirectory] = useState("content/import");
  const [publish, setPublish] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string>("");

  async function runImport() {
    setRunning(true);
    setResult("");

    try {
      const response = await fetch("/api/v1/admin/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          directory,
          publish
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || "Import failed");
      }

      const message = `Scanned ${payload.scanned}, created ${payload.created}, updated ${payload.updated}, skipped ${payload.skipped}, failed ${payload.failed}`;
      setResult(message);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Import failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="panel" style={{ padding: "1rem" }}>
      <h2 style={{ marginTop: 0, fontFamily: "var(--font-heading)" }}>Import existing files</h2>
      <div className="split">
        <div>
          <label htmlFor="import-directory">Directory</label>
          <input
            id="import-directory"
            onChange={(event) => setDirectory(event.target.value)}
            value={directory}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: 0 }}>
            <input
              checked={publish}
              onChange={(event) => setPublish(event.target.checked)}
              style={{ width: "auto" }}
              type="checkbox"
            />
            Publish imported posts
          </label>
          <button onClick={runImport} type="button" disabled={running}>
            {running ? "Importing..." : "Run import"}
          </button>
        </div>
      </div>
      {result ? <p>{result}</p> : null}
    </section>
  );
}
