"""Print the tap center of the first node whose label starts with argv[1]."""
import json
import sys

prefix = sys.argv[1]


def walk(node):
    label = node.get("AXLabel") or ""
    frame = node.get("frame") or {}
    if label.startswith(prefix) and frame.get("width", 0) > 0:
        return f"{frame['x'] + frame['width'] / 2:.0f} {frame['y'] + frame['height'] / 2:.0f}"
    for child in node.get("children") or []:
        found = walk(child)
        if found:
            return found
    return None


data = json.load(sys.stdin)
for root in data if isinstance(data, list) else [data]:
    hit = walk(root)
    if hit:
        print(hit)
        break
