# PDF import: _source/source.pdf

- Imported at: 2026-05-09T07:44:08Z
- Pages: 10 (7 with text layer, 3 without)
- Canvas: portrait (document)
- Screenshot DPI: 150
- Embedded images extracted: 21
- Creator: PScript5.dll Version 5.2.2
- Producer: Acrobat Distiller 10.1.16 (Windows)

## Read strategy

This tool ALWAYS produces:
- `pages/page_NNN.png` — page screenshot (read with the Read
  tool to view inline; supports crop_left/top/right/bottom
  for region zoom)
- `pages/page_NNN.json` — per-page spans/images/drawings/links
  plus a flat `text` field (PyMuPDF reading order)
- `media/img_xref_NNNN.<ext>` — deduplicated embedded images

There is no PDF-type classification. For each page, look at
`text_layer_chars` in `manifest.json`:
- > 0 → reading the JSON `spans` (or `text`) is precise and
  free; use the screenshot only if you need visual layout.
- = 0 → page has no text layer (scanned/image-only); read the
  screenshot directly (vision LLM does the OCR for you).

Mixed PDFs Just Work: each page is independent.
