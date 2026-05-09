import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { getBulletChar, formatPageNumber, getShapeBorderRadius } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const ContentSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const cmx = t.layout.contentMarginX;
  const bullet = getBulletChar(t.decorations.bulletStyle);
  const chapterBoxRadius = getShapeBorderRadius(t.layout.chapterBox.shape, t.layout.chapterBox.size);

  return (
    <div style={{ position:'relative', width, height, background:'#fff', color:colors.primary }}>
      {/* Header bar */}
      <div style={{ position:'absolute', left:mx, top:t.layout.headerY, width:width-mx*2, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontSize:t.typography.labelText.fontSize, letterSpacing:t.typography.labelText.letterSpacing, fontWeight:t.typography.labelText.fontWeight, color:colors.accent2 }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>{slide.subtitle||''}</span>
      </div>
      <div style={{ position:'absolute', left:mx, top:t.layout.headerLineY, width:width-mx*2, height:1, background:colors.primary, zIndex:5 }} />
      {/* Sidebar */}
      {t.layout.sidebar.enabled && (
        <>
          <div style={{ position:'absolute', left:0, top:130, width:t.layout.sidebar.width, height:520, background:colors.primary, zIndex:5 }} />
          <div style={{ position:'absolute', left:0, top:130, width:t.layout.sidebar.width, height:t.layout.sidebar.accentHeight, background:colors.accent, zIndex:6 }} />
          {t.layout.sidebar.width >= 20 && (
            <div style={{ position:'absolute', left:0, top:230, width:t.layout.sidebar.width, height:420, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ writingMode:'vertical-rl', transform:'rotate(180deg)', fontSize:10, letterSpacing:'0.42em', fontWeight:800, color:'#fff' }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</div>
            </div>
          )}
        </>
      )}
      {/* Chapter number */}
      {t.layout.chapterBox.enabled && (
        <>
          <div style={{ position:'absolute', left:cmx, top:128, width:t.layout.chapterBox.size, height:t.layout.chapterBox.size, background:colors.accent, zIndex:5, borderRadius: chapterBoxRadius }} />
          <div style={{ position:'absolute', left:cmx, top:128, width:t.layout.chapterBox.size, height:t.layout.chapterBox.size, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:900, color:colors.primary, borderRadius: chapterBoxRadius }}>{String(slide.chapterNumber||1).padStart(2,'0')}</div>
        </>
      )}
      <div style={{ position:'absolute', left:t.layout.chapterBox.enabled ? cmx + t.layout.chapterBox.size + 17 : cmx, top:135, width:width - (t.layout.chapterBox.enabled ? cmx + t.layout.chapterBox.size + 17 : cmx) - mx, zIndex:10 }}>
        <div style={{ fontSize:t.typography.chapterLabel.fontSize, letterSpacing:t.typography.chapterLabel.letterSpacing, fontWeight:t.typography.chapterLabel.fontWeight, color:colors.accent2 }}>CHAPTER &middot; {slide.chapterNumber ? ['\u2460','\u2461','\u2462','\u2463','\u2464','\u2465','\u2466','\u2467'][slide.chapterNumber-1]||slide.chapterNumber : '\u2460'}</div>
        <div style={{ fontSize:t.typography.chapterTitle.fontSize, fontWeight:t.typography.chapterTitle.fontWeight, color:colors.primary, lineHeight:t.typography.chapterTitle.lineHeight, marginTop:2 }}>{slide.chapterTitle||slide.title||''}</div>
      </div>
      {/* Content sections */}
      {slide.sections?.map((sec, si) => {
        const topY = t.layout.sectionStartY + si * t.layout.sectionSpacing;
        return (
          <React.Fragment key={si}>
            {sec.subTitle && (
              <div style={{ position:'absolute', left:cmx, top:topY, width:width-cmx-mx, zIndex:10, display:'flex', alignItems:'center', gap:10 }}>
                {bullet && <div style={{ width:8, height:8, background:colors.accent2, borderRadius: t.decorations.bulletStyle === 'circle' ? '50%' : 0 }} />}
                <div style={{ fontSize:t.typography.sectionTitle.fontSize, fontWeight:t.typography.sectionTitle.fontWeight, color:colors.primary }}>{sec.subTitle}</div>
              </div>
            )}
            {sec.keyTopic && (
              <div style={{ position:'absolute', left:cmx, top:topY+50, width:width-cmx-mx, zIndex:10 }}>
                <div style={{ fontSize:20, fontWeight:800, color:colors.primary }}>{bullet && <span style={{ color:colors.accent }}>{bullet}</span>}{bullet && '\u00A0 '}{sec.keyTopic}</div>
              </div>
            )}
            {sec.body && (
              <div style={{ position:'absolute', left:cmx, top:topY+(sec.subTitle?86:sec.keyTopic?36:0), width:width-cmx-mx, zIndex:10 }}>
                <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:t.typography.bodyText.fontWeight, color:'#2D2D2D', lineHeight:t.typography.bodyText.lineHeight, textAlign:t.typography.bodyText.textAlign }} dangerouslySetInnerHTML={{ __html: sec.body.replace(/\n/g, '<br/>') }} />
              </div>
            )}
            {sec.keyPoint && (
              <div style={{ position:'absolute', left:cmx, top:Math.min(topY+200, height-190), width:width-cmx-mx, zIndex:10 }}>
                <div style={{ background: sec.keyPoint.type==='caution' ? '#FFEEE6' : '#FFF6D6', padding:'14px 20px', borderLeft: `${t.decorations.calloutStyle.borderLeftWidth}px solid ${sec.keyPoint.type==='caution' ? colors.accent2 : colors.accent}`, borderRadius: t.decorations.calloutStyle.borderRadius }}>
                  <div style={{ fontSize:11, letterSpacing:'0.28em', fontWeight:800, color: sec.keyPoint.type==='caution' ? '#C0392B' : colors.accent }}>{sec.keyPoint.title || 'KEY POINT'}</div>
                  <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:600, color:colors.primary, marginTop:5, lineHeight:1.6 }}>{sec.keyPoint.content}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      {/* Footnote */}
      <div style={{ position:'absolute', left:mx, top:height-61, width:width-mx*2, height:1, background:t.layout.footer.lineColor, zIndex:5 }} />
      <div style={{ position:'absolute', left:mx, top:height-48, width:width-mx*2, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:9, color:colors.mute, fontFamily:'serif' }}>{slide.footnote||''}</span>
        <span style={{ fontSize:11, fontWeight:800, color:colors.primary }}>{formatPageNumber(slide.pageNumber||0, t.layout.footer.pageNumberFormat)}</span>
      </div>
    </div>
  );
};
