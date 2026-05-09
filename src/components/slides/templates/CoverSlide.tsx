import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate, CoverLayoutVariant } from '../../../types';
import { getShapeBorderRadius } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const CoverSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const variant: CoverLayoutVariant = t.coverLayoutVariant || 'top-panel';

  switch (variant) {
    case 'left-panel':
      return renderLeftPanel({ slide, colors, width, height, t });
    case 'full-bleed':
      return renderFullBleed({ slide, colors, width, height, t });
    case 'center-band':
      return renderCenterBand({ slide, colors, width, height, t });
    case 'top-panel':
    default:
      return renderTopPanel({ slide, colors, width, height, t });
  }
};

/* ─── Shared types ─── */
interface RenderProps { slide: SlideData; colors: ColorScheme; width: number; height: number; t: DesignTemplate; }

/* ════════════════════════════════════════════════════════════════
   top-panel — 기존 기본 레이아웃 (100% 동일)
   상단 50% 색상패널 + 하단 흰색, 그리드 오버레이, 코너 악센트
   ════════════════════════════════════════════════════════════════ */
function renderTopPanel({ slide, colors, width, height, t }: RenderProps) {
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
}

/* ════════════════════════════════════════════════════════════════
   left-panel — 인포그래픽 전용
   좌 40% primary (풀하이트) + 우 60% 흰색
   좌: 거대 워터마크 넘버 + 카테고리 + 헤드라인
   우: 장식 원 + 파트 인덱스 카드 + 서브타이틀
   ════════════════════════════════════════════════════════════════ */
