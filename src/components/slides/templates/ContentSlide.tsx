import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate, ContentLayoutVariant } from '../../../types';
import { getBulletChar, formatPageNumber, getShapeBorderRadius } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const ContentSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const variant: ContentLayoutVariant = t.contentLayoutVariant || 'default';

  switch (variant) {
    case 'top-accent':
      return renderTopAccent({ slide, colors, width, height, t });
    case 'clean-wide':
      return renderCleanWide({ slide, colors, width, height, t });
    case 'default':
    default:
      return renderDefault({ slide, colors, width, height, t });
  }
};

/* ─── Shared types ─── */
interface RenderProps { slide: SlideData; colors: ColorScheme; width: number; height: number; t: DesignTemplate; }

/* ════════════════════════════════════════════════════════════════
   default — 기존 기본 레이아웃 (100% 동일)
   좌측 사이드바 + 챕터박스 + 헤더바 + 구분선
   ════════════════════════════════════════════════════════════════ */
function renderDefault({ slide, colors, width, height, t }: RenderProps) {
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
}

/* ════════════════════════════════════════════════════════════════
   top-accent — 다크 프로페셔널 / 인포그래픽 전용
   상단 primary 색상 스트립(70px) + 악센트 라인 + 원형 챕터넘버
   섹션별 좌측 색상 보더 + 언더라인 섹션제목 + 풀폭 콜아웃
   ════════════════════════════════════════════════════════════════ */
