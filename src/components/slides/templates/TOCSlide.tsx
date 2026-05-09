import React from 'react';
import type { SlideData, ColorScheme } from '../../../types';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; }

export const TOCSlide: React.FC<Props> = ({ slide, colors, width, height }) => {
  return (
    <div style={{ position:'relative', width, height, background:'#fff' }}>
      {/* Header */}
      <div style={{ position:'absolute', left:57, top:57, width:width-114, height:1, background:colors.primary, zIndex:5 }} />
      <div style={{ position:'absolute', left:57, top:32, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontSize:10, letterSpacing:'0.28em', fontWeight:700, color:colors.primary }}>CONTENTS</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>{slide.subtitle || ''}</span>
      </div>
      {/* Title */}
      <div style={{ position:'absolute', left:94, top:110, width:width-188, zIndex:10 }}>
        <div style={{ fontSize:11, letterSpacing:'0.32em', fontWeight:800, color:colors.accent2 }}>CONTENTS</div>
        <div style={{ fontSize:34, fontWeight:900, color:colors.primary, lineHeight:1.1, marginTop:8 }}>{slide.title || '\uCC28 \uB840'}</div>
        <div style={{ width:60, height:3, background:colors.accent, marginTop:12 }} />
      </div>
      {/* TOC Sections */}
      {slide.tocSections?.map((section, si) => {
        const topY = 240 + si * 205;
        return (
          <React.Fragment key={si}>
            <div style={{ position:'absolute', left:94, top:topY, width:width-188, height:1, background:colors.primary, zIndex:4 }} />
            <div style={{ position:'absolute', left:94, top:topY+15, width:120, zIndex:10 }}>
              <div style={{ fontSize:9, letterSpacing:'0.32em', fontWeight:800, color:colors.accent2 }}>PART</div>
              <div style={{ fontSize:36, fontWeight:900, color:colors.primary, lineHeight:1, marginTop:2 }}>{section.partNumber}</div>
            </div>
            <div style={{ position:'absolute', left:230, top:topY+20, width:width-324, zIndex:10 }}>
              <div style={{ fontSize:20, fontWeight:800, color:colors.primary }}>{section.partTitle}</div>
              <div style={{ fontSize:11, fontWeight:500, color:colors.mute, lineHeight:1.7, marginTop:14 }}>
                {section.items.map((item, ii) => (
                  <div key={ii} style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', borderBottom: ii < section.items.length-1 ? `1px dashed ${colors.background}` : 'none' }}>
                    <span><span style={{ color:colors.accent, fontWeight:800 }}>{item.number}</span>&nbsp; {item.title}</span>
                    {item.page && <span style={{ fontWeight:700, color:colors.primary }}>{item.page}</span>}
                  </div>
                ))}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {/* How to use */}
      {slide.howToUse && (
        <>
          <div style={{ position:'absolute', left:94, top:height-253, width:width-188, height:160, background:colors.background, zIndex:1 }} />
          <div style={{ position:'absolute', left:94, top:height-253, width:6, height:160, background:colors.accent, zIndex:2 }} />
          <div style={{ position:'absolute', left:120, top:height-235, width:width-214, zIndex:10 }}>
            <div style={{ fontSize:10, letterSpacing:'0.3em', fontWeight:800, color:colors.accent2 }}>HOW TO USE</div>
            <div style={{ fontSize:13.3, color:colors.primary, marginTop:8, lineHeight:1.65 }}>{slide.howToUse}</div>
          </div>
        </>
      )}
      {/* Page number */}
      <div style={{ position:'absolute', left:57, top:height-48, width:width-114, zIndex:10, display:'flex', justifyContent:'flex-end' }}>
        <span style={{ fontSize:11, fontWeight:800, color:colors.primary }}>{slide.pageNumber ? `${String(slide.pageNumber).padStart(2,'0')} \u00B7 ${String(slide.pageNumber+1).padStart(2,'0')}` : ''}</span>
      </div>
    </div>
  );
};
