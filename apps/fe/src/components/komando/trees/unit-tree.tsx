"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { UnitNode } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function UnitTree({
  nodes,
  linkPrefix,
  selectable = false,
  selectedIds = [],
  onToggle,
  defaultExpanded = true,
}: {
  nodes: UnitNode[];
  linkPrefix?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onToggle?: (unit: UnitNode) => void;
  defaultExpanded?: boolean;
}) {
  if (!nodes.length) return null;

  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <UnitTreeNode
          key={node.id}
          node={node}
          linkPrefix={linkPrefix}
          selectable={selectable}
          selectedIds={selectedIds}
          onToggle={onToggle}
          defaultExpanded={defaultExpanded}
        />
      ))}
    </div>
  );
}

function UnitTreeNode({
  node,
  linkPrefix,
  selectable,
  selectedIds,
  onToggle,
  defaultExpanded,
}: {
  node: UnitNode;
  linkPrefix?: string;
  selectable: boolean;
  selectedIds: string[];
  onToggle?: (unit: UnitNode) => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const selected = selectedIds.includes(node.id);

  const card = (
    <Card
      className={cn(
        "py-0 transition-colors",
        selectable && "cursor-pointer hover:bg-accent/50",
        selected && "border-primary bg-primary/5",
      )}
      onClick={selectable ? () => onToggle?.(node) : undefined}
    >
      <CardContent className="flex items-center gap-3 p-3">
        {hasChildren ? (
          <button
            type="button"
            className="bg-muted hover:bg-muted/80 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded((current) => !current);
            }}
            aria-expanded={expanded}
            aria-label={expanded ? `Tutup ${node.name}` : `Buka ${node.name}`}
          >
            {expanded ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
          </button>
        ) : (
          <div className="size-8 shrink-0" aria-hidden />
        )}
        {linkPrefix && !selectable ? (
          <Link href={`${linkPrefix}/${node.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{node.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                Level {node.depthLevel}
                {node.commander ? ` · Komandan: ${node.commander.fullName}` : ""}
              </p>
            </div>
            <Badge variant="secondary" className="gap-1 rounded-sm">
              <UsersIcon className="size-3" />
              {node.directMembers?.length ?? 0}
            </Badge>
          </Link>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{node.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                Level {node.depthLevel}
                {node.commander ? ` · Komandan: ${node.commander.fullName}` : ""}
              </p>
            </div>
            <Badge variant="secondary" className="gap-1 rounded-sm">
              <UsersIcon className="size-3" />
              {node.directMembers?.length ?? 0}
            </Badge>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-2">
      {card}
      {hasChildren && expanded ? (
        <div className="ml-5 border-l pl-3">
          <UnitTree
            nodes={node.children}
            linkPrefix={linkPrefix}
            selectable={selectable}
            selectedIds={selectedIds}
            onToggle={onToggle}
            defaultExpanded={defaultExpanded}
          />
        </div>
      ) : null}
    </div>
  );
}
