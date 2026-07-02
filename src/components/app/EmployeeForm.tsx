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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/lib/data-store";
import type { Employee } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  employee?: Employee | null;
}

export function EmployeeForm({ open, onOpenChange, employee }: EmployeeFormProps) {
  const { addEmployee, updateEmployee, departments } = useData();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (open) {
      setName(employee?.name ?? "");
      setDepartment(employee?.department ?? departments[0]?.name ?? "");
      setPosition(employee?.position ?? "");
      setEmail(employee?.email ?? "");
      setPhone(employee?.phone ?? "");
    }
  }, [open, employee, departments]);

  const submit = () => {
    if (!name.trim() || !department) return;
    const payload = {
      name: name.trim(),
      department,
      position: position.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };
    if (employee) updateEmployee(employee.id, payload);
    else addEmployee(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? t("emp.edit") : t("emp.new")}</DialogTitle>
          <DialogDescription>
            {employee ? t("emp.formEditDesc") : t("emp.formNewDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("common.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("common.department")}</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("common.position")}</Label>
              <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Developer" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("common.email")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("common.phone")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-0100" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={submit}>{employee ? t("common.saveChanges") : t("common.create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
