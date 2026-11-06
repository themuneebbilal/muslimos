from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "MuslimOS-Play-Store-Launch-Guide.docx"

EMERALD = RGBColor(0x0B, 0x6B, 0x4F)
EMERALD_DEEP = RGBColor(0x06, 0x4A, 0x37)
GOLD = RGBColor(0xC9, 0xA8, 0x4C)
GOLD_DARK = RGBColor(0x8B, 0x73, 0x30)
INK = RGBColor(0x1A, 0x1A, 0x1A)
MUTED = RGBColor(0x4A, 0x4A, 0x4A)
TERTIARY = RGBColor(0x8A, 0x8A, 0x8A)
CREAM = "FBF8F1"
CREAM_MID = "F0EDE4"
CREAM_DARK = "E4DED3"
EMERALD_FILL = "E8F5F0"
GOLD_FILL = "F5EDD6"


def set_page_margins(section):
    section.top_margin = Inches(0.58)
    section.bottom_margin = Inches(0.58)
    section.left_margin = Inches(0.68)
    section.right_margin = Inches(0.68)


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_border(cell, color="E4DED3", size="8"):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in("w:tcBorders")
    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)
    for edge in ("top", "left", "bottom", "right"):
        element = OxmlElement(f"w:{edge}")
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)
        tc_borders.append(element)


def set_doc_defaults(doc):
    style = doc.styles["Normal"]
    style.font.name = "DM Sans"
    style._element.rPr.rFonts.set(qn("w:eastAsia"), "DM Sans")
    style.font.size = Pt(11)
    style.font.color.rgb = INK


def add_run(paragraph, text, *, font="DM Sans", size=11, color=INK, bold=False, italic=False):
    run = paragraph.add_run(text)
    run.font.name = font
    run._element.rPr.rFonts.set(qn("w:eastAsia"), font)
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.bold = bold
    run.italic = italic
    return run


