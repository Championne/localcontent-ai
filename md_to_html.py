# -*- coding: utf-8 -*-
"""Convert business plan, sales strategy, and revenue projections Markdown to HTML.
No external dependencies; handles # headers, lists, tables, bold, and hr.
"""
import re
from pathlib import Path

BASE = Path(r"c:\Users\Gert Jan\OneDrive\Documents\GeoSpark.AI")

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
  body {{ font-family: Calibri, "Segoe UI", sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; color: #333; line-height: 1.5; }}
  h1 {{ font-size: 1.75rem; border-bottom: 2px solid #0D9488; padding-bottom: 0.5rem; }}
  h2 {{ font-size: 1.35rem; margin-top: 1.5rem; color: #0D9488; }}
  h3 {{ font-size: 1.15rem; margin-top: 1.25rem; }}
  h4 {{ font-size: 1.05rem; margin-top: 1rem; }}
  table {{ border-collapse: collapse; width: 100%; margin: 1rem 0; }}
  th, td {{ border: 1px solid #E5E5E5; padding: 0.5rem 0.75rem; text-align: left; }}
  th {{ background: #f5f5f5; font-weight: 600; }}
  hr {{ border: none; border-top: 1px solid #E5E5E5; margin: 1.5rem 0; }}
  ul, ol {{ margin: 0.5rem 0; padding-left: 1.5rem; }}
  p {{ margin: 0.75rem 0; }}
  strong {{ font-weight: 600; }}
</style>
</head>
<body>
{body}
</body>
</html>
"""


def escape(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def inline_md(text: str) -> str:
    """Convert inline markdown (bold, code)."""
    text = escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return text


def parse_table(lines: list, start: int) -> tuple[str, int]:
    """Parse a markdown table; return (html, next_line_index)."""
    rows = []
    i = start
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            break
        # Skip separator row |---|---|
        if re.match(r"^\s*\|[\s\-:]+\|", line):
            i += 1
            continue
        parts = re.split(r"\s*\|\s*", line.strip().strip("|"))
        cells = [c.strip() for c in parts if c.strip()]
        if not cells:
            break
        rows.append(cells)
        i += 1
    if not rows:
        return "", start
    # First row as header
    thead = "<tr>" + "".join("<th>" + inline_md(c) + "</th>" for c in rows[0]) + "</tr>"
    tbody = ""
    for r in rows[1:]:
        tbody += "<tr>" + "".join("<td>" + inline_md(c) + "</td>" for c in r) + "</tr>"
    return "<table>\n<thead>\n" + thead + "\n</thead>\n<tbody>\n" + tbody + "\n</tbody>\n</table>", i


def md_to_html_content(text: str) -> str:
    """Convert full markdown document to HTML (no doc wrapper)."""
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    out = []
    i = 0
    in_list = None  # "ul" or "ol"
    list_items = []

    def flush_list():
        nonlocal list_items, in_list
        if list_items:
            tag = "ol" if in_list == "ol" else "ul"
            out.append("<" + tag + ">\n" + "\n".join(list_items) + "\n</" + tag + ">")
            list_items = []
        in_list = None

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Table
        if stripped.startswith("|") and "|" in stripped[1:]:
            tbl_html, i = parse_table(lines, i)
            flush_list()
            out.append(tbl_html)
            continue

        # Horizontal rule
        if stripped in ("---", "***", "___"):
            flush_list()
            out.append("<hr>")
            i += 1
            continue

        # Headers
        if stripped.startswith("#### "):
            flush_list()
            out.append("<h4>" + inline_md(stripped[5:]) + "</h4>")
            i += 1
            continue
        if stripped.startswith("### "):
            flush_list()
            out.append("<h3>" + inline_md(stripped[4:]) + "</h3>")
            i += 1
            continue
        if stripped.startswith("## "):
            flush_list()
            out.append("<h2>" + inline_md(stripped[3:]) + "</h2>")
            i += 1
            continue
        if stripped.startswith("# "):
            flush_list()
            out.append("<h1>" + inline_md(stripped[2:]) + "</h1>")
            i += 1
            continue

        # Unordered list
        if re.match(r"^[\-\*]\s+", line) or (line.startswith("  ") and re.match(r"^\s+[\-\*]\s+", line)):
            if in_list != "ul":
                flush_list()
                in_list = "ul"
            content = re.sub(r"^\s*[\-\*]\s+", "", line).strip()
            list_items.append("<li>" + inline_md(content) + "</li>")
            i += 1
            continue

        # Ordered list
        if re.match(r"^\d+\.\s+", stripped):
            if in_list != "ol":
                flush_list()
                in_list = "ol"
            content = re.sub(r"^\d+\.\s+", "", stripped)
            list_items.append("<li>" + inline_md(content) + "</li>")
            i += 1
            continue

        # Empty line
        if not stripped:
            flush_list()
            i += 1
            continue

        # Paragraph
        flush_list()
        out.append("<p>" + inline_md(stripped) + "</p>")
        i += 1

    flush_list()
    return "\n".join(out)


def preprocess_business_plan(text: str) -> str:
    """Add markdown headers for business plan's loose structure."""
    lines = text.split("\n")
    out = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            out.append(line)
            continue
        if i == 0:
            out.append("# " + stripped)
            continue
        if re.match(r"^\d+\.\s+.+", stripped) and len(stripped) < 100:
            out.append("\n## " + stripped)
            continue
        for heading in (
            "Executive Summary", "Conclusion", "Success Metrics & Milestones",
            "Risk Mitigation Checkpoints", "Key Metrics Target:", "Primary Problem:",
            "Market Pain Points:", "Market Size:", "Core Value Proposition:",
            "Key Features:", "Technical Architecture:", "Primary Target Segments:",
            "Customer Personas:", "Revenue Streams:", "Pricing Psychology:",
            "Unit Economics:", "Product-Led Growth Strategy:", "Sales Automation Framework:",
            "Lead Capture & Qualification:", "Conversion Optimization:",
        ):
            if stripped == heading or stripped.rstrip(":") == heading.rstrip(":"):
                out.append("\n## " + stripped)
                break
        else:
            out.append(line)
    return "\n".join(out)


def main():
    files = [
        (
            BASE / "strategic_plans" / "AI_Content_Engine_Business_Plan_Formatted.md",
            BASE / "strategic_plans" / "AI_Content_Engine_Business_Plan.html",
            "LocalContent.ai – Business Plan",
            preprocess_business_plan,
        ),
        (
            BASE / "strategic_plans" / "sales_strategy.md",
            BASE / "strategic_plans" / "LocalContent_Sales_Strategy_Plan.html",
            "LocalContent.ai – Sales Strategy",
            None,
        ),
        (
            BASE / "docs" / "REVENUE_PROJECTIONS.md",
            BASE / "docs" / "REVENUE_PROJECTIONS.html",
            "GeoSpark Revenue Projections",
            None,
        ),
    ]

    for md_path, html_path, title, preprocess in files:
        if not md_path.exists():
            print("Skip (not found):", md_path)
            continue
        text = md_path.read_text(encoding="utf-8")
        if preprocess:
            text = preprocess(text)
        body = md_to_html_content(text)
        html = HTML_TEMPLATE.format(title=title, body=body)
        html_path.write_text(html, encoding="utf-8")
        print("Written:", html_path)


if __name__ == "__main__":
    main()
