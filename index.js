// index.js  –  CommonJS version
require("dotenv").config();
const express = require("express");
const { CodeSandbox } = require("@codesandbox/sdk");

const app = express().use(express.json());
const sdk = new CodeSandbox(process.env.CSB_API_KEY); // one SDK client for all requests

// helper: open a live session to an existing sandbox
async function connectSession(sandboxId) {
  const sandbox = await sdk.sandboxes.resume(sandboxId); // grab the sandbox
  return sandbox.connect();                              // open a WS session
}

/* ---------- read_file ---------- */
app.post("/read_file", async (req, res) => {
  try {
    const { sandboxId, path } = req.body;
    const session = await connectSession(sandboxId);
    const text = await session.fs.readTextFile(path);
    res.json({ content: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- write_file ---------- */
app.post("/write_file", async (req, res) => {
  try {
    const { sandboxId, path, content } = req.body;
    const session = await connectSession(sandboxId);
    await session.fs.writeTextFile(path, content);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- run_command ---------- */
app.post("/run_command", async (req, res) => {
  try {
    const { sandboxId, command } = req.body;
    const session = await connectSession(sandboxId);
    const term = session.terminals.create();      // open a bash terminal
    await term.input(command + "\n");
    const out = await term.outputUntilExit();     // wait for command to finish
    res.json({ output: out });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Bridge running on http://localhost:${PORT}`)
);
