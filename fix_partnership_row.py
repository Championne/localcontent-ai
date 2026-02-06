# -*- coding: utf-8 -*-
from pathlib import Path
path = Path(r"c:\Users\Gert Jan\OneDrive\Documents\GeoSpark.AI\GeoSpark Sales Partner proposal_3.0_0602026.htm")
s = path.read_text(encoding="utf-16")

# Row 6: empty first td, then "Weekly training calls + support group"
# We need to add content to the first td. Exact pattern:
old = "<tr style='mso-yfti-irow:6;mso-yfti-lastrow:yes'>\n  <td style='border:none;border-bottom:solid #E5E5E5 1.0pt;mso-border-bottom-alt:\n  solid #E5E5E5 .75pt;padding:6.0pt 6.0pt 6.0pt 6.0pt'></td>"
new = "<tr style='mso-yfti-irow:6;mso-yfti-lastrow:yes'>\n  <td style='border:none;border-bottom:solid #E5E5E5 1.0pt;mso-border-bottom-alt:\n  solid #E5E5E5 .75pt;padding:6.0pt 6.0pt 6.0pt 6.0pt'>\n  <p class=MsoNormal style='margin-top:11.25pt;margin-right:0in;margin-bottom:\n 11.25pt;margin-left:0in'><span style='font-size:10.0pt;font-family:\"Calibri\",sans-serif;\n mso-fareast-font-family:\"Times New Roman\";color:#333333'>Your commitment<o:p></o:p></span></p>\n  </td>"

if old in s:
    s = s.replace(old, new, 1)
    path.write_text(s, encoding="utf-16")
    print("Added 'Your commitment' to the last row.")
else:
    # try to find what's there
    i = s.find("mso-yfti-irow:6;mso-yfti-lastrow:yes")
    if i >= 0:
        print("Snippet:", repr(s[i:i+400]))
    else:
        print("Row not found")
