import React from 'react';
import type { SlideData, ColorScheme } from '../../../types';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; }

export const SummarySlide: React.FC<Props> = ({ slide, colors, width, height }) => {
  return (
    <div style={{ position:'relative', width, height, background:colors.primary }}>
      {/* Dot pattern */}
      <div style={{ position:'absolute', left:0, top:0, width, height, backgroundImage:`radial-gradient(circle, rgba(${colors.accent === '#F4B400' ? '244,180,0' : '255,255,255'},0.12) 1.4px, transparent 1.4px)`, backgroundSize:'38px 38px', zIndex:1 }} />
      {/* Corner marks */}
      <div style={{ position:'absolute', left:0, top:0, width:120, height:10, background:colors.accent, zIndex:5 }} />
      <div style={{ position:'absolute', left:0, top:0, width:10, height:120, background:colors.accent, zIndex:5 }} />
      {/* Header */}
      <div style={{ position:'absolute', left:57, top:57, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, letterSpacing:'0.32em', fontWeight:800, color:colors.accent }}>WRAP-UP</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:'rgba(255,255,255,0.5)' }}>2026</span>
      </div>
      {/* Title */}
      <div style={{ position:'absolute', left:94, top:140, width:width-188, zIndex:10, color:'#fff' }}>
        <div style={{ fontSize:14, letterSpacing:'0.4em', fontWeight:800, color:colors.accent }}>SUMMARY</div>
        <div style={{ fontSize:48, fontWeight:900, lineHeight:1.15, letterSpacing:'-0.03em', marginTop:12 }} dangerouslySetInnerHTML={{ __html: (slide.summaryHeadline||slide.title||'').replace(/\n/g,'<br/>') }} />
      </div>
      {/* Divider */}
      <div style={{ position:'absolute', left:94, top:380, width:width-188, height:1, background:'rgba(255,255,255,0.18)', zIndex:5 }} />
      {/* Summary items */}
      {slide.summaryItems?.map((item, si) => {
        const topY = 400 + si * 140;
        return (
          <React.Fragment key={si}>
            <div style={{ position:'absolute', left:94, top:topY, width:170, zIndex:10, color:'#fff' }}>
              <div style={{ fontSize:11, letterSpacing:'0.32em', fontWeight:800, color:colors.accent }}>{item.partLabel}</div>
              <div style={{ fontSize:18, fontWeight:800, lineHeight:1.3, marginTop:6 }}>{item.title}</div>
            </div>
            <div style={{ position:'absolute', left:284, top:topY, width:width-378, zIndex:10, color:'rgba(255,255,255,0.78)' }}>
              <div style={{ fontSize:13.3, lineHeight:1.75, fontWeight:400 }}>{item.description}</div>
            </div>
            {si < (slide.summaryItems?.length||0)-1 && (
              <div style={{ position:'absolute', left:94, top:topY+120, width:width-188, height:1, background:'rgba(255,255,255,0.18)', zIndex:5 }} />
            )}
          </React.Fragment>
        );
      })}
      {/* FROM HERE block */}
      {slide.fromHere && (
        <div style={{ position:'absolute', left:94, top:height-283, width:width-188, zIndex:10 }}>
          <div style={{ background:colors.accent, padding:'18px 26px', color:colors.primary }}>
            <div style={{ fontSize:11, letterSpacing:'0.32em', fontWeight:800 }}>FROM HERE</div>
            <div style={{ fontSize:21, fontWeight:900, lineHeight:1.35, marginTop:8 }} dangerouslySetInnerHTML={{ __html: slide.fromHere.replace(/\n/g,'<br/>') }} />
          </div>
        </div>
      )}
      {/* Page number */}
      <div style={{ position:'absolute', left:width-157, top:height-48, width:100, zIndex:10, textAlign:'right' }}>
        <div style={{ fontSize:11, fontWeight:800, color:colors.accent }}>&mdash; {String(slide.pageNumber||0).padStart(3,'0')} &mdash;</div>
      </div>
    </div>
  );
};
