import type { PresentationData, CoverLayoutVariant, ContentLayoutVariant, SlideData, ColorScheme } from '../types';
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
          case 'diagonal-split': {
            // Diagonal split: primary polygon + white background
            pptxSlide.background = { color: colors.background.replace('#', '') };
            // Approximate diagonal with a large primary rect (PPTX has no clip-path)
            pptxSlide.addShape('rect' as any, {
              x: 0, y: 0, w: slideW * 0.65, h: slideH,
              fill: { color: colors.primary.replace('#', '') },
            });
            // Accent vertical line at diagonal edge
            pptxSlide.addShape('rect' as any, {
              x: slideW * 0.65 - 0.04, y: 0, w: 0.04, h: slideH,
              fill: { color: colors.accent.replace('#', '') },
            });
            if (slide.categoryChip) {
              pptxSlide.addText(slide.categoryChip, {
                x: 0.6, y: 1.2,
                fontSize: 8, color: colors.accent.replace('#', ''),
                charSpacing: 2, bold: true,
              });
            }
            pptxSlide.addText(slide.headline || slide.title || '', {
              x: 0.6, y: slideH * 0.25, w: slideW * 0.55 - 0.6,
              fontSize: 30, fontFace: 'Malgun Gothic',
              bold: true, color: 'FFFFFF',
            });
            if (slide.subtitle) {
              pptxSlide.addText(slide.subtitle, {
                x: slideW * 0.65 + 0.3, y: slideH - 2.0, w: slideW * 0.35 - 0.6,
                fontSize: 10, color: colors.primary.replace('#', ''),
                align: 'right',
              });
            }
            break;
          }
          case 'minimal-frame': {
            // White background + primary border frame
            pptxSlide.background = { color: colors.background.replace('#', '') };
            // Outer frame (simulated with 4 thin rectangles)
            const fi = 0.3; // frame inset in inches
            const fw = 0.03; // frame width
            pptxSlide.addShape('rect' as any, { x: fi, y: fi, w: slideW - fi * 2, h: fw, fill: { color: colors.primary.replace('#', '') } }); // top
            pptxSlide.addShape('rect' as any, { x: fi, y: slideH - fi - fw, w: slideW - fi * 2, h: fw, fill: { color: colors.primary.replace('#', '') } }); // bottom
            pptxSlide.addShape('rect' as any, { x: fi, y: fi, w: fw, h: slideH - fi * 2, fill: { color: colors.primary.replace('#', '') } }); // left
            pptxSlide.addShape('rect' as any, { x: slideW - fi - fw, y: fi, w: fw, h: slideH - fi * 2, fill: { color: colors.primary.replace('#', '') } }); // right
            if (slide.categoryChip) {
              pptxSlide.addText(slide.categoryChip, {
                x: 0.8, y: slideH * 0.28, w: slideW - 1.6,
                fontSize: 8, color: colors.primary.replace('#', ''),
                charSpacing: 2, align: 'center',
              });
            }
            pptxSlide.addText(slide.headline || slide.title || '', {
              x: 1.0, y: slideH * 0.36, w: slideW - 2.0,
              fontSize: 28, fontFace: 'Malgun Gothic',
              bold: true, color: colors.primary.replace('#', ''), align: 'center',
            });
            if (slide.subtitle) {
              pptxSlide.addText(slide.subtitle, {
                x: 1.0, y: slideH * 0.62, w: slideW - 2.0,
                fontSize: 10, color: colors.accent2.replace('#', ''),
                align: 'center', charSpacing: 1,
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

      // ─── Chart slides ───
      case 'column-chart':
      case 'line-chart':
      case 'pie-chart':
      case 'bubble-chart':
        exportChartSlide(pptxSlide, slide, colors, slideW, slideH);
        break;

      case 'kpi-dashboard':
        exportKPIDashboard(pptxSlide, slide, colors, slideW, slideH);
        break;

      // ─── Matrix slides ───
      case 'comparison-table':
      case 'assessment-table':
        exportComparisonTable(pptxSlide, slide, colors, slideW, slideH);
        break;

      case 'bcg-matrix':
      case 'priority-matrix':
        exportMatrixSlide(pptxSlide, slide, colors, slideW, slideH);
        break;

      // ─── Structure slides ───
      case 'org-chart':
        exportOrgChart(pptxSlide, slide, colors, slideW, slideH);
        break;

      case 'timeline':
      case 'roadmap':
        exportTimeline(pptxSlide, slide, colors, slideW, slideH);
        break;

      case 'process-flow':
        exportProcessFlow(pptxSlide, slide, colors, slideW, slideH);
        break;

      // ─── Special slides ───
      case 'quote':
        exportQuote(pptxSlide, slide, colors, slideW, slideH);
        break;

      case 'two-column':
      case 'three-column':
        exportMultiColumn(pptxSlide, slide, colors, slideW, slideH);
        break;

      case 'stat-card':
        exportStatCard(pptxSlide, slide, colors, slideW, slideH);
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

          case 'card-grid': {
            // Light background + card-style sections
            pptxSlide.background = { color: 'FAFAFA' };
            // Chapter number + title
            pptxSlide.addText(`PART ${String(slide.partNumber||1).padStart(2,'0')} · ${slide.partTitle||''}`, {
              x: 0.7, y: 0.3, fontSize: 7,
              color: colors.accent2.replace('#', ''),
              bold: true, charSpacing: 2,
            });
            pptxSlide.addText(slide.chapterTitle || slide.title || '', {
              x: 1.2, y: 0.6, w: slideW - 1.8, fontSize: 18,
              bold: true, color: colors.primary.replace('#', ''),
            });
            // Section cards as bordered rounded rects with text
            let cardY = 1.3;
            for (const sec of (slide.sections || [])) {
              // Card background
              pptxSlide.addShape('roundRect' as any, {
                x: 0.7, y: cardY, w: slideW - 1.4, h: 1.6,
                fill: { color: 'FFFFFF' },
                line: { color: 'E8E8E8', width: 0.5 },
                rectRadius: 0.1,
              });
              if (sec.subTitle) {
                pptxSlide.addText(sec.subTitle, {
                  x: 0.9, y: cardY + 0.15, w: slideW - 1.8, fontSize: 14,
                  bold: true, color: colors.primary.replace('#', ''),
                });
              }
              if (sec.body) {
                pptxSlide.addText(sec.body, {
                  x: 0.9, y: cardY + 0.5, w: slideW - 1.8, fontSize: 10,
                  color: '2D2D2D', lineSpacing: 16,
                });
              }
              cardY += 1.8;
            }
            break;
          }

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

// ─── New slide type export helpers ───

function hexColor(c: string): string {
  return c.replace('#', '');
}

function exportChartSlide(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  const chart = slide.chartConfig;
  if (!chart) {
    pptxSlide.addText(slide.title || 'Chart', { x: 0.6, y: 0.6, fontSize: 20, bold: true, color: hexColor(colors.primary) });
    return;
  }

  // Title
  pptxSlide.addText(slide.title || chart.title || '', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  // Use PptxGenJS native chart if applicable
  const chartType = chart.type;
  const chartColors = [colors.primary, colors.accent, colors.accent2, colors.mute].map(hexColor);

  if (chartType === 'column' || chartType === 'bar' || chartType === 'line' || chartType === 'pie') {
    const chartData = chart.series.map((s, i) => ({
      name: s.name,
      labels: chart.categories || s.data.map((_, idx) => String(idx + 1)),
      values: s.data,
      color: hexColor(s.color || chartColors[i % chartColors.length]),
    }));

    const typeMap: Record<string, string> = { column: 'bar', bar: 'bar', line: 'line', pie: 'pie' };
    try {
      pptxSlide.addChart(typeMap[chartType] as any, chartData, {
        x: 0.5, y: 1.0, w: slideW - 1.0, h: slideH - 1.8,
        showLegend: chart.showLegend !== false,
        legendPos: 'b',
        catAxisLabelFontSize: 8,
        valAxisLabelFontSize: 8,
        barDir: chartType === 'bar' ? 'bar' : 'col',
      });
    } catch {
      // Fallback: text representation
      pptxSlide.addText(`[${chartType} chart: ${chart.series.map(s => s.name).join(', ')}]`, {
        x: 0.6, y: slideH / 2, w: slideW - 1.2, fontSize: 12, color: '666666', align: 'center',
      });
    }
  } else {
    // Bubble: text fallback
    pptxSlide.addText(`[Bubble chart: ${chart.series.map(s => s.name).join(', ')}]`, {
      x: 0.6, y: slideH / 2, w: slideW - 1.2, fontSize: 12, color: '666666', align: 'center',
    });
  }
}

function exportKPIDashboard(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, _slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  pptxSlide.addText(slide.title || 'KPI Dashboard', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  const metrics = slide.kpiMetrics || [];
  const cols = Math.min(metrics.length, 3);
  const cardW = (slideW - 1.2) / cols;
  const cardH = 1.5;

  metrics.forEach((m, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.6 + col * cardW;
    const y = 1.2 + row * (cardH + 0.3);

    pptxSlide.addShape('roundRect' as any, {
      x, y, w: cardW - 0.15, h: cardH,
      fill: { color: 'F8F9FA' }, line: { color: 'E0E0E0', width: 0.5 }, rectRadius: 0.08,
    });
    pptxSlide.addText(m.label, { x: x + 0.15, y: y + 0.15, fontSize: 9, color: hexColor(colors.accent2), bold: true });
    pptxSlide.addText(`${m.value}${m.unit ? ' ' + m.unit : ''}`, {
      x: x + 0.15, y: y + 0.5, fontSize: 24, bold: true, color: hexColor(colors.primary),
    });
    if (m.trendValue) {
      const trendColor = m.trend === 'up' ? '10B981' : m.trend === 'down' ? 'EF4444' : '6B7280';
      pptxSlide.addText(`${m.trend === 'up' ? '\u25B2' : m.trend === 'down' ? '\u25BC' : '\u25CF'} ${m.trendValue}`, {
        x: x + 0.15, y: y + cardH - 0.4, fontSize: 9, color: trendColor,
      });
    }
  });
}

function exportComparisonTable(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  pptxSlide.addText(slide.title || '', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  const headers = slide.comparisonHeaders || [];
  const rows = slide.comparisonRows || [];

  // Build table data
  const tableRows: any[][] = [];
  // Header row
  tableRows.push([
    { text: 'Criteria', options: { bold: true, color: 'FFFFFF', fill: { color: hexColor(colors.primary) } } },
    ...headers.map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: hexColor(colors.accent2) } } })),
  ]);
  // Data rows
  rows.forEach(row => {
    tableRows.push([
      { text: row.label, options: { bold: true, color: hexColor(colors.primary) } },
      ...row.values.map(v => ({ text: v })),
    ]);
  });

  try {
    pptxSlide.addTable(tableRows, {
      x: 0.5, y: 1.2, w: slideW - 1.0,
      fontSize: 9, border: { type: 'solid', pt: 0.5, color: 'E0E0E0' },
      colW: Array(headers.length + 1).fill((slideW - 1.0) / (headers.length + 1)),
      rowH: 0.4,
    });
  } catch {
    // fallback
    pptxSlide.addText('[Comparison table]', { x: 0.6, y: slideH / 2, fontSize: 12, color: '666666' });
  }
}

function exportMatrixSlide(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  const matrix = slide.matrixConfig;

  pptxSlide.addText(slide.title || '', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  if (!matrix) return;

  const size = Math.min(slideW - 2, slideH - 2.5);
  const ox = (slideW - size) / 2;
  const oy = 1.2;

  // Draw 4 quadrants
  pptxSlide.addShape('rect' as any, { x: ox, y: oy, w: size / 2, h: size / 2, fill: { color: hexColor(colors.primary) + '20' } });
  pptxSlide.addShape('rect' as any, { x: ox + size / 2, y: oy, w: size / 2, h: size / 2, fill: { color: hexColor(colors.accent) + '20' } });
  pptxSlide.addShape('rect' as any, { x: ox, y: oy + size / 2, w: size / 2, h: size / 2, fill: { color: hexColor(colors.accent2) + '15' } });
  pptxSlide.addShape('rect' as any, { x: ox + size / 2, y: oy + size / 2, w: size / 2, h: size / 2, fill: { color: hexColor(colors.mute) + '20' } });

  // Quadrant labels
  const quads = matrix.quadrants || [];
  if (quads[0]) pptxSlide.addText(quads[0].label, { x: ox + 0.1, y: oy + 0.1, fontSize: 9, bold: true, color: hexColor(colors.primary) });
  if (quads[1]) pptxSlide.addText(quads[1].label, { x: ox + size / 2 + 0.1, y: oy + 0.1, fontSize: 9, bold: true, color: hexColor(colors.accent) });
  if (quads[2]) pptxSlide.addText(quads[2].label, { x: ox + 0.1, y: oy + size / 2 + 0.1, fontSize: 9, bold: true, color: hexColor(colors.accent2) });
  if (quads[3]) pptxSlide.addText(quads[3].label, { x: ox + size / 2 + 0.1, y: oy + size / 2 + 0.1, fontSize: 9, bold: true, color: hexColor(colors.mute) });

  // Items
  matrix.items.forEach(item => {
    const cx = ox + (item.x / 100) * size;
    const cy = oy + size - (item.y / 100) * size;
    pptxSlide.addShape('ellipse' as any, {
      x: cx - 0.15, y: cy - 0.15, w: 0.3, h: 0.3,
      fill: { color: hexColor(colors.accent) },
    });
    pptxSlide.addText(item.label, { x: cx - 0.5, y: cy + 0.2, w: 1.0, fontSize: 7, align: 'center', color: '333333' });
  });

  // Axis labels
  if (matrix.xAxisLabel) pptxSlide.addText(matrix.xAxisLabel, { x: ox + size / 2 - 0.5, y: oy + size + 0.1, w: 1.0, fontSize: 8, align: 'center', color: '666666' });
  if (matrix.yAxisLabel) pptxSlide.addText(matrix.yAxisLabel, { x: ox - 0.6, y: oy + size / 2, fontSize: 8, color: '666666', rotate: 270 });
}

function exportOrgChart(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, _slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  pptxSlide.addText(slide.title || 'Organization', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  const root = slide.orgChart;
  if (!root) return;

  // Flatten tree to render as text-based org chart
  const renderLevel = (node: any, level: number, y: { val: number }) => {
    const indent = level * 0.4;
    pptxSlide.addText(`${'  '.repeat(level)}${level > 0 ? '\u2514 ' : ''}${node.name}${node.title ? ` (${node.title})` : ''}`, {
      x: 0.6 + indent, y: y.val, w: slideW - 1.2 - indent, fontSize: 10,
      color: level === 0 ? hexColor(colors.primary) : '333333',
      bold: level === 0,
    });
    y.val += 0.35;
    if (node.children) {
      for (const child of node.children) {
        renderLevel(child, level + 1, y);
      }
    }
  };
  renderLevel(root, 0, { val: 1.2 });
}

function exportTimeline(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  pptxSlide.addText(slide.title || '', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  const events = slide.timelineEvents || [];
  const startY = 1.3;
  const stepH = Math.min(0.8, (slideH - startY - 0.5) / events.length);

  // Vertical line
  pptxSlide.addShape('rect' as any, {
    x: 1.2, y: startY, w: 0.02, h: events.length * stepH,
    fill: { color: hexColor(colors.primary) },
  });

  events.forEach((ev, i) => {
    const y = startY + i * stepH;
    const statusColor = ev.status === 'completed' ? hexColor(colors.primary) : ev.status === 'in-progress' ? hexColor(colors.accent) : hexColor(colors.mute);

    // Dot
    pptxSlide.addShape('ellipse' as any, {
      x: 1.12, y: y + 0.05, w: 0.18, h: 0.18,
      fill: { color: statusColor },
    });
    // Date
    pptxSlide.addText(ev.date, { x: 0.2, y: y + 0.02, w: 0.85, fontSize: 8, bold: true, color: hexColor(colors.accent2), align: 'right' });
    // Title + description
    pptxSlide.addText(ev.title, { x: 1.5, y: y, w: slideW - 2.2, fontSize: 11, bold: true, color: hexColor(colors.primary) });
    if (ev.description) {
      pptxSlide.addText(ev.description, { x: 1.5, y: y + 0.25, w: slideW - 2.2, fontSize: 9, color: '666666' });
    }
  });
}

function exportProcessFlow(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  pptxSlide.addText(slide.title || '', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  const steps = slide.processSteps || [];
  const stepW = Math.min(1.5, (slideW - 1.2 - 0.3 * (steps.length - 1)) / steps.length);
  const startX = (slideW - stepW * steps.length - 0.3 * (steps.length - 1)) / 2;
  const y = slideH / 2 - 0.4;

  steps.forEach((step, i) => {
    const x = startX + i * (stepW + 0.3);
    const isTerminal = step.type === 'start' || step.type === 'end';
    const fillColor = isTerminal ? hexColor(colors.primary) : 'FFFFFF';
    const textColor = isTerminal ? 'FFFFFF' : hexColor(colors.primary);

    pptxSlide.addShape('roundRect' as any, {
      x, y, w: stepW, h: 0.8,
      fill: { color: fillColor },
      line: { color: hexColor(colors.primary), width: 1.5 },
      rectRadius: isTerminal ? 0.4 : 0.08,
    });
    pptxSlide.addText(step.label, {
      x, y: y + 0.15, w: stepW, fontSize: 9, bold: true, color: textColor, align: 'center',
    });
    if (step.description) {
      pptxSlide.addText(step.description, {
        x, y: y + 0.4, w: stepW, fontSize: 7, color: isTerminal ? 'FFFFFFCC' : '666666', align: 'center',
      });
    }
    // Arrow
    if (i < steps.length - 1) {
      pptxSlide.addText('\u25B6', {
        x: x + stepW, y: y + 0.25, w: 0.3, fontSize: 12, color: hexColor(colors.primary), align: 'center',
      });
    }
  });
}

function exportQuote(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  const quote = slide.quote;
  if (!quote) return;

  // Large quotation mark
  pptxSlide.addText('\u201C', {
    x: 0.6, y: slideH * 0.15, fontSize: 72, color: hexColor(colors.primary) + '30', fontFace: 'Georgia',
  });

  // Quote text
  pptxSlide.addText(quote.text, {
    x: 1.0, y: slideH * 0.3, w: slideW - 2.0, fontSize: 18, italic: true, color: hexColor(colors.primary), lineSpacing: 28,
  });

  // Author
  if (quote.author) {
    pptxSlide.addText(`\u2014 ${quote.author}${quote.source ? `, ${quote.source}` : ''}`, {
      x: 1.0, y: slideH * 0.7, w: slideW - 2.0, fontSize: 12, color: hexColor(colors.accent2),
    });
  }
}

function exportMultiColumn(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, _slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  pptxSlide.addText(slide.title || '', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  const columns = slide.columns || [];
  const colCount = slide.type === 'three-column' ? 3 : 2;
  const colW = (slideW - 1.2) / colCount;

  columns.slice(0, colCount).forEach((col, i) => {
    const x = 0.6 + i * colW;
    let y = 1.2;

    if (col.title) {
      pptxSlide.addText(col.title, { x, y, w: colW - 0.2, fontSize: 12, bold: true, color: hexColor(colors.primary) });
      y += 0.4;
    }
    if (col.body) {
      pptxSlide.addText(col.body, { x, y, w: colW - 0.2, fontSize: 10, color: '333333', lineSpacing: 16 });
      y += 0.8;
    }
    if (col.items) {
      col.items.forEach(item => {
        pptxSlide.addText(`\u2022 ${item}`, { x: x + 0.1, y, w: colW - 0.3, fontSize: 9, color: '555555' });
        y += 0.3;
      });
    }
  });
}

function exportStatCard(pptxSlide: any, slide: SlideData, colors: ColorScheme, slideW: number, _slideH: number): void {
  pptxSlide.background = { color: 'FFFFFF' };
  pptxSlide.addText(slide.title || '', {
    x: 0.6, y: 0.3, w: slideW - 1.2, fontSize: 18, bold: true, color: hexColor(colors.primary),
  });

  const stats = slide.statHighlight || [];
  const cols = Math.min(stats.length, 3);
  const cardW = (slideW - 1.4) / cols;
  const cardH = 1.8;

  stats.forEach((stat, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.7 + col * (cardW + 0.1);
    const y = 1.3 + row * (cardH + 0.2);
    const color = stat.color ? hexColor(stat.color) : hexColor(colors.primary);

    pptxSlide.addShape('roundRect' as any, {
      x, y, w: cardW - 0.1, h: cardH,
      fill: { color: 'F8F9FA' }, rectRadius: 0.1,
    });
    // Top accent bar
    pptxSlide.addShape('rect' as any, {
      x, y, w: cardW - 0.1, h: 0.04, fill: { color },
    });
    // Value
    pptxSlide.addText(stat.value, {
      x, y: y + 0.3, w: cardW - 0.1, fontSize: 28, bold: true, color, align: 'center',
    });
    // Label
    pptxSlide.addText(stat.label, {
      x, y: y + 1.0, w: cardW - 0.1, fontSize: 11, bold: true, color: hexColor(colors.primary), align: 'center',
    });
    // Description
    if (stat.description) {
      pptxSlide.addText(stat.description, {
        x: x + 0.1, y: y + 1.3, w: cardW - 0.3, fontSize: 8, color: '666666', align: 'center',
      });
    }
  });
}
