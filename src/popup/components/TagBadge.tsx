import React from "react"
import { MdClose } from "react-icons/md"
import type { Tag } from "~shared/types"

interface TagBadgeProps {
  tag: Tag
  onRemove?: () => void
  size?: "sm" | "md"
}

export function TagBadge({ tag, onRemove, size = "sm" }: TagBadgeProps) {
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: tag.color + "20", // 12% opacity
        color: tag.color,
        border: `1px solid ${tag.color}40`
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: tag.color }}
      />
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 p-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove tag ${tag.name}`}
        >
          <MdClose size={12} />
        </button>
      )}
    </span>
  )
}
