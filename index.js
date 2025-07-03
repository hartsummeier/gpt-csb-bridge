require('dotenv').config();
const express = require('express');
const { CodeSandbox } = require('@codesandbox/sdk');

const app = express().use(express.json());
const csb = new CodeSandbox(process.env.CSB_API_KEY);

// -------- read_file --------
app.post('/read_file', async (req, res) => {
  const { sandboxId, path } = req.body;
  const sb = await csb.sandboxes.connect(sandboxId);
  const text = await sb.fs.readTextFile(path);
  res.json({ content: text });
});

// -------- write_file --------
app.post('/write_file', async (req, res) => {
  const { sandboxId, path, content } = req.body;
  const sb = await csb.sandboxes.connect(sandboxId);
  await sb.fs.writeTextFile(path, content);
  res.json({ ok: true });
});

// -------- run_command ------
app.post('/run_command', async (req, res) => {
  const { sandboxId, command } = req.body;
  const sb   = await csb.sandboxes.connect(sandboxId);
  const term = await sb.terminals.create();
  await term.input(command + '\n');
  const out  = await term.outputUntilExit();
  res.json({ output: out });
});

app.listen(process.env.PORT, () =>
  console.log('Bridge running on http://localhost:' + process.env.PORT)
);
