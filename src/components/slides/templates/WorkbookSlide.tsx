import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber, getShapeBorderRadius } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const WorkbookSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const cmx = t.layout.contentMarginX;
  const contentW = width - cmx - mx;
  const stepSize = t.decorations.workbook.stepBlockSize;
  const stepRadius = getShapeBorderRadius(t.decorations.workbook.stepBlockShape, stepSize);
  const checkRadius = t.decorations.workbook.checkboxShape === 'circle' ? '50%' : '0';

  return (
    <div style={{ position:'relative', width, height, background:'#fff', color:colors.primary }}>
      {/* Header */}
      <div style={{ position:'absolute', left:mx, top:t.layout.headerY, width:width-mx*2, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontSize:t.typography.labelText.fontSize, letterSpacing:t.typography.labelText.letterSpacing, fontWeight:t.typography.labelText.fontWeight, color:colors.accent2 }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>WORKBOOK</span>
      </div>
      <div style={{ position:'absolute', left:mx, top:t.layout.headerLineY, width:width-mx*2, height:1, background:colors.primary, zIndex:5 }} />
      {/* Sidebar */}
      {t.layout.sidebar.enabled && (
        <>
          <div style={{ position:'absolute', left:0, top:130, width:t.layout.sidebar.width, height:520, background:colors.primary, zIndex:5 }} />
          <div style={{ position:'absolute', left:0, top:130, width:t.layout.sidebar.width, height:t.layout.sidebar.accentHeight, background:colors.accent, zIndex:6 }} />
        </>
      )}
      {/* STEP block */}
      <div style={{ position:'absolute', left:cmx, top:96, width:stepSize, height:stepSize, background:colors.primary, zIndex:5, borderRadius: stepRadius }} />
      <div style={{ position:'absolute', left:cmx, top:104, width:stepSize, zIndex:11, textAlign:'center', color:'#fff' }}>
        <div style={{ fontSize:9, letterSpacing:'0.32em', fontWeight:800, color:colors.accent }}>STEP</div>
        <div style={{ fontSize:36, fontWeight:900, lineHeight:1, marginTop:4 }}>{String(slide.stepNumber||1).padStart(2,'0')}</div>
        <div style={{ fontSize:8, letterSpacing:'0.18em', fontWeight:600, color:'rgba(255,255,255,0.6)', marginTop:6 }}>{slide.stepLabel||''}</div>
      </div>
      {/* Title */}
      <div style={{ position:'absolute', left:cmx + stepSize + 16, top:96, width:width - cmx - stepSize - 16 - mx, zIndex:10 }}>
        <div style={{ fontSize:t.typography.chapterLabel.fontSize, letterSpacing:t.typography.chapterLabel.letterSpacing, fontWeight:t.typography.chapterLabel.fontWeight, color:colors.accent2 }}>CHAPTER &middot; WORKBOOK</div>
        <div style={{ fontSize:t.typography.chapterTitle.fontSize, fontWeight:t.typography.chapterTitle.fontWeight, color:colors.primary, lineHeight:t.typography.chapterTitle.lineHeight, marginTop:2 }}>{slide.title||''}</div>
      </div>
      {/* Learning objective */}
      {slide.learningObjective && (
        <>
          <div style={{ position:'absolute', left:cmx, top:218, width:contentW, height:78, background:'#FFF6D6', zIndex:1, borderRadius: t.decorations.calloutStyle.borderRadius }} />
          <div style={{ position:'absolute', left:cmx, top:218, width:t.decorations.calloutStyle.borderLeftWidth, height:78, background:colors.accent, zIndex:2 }} />
          <div style={{ position:'absolute', left:cmx+20, top:230, width:contentW-20, zIndex:10 }}>
            <div style={{ fontSize:t.typography.labelText.fontSize, letterSpacing:t.typography.labelText.letterSpacing, fontWeight:t.typography.labelText.fontWeight, color:colors.accent }}>LEARNING OBJECTIVE</div>
            <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:500, color:colors.primary, marginTop:5, lineHeight:1.6 }}>{slide.learningObjective}</div>
          </div>
        </>
      )}
      {/* Scenario */}
      {slide.scenario && (
        <>
          <div style={{ position:'absolute', left:cmx, top:312, width:contentW, height:78, background:colors.background, zIndex:1, borderRadius: t.decorations.calloutStyle.borderRadius }} />
          <div style={{ position:'absolute', left:cmx, top:312, width:t.decorations.calloutStyle.borderLeftWidth, height:78, background:colors.primary, zIndex:2 }} />
          <div style={{ position:'absolute', left:cmx+20, top:324, width:contentW-20, zIndex:10 }}>
            <div style={{ fontSize:t.typography.labelText.fontSize, letterSpacing:t.typography.labelText.letterSpacing, fontWeight:t.typography.labelText.fontWeight, color:colors.primary }}>SCENARIO</div>
            <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:500, color:'#2D2D2D', marginTop:5, lineHeight:1.6 }}>{slide.scenario}</div>
          </div>
        </>
      )}
      {/* Steps */}
      {slide.steps && (
        <div style={{ position:'absolute', left:cmx, top:412, width:contentW, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:8, height:8, background:colors.accent2, borderRadius: t.decorations.bulletStyle === 'circle' ? '50%' : 0 }} />
            <div style={{ fontSize:20, fontWeight:800, color:colors.primary }}>Steps</div>
          </div>
          <div style={{ fontSize:t.typography.bodyText.fontSize, lineHeight:1.85, color:'#2D2D2D', marginTop:16 }}>
            {slide.steps.map((step, si) => (
              <div key={si} style={{ marginBottom:6 }}>
                <b style={{ color:colors.accent2 }}>{step.number})</b>&nbsp; {step.title}
                {step.description && <div style={{ color:colors.mute, paddingLeft:18, display:'block' }}>{step.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Checklist */}
      {slide.checklist && (
        <div style={{ position:'absolute', left:cmx, top:710, width:contentW, border: t.decorations.workbook.checklistBorder !== 'none' ? `2px ${t.decorations.workbook.checklistBorder} ${colors.primary}` : 'none', padding:16, zIndex:10, borderRadius: t.decorations.calloutStyle.borderRadius }}>
          <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:800, color:colors.primary, marginBottom:10 }}>Checklist</div>
          {slide.checklist.map((item, ci) => (
            <div key={ci} style={{ fontSize:11.5, color:'#2D2D2D', lineHeight:1.7, marginBottom:6 }}>
              {item.label}: {item.options.map((opt, oi) => (
                <span key={oi} style={{ display:'inline-flex', alignItems:'center', gap:5, marginLeft:8 }}>
                  <span style={{ width:t.decorations.workbook.checkboxSize, height:t.decorations.workbook.checkboxSize, border:`1.5px solid ${colors.primary}`, display:'inline-block', borderRadius: checkRadius }} />{opt}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      {/* Caution */}
      {slide.caution && (
        <div style={{ position:'absolute', left:cmx, top:height-220, width:contentW, zIndex:10 }}>
          <div style={{ background:'#FFEEE6', padding:'14px 20px', borderLeft:`${t.decorations.calloutStyle.borderLeftWidth}px solid ${colors.accent2}`, borderRadius: t.decorations.calloutStyle.borderRadius }}>
            <div style={{ fontSize:t.typography.labelText.fontSize, letterSpacing:t.typography.labelText.letterSpacing, fontWeight:t.typography.labelText.fontWeight, color:'#C0392B' }}>CAUTION</div>
            <div style={{ fontSize:12.5, fontWeight:500, color:colors.primary, marginTop:4, lineHeight:1.55 }}>{slide.caution}</div>
          </div>
        </div>
      )}
      {/* Code block */}
      {slide.workbookCode && (
        <div style={{ position:'absolute', left:cmx, top:height-130, width:contentW, zIndex:10 }}>
          <div style={{ display:'inline-block', fontSize:t.typography.labelText.fontSize, letterSpacing:'0.24em', fontWeight:800, color:colors.primary, padding:'4px 10px', background:colors.accent }}>{slide.workbookCode.label}</div>
          <span style={{ fontSize:12.5, fontWeight:600, color:colors.primary, marginLeft:8 }}>{slide.workbookCode.title}</span>
          <div style={{ fontSize:11.5, color: t.decorations.codeBlock.background === '#1E1E1E' ? '#D4D4D4' : colors.primary, marginTop:6, padding:'6px 10px', background:t.decorations.codeBlock.background, borderLeft: t.decorations.codeBlock.borderLeftWidth > 0 ? `${t.decorations.codeBlock.borderLeftWidth}px solid ${colors.primary}` : 'none', fontFamily:"'D2Coding','Consolas',monospace", whiteSpace:'pre-wrap' }}>{slide.workbookCode.content}</div>
        </div>
      )}
      {/* Footer */}
      <div style={{ position:'absolute', left:mx, top:height-48, width:width-mx*2, zIndex:10, display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:9, color:colors.mute, fontFamily:'serif' }}>{slide.footnote||''}</span>
        <span style={{ fontSize:11, fontWeight:800, color:colors.primary }}>{formatPageNumber(slide.pageNumber||0, t.layout.footer.pageNumberFormat)}</span>
      </div>
    </div>
  );
};