function renderTopAccent({ slide, colors, width, height, t }: RenderProps) {
  const mx = t.layout.marginX;
  const cmx = t.layout.contentMarginX;
  const stripH = 70;

  return (
    <div style={{ position:'relative', width, height, background:'#fff', color:colors.primary }}>
      {/* ── Top colored strip (full width) ── */}
      <div style={{ position:'absolute', left:0, top:0, width, height:stripH, background:colors.primary, zIndex:3 }} />
      {/* Accent line below strip */}
      <div style={{ position:'absolute', left:0, top:stripH, width, height:4, background:colors.accent, zIndex:4 }} />
      {/* PART label inside strip — left */}
      <div style={{ position:'absolute', left:mx, top:0, height:stripH, zIndex:10, display:'flex', alignItems:'center' }}>
        <span style={{ fontSize:10, letterSpacing:'0.3em', fontWeight:700, color:'rgba(255,255,255,0.9)' }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</span>
      </div>
      {/* Subtitle inside strip — right */}
      <div style={{ position:'absolute', right:mx, top:0, height:stripH, zIndex:10, display:'flex', alignItems:'center' }}>
        <span style={{ fontSize:10, letterSpacing:'0.15em', fontWeight:500, color:'rgba(255,255,255,0.5)' }}>{slide.subtitle||''}</span>
      </div>

      {/* ── Chapter area: circle + title with underline ── */}
      <div style={{ position:'absolute', left:cmx, top:stripH + 30, zIndex:10, display:'flex', alignItems:'center', gap:18 }}>
        {/* Chapter circle */}
        <div style={{ width:52, height:52, borderRadius:'50%', background:colors.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:22, fontWeight:900, color:colors.primary }}>{String(slide.chapterNumber||1).padStart(2,'0')}</span>
        </div>
        <div>
          <div style={{ fontSize:t.typography.chapterTitle.fontSize, fontWeight:t.typography.chapterTitle.fontWeight, color:colors.primary, lineHeight:t.typography.chapterTitle.lineHeight }}>{slide.chapterTitle||slide.title||''}</div>
          {/* Thick underline accent */}
          <div style={{ width:80, height:4, background:colors.accent, marginTop:6, borderRadius:2 }} />
        </div>
      </div>

      {/* ── Content sections — each with colored left border ── */}
      {slide.sections?.map((sec, si) => {
        const topY = t.layout.sectionStartY + si * t.layout.sectionSpacing;
        return (
          <React.Fragment key={si}>
            {sec.subTitle && (
              <div style={{ position:'absolute', left:cmx, top:topY, width:width-cmx-mx, zIndex:10 }}>
                <div style={{ fontSize:t.typography.sectionTitle.fontSize, fontWeight:t.typography.sectionTitle.fontWeight, color:colors.primary, paddingBottom:6, borderBottom:`2px solid ${colors.accent}`, display:'inline-block' }}>{sec.subTitle}</div>
              </div>
            )}
            {sec.keyTopic && (
              <div style={{ position:'absolute', left:cmx, top:topY+46, width:width-cmx-mx, zIndex:10 }}>
                <div style={{ fontSize:20, fontWeight:800, color:colors.primary, paddingLeft:14, borderLeft:`3px solid ${colors.accent2}` }}>{sec.keyTopic}</div>
              </div>
            )}
            {sec.body && (
              <div style={{ position:'absolute', left:cmx, top:topY+(sec.subTitle?82:sec.keyTopic?36:0), width:width-cmx-mx, zIndex:10 }}>
                <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:t.typography.bodyText.fontWeight, color:'#2D2D2D', lineHeight:t.typography.bodyText.lineHeight, textAlign:t.typography.bodyText.textAlign, paddingLeft:14, borderLeft:`3px solid ${colors.primary}15` }} dangerouslySetInnerHTML={{ __html: sec.body.replace(/\n/g, '<br/>') }} />
              </div>
            )}
            {sec.keyPoint && (
              <div style={{ position:'absolute', left:cmx, top:Math.min(topY+200, height-190), width:width-cmx-mx, zIndex:10 }}>
                {/* Full-width tinted callout with top border */}
                <div style={{ background: sec.keyPoint.type==='caution' ? `${colors.accent2}0C` : `${colors.primary}08`, padding:'14px 20px', borderTop: `3px solid ${sec.keyPoint.type==='caution' ? colors.accent2 : colors.accent}`, borderRadius: `0 0 ${t.decorations.calloutStyle.borderRadius}px ${t.decorations.calloutStyle.borderRadius}px` }}>
                  <div style={{ fontSize:11, letterSpacing:'0.28em', fontWeight:800, color: sec.keyPoint.type==='caution' ? '#C0392B' : colors.accent, textAlign:'center' }}>{sec.keyPoint.title || 'KEY POINT'}</div>
                  <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:600, color:colors.primary, marginTop:6, lineHeight:1.6 }}>{sec.keyPoint.content}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      {/* ── Footer — thin colored strip ── */}
      <div style={{ position:'absolute', left:0, bottom:0, width, height:36, background:colors.primary, zIndex:3 }} />
      <div style={{ position:'absolute', left:mx, bottom:0, width:width-mx*2, height:36, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontFamily:'serif' }}>{slide.footnote||''}</span>
        <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.8)' }}>{formatPageNumber(slide.pageNumber||0, t.layout.footer.pageNumberFormat)}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   clean-wide — 피치덱 / 내추럴 오가닉 전용
   헤더바 없음, 중앙 정렬, 워터마크 챕터넘버, 원형 페이지번호
   불릿 없음, 넓은 여백, 라운드 카드형 콜아웃
   ════════════════════════════════════════════════════════════════ */
function renderCleanWide({ slide, colors, width, height, t }: RenderProps) {
  const mx = t.layout.marginX + 20;
  const cx = Math.round(width / 2);

  return (
    <div style={{ position:'relative', width, height, background:'#fff', color:colors.primary, overflow:'hidden' }}>
      {/* ── Page number circle — top-right ── */}
      <div style={{ position:'absolute', right:mx - 6, top:28, width:32, height:32, borderRadius:'50%', border:`2px solid ${colors.primary}20`, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
        <span style={{ fontSize:10, fontWeight:700, color:colors.primary }}>{formatPageNumber(slide.pageNumber||0, 'plain')}</span>
      </div>

      {/* ── Chapter area — centered with watermark number ── */}
      {/* Large watermark chapter number */}
      <div style={{ position:'absolute', left:cx - 50, top:40, width:100, zIndex:2, textAlign:'center' }}>
        <span style={{ fontSize:100, fontWeight:900, color:`${colors.primary}08`, lineHeight:1 }}>{String(slide.chapterNumber||1).padStart(2,'0')}</span>
      </div>
      {/* Chapter title overlaid — centered */}
      <div style={{ position:'absolute', left:mx, top:80, width:width - mx * 2, zIndex:10, textAlign:'center' }}>
        <div style={{ fontSize:9, letterSpacing:'0.35em', fontWeight:600, color:colors.accent2, marginBottom:6 }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</div>
        <div style={{ fontSize:t.typography.chapterTitle.fontSize, fontWeight:t.typography.chapterTitle.fontWeight, color:colors.primary, lineHeight:t.typography.chapterTitle.lineHeight }}>{slide.chapterTitle||slide.title||''}</div>
        {/* Centered short divider */}
        <div style={{ width:50, height:2, background:colors.accent, margin:'12px auto 0', borderRadius:1 }} />
      </div>

      {/* ── Content sections — centered, no bullets ── */}
      {slide.sections?.map((sec, si) => {
        const topY = t.layout.sectionStartY + si * t.layout.sectionSpacing;
        return (
          <React.Fragment key={si}>
            {sec.subTitle && (
              <div style={{ position:'absolute', left:mx, top:topY, width:width - mx * 2, zIndex:10, textAlign:'center' }}>
                <div style={{ fontSize:t.typography.sectionTitle.fontSize, fontWeight:t.typography.sectionTitle.fontWeight, color:colors.primary, letterSpacing:'0.05em' }}>{sec.subTitle}</div>
              </div>
            )}
            {sec.keyTopic && (
              <div style={{ position:'absolute', left:mx, top:topY + 44, width:width - mx * 2, zIndex:10 }}>
                <div style={{ fontSize:20, fontWeight:800, color:colors.primary, textAlign:'center' }}>{sec.keyTopic}</div>
              </div>
            )}
            {sec.body && (
              <div style={{ position:'absolute', left:mx, top:topY+(sec.subTitle?78:sec.keyTopic?36:0), width:width - mx * 2, zIndex:10 }}>
                <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:t.typography.bodyText.fontWeight, color:'#2D2D2D', lineHeight:t.typography.bodyText.lineHeight, textAlign:'left' }} dangerouslySetInnerHTML={{ __html: sec.body.replace(/\n/g, '<br/>') }} />
              </div>
            )}
            {sec.keyPoint && (
              <div style={{ position:'absolute', left:mx, top:Math.min(topY+200, height-200), width:width - mx * 2, zIndex:10 }}>
                {/* Rounded card callout — no left border, subtle border all around */}
                <div style={{ background: sec.keyPoint.type==='caution' ? '#FFF8F5' : '#FFFDF0', padding:'16px 24px', borderRadius:14, border: `1px solid ${sec.keyPoint.type==='caution' ? `${colors.accent2}25` : `${colors.accent}25`}` }}>
                  <div style={{ fontSize:11, letterSpacing:'0.25em', fontWeight:800, color: sec.keyPoint.type==='caution' ? '#C0392B' : colors.accent, textAlign:'center' }}>{sec.keyPoint.title || 'KEY POINT'}</div>
                  <div style={{ fontSize:t.typography.bodyText.fontSize, fontWeight:600, color:colors.primary, marginTop:6, lineHeight:1.6, textAlign:'center' }}>{sec.keyPoint.content}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      {/* ── Footer — centered page number only, no line ── */}
      <div style={{ position:'absolute', left:0, bottom:28, width, zIndex:10, textAlign:'center' }}>
        <span style={{ fontSize:9, color:colors.mute }}>{slide.footnote||''}</span>
      </div>
    </div>
  );
}
