import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "km" | "zh";

const STORAGE_KEY = "tpt.lang";

const dict = {
  en: {
    "app.title": "TASK & PROJECT TRACKER",
    "app.tagline": "Track Tasks, Monitor Progress, Achieve Results",
    "nav.dashboard": "Dashboard",
    "nav.tasks": "Tasks",
    "nav.projects": "Projects",
    "nav.departments": "Departments",
    "nav.employees": "Employees",
    "nav.users": "Users",
    "account.label": "Account",
    "account.notSignedIn": "Not signed in",
    "account.admin": "Admin",
    "account.member": "Member",
    "account.manageUsers": "Manage users",
    "account.logout": "Log out",
    "lang.label": "Language",
    "footer.disclaimer": "Disclaimer:",
    "footer.text": "This tracker is for internal use only. Data accuracy is the responsibility of the user.",
  },
  km: {
    "app.title": "កម្មវិធីតាមដានកិច្ចការ និងគម្រោង",
    "app.tagline": "តាមដានកិច្ចការ ត្រួតពិនិត្យវឌ្ឍនភាព សម្រេចលទ្ធផល",
    "nav.dashboard": "ផ្ទាំងគ្រប់គ្រង",
    "nav.tasks": "កិច្ចការ",
    "nav.projects": "គម្រោង",
    "nav.departments": "នាយកដ្ឋាន",
    "nav.employees": "បុគ្គលិក",
    "nav.users": "អ្នកប្រើប្រាស់",
    "account.label": "គណនី",
    "account.notSignedIn": "មិនទាន់ចូលប្រើ",
    "account.admin": "អ្នកគ្រប់គ្រង",
    "account.member": "សមាជិក",
    "account.manageUsers": "គ្រប់គ្រងអ្នកប្រើ",
    "account.logout": "ចាកចេញ",
    "lang.label": "ភាសា",
    "footer.disclaimer": "សេចក្តីបដិសេធ៖",
    "footer.text": "កម្មវិធីនេះសម្រាប់ប្រើផ្ទៃក្នុងតែប៉ុណ្ណោះ។ ភាពត្រឹមត្រូវនៃទិន្នន័យជាទំនួលខុសត្រូវរបស់អ្នកប្រើ។",
  },
  zh: {
    "app.title": "任务与项目跟踪器",
    "app.tagline": "跟踪任务，监控进度，达成成果",
    "nav.dashboard": "仪表板",
    "nav.tasks": "任务",
    "nav.projects": "项目",
    "nav.departments": "部门",
    "nav.employees": "员工",
    "nav.users": "用户",
    "account.label": "账户",
    "account.notSignedIn": "未登录",
    "account.admin": "管理员",
    "account.member": "成员",
    "account.manageUsers": "管理用户",
    "account.logout": "退出登录",
    "lang.label": "语言",
    "footer.disclaimer": "免责声明：",
    "footer.text": "此跟踪器仅供内部使用。数据准确性由用户负责。",
  },
} as const;

export type TKey = keyof (typeof dict)["en"];

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "km", label: "Khmer", native: "ខ្មែរ" },
  { code: "zh", label: "Chinese", native: "中文" },
];

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string };
const I18nContext = createContext<Ctx | null>(null);

function readInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "en" || v === "km" || v === "zh") return v;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(readInitial());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((k: TKey) => dict[lang][k] ?? dict.en[k] ?? k, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
