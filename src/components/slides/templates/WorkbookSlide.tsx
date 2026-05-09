import React from 'react';
import type { SlideData, ColorScheme } from '../../../types';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; }

export const WorkbookSlide: React.FC<Props> = ({ slide, colors, width, height }) => {
  return (
    <div style={{ position:'relative', width, height, background:'#fff', color:colors.primary }}>
      {/* Header */}
      <div style={{ position:'absolute', left:57, top:36, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontSize:10, letterSpacing:'0.28em', fontWeight:800, color:colors.accent2 }}>PART {String(slide.partNumber||1).padStart(2,'0')} &middot; {slide.partTitle||''}</span>
        <span style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:600, color:colors.mute }}>WORKBOOK</span>
      </div>
      <div style={{ position:'absolute', left:57, top:62, width:width-114, height:1, background:colors.primary, zIndex:5 }} />
      {/* Sidebar */}
      <div style={{ position:'absolute', left:0, top:130, width:36, height:520, background:colors.primary, zIndex:5 }} />
      <div style={{ position:'absolute', left:0, top:130, width:36, height:80, background:colors.accent, zIndex:6 }} />
      {/* STEP block */}
      <div style={{ position:'absolute', left:94, top:96, width:90, height:90, background:colors.primary, zIndex:5 }} />
      <div style={{ position:'absolute', left:94, top:104, width:90, zIndex:11, textAlign:'center', color:'#fff' }}>
        <div style={{ fontSize:9, letterSpacing:'0.32em', fontWeight:800, color:colors.accent }}>STEP</div>
        <div style={{ fontSize:36, fontWeight:900, lineHeight:1, marginTop:4 }}>{String(slide.stepNumber||1).padStart(2,'0')}</div>
        <div style={{ fontSize:8, letterSpacing:'0.18em', fontWeight:600, color:'rgba(255,255,255,0.6)', marginTop:6 }}>{slide.stepLabel||''}</div>
      </div>
      {/* Title */}
      <div style={{ position:'absolute', left:200, top:96, width:width-257, zIndex:10 }}>
        <div style={{ fontSize:11, letterSpacing:'0.3em', fontWeight:800, color:colors.accent2 }}>CHAPTER &middot; WORKBOOK</div>
        <div style={{ fontSize:27, fontWeight:900, color:colors.primary, lineHeight:1.25, marginTop:2 }}>{slide.title||''}</div>
      </div>
      {/* Learning objective */}
      {slide.learningObjective && (
        <>
          <div style={{ position:'absolute', left:94, top:218, width:width-188, height:78, background:'#FFF6D6', zIndex:1 }} />
          <div style={{ position:'absolute', left:94, top:218, width:5, height:78, background:colors.accent, zIndex:2 }} />
          <div style={{ position:'absolute', left:114, top:230, width:width-208, zIndex:10 }}>
            <div style={{ fontSize:10, letterSpacing:'0.3em', fontWeight:800, color:colors.accent }}>LEARNING OBJECTIVE</div>
            <div style={{ fontSize:13.3, fontWeight:500, color:colors.primary, marginTop:5, lineHeight:1.6 }}>{slide.learningObjective}</div>
          </div>
        </>
      )}
      {/* Scenario */}
      {slide.scenario && (
        <>
          <div style={{ position:'absolute', left:94, top:312, width:width-188, height:78, background:colors.background, zIndex:1 }} />
          <div style={{ position:'absolute', left:94, top:312, width:5, height:78, background:colors.primary, zIndex:2 }} />
          <div style={{ position:'absolute', left:114, top:324, width:width-208, zIndex:10 }}>
            <div style={{ fontSize:10, letterSpacing:'0.3em', fontWeight:800, color:colors.primary }}>SCENARIO</div>
            <div style={{ fontSize:13.3, fontWeight:500, color:'#2D2D2D', marginTop:5, lineHeight:1.6 }}>{slide.scenario}</div>
          </div>
        </>
      )}
      {/* Steps */}
      {slide.steps && (
        <div style={{ position:'absolute', left:94, top:412, width:width-188, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:8, height:8, background:colors.accent2 }} />
            <div style={{ fontSize:20, fontWeight:800, color:colors.primary }}>Steps</div>
          </div>
          <div style={{ fontSize:13.3, lineHeight:1.85, color:'#2D2D2D', marginTop:16 }}>
            {slide.steps.map((step, si) => (
              <div key={si} style={{ marginBottom:6 }}>
                <b style={{ color:colors.accent2 }}>{step.number})</b>&nbsp; {step.title}
                {step.description && <div style={{ color:colors.mute, paddingLeft:18, display:'block' }}>{step.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Checklist */}
      {slide.checklist && (
        <div style={{ position:'absolute', left:94, top:710, width:width-188, border:`2px dashed ${colors.primary}`, padding:16, zIndex:10 }}>
          <div style={{ fontSize:13.3, fontWeight:800, color:colors.primary, marginBottom:10 }}>Checklist</div>
          {slide.checklist.map((item, ci) => (
            <div key={ci} style={{ fontSize:11.5, color:'#2D2D2D', lineHeight:1.7, marginBottom:6 }}>
              {item.label}: {item.options.map((opt, oi) => (
                <span key={oi} style={{ display:'inline-flex', alignItems:'center', gap:5, marginLeft:8 }}>
                  <span style={{ width:11, height:11, border:`1.5px solid ${colors.primary}`, display:'inline-block' }} />{opt}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      {/* Caution */}
      {slide.caution && (
        <div style={{ position:'absolute', left:94, top:height-220, width:width-188, zIndex:10 }}>
          <div style={{ background:'#FFEEE6', padding:'14px 20px', borderLeft:`5px solid ${colors.accent2}` }}>
            <div style={{ fontSize:10, letterSpacing:'0.3em', fontWeight:800, color:'#C0392B' }}>CAUTION</div>
            <div style={{ fontSize:12.5, fontWeight:500, color:colors.primary, marginTop:4, lineHeight:1.55 }}>{slide.caution}</div>
          </div>
        </div>
      )}
      {/* Code block */}
      {slide.workbookCode && (
        <div style={{ position:'absolute', left:94, top:height-130, width:width-188, zIndex:10 }}>
          <div style={{ display:'inline-block', fontSize:10, letterSpacing:'0.24em', fontWeight:800, color:colors.primary, padding:'4px 10px', background:colors.accent }}>{slide.workbookCode.label}</div>
          <span style={{ fontSize:12.5, fontWeight:600, color:colors.primary, marginLeft:8 }}>{slide.workbookCode.title}</span>
          <div style={{ fontSize:11.5, color:colors.primary, marginTop:6, padding:'6px 10px', background:'#F8F8F8', borderLeft:`3px solid ${colors.primary}`, fontFamily:"'D2Coding','Consolas',monospace", whiteSpace:'pre-wrap' }}>{slide.workbookCode.content}</div>
        </div>
      )}
      {/* Footer */}
      <div style={{ position:'absolute', left:57, top:height-48, width:width-114, zIndex:10, display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:9, color:colors.mute, fontFamily:'serif' }}>{slide.footnote||''}</span>
        <span style={{ fontSize:11, fontWeight:800, color:colors.primary }}>{String(slide.pageNumber||0).padStart(3,'0')}</span>
      </div>
    </div>
  );
};
