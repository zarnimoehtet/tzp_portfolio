"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DragHandleProps {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
}

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (handle: DragHandleProps, isDragging: boolean) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10 opacity-80")}
    >
      {children({ attributes, listeners }, isDragging)}
    </li>
  );
}

export function DragHandle({ attributes, listeners, className }: DragHandleProps & { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      className={cn(
        "flex cursor-grab touch-none items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing",
        className,
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  );
}

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (ids: string[]) => Promise<ActionResult>;
  renderItem: (item: T, handle: DragHandleProps, isDragging: boolean) => ReactNode;
  layout?: "list" | "grid";
  className?: string;
  disabled?: boolean;
}

/** Drag-and-drop (mouse, touch, keyboard) reordering with optimistic updates. */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  layout = "list",
  className,
  disabled,
}: SortableListProps<T>) {
  const [ordered, setOrdered] = useState(items);
  const [sourceItems, setSourceItems] = useState(items);
  const [, startTransition] = useTransition();

  // Re-sync with fresh server data after a refresh.
  if (items !== sourceItems) {
    setSourceItems(items);
    setOrdered(items);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ordered.findIndex((i) => i.id === active.id);
    const to = ordered.findIndex((i) => i.id === over.id);
    const next = arrayMove(ordered, from, to);
    const previous = ordered;
    setOrdered(next);
    startTransition(async () => {
      const result = await onReorder(next.map((i) => i.id));
      if (!result.ok) {
        setOrdered(previous);
        toast.error(result.error);
      }
    });
  }

  return (
    <DndContext
      sensors={disabled ? undefined : sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ordered.map((i) => i.id)}
        strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
        disabled={disabled}
      >
        <ul className={className}>
          {ordered.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {(handle, isDragging) => renderItem(item, handle, isDragging)}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
