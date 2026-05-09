import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber, getShapeBorderRadius } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const SectionCoverSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const cmx = t.layout.contentMarginX;
  const contentW = width - cmx - mx;
  const partNum = String(slide.partNumber || 1).padStart(2, '0');
  const chapterBoxRadius = getShapeBorderRadius(t.layout.chapterBox.shape, t.layout.chapterBox.size > 0 ? 36 : 36);

  return (
    <div style={{ position:'relative', width, height, background:colors.background }}>
      {/* Header */}
      <div style={{ position:'absolute', left:mx, top:57, width:width-mx*2, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:t.typography.labelText.fontSize, letterSpacing:'0.32em', fontWeight:t.typography.labelText.fontWeight, color:colors.primary }}>{slide.subtitle || ''}</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>2026 EDITION</span>
      </div>
      {/* PART label */}
      <div style={{ position:'absolute', left:cmx, top:280, width:contentW, zIndex:10 }}>
        <div style={{ fontSize:14, letterSpacing:'0.4em', fontWeight:800, color:colors.accent2 }}>PART</div>
      </div>
      <div style={{ position:'absolute', left:cmx, top:298, width:contentW, zIndex:10 }}>
        <div style={{ fontSize:t.decorations.sectionCover.partNumberFontSize, fontWeight:900, color:colors.primary, lineHeight:1, letterSpacing:'-0.06em' }}>{partNum}</div>
      </div>
      {/* Accent bar */}
      <div style={{ position:'absolute', left:cmx, top:520, width:t.decorations.sectionCover.accentBarWidth, height:t.decorations.sectionCover.accentBarHeight, background:colors.accent, zIndex:5 }} />
      {/* Title */}
      <div style={{ position:'absolute', left:cmx, top:550, width:contentW, zIndex:10 }}>
        <div style={{ fontSize:t.typography.chapterTitle.fontSize, fontWeight:t.typography.chapterTitle.fontWeight, color:colors.primary, lineHeight:1.2 }}>{slide.title || slide.partTitle || ''}</div>
        {slide.subtitle && <div style={{ fontSize:13, fontWeight:500, color:colors.mute, marginTop:10, fontFamily:'serif' }}>{slide.subtitle}</div>}
      </div>
      {/* Chapter list */}
      {slide.chapters && slide.chapters.length > 0 && (
        <>
          <div style={{ position:'absolute', left:cmx, top:680, width:contentW, height:1, background:colors.primary, zIndex:4 }} />
          <div style={{ position:'absolute', left:cmx, top:700, width:contentW, zIndex:10 }}>
            <div style={{ fontSize:t.typography.labelText.fontSize, letterSpacing:t.typography.labelText.letterSpacing, fontWeight:t.typography.labelText.fontWeight, color:colors.accent2 }}>CHAPTERS IN THIS PART</div>
          </div>
          {slide.chapters.map((ch, ci) => (
            <React.Fragment key={ci}>
              <div style={{ position:'absolute', left:cmx, top:740+ci*70, width:36, height:36, background:colors.accent, zIndex:5, borderRadius: chapterBoxRadius }} />
              <div style={{ position:'absolute', left:cmx, top:740+ci*70, width:36, height:36, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:colors.primary, borderRadius: chapterBoxRadius }}>{ch.number}</div>
              <div style={{ position:'absolute', left:cmx+54, top:744+ci*70, width:contentW-54, zIndex:10 }}>
                <div style={{ fontSize:18, fontWeight:800, color:colors.primary }}>{ch.title}</div>
                <div style={{ fontSize:11, color:colors.mute, marginTop:3, lineHeight:1.5 }}>{ch.description}</div>
              </div>
            </React.Fragment>
          ))}
        </>
      )}
      {/* Page number */}
      <div style={{ position:'absolute', left:width-157, top:height-48, width:100, zIndex:10, textAlign:'right' }}>
        <div style={{ fontSize:11, fontWeight:800, color:colors.primary }}>{formatPageNumber(slide.pageNumber || 0, t.layout.footer.pageNumberFormat)}</div>
      </div>
    </div>
  );
};
