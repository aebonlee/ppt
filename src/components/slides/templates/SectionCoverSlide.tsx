import React from 'react';
import type { SlideData, ColorScheme } from '../../../types';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; }

export const SectionCoverSlide: React.FC<Props> = ({ slide, colors, width, height }) => {
  const partNum = String(slide.partNumber || 1).padStart(2, '0');
  return (
    <div style={{ position:'relative', width, height, background:colors.background }}>
      {/* Header */}
      <div style={{ position:'absolute', left:57, top:57, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:10, letterSpacing:'0.32em', fontWeight:800, color:colors.primary }}>{slide.subtitle || ''}</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>2026 EDITION</span>
      </div>
      {/* PART label */}
      <div style={{ position:'absolute', left:94, top:280, width:width-188, zIndex:10 }}>
        <div style={{ fontSize:14, letterSpacing:'0.4em', fontWeight:800, color:colors.accent2 }}>PART</div>
      </div>
      <div style={{ position:'absolute', left:94, top:298, width:width-188, zIndex:10 }}>
        <div style={{ fontSize:200, fontWeight:900, color:colors.primary, lineHeight:1, letterSpacing:'-0.06em' }}>{partNum}</div>
      </div>
      {/* Accent bar */}
      <div style={{ position:'absolute', left:94, top:520, width:120, height:6, background:colors.accent, zIndex:5 }} />
      {/* Title */}
      <div style={{ position:'absolute', left:94, top:550, width:width-188, zIndex:10 }}>
        <div style={{ fontSize:27, fontWeight:900, color:colors.primary, lineHeight:1.2 }}>{slide.title || slide.partTitle || ''}</div>
        {slide.subtitle && <div style={{ fontSize:13, fontWeight:500, color:colors.mute, marginTop:10, fontFamily:'serif' }}>{slide.subtitle}</div>}
      </div>
      {/* Chapter list */}
      {slide.chapters && slide.chapters.length > 0 && (
        <>
          <div style={{ position:'absolute', left:94, top:680, width:width-188, height:1, background:colors.primary, zIndex:4 }} />
          <div style={{ position:'absolute', left:94, top:700, width:width-188, zIndex:10 }}>
            <div style={{ fontSize:10, letterSpacing:'0.3em', fontWeight:800, color:colors.accent2 }}>CHAPTERS IN THIS PART</div>
          </div>
          {slide.chapters.map((ch, ci) => (
            <React.Fragment key={ci}>
              <div style={{ position:'absolute', left:94, top:740+ci*70, width:36, height:36, background:colors.accent, zIndex:5 }} />
              <div style={{ position:'absolute', left:94, top:740+ci*70, width:36, height:36, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:colors.primary }}>{ch.number}</div>
              <div style={{ position:'absolute', left:148, top:744+ci*70, width:width-242, zIndex:10 }}>
                <div style={{ fontSize:18, fontWeight:800, color:colors.primary }}>{ch.title}</div>
                <div style={{ fontSize:11, color:colors.mute, marginTop:3, lineHeight:1.5 }}>{ch.description}</div>
              </div>
            </React.Fragment>
          ))}
        </>
      )}
      {/* Page number */}
      <div style={{ position:'absolute', left:width-157, top:height-48, width:100, zIndex:10, textAlign:'right' }}>
        <div style={{ fontSize:11, fontWeight:800, color:colors.primary }}>&mdash; {String(slide.pageNumber || 0).padStart(3,'0')} &mdash;</div>
      </div>
    </div>
  );
};
