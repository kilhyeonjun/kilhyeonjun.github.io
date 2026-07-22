#!/usr/bin/env python3
"""Fail closed when the Pages workflow regresses to deprecated actions or wrong gate order."""
from pathlib import Path
import re

WORKFLOW = Path(__file__).resolve().parents[1] / ".github/workflows/deploy.yml"
text = WORKFLOW.read_text(encoding="utf-8")
actions = set(re.findall(r"^\s*uses:\s*([^\s#]+)", text, flags=re.MULTILINE))
runs = re.findall(r"^\s*run:\s*([^#\n]+?)\s*$", text, flags=re.MULTILINE)
node_versions = re.findall(r"^\s*node-version:\s*[\"']?([^\s\"']+)", text, flags=re.MULTILINE)

expected = {
    "actions/checkout@v7",
    "actions/setup-node@v7",
    "actions/configure-pages@v6",
    "actions/upload-pages-artifact@v5",
    "actions/deploy-pages@v5",
}
issues = [f"missing active action: {value}" for value in sorted(expected - actions)]
legacy = [value for value in actions if value.startswith("actions/") and value not in expected]
issues.extend(f"unexpected or legacy action: {value}" for value in sorted(legacy))
for command in ["npm run check", "npm run build", "npm run verify:release"]:
    if command not in runs:
        issues.append(f"missing active run step: {command}")
if "22" not in node_versions:
    issues.append("missing active Node 22 build version")
if "npm run build" in runs and "npm run verify:release" in runs:
    if runs.index("npm run build") > runs.index("npm run verify:release"):
        issues.append("release verification must run after build so generated SEO artifacts are checked")
if issues:
    raise SystemExit("GitHub Pages workflow contract failed:\n- " + "\n- ".join(issues))
print("github pages workflow contract: PASS")
