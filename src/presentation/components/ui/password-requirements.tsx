import { Check, Circle } from 'lucide-react';

const REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres', test: (pw: string) => pw.length >= 8 },
  { label: 'Una letra mayúscula', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Una letra minúscula', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'Un número', test: (pw: string) => /\d/.test(pw) },
  { label: 'Un carácter especial', test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pw) },
];

interface PasswordRequirementsProps {
  password: string;
  /** Si es false, oculta el requisito de carácter especial (ej. signup). Default true. */
  requireSpecialChar?: boolean;
}

export function PasswordRequirements({ password, requireSpecialChar = true }: PasswordRequirementsProps) {
  if (!password) return null;

  const requirements = requireSpecialChar
    ? REQUIREMENTS
    : REQUIREMENTS.filter((req) => req.label !== 'Un carácter especial');

  return (
    <ul className="space-y-1 mt-2">
      {requirements.map((req) => {
        const met = req.test(password);
        return (
          <li key={req.label} className="flex items-center gap-2">
            {met ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-slate-300 dark:text-muted-foreground" />
            )}
            <span className={`text-xs ${met ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-muted-foreground'}`}>
              {req.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password.length > 0 && confirm.length > 0 && password === confirm;
}
