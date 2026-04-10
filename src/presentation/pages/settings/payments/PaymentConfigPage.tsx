import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Eye, EyeOff, Info, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { settingsService } from '@/application/services/settings.service';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import type { SavePaymentConfigRequest } from '@/domain/types/settings.types';

interface FormState {
  accessToken: string;
  webhookSecret: string;
}

const INITIAL_FORM: FormState = {
  accessToken: '',
  webhookSecret: '',
};

const configCardClass =
  'rounded-xl border-slate-200 dark:border-slate-700/80 bg-card dark:bg-slate-900/30 shadow-sm';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
      {children}
    </span>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{children}</p>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const PaymentConfigPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM });
  const [isSaving, setIsSaving] = useState(false);
  const [dirtyFields, setDirtyFields] = useState<Set<keyof FormState>>(new Set());

  const { data: config, isLoading } = useQuery({
    queryKey: ['payment-config'],
    queryFn: () => settingsService.getPaymentConfig(),
  });

  useEffect(() => {
    if (config) {
      setForm({
        accessToken: config.mercadoPago.accessToken,
        webhookSecret: config.mercadoPago.webhookSecret,
      });
      setDirtyFields(new Set());
    }
  }, [config]);

  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirtyFields((prev) => new Set(prev).add(field));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: SavePaymentConfigRequest = { mercadoPago: {} };
      if (dirtyFields.has('accessToken')) payload.mercadoPago!.accessToken = form.accessToken;
      if (dirtyFields.has('webhookSecret')) payload.mercadoPago!.webhookSecret = form.webhookSecret;

      await settingsService.savePaymentConfig(payload);
      await queryClient.invalidateQueries({ queryKey: ['payment-config'] });
      setDirtyFields(new Set());
      showSuccessToast('Configuración guardada', 'Las credenciales de Mercado Pago se actualizaron correctamente.');
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al guardar', error.message);
      } else {
        showErrorToast('Error al guardar', 'No se pudieron guardar los cambios.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (config) {
      setForm({
        accessToken: config.mercadoPago.accessToken,
        webhookSecret: config.mercadoPago.webhookSecret,
      });
      setDirtyFields(new Set());
    } else {
      setForm({ ...INITIAL_FORM });
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con badge */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Configuración de Mercado Pago
          </h2>
          {config?.isConfigured ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wider">
              Configurado
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider">
              Pendiente
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Configura las credenciales de tu cuenta de Mercado Pago para recibir pagos con QR en
          tu restaurante. Obtén estas credenciales desde tu panel de Mercado Pago en{' '}
          <span className="text-blue-500 dark:text-blue-400 font-medium">
            Credenciales {'>'} Credenciales de producción
          </span>.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Credenciales de Producción */}
        <Card className={configCardClass}>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              Credenciales de Producción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel>Access Token</FieldLabel>
                <PasswordInput
                  id="mp-access-token"
                  value={form.accessToken}
                  onChange={(v) => updateField('accessToken', v)}
                  placeholder="APP_USR-..."
                />
                <FieldHint>Token de producción de MP (APP_USR-...)</FieldHint>
              </div>
              <div>
                <FieldLabel>Webhook Secret</FieldLabel>
                <PasswordInput
                  id="mp-webhook-secret"
                  value={form.webhookSecret}
                  onChange={(v) => updateField('webhookSecret', v)}
                  placeholder="Clave secreta"
                />
                <FieldHint>Clave secreta para validar webhooks</FieldHint>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info note */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Prueba de Conexión</p>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/70 mt-0.5">
              Asegúrate de que tu servidor sea accesible públicamente para que Mercado Pago pueda
              enviar las notificaciones de webhook correctamente.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSaving || dirtyFields.size === 0} className="gap-2">
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Configuración
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentConfigPage;
