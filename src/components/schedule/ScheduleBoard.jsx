import React, { useRef } from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { ScheduleBlock } from './ScheduleBlock';

export const ScheduleBoard = () => {
  const blocks = useScheduleStore((s) => s.blocks);
  const boardRef = useRef(null);

  // Calculate board dimensions from block positions
  const maxX = blocks.reduce((max, b) => Math.max(max, b.x + 320), 1400);
  const maxY = blocks.reduce((max, b) => Math.max(max, b.y + 170), 1100);

  return (
    <div className="schedule-board-wrapper">
      <div
        ref={boardRef}
        className="schedule-board"
        style={{
          minWidth: `${maxX + 60}px`,
          minHeight: `${maxY + 60}px`,
        }}
      >
        {/* Dotted Grid Background */}
        <div
          className="schedule-board__grid"
          style={{ minWidth: `${maxX + 60}px`, minHeight: `${maxY + 60}px` }}
        />

        {blocks.map((block) => (
          <ScheduleBlock key={block.id} block={block} boardRef={boardRef} />
        ))}
      </div>
    </div>
  );
};
