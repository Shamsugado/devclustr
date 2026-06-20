"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewItemDialog from "@/components/items/NewItemDialog";
import type { SidebarItemType } from "@/components/dashboard/Sidebar";

interface AddTypeButtonProps {
  label: string;
  itemTypes: SidebarItemType[];
  initialTypeId: string;
}

export default function AddTypeButton({ label, itemTypes, initialTypeId }: AddTypeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add {label}
      </Button>
      <NewItemDialog
        open={open}
        onOpenChange={setOpen}
        itemTypes={itemTypes}
        initialTypeId={initialTypeId}
      />
    </>
  );
}