def add_spacer(doc, size=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(size)


def add_cover(doc):
    top_band = doc.add_table(rows=1, cols=3)
    top_band.alignment = WD_TABLE_ALIGNMENT.CENTER
    top_band.autofit = False
    for idx, fill in enumerate(("064A37", "0B6B4F", "C9A84C")):
        cell = top_band.cell(0, idx)
        cell.width = Inches(2.08)
        shade(cell, fill)
        cell.paragraphs[0].add_run("")

    add_spacer(doc, 10)

    hero = doc.add_table(rows=1, cols=1)
    hero.alignment = WD_TABLE_ALIGNMENT.CENTER
    hero.autofit = False
    cell = hero.cell(0, 0)
    shade(cell, CREAM)
    set_cell_border(cell, CREAM_DARK, "10")
    cell.width = Inches(6.2)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    add_run(p, "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", font="Amiri", size=17, color=GOLD_DARK)
    add_run(p, "\nMuslimOS", font="Amiri", size=27, color=EMERALD_DEEP, bold=True)
    add_run(p, "\nAndroid Play Store Launch Guide", font="DM Sans", size=20, color=INK, bold=True)
    add_run(p, "\nPrayer times · Quran · Hadith · Dhikr · Qibla", font="DM Sans", size=11, color=MUTED)
    add_run(p, "\nInspired by the Sheikh Zayed Grand Mosque", font="DM Sans", size=11, color=GOLD_DARK, italic=True)

    add_spacer(doc, 8)

    callout = doc.add_table(rows=1, cols=1)
    callout.alignment = WD_TABLE_ALIGNMENT.CENTER
    callout.autofit = False
    cell = callout.cell(0, 0)
    shade(cell, GOLD_FILL)
    set_cell_border(cell, "E8D5A8", "10")
    cell.width = Inches(6.2)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    add_run(p, "Recommended Path\n", font="DM Sans", size=9, color=GOLD_DARK, bold=True)
    add_run(
        p,
        "Keep the existing MuslimOS app, wrap it with Capacitor for Android, ship first, and only add SQLite when offline content scale truly demands it.",
        font="DM Sans",
        size=12,
        color=INK,
    )

    add_spacer(doc, 8)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run(p, "Version 2.0 · March 2026", font="DM Sans", size=10, color=TERTIARY)
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def add_section_header(doc, eyebrow, title, subtitle):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    add_run(p, eyebrow.upper(), font="DM Sans", size=9, color=GOLD_DARK, bold=True)
    p = doc.add_paragraph()
    add_run(p, title, font="Amiri", size=18, color=EMERALD_DEEP, bold=True)
    p.paragraph_format.space_after = Pt(0)
    p = doc.add_paragraph()
    add_run(p, subtitle, font="DM Sans", size=11, color=MUTED)
    p.paragraph_format.space_after = Pt(8)


def add_paragraph_block(doc, text, color=MUTED):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(7)
    add_run(p, text, font="DM Sans", size=11, color=color)


def add_bullets(doc, items):
    for item in items:
      p = doc.add_paragraph(style="List Bullet")
      p.paragraph_format.space_after = Pt(2)
      add_run(p, item, font="DM Sans", size=11, color=INK)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        p.paragraph_format.space_after = Pt(2)
        add_run(p, item, font="DM Sans", size=11, color=INK)


def add_matrix(doc, title, rows):
    p = doc.add_paragraph()
    add_run(p, title, font="DM Sans", size=11, color=EMERALD_DEEP, bold=True)
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Path", "Why it fits", "Use when"]
    for idx, label in enumerate(headers):
        cell = table.cell(0, idx)
        shade(cell, EMERALD_FILL)
        set_cell_border(cell, "C4E8DA", "8")
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        add_run(p, label, font="DM Sans", size=10, color=EMERALD_DEEP, bold=True)
    for row in rows:
        cells = table.add_row().cells
        for idx, text in enumerate(row):
            set_cell_border(cells[idx], CREAM_DARK, "6")
            p = cells[idx].paragraphs[0]
            add_run(p, text, font="DM Sans", size=10, color=INK if idx == 0 else MUTED, bold=(idx == 0))
    add_spacer(doc, 8)


def add_decision_box(doc, title, body, fill=EMERALD_FILL, border="C4E8DA"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    shade(cell, fill)
    set_cell_border(cell, border, "8")
    cell.width = Inches(6.2)
    p = cell.paragraphs[0]
    add_run(p, f"{title}\n", font="DM Sans", size=10, color=EMERALD_DEEP, bold=True)
    add_run(p, body, font="DM Sans", size=11, color=INK)
    add_spacer(doc, 8)


def add_checklist_table(doc, title, items):
    p = doc.add_paragraph()
    add_run(p, title, font="DM Sans", size=11, color=EMERALD_DEEP, bold=True)
    table = doc.add_table(rows=0, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for item in items:
        cells = table.add_row().cells
        set_cell_border(cells[0], CREAM_DARK, "6")
        set_cell_border(cells[1], CREAM_DARK, "6")
        shade(cells[0], GOLD_FILL)
        p0 = cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_run(p0, "□", font="DM Sans", size=11, color=GOLD_DARK, bold=True)
        p1 = cells[1].paragraphs[0]
        add_run(p1, item, font="DM Sans", size=10.5, color=INK)
    add_spacer(doc, 8)


def add_phase_table(doc):
    p = doc.add_paragraph()
    add_run(p, "Release Phases", font="DM Sans", size=11, color=EMERALD_DEEP, bold=True)
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Phase", "What ships", "Why it matters"]
    for idx, label in enumerate(headers):
        cell = table.cell(0, idx)
        shade(cell, GOLD_FILL if idx == 1 else EMERALD_FILL)
        set_cell_border(cell, CREAM_DARK, "8")
        add_run(cell.paragraphs[0], label, font="DM Sans", size=10, color=EMERALD_DEEP, bold=True)
    rows = [
        ("Phase 1", "Capacitor shell, icons, splash, mobile QA, Play Store build", "Gets MuslimOS into users' hands fast"),
        ("Phase 2", "Notifications, more native polish, offline improvements", "Turns the wrapper into a stronger product"),
        ("Phase 3", "SQLite, offline bundles, sync-ready architecture if needed", "Adds scale only when scale is real"),
    ]
    for row in rows:
        cells = table.add_row().cells
        for idx, text in enumerate(row):
            set_cell_border(cells[idx], CREAM_DARK, "6")
            add_run(cells[idx].paragraphs[0], text, font="DM Sans", size=10, color=INK if idx == 0 else MUTED, bold=(idx == 0))
    add_spacer(doc, 8)


def add_footer(section):
    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run(
        footer,
        "MuslimOS · Emerald, Gold, Cream · Android Launch Guide · March 2026",
        font="DM Sans",
        size=9,
        color=TERTIARY,
    )


def build():
    doc = Document()
    set_page_margins(doc.sections[0])
    set_doc_defaults(doc)
    add_cover(doc)

    add_section_header(
        doc,
        "Executive Summary",
        "Ship MuslimOS to Android without losing the product’s elegance.",
        "The cleanest route is to preserve the current codebase, wrap it well, and only add complexity where the product actually needs it.",
    )
    add_bullets(doc, [
        "Keep the existing Vite + React app as the core product.",
        "Use Capacitor as the Android shell and Android Studio for release builds.",
        "Treat SQLite as optional, not required for v1.",
        "Optimize for a fast, stable first Play Store release.",
    ])
    add_decision_box(
        doc,
        "MuslimOS Recommendation",
        "Package the current app with Capacitor, harden mobile UX, ship Android first, and defer SQLite until offline data scale or search demands it.",
    )

    add_section_header(
        doc,
        "Architecture",
        "Choose the least destructive path.",
        "For MuslimOS, the elegant solution is the one that protects design quality and shipping velocity at the same time.",
    )
    add_matrix(doc, "Platform Decision Matrix", [
        ("Capacitor + current app", "Keeps your current UI, logic, and release momentum intact", "You want to ship soon with minimal rewrite risk"),
        ("Flutter rewrite", "Strong native feeling and long-term control", "You are willing to rebuild most of the product"),
        ("React Native rewrite", "Shared JavaScript skills but still a major rebuild", "You need deeper native UI later and accept a rewrite"),
    ])

    add_section_header(
        doc,
        "SQLite",
        "Only add a database when the product justifies it.",
        "A good v1 should not carry database complexity purely because it sounds more serious.",
    )
    add_decision_box(
        doc,
        "Do not block launch on SQLite",
        "Settings, streaks, bookmarks, journaling, checklist state, and last-read position can all stay in lightweight local storage for the first Android release.",
        fill=GOLD_FILL,
        border="E8D5A8",
    )
    add_bullets(doc, [
        "Use SQLite later for large offline hadith collections, tafseer packs, search indexes, or sync-ready structured storage.",
        "Use a one-time migration when SQLite is introduced so existing users keep their data.",
        "Do not build a heavier architecture until offline content scale actually exists.",
    ])

    add_section_header(
        doc,
        "Implementation Plan",
        "Move from web app to Android product in practical phases.",
        "This sequence is designed to preserve current momentum and reduce release risk.",
    )
    add_phase_table(doc)
    add_bullets(doc, [
        "Stabilize mobile viewport behavior first.",
        "Add Capacitor and Android shell.",
        "Sync assets, icons, splash screen, and status bar.",
        "Run device QA before store submission.",
    ])
    add_code_block = [
        "npm install @capacitor/core @capacitor/cli",
        "npx cap init",
        "npx cap add android",
        "npm run build",
        "npx cap sync android",
        "npx cap open android",
    ]
    p = doc.add_paragraph()
    add_run(p, "Core Setup Commands", font="DM Sans", size=11, color=EMERALD_DEEP, bold=True)
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    shade(cell, GOLD_FILL)
    set_cell_border(cell, "E8D5A8", "8")
    para = cell.paragraphs[0]
    for idx, line in enumerate(add_code_block):
        if idx:
            para.add_run().add_break()
        add_run(para, line, font="Menlo", size=10, color=EMERALD_DEEP)
    add_spacer(doc, 8)

    add_section_header(
        doc,
        "Native Features",
        "Add native polish where Android users will actually feel it.",
        "This is where the shell stops being a wrapper and starts feeling like a product.",
    )
    add_bullets(doc, [
        "Splash screen and app icon set",
        "Status bar styling and safe area tuning",
        "Android back-button behavior review",
        "Local notifications for prayer reminders",
        "Optional device features later: biometrics, background tasks, SQLite",
    ])

    add_section_header(
        doc,
        "Quality Assurance",
        "Do not submit a worship app with unstable basics.",
        "The product should feel calm, trustworthy, and durable on real phones.",
    )
    add_checklist_table(doc, "Pre-release QA", [
        "Home, Quran, Worship, Hadith, and drawer navigation all behave correctly",
        "Quran audio survives backgrounding and resume cleanly",
        "Tafseer language follows the app-level language setting",
        "Islamic Calendar and Hijri date resolve correctly for local region",
        "Journal and Worship tracker save and restore local state reliably",
        "Qibla permissions and fallback states are understandable",
        "No accidental horizontal scroll or broken safe-area spacing on Android",
    ])

    add_section_header(
        doc,
        "Play Store Submission",
        "Prepare the release like a product, not just a build artifact.",
        "The store listing is part of the brand experience.",
    )
    add_bullets(doc, [
        "Create a Google Play Console account",
        "Generate a signed Android App Bundle (.aab)",
        "Prepare screenshots, icon, and feature graphic",
        "Write the privacy policy and complete the Data Safety form",
        "Run internal testing before public rollout",
    ])
    add_decision_box(
        doc,
        "Store Positioning",
        "MuslimOS should present itself as a premium Islamic companion: private, beautiful, useful every day, and not overloaded with ad-like noise.",
        fill=EMERALD_FILL,
        border="C4E8DA",
    )

    add_section_header(
        doc,
        "Final Recommendation",
        "The most elegant move",
        "Protect the design system, protect shipping velocity, and add infrastructure only when the product earns it.",
    )
    add_decision_box(
        doc,
        "Final Call",
        "Keep the current MuslimOS app. Package it with Capacitor. Publish Android first. Add SQLite later only when offline structured data genuinely becomes a product requirement.",
        fill=GOLD_FILL,
        border="E8D5A8",
    )

    add_footer(doc.sections[0])
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
