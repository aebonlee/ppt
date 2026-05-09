import React from 'react';
import type { SlideData, ColorScheme } from '../../../types';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; }

export const CoverSlide: React.FC<Props> = ({ slide, colors, width, height }) => {
  const topH = Math.round(height * 0.5);
  return (
    <div style={{ position:'relative', width, height, background: colors.background }}>
      {/* Top panel */}
      <div style={{ position:'absolute', left:0, top:0, width, height:topH, background:colors.primary, zIndex:1 }} />
      {/* Grid overlay */}
      <div style={{ position:'absolute', left:0, top:0, width, height:topH, backgroundImage:`linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize:'42px 42px', zIndex:2 }} />
      {/* Corner accent */}
      <div style={{ position:'absolute', left:0, top:0, width:84, height:10, background:colors.accent, zIndex:5 }} />
      <div style={{ position:'absolute', left:0, top:0, width:10, height:84, background:colors.accent, zIndex:5 }} />
      {/* Category chip */}
      {slide.categoryChip && (
        <>
          <div style={{ position:'absolute', left:57, top:140, width:280, height:34, background:colors.accent, zIndex:5 }} />
          <div style={{ position:'absolute', left:57, top:140, width:280, height:34, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, letterSpacing:'0.22em', fontWeight:800, color:colors.primary }}>
            {slide.categoryChip}
          </div>
        </>
      )}
      {/* Headline */}
      <div style={{ position:'absolute', left:57, top:200, width:width-114, zIndex:10, color:'#fff' }}>
        <div style={{ fontSize:42, fontWeight:800, lineHeight:1.18, letterSpacing:'-0.025em' }}
          dangerouslySetInnerHTML={{ __html: (slide.headline || slide.title || '').replace(/\n/g, '<br/>') }} />
      </div>
      {/* Subtitle */}
      {slide.subtitle && (
        <div style={{ position:'absolute', left:57, top:topH-110, width:width-114, zIndex:10 }}>
          <div style={{ fontSize:13, fontWeight:600, letterSpacing:'0.04em', color:colors.accent }}>{slide.subtitle}</div>
        </div>
      )}
      {/* Part index */}
      {slide.partIndex && slide.partIndex.length > 0 && (
        <>
          <div style={{ position:'absolute', left:57, top:height-203, width:width-114, height:1, background:colors.primary, zIndex:5 }} />
          <div style={{ position:'absolute', left:57, top:height-185, width:width-114, zIndex:10, display:'flex', gap:30 }}>
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
        <div style={{ position:'absolute', left:57, top:height-83, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between' }}>
          <div style={{ fontSize:10, fontWeight:700, color:colors.primary }}>{slide.publisherInfo.left}</div>
          <div style={{ fontSize:9, color:colors.mute }}>{slide.publisherInfo.right}</div>
        </div>
      )}
    </div>
  );
};
