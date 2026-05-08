import os
from pptx import Presentation
from pptx.util import Emu
import xml.etree.ElementTree as ET
import sys
sys.stdout.reconfigure(encoding='utf-8')

prs = Presentation(os.path.join(r'C:\Users\pedro\OneDrive\Git\MyProjs', 'template.pptx'))

# Extract theme XML
for slide_master in prs.slide_masters:
    xml_str = ET.tostring(slide_master.element, encoding='unicode')
    # Save full XML for analysis
    with open(os.path.join(r'C:\Users\pedro\OneDrive\Git\MyProjs', 'theme_xml.txt'), 'w', encoding='utf-8') as f:
        f.write(xml_str[:5000])

# Get background fills from slide layouts
for layout in prs.slide_layouts:
    bg = layout.background
    bg_xml = ET.tostring(bg._element, encoding='unicode')
    if 'srgbClr' in bg_xml or 'schemeClr' in bg_xml:
        print(f'Layout "{layout.name}": {bg_xml[:500]}')
        print()

# Check first slide background
for i, slide in enumerate(prs.slides[:3]):
    bg = slide.background
    bg_xml = ET.tostring(bg._element, encoding='unicode')
    print(f'Slide {i+1} bg: {bg_xml[:500]}')
    print()
