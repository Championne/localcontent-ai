#!/usr/bin/env python3
"""Update GeoSpark Sales Partner proposal with new pricing: Starter $29, Pro $79, Premium $199. ARPU $77."""
import re

path = "GeoSpark Sales Partner proposal_4.0_0602026.htm"
with open(path, encoding="utf-16") as f:
    s = f.read()

# Pricing tier text: Premium $179 -> $199; remove Enterprise from average-deal sentence
s = s.replace("$179/<span", "$199/<span")
s = s.replace("Premium $179", "Premium $199")
s = s.replace("$29-299/month", "$29-199/month")
s = s.replace(
    "$72/month (mix of Starter $29, Pro $79, Premium $179 & Enterprise $299 plans)",
    "$77/month (mix of Starter $29, Pro $79, Premium $199 plans)",
)
s = s.replace("$72/month", "$77/month")

# 5-month table: Commission (40%) and Cumulative. Same client counts (8, 23, 42, 63, 86). ARPU $77.
# Commission: 8*77*0.4=246, 23*77*0.4=708, 42*77*0.4=1294, 63*77*0.4=1940, 86*77*0.4=2649
# Cumulative (client MRR): 616, 1771, 3234, 4851, 6622
replacements = [
    ("$230</span></b>", "$246</span></b>"),  # month 1 commission (green)
    ("$230</span></p>", "$616</span></p>"),   # month 1 cumulative
    ("$662</span></b>", "$708</span></b>"),
    ("$1,092</span></p>", "$1,771</span></p>"),
    ("$1,210</span></b>", "$1,294</span></b>"),
    ("$2,302</span></p>", "$3,234</span></p>"),
    ("$1,814</span></b>", "$1,940</span></b>"),
    ("$4,616</span></p>", "$4,851</span></p>"),
    ("$2,477</span></b>", "$2,649</span></b>"),
    ("$6,916</span></b>", "$6,622</span></b>"),
    ("$6,916</span></p>", "$6,622</span></p>"),
]
for old, new in replacements:
    s = s.replace(old, new)

# Summary line: Month 5 recurring income
s = s.replace("$2,477/month</span>", "$2,649/month</span>")
# Month 12 projection: 219 clients × $77 = $16,863
s = s.replace("$6,307/month</span>", "$16,863/month</span>")
# Year 1 total (~$41,000 -> ~$44,000; scale from 72 to 77)
s = s.replace("~$41,000</span>", "~$44,000</span>")

# Remove Enterprise from average-deal sentence (file has &amp; from Word HTML)
s = s.replace(" &amp; Enterprise $299 plans)", " plans)")

# Enterprise row: $299 -> keep for custom or remove; leave as-is so "custom" tier still shown
# (Optional: change Enterprise $299 to "Custom" if you want to hide price.)

with open(path, "w", encoding="utf-16") as f:
    f.write(s)

print("Updated", path, "with new pricing (Starter $29, Pro $79, Premium $199, ARPU $77).")
