"""Print labelled accessibility nodes (AXe describe-ui JSON) with tap centers."""
import json
import sys


def walk(node, depth=0):
    label = node.get("AXLabel") or node.get("AXValue") or ""
    frame = node.get("frame") or {}
    if label:
        cx = frame.get("x", 0) + frame.get("width", 0) / 2
        cy = frame.get("y", 0) + frame.get("height", 0) / 2
        print(f"{'  ' * depth}{label[:60]!r} ({cx:.0f},{cy:.0f}) {node.get('type')}")
    for child in node.get("children") or []:
        walk(child, depth + 1)


data = json.load(sys.stdin)
for root in data if isinstance(data, list) else [data]:
    walk(root)
