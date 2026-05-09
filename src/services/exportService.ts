import type { PresentationData, CoverLayoutVariant, ContentLayoutVariant } from '../types';
import { getDesignTemplate } from '../config/designTemplates';

// HTML/ZIP export
export async function exportAsHtmlZip(presentation: PresentationData): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // manifest.json
  const manifest = {
    title: presentation.title,
    description: presentation.description || '',
    canvas: presentation.canvas,
    orientation: presentation.orientation,
    colorScheme: presentation.colorScheme.id,
    designTemplateId: presentation.designTemplateId || 'modern-corporate',
    slideCount: presentation.slides.length,
    createdAt: presentation.createdAt,
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // data.json (full presentation data for reimport)
  zip.file('data.json', JSON.stringify(presentation, null, 2));

  // Generate blob and download
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${sanitizeFilename(presentation.title)}.zip`);
}

// PDF export via print
export function exportAsPdf(presentation: PresentationData): void {
  const { width, height } = presentation.canvas;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('팝업이 차단되었습니다. 팝업을 허용해 주세요.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${presentation.title}</title>
      <style>
        @page {
          size: ${width}px ${height}px;
          margin: 0;
        }
        body { margin: 0; padding: 0; }
        .slide-page {
          width: ${width}px;
          height: ${height}px;
          page-break-after: always;
          overflow: hidden;
          position: relative;
        }
        .slide-page:last-child { page-break-after: avoid; }
      </style>
    </head>
    <body>
      <p style="text-align:center; padding:40px; color:#666;">
        프레젠테이션 PDF를 생성하려면 인쇄 대화상자에서 "PDF로 저장"을 선택하세요.
      </p>
    </body>
    </html>
  `);

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// PPTX export
export async function exportAsPptx(presentation: PresentationData): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();

  const { width, height } = presentation.canvas;
  // Convert px to inches (96 dpi)
  const slideW = width / 96;
  const slideH = height / 96;

  pptx.defineLayout({ name: 'CUSTOM', width: slideW, height: slideH });
  pptx.layout = 'CUSTOM';

  for (const slide of presentation.slides) {
    const pptxSlide = pptx.addSlide();
    const colors = presentation.colorScheme;

    const template = getDesignTemplate(presentation.designTemplateId || 'modern-corporate');
    const coverVariant: CoverLayoutVariant = template.coverLayoutVariant || 'top-panel';
    const contentVariant: ContentLayoutVariant = template.contentLayoutVariant || 'default';

    switch (slide.type) {
      case 'cover':
        switch (coverVariant) {
          case 'full-bleed':
            // Full primary background + centered text + accent divider
            pptxSlide.background = { color: colors.primary.replace('#', '') };
            if (slide.categoryChip) {
              pptxSlide.addText(slide.categoryChip, {
                x: 0.8, y: 0.8, w: slideW - 1.6,
                fontSize: 8, color: colors.accent.replace('#', ''),
                charSpacing: 3,
              });
            }
            pptxSlide.addText(slide.headline || slide.title || '', {
              x: 0.8, y: slideH * 0.30, w: slideW - 1.6,
              fontSize: 36, fontFace: 'Malgun Gothic',
              bold: true, color: 'FFFFFF', align: 'center',
            });
            // Accent divider line
            pptxSlide.addShape('rect' as any, {
              x: slideW / 2 - 0.4, y: slideH * 0.58, w: 0.8, h: 0.02,
              fill: { color: colors.accent.replace('#', '') },
            });
            if (slide.subtitle) {
              pptxSlide.addText(slide.subtitle, {
                x: 0.8, y: slideH * 0.62, w: slideW - 1.6,
                fontSize: 10, color: colors.accent.replace('#', ''),
                align: 'center', charSpacing: 1,
              });
            }
            break;
          case 'left-panel': {
            // Left 40% panel + right white + accent edge line
            const panelW = slideW * 0.40;
            pptxSlide.background = { color: colors.background.replace('#', '') };
            pptxSlide.addShape('rect' as any, {
              x: 0, y: 0, w: panelW, h: slideH,
              fill: { color: colors.primary.replace('#', '') },
            });
            // Accent edge line
            pptxSlide.addShape('rect' as any, {
              x: panelW - 0.05, y: 0, w: 0.05, h: slideH,
              fill: { color: colors.accent.replace('#', '') },
            });
            if (slide.categoryChip) {
              pptxSlide.addText(slide.categoryChip, {
                x: 0.4, y: 0.5,
                fontSize: 8, color: colors.accent.replace('#', ''),
                charSpacing: 2,
              });
            }
            pptxSlide.addText(slide.headline || slide.title || '', {
              x: 0.4, y: slideH * 0.30, w: panelW - 0.8,
              fontSize: 28, fontFace: 'Malgun Gothic',
              bold: true, color: 'FFFFFF',
            });
            if (slide.subtitle) {
              pptxSlide.addText(slide.subtitle, {
                x: 0.4, y: slideH - 1.0, w: panelW - 0.8,
                fontSize: 10, color: colors.accent.replace('#', ''),
              });
            }
            break;
          }
          case 'center-band': {
            // White background + rounded center band
            const bandY = slideH * 0.28;
            const bandH = slideH * 0.36;
            pptxSlide.background = { color: colors.background.replace('#', '') };
            pptxSlide.addShape('roundRect' as any, {
              x: 0.5, y: bandY, w: slideW - 1.0, h: bandH,
              fill: { color: colors.primary.replace('#', '') },
              rectRadius: 0.2,
            });
            pptxSlide.addText(slide.headline || slide.title || '', {
              x: 1.0, y: bandY + 0.4, w: slideW - 2.0,
              fontSize: 30, fontFace: 'Malgun Gothic',
              bold: true, color: 'FFFFFF', align: 'center',
            });
            if (slide.subtitle) {
              pptxSlide.addText(slide.subtitle, {
                x: 1.0, y: bandY + bandH - 0.6, w: slideW - 2.0,
                fontSize: 10, color: colors.accent.replace('#', ''),
                align: 'center',
              });
            }
            break;
          }
          case 'top-panel':
          default:
            // Original: top 50% panel
            pptxSlide.background = { color: colors.background.replace('#', '') };
            pptxSlide.addShape('rect' as any, {
              x: 0, y: 0, w: slideW, h: slideH * 0.5,
              fill: { color: colors.primary.replace('#', '') },
            });
            pptxSlide.addText(slide.headline || slide.title || '', {
              x: 0.6, y: 2.0, w: slideW - 1.2,
              fontSize: 32, fontFace: 'Malgun Gothic',
              bold: true, color: 'FFFFFF',
            });
            if (slide.subtitle) {
              pptxSlide.addText(slide.subtitle, {
                x: 0.6, y: slideH * 0.5 - 1.2, w: slideW - 1.2,
                fontSize: 10, color: colors.accent.replace('#', ''),
              });
            }
            break;
        }
        break;

      case 'toc':
        pptxSlide.background = { color: 'FFFFFF' };
        pptxSlide.addText('CONTENTS', {
          x: 0.6, y: 0.4, fontSize: 8, color: colors.primary.replace('#', ''),
          bold: true, charSpacing: 3,
        });
        pptxSlide.addText(slide.title || '차 례', {
          x: 1.0, y: 1.2, fontSize: 26, bold: true,
          color: colors.primary.replace('#', ''),
        });
        break;

      case 'content':
      default:
        switch (contentVariant) {
          case 'top-accent':
            pptxSlide.background = { color: 'FFFFFF' };
            // Top colored strip
            pptxSlide.addShape('rect' as any, {
              x: 0, y: 0, w: slideW, h: 0.7,
              fill: { color: colors.primary.replace('#', '') },
            });
            // Accent line below strip
            pptxSlide.addShape('rect' as any, {
              x: 0, y: 0.7, w: slideW, h: 0.04,
              fill: { color: colors.accent.replace('#', '') },
            });
            // Part label in strip
            pptxSlide.addText(`PART ${String(slide.partNumber||1).padStart(2,'0')} · ${slide.partTitle||''}`, {
              x: 0.6, y: 0.15, fontSize: 8,
              color: 'FFFFFF', bold: true, charSpacing: 2,
            });
            // Chapter title with underline
            pptxSlide.addText(slide.chapterTitle || slide.title || '', {
              x: 1.5, y: 1.1, w: slideW - 2.1, fontSize: 20,
              bold: true, color: colors.primary.replace('#', ''),
            });
            // Body with left border feel
            if (slide.sections?.[0]?.body) {
              pptxSlide.addText(slide.sections[0].body, {
                x: 1.0, y: 2.3, w: slideW - 2.0, fontSize: 10,
                color: '2D2D2D', lineSpacing: 18,
              });
            }
            // Bottom colored strip
            pptxSlide.addShape('rect' as any, {
              x: 0, y: slideH - 0.38, w: slideW, h: 0.38,
              fill: { color: colors.primary.replace('#', '') },
            });
            break;

          case 'clean-wide':
            pptxSlide.background = { color: 'FFFFFF' };
            // Centered chapter title
            pptxSlide.addText(slide.chapterTitle || slide.title || '', {
              x: 0.8, y: 0.8, w: slideW - 1.6, fontSize: 20,
              bold: true, color: colors.primary.replace('#', ''),
              align: 'center',
            });
            // Centered divider
            pptxSlide.addShape('rect' as any, {
              x: slideW / 2 - 0.25, y: 1.3, w: 0.5, h: 0.02,
              fill: { color: colors.accent.replace('#', '') },
            });
            // Body
            if (slide.sections?.[0]?.body) {
              pptxSlide.addText(slide.sections[0].body, {
                x: 0.9, y: 2.2, w: slideW - 1.8, fontSize: 10,
                color: '2D2D2D', lineSpacing: 18,
              });
            }
            break;

          default:
            pptxSlide.background = { color: 'FFFFFF' };
            // Header
            pptxSlide.addText(`PART ${String(slide.partNumber||1).padStart(2,'0')} · ${slide.partTitle||''}`, {
              x: 0.6, y: 0.3, fontSize: 8,
              color: colors.accent2.replace('#', ''),
              bold: true, charSpacing: 2,
            });
            // Title
            pptxSlide.addText(slide.chapterTitle || slide.title || '', {
              x: 1.7, y: 1.3, w: slideW - 2.3, fontSize: 20,
              bold: true, color: colors.primary.replace('#', ''),
            });
            // Body
            if (slide.sections?.[0]?.body) {
              pptxSlide.addText(slide.sections[0].body, {
                x: 1.0, y: 2.5, w: slideW - 2.0, fontSize: 10,
                color: '2D2D2D', lineSpacing: 18,
              });
            }
            break;
        }
        break;
    }

    // Page number
    if (slide.pageNumber) {
      pptxSlide.addText(String(slide.pageNumber).padStart(3, '0'), {
        x: slideW - 1.5, y: slideH - 0.5, w: 1.0,
        fontSize: 8, bold: true, align: 'right',
        color: colors.primary.replace('#', ''),
      });
    }
  }

  const filename = `${sanitizeFilename(presentation.title)}.pptx`;
  await pptx.writeFile({ fileName: filename });
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
