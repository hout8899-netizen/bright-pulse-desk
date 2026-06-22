import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useData } from "@/lib/data-store";
import type { Department } from "@/lib/mock-data";

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  department?: Department | null;
}

export function DepartmentForm({ open, onOpenChange, department }: DepartmentFormProps) {
  const { addDepartment, updateDepartment } = useData();
  const [name, setName] = useState("");
  const [head, setHead] = useState("");

  useEffect(() => {
    if (open) {
      setName(department?.name ?? "");
      setHead(department?.head ?? "");
    }
  }, [open, department]);

  const submit = () => {
    if (!name.trim()) return;
    if (department) updateDepartment(department.id, { name: name.trim(), head: head.trim() });
    else addDepartment({ name: name.trim(), head: head.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{department ? "Edit Department" : "New Department"}</DialogTitle>
          <DialogDescription>
            {department ? "Update the department details." : "Create a new department."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Department Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Department Head</Label>
            <Input value={head} onChange={(e) => setHead(e.target.value)} placeholder="Head of department" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{department ? "Save Changes" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
