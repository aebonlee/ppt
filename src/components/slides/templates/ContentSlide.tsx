import React from 'react';
import type { SlideData, ColorScheme } from '../../../types';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; }

export const ContentSlide: React.FC<Props> = ({ slide, colors, width, height }) => {
  return (
    <div style={{ position:'relative', width, height, background:'#fff', color:colors.primary }}>
      {/* Header bar */}
      <div style={{ position:'absolute', left:57, top:36, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontSize:10, letterSpacing:'0.28em', fontWeight:800, color:colors.accent2 }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>{slide.subtitle||''}</span>
      </div>
      <div style={{ position:'absolute', left:57, top:62, width:width-114, height:1, background:colors.primary, zIndex:5 }} />
      {/* Sidebar */}
      <div style={{ position:'absolute', left:0, top:130, width:36, height:520, background:colors.primary, zIndex:5 }} />
      <div style={{ position:'absolute', left:0, top:130, width:36, height:80, background:colors.accent, zIndex:6 }} />
      <div style={{ position:'absolute', left:0, top:230, width:36, height:420, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ writingMode:'vertical-rl', transform:'rotate(180deg)', fontSize:10, letterSpacing:'0.42em', fontWeight:800, color:'#fff' }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</div>
      </div>
      {/* Chapter number */}
      <div style={{ position:'absolute', left:94, top:128, width:54, height:54, background:colors.accent, zIndex:5 }} />
      <div style={{ position:'absolute', left:94, top:128, width:54, height:54, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:900, color:colors.primary }}>{String(slide.chapterNumber||1).padStart(2,'0')}</div>
      <div style={{ position:'absolute', left:165, top:135, width:width-222, zIndex:10 }}>
        <div style={{ fontSize:11, letterSpacing:'0.3em', fontWeight:800, color:colors.accent2 }}>CHAPTER &middot; {slide.chapterNumber ? ['\u2460','\u2461','\u2462','\u2463','\u2464','\u2465','\u2466','\u2467'][slide.chapterNumber-1]||slide.chapterNumber : '\u2460'}</div>
        <div style={{ fontSize:27, fontWeight:900, color:colors.primary, lineHeight:1.25, marginTop:2 }}>{slide.chapterTitle||slide.title||''}</div>
      </div>
      {/* Content sections */}
      {slide.sections?.map((sec, si) => {
        const topY = 230 + si * 250;
        return (
          <React.Fragment key={si}>
            {sec.subTitle && (
              <div style={{ position:'absolute', left:94, top:topY, width:width-188, zIndex:10, display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:8, height:8, background:colors.accent2 }} />
                <div style={{ fontSize:23, fontWeight:800, color:colors.primary }}>{sec.subTitle}</div>
              </div>
            )}
            {sec.keyTopic && (
              <div style={{ position:'absolute', left:94, top:topY+50, width:width-188, zIndex:10 }}>
                <div style={{ fontSize:20, fontWeight:800, color:colors.primary }}><span style={{ color:colors.accent }}>&diams;</span>&nbsp; {sec.keyTopic}</div>
              </div>
            )}
            {sec.body && (
              <div style={{ position:'absolute', left:94, top:topY+(sec.subTitle?86:sec.keyTopic?36:0), width:width-188, zIndex:10 }}>
                <div style={{ fontSize:13.3, fontWeight:400, color:'#2D2D2D', lineHeight:1.75, textAlign:'justify' }} dangerouslySetInnerHTML={{ __html: sec.body.replace(/\n/g, '<br/>') }} />
              </div>
            )}
            {sec.keyPoint && (
              <div style={{ position:'absolute', left:94, top:Math.min(topY+200, height-190), width:width-188, zIndex:10 }}>
                <div style={{ background: sec.keyPoint.type==='caution' ? '#FFEEE6' : '#FFF6D6', padding:'14px 20px', borderLeft: `5px solid ${sec.keyPoint.type==='caution' ? colors.accent2 : colors.accent}` }}>
                  <div style={{ fontSize:11, letterSpacing:'0.28em', fontWeight:800, color: sec.keyPoint.type==='caution' ? '#C0392B' : colors.accent }}>{sec.keyPoint.title || 'KEY POINT'}</div>
                  <div style={{ fontSize:13.3, fontWeight:600, color:colors.primary, marginTop:5, lineHeight:1.6 }}>{sec.keyPoint.content}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      {/* Footnote */}
      <div style={{ position:'absolute', left:57, top:height-61, width:width-114, height:1, background:'#D6D0C2', zIndex:5 }} />
      <div style={{ position:'absolute', left:57, top:height-48, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:9, color:colors.mute, fontFamily:'serif' }}>{slide.footnote||''}</span>
        <span style={{ fontSize:11, fontWeight:800, color:colors.primary }}>{String(slide.pageNumber||0).padStart(3,'0')}</span>
      </div>
    </div>
  );
};
