# -*- coding: utf-8 -*-
"""Add pricing tier 4 (Enterprise) and recalculate expected earnings. Edits UTF-16 .htm."""
from pathlib import Path

path = Path(r"c:\Users\Gert Jan\OneDrive\Documents\GeoSpark.AI\GeoSpark Sales Partner proposal_3.0_0602026.htm")
s = path.read_text(encoding="utf-16")

# --- 1) Add Pricing Tier 4 row (Enterprise $299/mo) after Premium row, before </table> ---
# Premium row ends with: multi-location businesses</span></p>  </td></tr>
# We insert the new row before </table> that follows the pricing table.
old_premium_end = "multi-location businesses<o:p></o:p></span></p>\n  </td>\n </tr>\n</table>"
tier4_row = """multi-location businesses<o:p></o:p></span></p>
  </td>
 </tr>
  <tr style='mso-yfti-irow:4;mso-yfti-lastrow:yes'>
  <td style='border:none;border-bottom:solid #E5E5E5 1.0pt;mso-border-bottom-alt:
 solid #E5E5E5 .75pt;padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-top:11.25pt;margin-right:0in;margin-bottom:
 11.25pt;margin-left:0in'><span style='font-size:10.0pt;font-family:"Calibri",sans-serif;
 mso-fareast-font-family:"Times New Roman";color:#333333'>Enterprise<o:p></o:p></span></p>
  </td>
  <td style='border:none;border-bottom:solid #E5E5E5 1.0pt;mso-border-bottom-alt:
 solid #E5E5E5 .75pt;padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-top:11.25pt;margin-right:0in;margin-bottom:
 11.25pt;margin-left:0in'><span style='font-size:10.0pt;font-family:"Calibri",sans-serif;
 mso-fareast-font-family:"Times New Roman";color:#333333'>$299/<span
 class=SpellE>mo</span><o:p></o:p></span></p>
  </td>
  <td style='border:none;border-bottom:solid #E5E5E5 1.0pt;mso-border-bottom-alt:
 solid #E5E5E5 .75pt;padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-top:11.25pt;margin-right:0in;margin-bottom:
 11.25pt;margin-left:0in'><span style='font-size:10.0pt;font-family:"Calibri",sans-serif;
 mso-fareast-font-family:"Times New Roman";color:#333333'>Franchise / enterprise networks<o:p></o:p></span></p>
  </td>
</tr>
</table>"""
if old_premium_end in s:
    s = s.replace(old_premium_end, tier4_row, 1)
    print("Added pricing tier 4: Enterprise $299/mo.")
else:
    print("(Tier 4 insert: pattern not found)")

# --- 2) Update average deal text (include all 4 plans; new avg $72) ---
s = s.replace(
    "$60/month (mix of Starter $29 &amp; Pro $79 plans)",
    "$72/month (mix of Starter $29, Pro $79, Premium $179 &amp; Enterprise $299 plans)",
    1,
)

# --- 3) Recalculated at 40% of $72 = $28.80/client; rounded: 8->$230, 23->$662, 42->$1,210, 63->$1,814, 86->$2,477 ---
# Cumulative commission: 230, 892, 2102, 3916, 6216. With portfolio bonuses (25->$200, 50->$500): 230, 1092, 2302, 4616, 6916
s = s.replace(">$192<", ">$230<", 2)   # Month 1 commission and cumulative
s = s.replace(">$552<", ">$662<", 1)
s = s.replace(">$744<", ">$1,092<", 1)
s = s.replace(">$1,008<", ">$1,210<", 1)
s = s.replace(">$1,752<", ">$2,302<", 1)
s = s.replace(">$1,512<", ">$1,814<", 1)
s = s.replace(">$3,264<", ">$4,616<", 1)
s = s.replace(">$2,064<", ">$2,477<", 1)
s = s.replace(">$5,328<", ">$6,916<", 1)

# --- 4) Month 5 recurring and Month 12 / Year 1 text ---
s = s.replace("$2,064/month", "$2,477/month", 1)
s = s.replace("$5,256/month", "$6,307/month", 1)   # 219 clients * 28.80 ≈ 6307
s = s.replace("~$35,000", "~$41,000", 1)

# --- 5) Tagline: include full range ---
s = s.replace("$29-79/month with 5 min/week effort", "$29-299/month with 5 min/week effort", 1)

path.write_text(s, encoding="utf-16")
print("Updated average deal to $72 (4 tiers); recalculated 5-month projection and Year 1 (~$41,000).")
