import React from 'react';
import type { SlideData, ColorScheme } from '../../../types';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; }

export const DiagramSlide: React.FC<Props> = ({ slide, colors, width, height }) => {
  return (
    <div style={{ position:'relative', width, height, background:'#fff', color:colors.primary }}>
      {/* Header */}
      <div style={{ position:'absolute', left:57, top:36, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontSize:10, letterSpacing:'0.28em', fontWeight:800, color:colors.accent2 }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>DIAGRAM</span>
      </div>
      <div style={{ position:'absolute', left:57, top:62, width:width-114, height:1, background:colors.primary, zIndex:5 }} />
      {/* Sidebar */}
      <div style={{ position:'absolute', left:0, top:130, width:36, height:520, background:colors.primary, zIndex:5 }} />
      <div style={{ position:'absolute', left:0, top:130, width:36, height:80, background:colors.accent, zIndex:6 }} />
      {/* Chapter */}
      <div style={{ position:'absolute', left:94, top:96, width:54, height:54, background:colors.accent, zIndex:5 }} />
      <div style={{ position:'absolute', left:94, top:96, width:54, height:54, zIndex:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:900, color:colors.primary }}>{String(slide.chapterNumber||1).padStart(2,'0')}</div>
      <div style={{ position:'absolute', left:165, top:103, width:width-222, zIndex:10 }}>
        <div style={{ fontSize:11, letterSpacing:'0.3em', fontWeight:800, color:colors.accent2 }}>CHAPTER</div>
        <div style={{ fontSize:27, fontWeight:900, color:colors.primary, lineHeight:1.25, marginTop:2 }}>{slide.chapterTitle||slide.title||''}</div>
      </div>
      {/* Body text */}
      {slide.sections?.[0]?.body && (
        <div style={{ position:'absolute', left:94, top:200, width:width-188, zIndex:10 }}>
          <div style={{ fontSize:13.3, color:'#2D2D2D', lineHeight:1.75, textAlign:'justify' }} dangerouslySetInnerHTML={{ __html: slide.sections[0].body.replace(/\n/g,'<br/>') }} />
        </div>
      )}
      {/* Diagram cards */}
      {slide.diagramCards && (
        <div style={{ position:'absolute', left:60, top:380, width:width-120, zIndex:10, display:'flex', gap:10, flexWrap:'wrap' }}>
          {slide.diagramCards.map((card, ci) => {
            const cardW = Math.floor((width-120-10*(slide.diagramCards!.length-1))/slide.diagramCards!.length);
            return (
              <div key={ci} style={{ width:cardW, border:`1px solid ${colors.primary}`, background:'#fff' }}>
                <div style={{ height:30, background:card.headerColor||colors.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:11, letterSpacing:'0.24em', fontWeight:800, color: card.headerColor===colors.accent ? colors.primary : '#fff' }}>{card.title}</span>
                </div>
                <div style={{ padding:'8px 10px', fontSize:10.5, lineHeight:1.7, color:'#2D2D2D' }}>
                  {card.items.map((item, ii) => (
                    <div key={ii}><b style={{ color:colors.primary }}>{item.label}</b> {item.value}</div>
                  ))}
                  {card.difficulty && <div style={{ marginTop:6, paddingTop:6, borderTop:`1px dashed ${colors.background}`, color:colors.accent2, fontWeight:700 }}>{card.difficulty}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* List items */}
      {slide.listItems && (
        <div style={{ position:'absolute', left:94, top:700, width:width-188, zIndex:10 }}>
          {slide.listItems.map((item, li) => (
            <div key={li} style={{ display:'flex', padding:'6px 0', borderBottom:`1px dashed #D6D0C2`, fontSize:13.3, lineHeight:1.85 }}>
              <span style={{ width:90, fontWeight:800, color:colors.primary }}>{item.label}</span>
              <span style={{ color:'#2D2D2D' }}>{item.description}</span>
            </div>
          ))}
        </div>
      )}
      {/* Footer */}
      <div style={{ position:'absolute', left:57, top:height-61, width:width-114, height:1, background:'#D6D0C2', zIndex:5 }} />
      <div style={{ position:'absolute', left:57, top:height-48, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:9, color:colors.mute, fontFamily:'serif' }}>{slide.footnote||''}</span>
        <span style={{ fontSize:11, fontWeight:800, color:colors.primary }}>{String(slide.pageNumber||0).padStart(3,'0')}</span>
      </div>
    </div>
  );
};
