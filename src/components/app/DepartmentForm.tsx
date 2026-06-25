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
import { useI18n } from "@/lib/i18n";

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  department?: Department | null;
}

export function DepartmentForm({ open, onOpenChange, department }: DepartmentFormProps) {
  const { addDepartment, updateDepartment } = useData();
  const { t } = useI18n();
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
          <DialogTitle>{department ? t("dept.edit") : t("dept.new")}</DialogTitle>
          <DialogDescription>
            {department ? t("dept.formEditDesc") : t("dept.formNewDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("common.department")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("dept.namePh")} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("dept.head")}</Label>
            <Input value={head} onChange={(e) => setHead(e.target.value)} placeholder={t("dept.headPh")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={submit}>{department ? t("common.saveChanges") : t("common.create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
