#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
from pathlib import Path


def safe_name(path: Path) -> str:
    stem = re.sub(r"[^0-9A-Za-z가-힣._-]+", "-", path.stem).strip("-")
    return stem or "post"


def run(cmd: list[str], cwd: Path | None = None) -> str:
    proc = subprocess.run(cmd, cwd=str(cwd) if cwd else None, text=True, capture_output=True, timeout=300)
    out = (proc.stdout or "") + (proc.stderr or "")
    if proc.returncode != 0:
        raise SystemExit(f"command failed: {' '.join(cmd)}\n{out[-2000:]}")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Package blog MD/MDX files as Telegram-friendly txt + zip review bundle")
    ap.add_argument("files", nargs="+")
    ap.add_argument("--root", default=".")
    ap.add_argument("--output-prefix", default="/tmp/blog-review")
    ap.add_argument("--validation-log")
    ap.add_argument("--build-log")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    prefix = Path(args.output_prefix)
    bundle_dir = prefix.with_suffix("")
    zip_path = prefix.with_suffix(".zip")
    txt_path = prefix.with_suffix(".txt")

    for target in [bundle_dir, zip_path, txt_path]:
        if target.is_dir():
            shutil.rmtree(target)
        elif target.exists():
            target.unlink()
    bundle_dir.mkdir(parents=True)

    entries: list[tuple[Path, Path]] = []
    for raw in args.files:
        src = Path(raw)
        if not src.is_absolute():
            src = root / src
        src = src.resolve()
        if not src.exists():
            raise SystemExit(f"missing file: {src}")
        dst = bundle_dir / f"{safe_name(src)}.txt"
        dst.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
        entries.append((src, dst))

    if args.validation_log and Path(args.validation_log).exists():
        shutil.copy(args.validation_log, bundle_dir / "VALIDATION-SUMMARY.txt")
    if args.build_log and Path(args.build_log).exists():
        shutil.copy(args.build_log, bundle_dir / "BUILD.log")

    lines = ["# Blog review bundle", "", f"Root: {root}", "", "## Files"]
    for src, dst in entries:
        rel = src.relative_to(root) if src.is_relative_to(root) else src
        lines.append(f"- {rel} -> {dst.name}")
    lines.append("")
    (bundle_dir / "README.txt").write_text("\n".join(lines), encoding="utf-8")
    txt_path.write_text("\n".join(lines), encoding="utf-8")
    run(["zip", "-qr", str(zip_path), bundle_dir.name], cwd=bundle_dir.parent)

    print(f"zip: {zip_path}")
    print(f"summary: {txt_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
