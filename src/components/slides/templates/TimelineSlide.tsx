import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const TimelineSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const events = slide.timelineEvents || [];
  const isRoadmap = slide.type === 'roadmap';

  const timelineTop = 160;
  const timelineWidth = width - mx * 2 - 60;
  const timelineLeft = mx + 30;

  // For vertical layout (portrait or many events)
  const isVertical = height > width || events.length > 6;
  const eventSpacing = isVertical
    ? Math.min(80, (height - timelineTop - 80) / Math.max(events.length, 1))
    : timelineWidth / Math.max(events.length, 1);

  const statusColor = (status?: string) => {
    switch (status) {
      case 'completed': return colors.primary;
      case 'in-progress': return colors.accent;
      default: return colors.mute;
    }
  };

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          {isRoadmap ? 'ROADMAP' : 'TIMELINE'}
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || ''}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{slide.subtitle}</div>
        )}
      </div>

      {isVertical ? (
        /* Vertical timeline */
        <div style={{ position: 'absolute', left: timelineLeft, top: timelineTop, width: timelineWidth }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 40, top: 0, width: 2, height: events.length * eventSpacing, background: `${colors.primary}30` }} />

          {events.map((event, i) => (
            <div key={i} style={{ position: 'absolute', left: 0, top: i * eventSpacing, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {/* Date */}
              <div style={{ width: 30, textAlign: 'right', fontSize: 9, fontWeight: 600, color: colors.accent2, paddingTop: 3 }}>
                {event.date}
              </div>
              {/* Dot */}
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: statusColor(event.status), border: `3px solid #fff`, boxShadow: `0 0 0 2px ${statusColor(event.status)}40`, flexShrink: 0, marginTop: 1 }} />
              {/* Content */}
              <div style={{ flex: 1, paddingTop: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.primary }}>{event.title}</div>
                {event.description && <div style={{ fontSize: 10, color: '#666', marginTop: 3, lineHeight: 1.4 }}>{event.description}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Horizontal timeline */
        <div style={{ position: 'absolute', left: timelineLeft, top: timelineTop, width: timelineWidth }}>
          {/* Horizontal line */}
          <div style={{ position: 'absolute', left: 0, top: 60, width: timelineWidth, height: 2, background: `${colors.primary}30` }} />

          {events.map((event, i) => {
            const x = i * eventSpacing + eventSpacing / 2;
            const isAbove = i % 2 === 0;
            return (
              <div key={i} style={{ position: 'absolute', left: x - eventSpacing / 2 + 10, width: eventSpacing - 20, textAlign: 'center' }}>
                {/* Dot */}
                <div style={{ position: 'absolute', left: '50%', top: 52, transform: 'translateX(-50%)', width: 16, height: 16, borderRadius: '50%', background: statusColor(event.status), border: `3px solid #fff`, boxShadow: `0 0 0 2px ${statusColor(event.status)}40` }} />
                {/* Content */}
                <div style={{ position: 'absolute', left: 0, width: '100%', ...(isAbove ? { bottom: 80 } : { top: 80 }) }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: colors.accent2 }}>{event.date}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.primary, marginTop: 3 }}>{event.title}</div>
                  {event.description && <div style={{ fontSize: 9, color: '#666', marginTop: 2, lineHeight: 1.3 }}>{event.description}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Page number */}
      {slide.pageNumber && (
        <div style={{ position: 'absolute', right: mx, bottom: 15, fontSize: 8, fontWeight: 600, color: colors.primary }}>
          {formatPageNumber(slide.pageNumber, t.layout.footer.pageNumberFormat)}
        </div>
      )}
    </div>
  );
};
