"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { UnitNode } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type UnitAdminTreeProps = {
  nodes: UnitNode[];
  onSelect: (unit: UnitNode) => void;
};

export function UnitAdminTree({ nodes, onSelect }: UnitAdminTreeProps) {
  if (!nodes.length) return null;

  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <UnitAdminTreeNode key={node.id} node={node} depth={0} onSelect={onSelect} />
      ))}
    </div>
  );
}

function UnitAdminTreeNode({
  node,
  depth,
  onSelect,
}: {
  node: UnitNode;
  depth: number;
  onSelect: (unit: UnitNode) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const [open, setOpen] = useState(depth < 1);

  const card = (
    <Card
      className="hover:bg-accent/40 cursor-pointer py-0 transition-colors"
      onClick={() => onSelect(node)}
    >
      <CardContent className="flex items-center gap-3 p-3">
        {hasChildren ? (
          <button
            type="button"
            className="bg-muted hover:bg-muted/80 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen((current) => !current);
            }}
            aria-expanded={open}
            aria-label={open ? `Tutup ${node.name}` : `Buka ${node.name}`}
          >
            {open ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
          </button>
        ) : (
          <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
            <UsersIcon className="size-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{node.name}</p>
          <p className="text-muted-foreground truncate text-xs">
            Level {node.depthLevel}
            {node.commander ? ` - Pimpinan: ${node.commander.fullName}` : ""}
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 rounded-sm">
          <UsersIcon className="size-3" />
          {node.directMembers?.length ?? 0}
        </Badge>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-2">
      {card}
      {hasChildren && open ? (
        <div className="ml-5 border-l pl-3">
          <div className="space-y-2">
            {node.children.map((child) => (
              <UnitAdminTreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
