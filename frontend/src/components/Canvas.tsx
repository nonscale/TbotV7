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
    padding: '8px',
    margin: '4px',
    border: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>{token.label}</span>
      <button
        onClick={() => onRemove(token.id)}
        style={{ cursor: 'pointer', border: 'none', background: 'transparent', color: 'red', fontWeight: 'bold' }}
      >
        X
      </button>
    </div>
  );
};


interface CanvasProps {
  tokens: Token[];
  onRemoveToken: (id: string) => void;
  onTokenOrderChange: (tokens: Token[]) => void;
}

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
    <div style={{ border: '1px solid #ccc', padding: '10px', minHeight: '200px', borderRadius: '5px' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tokens.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tokens.length > 0 ? (
            tokens.map(token => <SortableToken key={token.id} token={token} onRemove={onRemoveToken} />)
          ) : (
            <p style={{ color: '#888' }}>Click items from the palette to add them here.</p>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Canvas;