function renderLeftPanel({ slide, colors, width, height, t }: RenderProps) {
  const panelW = Math.round(width * 0.40);
  const rightX = panelW;
  const rightW = width - panelW;

  return (
    <div style={{ position:'relative', width, height, background: colors.background, overflow:'hidden' }}>
      {/* ── Left panel (full height) ── */}
      <div style={{ position:'absolute', left:0, top:0, width:panelW, height, background:colors.primary, zIndex:1 }} />
      {/* Giant watermark number */}
      <div style={{ position:'absolute', left:20, top:60, zIndex:2, fontSize:200, fontWeight:900, color:'rgba(255,255,255,0.07)', lineHeight:1, letterSpacing:'-0.05em' }}>
        №
      </div>
      {/* Accent vertical line at panel right edge */}
      <div style={{ position:'absolute', left:panelW - 5, top:0, width:5, height, background:colors.accent, zIndex:3 }} />
      {/* Category chip — top of left panel */}
      {slide.categoryChip && (
        <div style={{ position:'absolute', left:36, top:50, zIndex:11, fontSize:10, letterSpacing:'0.25em', fontWeight:700, color:colors.accent, textTransform:'uppercase' as const }}>
          {slide.categoryChip}
        </div>
      )}
      {/* Headline — center of left panel */}
      <div style={{ position:'absolute', left:36, top:Math.round(height * 0.30), width:panelW - 72, zIndex:10 }}>
        <div style={{ fontSize:t.typography.coverHeadline.fontSize, fontWeight:t.typography.coverHeadline.fontWeight, lineHeight:t.typography.coverHeadline.lineHeight, letterSpacing:t.typography.coverHeadline.letterSpacing, color:'#fff' }}
          dangerouslySetInnerHTML={{ __html: (slide.headline || slide.title || '').replace(/\n/g, '<br/>') }} />
        {/* Accent underline bar */}
        <div style={{ width:60, height:4, background:colors.accent, marginTop:20, borderRadius:2 }} />
      </div>
      {/* Subtitle — bottom of left panel */}
      {slide.subtitle && (
        <div style={{ position:'absolute', left:36, bottom:70, width:panelW - 72, zIndex:10 }}>
          <div style={{ fontSize:t.typography.coverSubtitle.fontSize, fontWeight:t.typography.coverSubtitle.fontWeight, letterSpacing:t.typography.coverSubtitle.letterSpacing, color:'rgba(255,255,255,0.7)' }}>{slide.subtitle}</div>
        </div>
      )}

      {/* ── Right panel ── */}
      {/* Decorative circles — top-right corner */}
      <div style={{ position:'absolute', right:-40, top:-40, width:180, height:180, borderRadius:'50%', border:`2px solid ${colors.accent}`, opacity:0.15, zIndex:2 }} />
      <div style={{ position:'absolute', right:20, top:20, width:60, height:60, borderRadius:'50%', background:colors.accent, opacity:0.08, zIndex:2 }} />
      {/* Decorative circle — bottom-right */}
      <div style={{ position:'absolute', right:40, bottom:100, width:100, height:100, borderRadius:'50%', border:`2px solid ${colors.primary}`, opacity:0.1, zIndex:2 }} />

      {/* Part index — as numbered cards on right */}
      {slide.partIndex && slide.partIndex.length > 0 && (
        <div style={{ position:'absolute', left:rightX + 50, top:100, width:rightW - 100, zIndex:10, display:'flex', flexDirection:'column', gap:16 }}>
          {slide.partIndex.map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14 }}>
              {/* Number circle */}
              <div style={{ width:36, height:36, borderRadius:'50%', background:colors.primary, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              {/* Card body */}
              <div style={{ flex:1, padding:'10px 16px', background:`${colors.primary}08`, borderLeft:`3px solid ${colors.accent}`, borderRadius:'0 6px 6px 0' }}>
                <div style={{ fontSize:8, letterSpacing:'0.3em', fontWeight:700, color:colors.accent2, marginBottom:2 }}>{p.partNumber}</div>
                <div style={{ fontSize:13, fontWeight:700, color:colors.primary }}>{p.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Publisher info — bottom-right, stacked */}
      {slide.publisherInfo && (
        <div style={{ position:'absolute', right:50, bottom:40, zIndex:10, textAlign:'right' }}>
          <div style={{ fontSize:10, fontWeight:700, color:colors.primary }}>{slide.publisherInfo.left}</div>
          <div style={{ fontSize:9, color:colors.mute, marginTop:4 }}>{slide.publisherInfo.right}</div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   full-bleed — 피치덱 / 다크 프로페셔널 전용
   전체 primary 배경, 키노트 스타일
   대형 장식 원, 코너 브래킷, 대각선, 중앙 임팩트 타이포
   ════════════════════════════════════════════════════════════════ */
function renderFullBleed({ slide, colors, width, height, t }: RenderProps) {
  const cx = Math.round(width / 2);

  return (
    <div style={{ position:'relative', width, height, background: colors.primary, overflow:'hidden' }}>
      {/* Diagonal decorative line */}
      <div style={{ position:'absolute', left:0, top:0, width:width * 1.5, height:2, background:'rgba(255,255,255,0.06)', transform:'rotate(25deg)', transformOrigin:'0 0', zIndex:2 }} />
      <div style={{ position:'absolute', left:0, top:120, width:width * 1.5, height:1, background:'rgba(255,255,255,0.04)', transform:'rotate(25deg)', transformOrigin:'0 0', zIndex:2 }} />
      {/* Large decorative circle — bottom-right */}
      <div style={{ position:'absolute', right:-80, bottom:-80, width:320, height:320, borderRadius:'50%', background:colors.accent, opacity:0.06, zIndex:2 }} />
      {/* Small decorative circle — top-left */}
      <div style={{ position:'absolute', left:60, top:60, width:16, height:16, borderRadius:'50%', background:colors.accent, opacity:0.3, zIndex:3 }} />
      {/* Corner bracket marks — top-left */}
      <div style={{ position:'absolute', left:30, top:30, width:40, height:2, background:'rgba(255,255,255,0.25)', zIndex:5 }} />
      <div style={{ position:'absolute', left:30, top:30, width:2, height:40, background:'rgba(255,255,255,0.25)', zIndex:5 }} />
      {/* Corner bracket marks — bottom-right */}
      <div style={{ position:'absolute', right:30, bottom:30, width:40, height:2, background:'rgba(255,255,255,0.25)', zIndex:5 }} />
      <div style={{ position:'absolute', right:30, bottom:30, width:2, height:40, background:'rgba(255,255,255,0.25)', zIndex:5 }} />

      {/* Category chip — top-left, text only (no background) */}
      {slide.categoryChip && (
        <div style={{ position:'absolute', left:80, top:80, zIndex:11, fontSize:10, letterSpacing:'0.3em', fontWeight:600, color:colors.accent }}>
          {slide.categoryChip}
        </div>
      )}

      {/* Headline — centered, huge, maximum impact */}
      <div style={{ position:'absolute', left:80, top:Math.round(height * 0.30), width:width - 160, zIndex:10, textAlign:'center' }}>
        <div style={{ fontSize:Math.round(t.typography.coverHeadline.fontSize * 1.15), fontWeight:900, lineHeight:1.1, letterSpacing:'-0.03em', color:'#fff' }}
          dangerouslySetInnerHTML={{ __html: (slide.headline || slide.title || '').replace(/\n/g, '<br/>') }} />
      </div>

      {/* Horizontal divider line — centered */}
      <div style={{ position:'absolute', left:cx - 40, top:Math.round(height * 0.58), width:80, height:2, background:colors.accent, zIndex:5 }} />

      {/* Subtitle — below divider, centered */}
      {slide.subtitle && (
        <div style={{ position:'absolute', left:80, top:Math.round(height * 0.62), width:width - 160, zIndex:10, textAlign:'center' }}>
          <div style={{ fontSize:t.typography.coverSubtitle.fontSize, fontWeight:t.typography.coverSubtitle.fontWeight, letterSpacing:'0.12em', color:'rgba(255,255,255,0.6)' }}>{slide.subtitle}</div>
        </div>
      )}

      {/* Part index — bottom, as minimal dots + text */}
      {slide.partIndex && slide.partIndex.length > 0 && (
        <div style={{ position:'absolute', left:80, bottom:100, width:width - 160, zIndex:10, display:'flex', justifyContent:'center', gap:40 }}>
          {slide.partIndex.map((p, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:colors.accent, margin:'0 auto 8px' }} />
              <div style={{ fontSize:8, letterSpacing:'0.2em', fontWeight:600, color:'rgba(255,255,255,0.4)' }}>{p.partNumber}</div>
              <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.7)', marginTop:3 }}>{p.title}</div>
            </div>
          ))}
        </div>
      )}

      {/* Publisher info — bottom-center, single line */}
      {slide.publisherInfo && (
        <div style={{ position:'absolute', left:0, bottom:30, width, zIndex:10, textAlign:'center' }}>
          <span style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{slide.publisherInfo.left} &nbsp;&middot;&nbsp; {slide.publisherInfo.right}</span>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   center-band — 내추럴 오가닉 전용
   흰 배경 + 라운드 밴드(마진 있음) + 유기적 원형 장식
   전체적으로 중앙 정렬, 부드러운 곡선 미학
   ════════════════════════════════════════════════════════════════ */
function renderCenterBand({ slide, colors, width, height, t }: RenderProps) {
  const bandMargin = 50;
  const bandTop = Math.round(height * 0.28);
  const bandH = Math.round(height * 0.36);
  const bandW = width - bandMargin * 2;
  const cx = Math.round(width / 2);

  return (
    <div style={{ position:'relative', width, height, background: colors.background, overflow:'hidden' }}>
      {/* Decorative organic circles */}
      <div style={{ position:'absolute', right:-30, top:-30, width:200, height:200, borderRadius:'50%', background:colors.accent, opacity:0.06, zIndex:1 }} />
      <div style={{ position:'absolute', left:-20, bottom:80, width:120, height:120, borderRadius:'50%', background:colors.primary, opacity:0.05, zIndex:1 }} />
      <div style={{ position:'absolute', right:100, bottom:-40, width:80, height:80, borderRadius:'50%', border:`2px solid ${colors.accent}`, opacity:0.1, zIndex:1 }} />

      {/* Center band — rounded, with margins */}
      <div style={{ position:'absolute', left:bandMargin, top:bandTop, width:bandW, height:bandH, background:colors.primary, borderRadius:20, zIndex:3 }} />
      {/* Soft inner glow on band */}
      <div style={{ position:'absolute', left:bandMargin, top:bandTop, width:bandW, height:bandH, borderRadius:20, background:'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)', zIndex:4 }} />

      {/* Category chip — above band, centered, pill shape */}
      {slide.categoryChip && (
        <div style={{ position:'absolute', left:cx - 130, top:bandTop - 50, width:260, zIndex:11, textAlign:'center' }}>
          <span style={{ display:'inline-block', padding:'6px 24px', borderRadius:20, background:`${colors.accent}18`, border:`1px solid ${colors.accent}30`, fontSize:10, letterSpacing:'0.2em', fontWeight:700, color:colors.primary }}>
            {slide.categoryChip}
          </span>
        </div>
      )}

      {/* Headline — inside band, centered */}
      <div style={{ position:'absolute', left:bandMargin + 50, top:bandTop + 40, width:bandW - 100, zIndex:10, textAlign:'center' }}>
        <div style={{ fontSize:t.typography.coverHeadline.fontSize, fontWeight:t.typography.coverHeadline.fontWeight, lineHeight:t.typography.coverHeadline.lineHeight, letterSpacing:t.typography.coverHeadline.letterSpacing, color:'#fff' }}
          dangerouslySetInnerHTML={{ __html: (slide.headline || slide.title || '').replace(/\n/g, '<br/>') }} />
      </div>

      {/* Subtitle — inside band, bottom area, centered */}
      {slide.subtitle && (
        <div style={{ position:'absolute', left:bandMargin + 50, top:bandTop + bandH - 55, width:bandW - 100, zIndex:10, textAlign:'center' }}>
          <div style={{ fontSize:t.typography.coverSubtitle.fontSize, fontWeight:t.typography.coverSubtitle.fontWeight, letterSpacing:t.typography.coverSubtitle.letterSpacing, color:colors.accent }}>{slide.subtitle}</div>
        </div>
      )}

      {/* Part index — below band, as centered pill tags */}
      {slide.partIndex && slide.partIndex.length > 0 && (
        <div style={{ position:'absolute', left:0, top:bandTop + bandH + 30, width, zIndex:10, display:'flex', justifyContent:'center', gap:14, flexWrap:'wrap', padding:'0 60px' }}>
          {slide.partIndex.map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:24, background:`${colors.primary}0A`, border:`1px solid ${colors.primary}15` }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:colors.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:9, fontWeight:800, color:'#fff' }}>{i + 1}</span>
              </div>
              <div>
                <div style={{ fontSize:8, letterSpacing:'0.2em', fontWeight:600, color:colors.accent2 }}>{p.partNumber}</div>
                <div style={{ fontSize:11, fontWeight:600, color:colors.primary }}>{p.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publisher info — centered at bottom */}
      {slide.publisherInfo && (
        <div style={{ position:'absolute', left:0, bottom:35, width, zIndex:10, textAlign:'center' }}>
          <div style={{ fontSize:10, fontWeight:600, color:colors.primary }}>{slide.publisherInfo.left}</div>
          <div style={{ fontSize:9, color:colors.mute, marginTop:3 }}>{slide.publisherInfo.right}</div>
        </div>
      )}
    </div>
  );
}
