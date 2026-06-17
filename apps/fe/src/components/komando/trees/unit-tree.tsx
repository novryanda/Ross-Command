import { ChevronRightIcon, UsersIcon } from "lucide-react";
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
}: {
  nodes: UnitNode[];
  linkPrefix?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onToggle?: (unit: UnitNode) => void;
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
}: {
  node: UnitNode;
  linkPrefix?: string;
  selectable: boolean;
  selectedIds: string[];
  onToggle?: (unit: UnitNode) => void;
}) {
  const selected = selectedIds.includes(node.id);
  const body = (
    <Card
      className={cn(
        "py-0 transition-colors",
        selectable && "cursor-pointer hover:bg-accent/50",
        selected && "border-primary bg-primary/5",
      )}
      onClick={selectable ? () => onToggle?.(node) : undefined}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <div className="bg-muted flex size-8 items-center justify-center rounded-md">
          <ChevronRightIcon className="size-4" />
        </div>
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
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-2">
      {linkPrefix && !selectable ? <Link href={`${linkPrefix}/${node.id}`}>{body}</Link> : body}
      {node.children?.length ? (
        <div className="ml-5 border-l pl-3">
          <UnitTree
            nodes={node.children}
            linkPrefix={linkPrefix}
            selectable={selectable}
            selectedIds={selectedIds}
            onToggle={onToggle}
          />
        </div>
      ) : null}
    </div>
  );
}
