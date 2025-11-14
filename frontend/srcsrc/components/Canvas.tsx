// src/components/Canvas.tsx
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Token } from '../pages/StrategyBuilderPage';

interface SortableTokenProps {
  token: Token;
  onRemove: (id: string) => void;
}

// 개별 토큰 컴포넌트 (드래그 가능)
const SortableToken: React.FC<SortableTokenProps> = ({ token, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: token.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-700 p-2 rounded-md flex justify-between items-center shadow-sm cursor-grab active:cursor-grabbing"
    >
      <span className="font-mono text-white select-none">{token.label}</span>
      <button
        onClick={(e) => {
            e.stopPropagation(); // 드래그 이벤트 방지
            onRemove(token.id);
        }}
        className="text-red-500 hover:text-red-400 font-bold text-lg leading-none p-1 rounded-full flex items-center justify-center h-6 w-6"
        aria-label={`Remove ${token.label}`}
      >
        &times;
      </button>
    </div>
  );
};

interface CanvasProps {
  tokens: Token[];
  onRemoveToken: (id: string) => void;
  onTokenOrderChange: (tokens: Token[]) => void;
  targetCanvas: 'first_pass' | 'second_pass'; // 캔버스를 구분하기 위한 prop 추가
}

// 토큰들을 담는 캔버스 컨테이너
const Canvas: React.FC<CanvasProps> = ({ tokens, onRemoveToken, onTokenOrderChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tokens.findIndex((t) => t.id === active.id);
      const newIndex = tokens.findIndex((t) => t.id === over.id);
      onTokenOrderChange(arrayMove(tokens, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg min-h-[200px] flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tokens.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tokens.length > 0 ? (
              tokens.map(token => <SortableToken key={token.id} token={token} onRemove={onRemoveToken} />)
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-500 text-center">팔레트에서 아이템을 클릭하여<br/>이곳에 추가하세요.</p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Canvas;
