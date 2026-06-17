"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnitTree } from "@/components/komando/trees/unit-tree";
import type { UnitNode, UserListItem } from "@/lib/api/types";

export type OrderTargetInput = {
  targetType: "unit" | "individual";
  unitId?: string;
  userId?: string;
};

export function TargetPicker({
  units,
  members,
  value,
  onChange,
}: {
  units: UnitNode[];
  members: UserListItem[];
  value: OrderTargetInput[];
  onChange: (value: OrderTargetInput[]) => void;
}) {
  const [mode, setMode] = useState<"unit" | "individual">("unit");
  const selectedUnitIds = useMemo(
    () => value.filter((item) => item.targetType === "unit" && item.unitId).map((item) => item.unitId as string),
    [value],
  );
  const selectedUserIds = useMemo(
    () => value.filter((item) => item.targetType === "individual" && item.userId).map((item) => item.userId as string),
    [value],
  );

  function toggleTarget(target: OrderTargetInput) {
    const key = target.targetType === "unit" ? target.unitId : target.userId;
    const exists = value.some((item) => {
      const itemKey = item.targetType === "unit" ? item.unitId : item.userId;
      return item.targetType === target.targetType && itemKey === key;
    });
    onChange(exists ? value.filter((item) => (item.targetType === "unit" ? item.unitId : item.userId) !== key) : [...value, target]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant={mode === "unit" ? "default" : "outline"} onClick={() => setMode("unit")}>
          Target Satuan
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "individual" ? "default" : "outline"}
          onClick={() => setMode("individual")}
        >
          Target Individu
        </Button>
        <Badge variant="secondary" className="ml-auto rounded-sm">{value.length} target</Badge>
      </div>

      {mode === "unit" ? (
        <UnitTree
          nodes={units}
          selectable
          selectedIds={selectedUnitIds}
          onToggle={(unit) => toggleTarget({ targetType: "unit", unitId: unit.id })}
        />
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {members.map((member) => {
            const selected = selectedUserIds.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                className={`rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent ${selected ? "border-primary bg-primary/5" : ""}`}
                onClick={() => toggleTarget({ targetType: "individual", userId: member.id })}
              >
                <span className="block font-medium">{member.fullName}</span>
                <span className="text-muted-foreground block text-xs">@{member.username} {member.unit?.name ? `· ${member.unit.name}` : ""}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
