import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber, getShapeBorderRadius } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const DiagramSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const cmx = t.layout.contentMarginX;
  const chapterBoxRadius = getShapeBorderRadius(t.layout.chapterBox.shape, t.layout.chapterBox.size);

  return (
    <div style={{ position:'relative', width, height, background:'#fff', color:colors.primary }}>
      {/* Header */}
      <div style={{ position:'absolute', left:mx, top:t.layout.headerY, width:width-mx*2, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontSize:t.typography.labelText.fontSize, letterSpacing:t.typography.labelText.letterSpacing, fontWeight:t.typography.labelText.fontWeight, color:colors.accent2 }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>DIAGRAM</span>
      </div>
      <div style={{ position:'absolute', left:mx, top:t.layout.headerLineY, width:width-mx*2, height:1, background:colors.primary, zIndex:5 }} />
      {/* Sidebar */}
      {t.layout.sidebar.enabled && (
        <>
          <div style={{ position:'absolute', left:0, top:130, width:t.layout.sidebar.width, height:520, background:colors.primary, zIndex:5 }} />
          <div style={{ position:'absolute', left:0, top:130, width:t.layout.sidebar.width, height:t.layout.sidebar.accentHeight, background:colors.accent, zIndex:6 }} />
        </>
      )}
      {/* Chapter */}
      {t.layout.chapterBox.enabled && (
        <>
          <div style={{ position:'absolute', left:cmx, top:96, width:t.layout.chapterBox.size, height:t.layout.chapterBox.size, background:colors.accent, zIndex:5, borderRadius: chapterBoxRadius }} />
          <div style={{ position:'absolute', left:cmx, top:96, width:t.layout.chapterBox.size, height:t.layout.chapterBox.size, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:900, color:colors.primary, borderRadius: chapterBoxRadius }}>{String(slide.chapterNumber||1).padStart(2,'0')}</div>
        </>
      )}
      <div style={{ position:'absolute', left:t.layout.chapterBox.enabled ? cmx + t.layout.chapterBox.size + 17 : cmx, top:103, width:width - (t.layout.chapterBox.enabled ? cmx + t.layout.chapterBox.size + 17 : cmx) - mx, zIndex:10 }}>
        <div style={{ fontSize:t.typography.chapterLabel.fontSize, letterSpacing:t.typography.chapterLabel.letterSpacing, fontWeight:t.typography.chapterLabel.fontWeight, color:colors.accent2 }}>CHAPTER</div>
        <div style={{ fontSize:t.typography.chapterTitle.fontSize, fontWeight:t.typography.chapterTitle.fontWeight, color:colors.primary, lineHeight:t.typography.chapterTitle.lineHeight, marginTop:2 }}>{slide.chapterTitle||slide.title||''}</div>
      </div>
      {/* Body text */}
      {slide.sections?.[0]?.body && (
        <div style={{ position:'absolute', left:cmx, top:200, width:width-cmx-mx, zIndex:10 }}>
          <div style={{ fontSize:t.typography.bodyText.fontSize, color:'#2D2D2D', lineHeight:t.typography.bodyText.lineHeight, textAlign:t.typography.bodyText.textAlign }} dangerouslySetInnerHTML={{ __html: slide.sections[0].body.replace(/\n/g,'<br/>') }} />
        </div>
      )}
      {/* Diagram cards */}
      {slide.diagramCards && (
        <div style={{ position:'absolute', left:60, top:380, width:width-120, zIndex:10, display:'flex', gap:10, flexWrap:'wrap' }}>
          {slide.diagramCards.map((card, ci) => {
            const cardW = Math.floor((width-120-10*(slide.diagramCards!.length-1))/slide.diagramCards!.length);
            return (
              <div key={ci} style={{ width:cardW, border: t.decorations.diagram.cardBorder ? `1px solid ${colors.primary}` : 'none', background:'#fff', borderRadius: t.decorations.diagram.cardBorderRadius }}>
                <div style={{ height:t.decorations.diagram.headerHeight, background:card.headerColor||colors.primary, display:'flex', alignItems:'center', justifyContent:'center', borderRadius: t.decorations.diagram.cardBorderRadius > 0 ? `${t.decorations.diagram.cardBorderRadius}px ${t.decorations.diagram.cardBorderRadius}px 0 0` : undefined }}>
                  <span style={{ fontSize:11, letterSpacing:'0.24em', fontWeight:800, color: card.headerColor===colors.accent ? colors.primary : '#fff' }}>{card.title}</span>
                </div>
                <div style={{ padding:'8px 10px', fontSize:10.5, lineHeight:1.7, color:'#2D2D2D' }}>
                  {card.items.map((item, ii) => (
                    <div key={ii}><b style={{ color:colors.primary }}>{item.label}</b> {item.value}</div>
                  ))}
                  {card.difficulty && <div style={{ marginTop:6, paddingTop:6, borderTop:`1px dashed ${colors.background}`, color:colors.accent2, fontWeight:700 }}>{card.difficulty}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* List items */}
      {slide.listItems && (
        <div style={{ position:'absolute', left:cmx, top:700, width:width-cmx-mx, zIndex:10 }}>
          {slide.listItems.map((item, li) => (
            <div key={li} style={{ display:'flex', padding:'6px 0', borderBottom:`1px dashed #D6D0C2`, fontSize:t.typography.bodyText.fontSize, lineHeight:1.85 }}>
              <span style={{ width:90, fontWeight:800, color:colors.primary }}>{item.label}</span>
              <span style={{ color:'#2D2D2D' }}>{item.description}</span>
            </div>
          ))}
        </div>
      )}
      {/* Footer */}
      <div style={{ position:'absolute', left:mx, top:height-61, width:width-mx*2, height:1, background:t.layout.footer.lineColor, zIndex:5 }} />
      <div style={{ position:'absolute', left:mx, top:height-48, width:width-mx*2, zIndex:10, display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:9, color:colors.mute, fontFamily:'serif' }}>{slide.footnote||''}</span>
        <span style={{ fontSize:11, fontWeight:800, color:colors.primary }}>{formatPageNumber(slide.pageNumber||0, t.layout.footer.pageNumberFormat)}</span>
      </div>
    </div>
  );
};
