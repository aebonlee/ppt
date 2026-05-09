import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { getShapeBorderRadius } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const CoverSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const contentW = width - mx * 2;
  const topH = Math.round(height * t.decorations.cover.topPanelRatio);
  const chipRadius = getShapeBorderRadius(t.decorations.cover.categoryChip.shape, 34);

  return (
    <div style={{ position:'relative', width, height, background: colors.background }}>
      {/* Top panel */}
      <div style={{ position:'absolute', left:0, top:0, width, height:topH, background:colors.primary, zIndex:1 }} />
      {/* Grid overlay */}
      {t.decorations.cover.gridOverlay && (
        <div style={{ position:'absolute', left:0, top:0, width, height:topH, backgroundImage:`linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize:'42px 42px', zIndex:2 }} />
      )}
      {/* Corner accents */}
      {t.decorations.cover.cornerAccents && t.decorations.cover.cornerSize > 0 && (
        <>
          <div style={{ position:'absolute', left:0, top:0, width:t.decorations.cover.cornerSize, height:10, background:colors.accent, zIndex:5 }} />
          <div style={{ position:'absolute', left:0, top:0, width:10, height:t.decorations.cover.cornerSize, background:colors.accent, zIndex:5 }} />
        </>
      )}
      {/* Category chip */}
      {slide.categoryChip && (
        <>
          <div style={{ position:'absolute', left:mx, top:140, width:280, height:34, background:colors.accent, zIndex:5, borderRadius: chipRadius }} />
          <div style={{ position:'absolute', left:mx, top:140, width:280, height:34, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, letterSpacing:'0.22em', fontWeight:800, color:colors.primary, borderRadius: chipRadius }}>
            {slide.categoryChip}
          </div>
        </>
      )}
      {/* Headline */}
      <div style={{ position:'absolute', left:mx, top:200, width:contentW, zIndex:10, color:'#fff' }}>
        <div style={{ fontSize:t.typography.coverHeadline.fontSize, fontWeight:t.typography.coverHeadline.fontWeight, lineHeight:t.typography.coverHeadline.lineHeight, letterSpacing:t.typography.coverHeadline.letterSpacing }}
          dangerouslySetInnerHTML={{ __html: (slide.headline || slide.title || '').replace(/\n/g, '<br/>') }} />
      </div>
      {/* Subtitle */}
      {slide.subtitle && (
        <div style={{ position:'absolute', left:mx, top:topH-110, width:contentW, zIndex:10 }}>
          <div style={{ fontSize:t.typography.coverSubtitle.fontSize, fontWeight:t.typography.coverSubtitle.fontWeight, letterSpacing:t.typography.coverSubtitle.letterSpacing, color:colors.accent }}>{slide.subtitle}</div>
        </div>
      )}
      {/* Part index */}
      {slide.partIndex && slide.partIndex.length > 0 && (
        <>
          <div style={{ position:'absolute', left:mx, top:height-203, width:contentW, height:1, background:colors.primary, zIndex:5 }} />
          <div style={{ position:'absolute', left:mx, top:height-185, width:contentW, zIndex:10, display:'flex', gap:30 }}>
            {slide.partIndex.map((p, i) => (
              <div key={i} style={{ flex:1 }}>
                <div style={{ fontSize:9, letterSpacing:'0.3em', fontWeight:700, color:colors.accent2 }}>{p.partNumber}</div>
                <div style={{ fontSize:12, fontWeight:700, color:colors.primary, marginTop:5 }}>{p.title}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Publisher info */}
      {slide.publisherInfo && (
        <div style={{ position:'absolute', left:mx, top:height-83, width:contentW, zIndex:10, display:'flex', justifyContent:'space-between' }}>
          <div style={{ fontSize:10, fontWeight:700, color:colors.primary }}>{slide.publisherInfo.left}</div>
          <div style={{ fontSize:9, color:colors.mute }}>{slide.publisherInfo.right}</div>
        </div>
      )}
    </div>
  );
};
