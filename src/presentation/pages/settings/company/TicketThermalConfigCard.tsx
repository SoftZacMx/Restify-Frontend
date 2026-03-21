import React, { useCallback, useState } from 'react';
import {
  ChevronDown,
  LayoutTemplate,
  Receipt,
  ChefHat,
  AlignLeft,
  ListOrdered,
  Calculator,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import type { ResolvedTicketPrintConfig } from '@/shared/utils/ticket-print-config';
import { cn } from '@/shared/lib/utils';

interface TicketThermalConfigCardProps {
  value: ResolvedTicketPrintConfig;
  onChange: (next: ResolvedTicketPrintConfig) => void;
  disabled?: boolean;
}

function RowSwitch({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-200/80 dark:border-slate-700/80 last:border-0">
      <Label htmlFor={id} className="text-sm font-normal cursor-pointer flex-1 text-slate-700 dark:text-slate-200">
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

const fieldLabelClass =
  'text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5';

function CollapsibleSection({
  id,
  title,
  description,
  defaultOpen = false,
  icon: Icon,
  nested = false,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  icon?: LucideIcon;
  nested?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden border transition-colors',
        nested
          ? 'border-slate-200/90 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-950/40'
          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/35'
      )}
    >
      <button
        type="button"
        id={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 text-left transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/40',
          nested ? 'p-2.5' : 'p-3.5'
        )}
      >
        {Icon ? (
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-lg text-blue-600 dark:text-sky-400',
              nested ? 'h-8 w-8 bg-slate-200/80 dark:bg-slate-800/80' : 'h-10 w-10 bg-blue-500/10 dark:bg-sky-500/15'
            )}
            aria-hidden
          >
            <Icon className={cn(nested ? 'h-4 w-4' : 'h-5 w-5')} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'font-semibold text-slate-900 dark:text-slate-100',
              nested ? 'text-xs' : 'text-sm'
            )}
          >
            {title}
          </div>
          {description ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{description}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400 transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          className={cn(
            'border-t border-slate-200 dark:border-slate-700/80',
            nested ? 'px-3 pb-3 pt-1' : 'px-4 pb-4 pt-2'
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

const switchListClass =
  'rounded-lg border border-slate-200/90 dark:border-slate-700/60 divide-y divide-slate-200/90 dark:divide-slate-700/60 px-2 bg-white/50 dark:bg-slate-950/25';

/**
 * Configuración de tickets térmicos (venta y cocina): layout, visibilidad y pie.
 */
export const TicketThermalConfigCard: React.FC<TicketThermalConfigCardProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const patchLayout = useCallback(
    (partial: Partial<ResolvedTicketPrintConfig['layout']>) => {
      onChange({
        ...value,
        layout: { ...value.layout, ...partial },
      });
    },
    [onChange, value]
  );

  const patchSale = useCallback(
    (partial: Partial<ResolvedTicketPrintConfig['sale']>) => {
      onChange({
        ...value,
        sale: { ...value.sale, ...partial },
      });
    },
    [onChange, value]
  );

  const patchKitchen = useCallback(
    (partial: Partial<ResolvedTicketPrintConfig['kitchen']>) => {
      onChange({
        ...value,
        kitchen: { ...value.kitchen, ...partial },
      });
    },
    [onChange, value]
  );

  const s = value.sale;
  const k = value.kitchen;
  const L = value.layout;

  const layoutFields = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
      <div>
        <label htmlFor="tp-width" className={fieldLabelClass}>
          Ancho papel (mm)
        </label>
        <Input
          id="tp-width"
          type="number"
          min={40}
          max={120}
          step={1}
          value={L.paperWidthMm}
          onChange={(e) => patchLayout({ paperWidthMm: Number(e.target.value) || 58 })}
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="tp-pv" className={fieldLabelClass}>
          Padding V (mm)
        </label>
        <Input
          id="tp-pv"
          type="number"
          min={0}
          max={10}
          step={0.5}
          value={L.bodyPaddingVerticalMm}
          onChange={(e) => patchLayout({ bodyPaddingVerticalMm: Number(e.target.value) || 0 })}
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="tp-ph" className={fieldLabelClass}>
          Padding H (mm)
        </label>
        <Input
          id="tp-ph"
          type="number"
          min={0}
          max={10}
          step={0.5}
          value={L.bodyPaddingHorizontalMm}
          onChange={(e) => patchLayout({ bodyPaddingHorizontalMm: Number(e.target.value) || 0 })}
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="tp-font" className={fieldLabelClass}>
          Fuente base (pt)
        </label>
        <Input
          id="tp-font"
          type="number"
          min={6}
          max={20}
          step={1}
          value={L.baseFontPt}
          onChange={(e) => patchLayout({ baseFontPt: Number(e.target.value) || 13 })}
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="tp-mb" className={fieldLabelClass}>
          Item margin B (px)
        </label>
        <Input
          id="tp-mb"
          type="number"
          min={0}
          max={40}
          step={1}
          value={L.itemBlockMarginBottomPx}
          onChange={(e) => patchLayout({ itemBlockMarginBottomPx: Number(e.target.value) || 0 })}
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="tp-pb" className={fieldLabelClass}>
          Item padding B (px)
        </label>
        <Input
          id="tp-pb"
          type="number"
          min={0}
          max={40}
          step={1}
          value={L.itemBlockPaddingBottomPx}
          onChange={(e) => patchLayout({ itemBlockPaddingBottomPx: Number(e.target.value) || 0 })}
          disabled={disabled}
        />
      </div>
    </div>
  );

  const saleEncabezado = (
    <div className={cn(switchListClass, 'mt-1')}>
      <RowSwitch
        id="tp-s-branch"
        label="Sucursal / segunda línea de marca"
        checked={s.showBrandBranch}
        onCheckedChange={(v) => patchSale({ showBrandBranch: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-contact"
        label="Bloque de contacto (activa las opciones de abajo)"
        checked={s.showContact}
        onCheckedChange={(v) => patchSale({ showContact: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-rfc"
        label="RFC en contacto"
        checked={s.showContactRfc}
        onCheckedChange={(v) => patchSale({ showContactRfc: v })}
        disabled={disabled || !s.showContact}
      />
      <RowSwitch
        id="tp-s-addr"
        label="Dirección en contacto"
        checked={s.showContactAddress}
        onCheckedChange={(v) => patchSale({ showContactAddress: v })}
        disabled={disabled || !s.showContact}
      />
      <RowSwitch
        id="tp-s-phone"
        label="Teléfono en contacto"
        checked={s.showContactPhone}
        onCheckedChange={(v) => patchSale({ showContactPhone: v })}
        disabled={disabled || !s.showContact}
      />
      <RowSwitch
        id="tp-s-title"
        label="Título «TICKET DE VENTA»"
        checked={s.showTicketTitle}
        onCheckedChange={(v) => patchSale({ showTicketTitle: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-oid"
        label="Número de ticket (#)"
        checked={s.showOrderId}
        onCheckedChange={(v) => patchSale({ showOrderId: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-dt"
        label="Fecha y hora"
        checked={s.showDateTime}
        onCheckedChange={(v) => patchSale({ showDateTime: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-table"
        label="Mesa / para llevar"
        checked={s.showTableLine}
        onCheckedChange={(v) => patchSale({ showTableLine: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-cons"
        label="Encabezado de sección consumo"
        checked={s.showConsumoHeader}
        onCheckedChange={(v) => patchSale({ showConsumoHeader: v })}
        disabled={disabled}
      />
    </div>
  );

  const saleContenido = (
    <div className={cn(switchListClass, 'mt-1')}>
      <RowSwitch
        id="tp-s-qty"
        label="Cantidad por línea"
        checked={s.showItemQuantity}
        onCheckedChange={(v) => patchSale({ showItemQuantity: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-ex"
        label="Extras por ítem"
        checked={s.showItemExtras}
        onCheckedChange={(v) => patchSale({ showItemExtras: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-price"
        label="Precio por línea"
        checked={s.showLinePrice}
        onCheckedChange={(v) => patchSale({ showLinePrice: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-note"
        label="Nota por ítem"
        checked={s.showItemNote}
        onCheckedChange={(v) => patchSale({ showItemNote: v })}
        disabled={disabled}
      />
    </div>
  );

  const saleTotales = (
    <div className={cn(switchListClass, 'mt-1')}>
      <RowSwitch
        id="tp-s-sub"
        label="Subtotal"
        checked={s.showSubtotal}
        onCheckedChange={(v) => patchSale({ showSubtotal: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-iva"
        label="IVA"
        checked={s.showIva}
        onCheckedChange={(v) => patchSale({ showIva: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-tip"
        label="Propina (si aplica)"
        checked={s.showTip}
        onCheckedChange={(v) => patchSale({ showTip: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-tot"
        label="Total"
        checked={s.showTotal}
        onCheckedChange={(v) => patchSale({ showTotal: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-s-center"
        label="Centrar bloque de totales (y pie si aplica)"
        checked={s.centerTotalsBlock}
        onCheckedChange={(v) => patchSale({ centerTotalsBlock: v })}
        disabled={disabled}
      />
    </div>
  );

  const salePago = (
    <>
      <div className={cn(switchListClass, 'mt-1')}>
        <RowSwitch
          id="tp-s-pay"
          label="Método de pago"
          checked={s.showPaymentMethod}
          onCheckedChange={(v) => patchSale({ showPaymentMethod: v })}
          disabled={disabled}
        />
        <RowSwitch
          id="tp-s-del"
          label="Estado entregado / pendiente"
          checked={s.showDeliveredStatus}
          onCheckedChange={(v) => patchSale({ showDeliveredStatus: v })}
          disabled={disabled}
        />
        <RowSwitch
          id="tp-s-foot"
          label="Mostrar pie de ticket"
          checked={s.showFooter}
          onCheckedChange={(v) => patchSale({ showFooter: v })}
          disabled={disabled}
        />
      </div>
      <div className="mt-4 space-y-2">
        <label htmlFor="tp-footer-text" className={fieldLabelClass}>
          Texto del pie (una línea)
        </label>
        <Input
          id="tp-footer-text"
          value={s.footerText}
          onChange={(e) => patchSale({ footerText: e.target.value })}
          placeholder="Restify"
          maxLength={120}
          disabled={disabled || !s.showFooter}
        />
      </div>
    </>
  );

  const kitchenEncabezado = (
    <div className={cn(switchListClass, 'mt-1')}>
      <RowSwitch
        id="tp-k-br"
        label="Subtítulo «COCINA»"
        checked={k.showBrandBranch}
        onCheckedChange={(v) => patchKitchen({ showBrandBranch: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-k-ord"
        label="Número de orden"
        checked={k.showOrderId}
        onCheckedChange={(v) => patchKitchen({ showOrderId: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-k-tbl"
        label="Mesa / para llevar"
        checked={k.showTableLine}
        onCheckedChange={(v) => patchKitchen({ showTableLine: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-k-ph"
        label="Encabezado de pedido"
        checked={k.showPedidoHeader}
        onCheckedChange={(v) => patchKitchen({ showPedidoHeader: v })}
        disabled={disabled}
      />
    </div>
  );

  const kitchenContenido = (
    <div className={cn(switchListClass, 'mt-1')}>
      <RowSwitch
        id="tp-k-qty"
        label="Cantidad"
        checked={k.showItemQuantity}
        onCheckedChange={(v) => patchKitchen({ showItemQuantity: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-k-ex"
        label="Extras"
        checked={k.showItemExtras}
        onCheckedChange={(v) => patchKitchen({ showItemExtras: v })}
        disabled={disabled}
      />
      <RowSwitch
        id="tp-k-note"
        label="Nota por ítem"
        checked={k.showItemNote}
        onCheckedChange={(v) => patchKitchen({ showItemNote: v })}
        disabled={disabled}
      />
    </div>
  );

  return (
    <Card className="rounded-xl border-slate-200 dark:border-slate-700/80 bg-card dark:bg-slate-900/30 shadow-sm overflow-hidden">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Configuración de ticket</CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visibilidad y medidas del ticket. Se guarda con &quot;Guardar cambios&quot;.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <CollapsibleSection
          id="tp-section-layout"
          title="Papel y tipografía"
          description="Dimensiones físicas y espaciado base"
          defaultOpen
          icon={LayoutTemplate}
        >
          {layoutFields}
        </CollapsibleSection>

        <CollapsibleSection
          id="tp-sale-root"
          title="Ticket de venta"
          description="Elementos visibles en el recibo de cliente"
          icon={Receipt}
        >
          <div className="space-y-2 pt-1">
            <CollapsibleSection
              id="tp-sale-header"
              title="Encabezado"
              description="Marca, contacto, título, número, fecha y mesa"
              icon={AlignLeft}
              nested
            >
              {saleEncabezado}
            </CollapsibleSection>
            <CollapsibleSection
              id="tp-sale-content"
              title="Contenido"
              description="Líneas de producto: cantidad, extras, precio y nota"
              icon={ListOrdered}
              nested
            >
              {saleContenido}
            </CollapsibleSection>
            <CollapsibleSection
              id="tp-sale-totals"
              title="Totales"
              description="Subtotal, impuestos, propina, total y alineación"
              icon={Calculator}
              nested
            >
              {saleTotales}
            </CollapsibleSection>
            <CollapsibleSection
              id="tp-sale-payment"
              title="Pago"
              description="Método de pago, entrega, pie de ticket y texto final"
              icon={CreditCard}
              nested
            >
              {salePago}
            </CollapsibleSection>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="tp-kitchen-root"
          title="Ticket de cocina"
          description="Optimización para área de preparación"
          icon={ChefHat}
        >
          <div className="space-y-2 pt-1">
            <CollapsibleSection
              id="tp-kitchen-header"
              title="Encabezado"
              description="Marca, orden, mesa y título del pedido"
              icon={AlignLeft}
              nested
            >
              {kitchenEncabezado}
            </CollapsibleSection>
            <CollapsibleSection
              id="tp-kitchen-content"
              title="Contenido"
              description="Cantidad, extras y notas por ítem"
              icon={ListOrdered}
              nested
            >
              {kitchenContenido}
            </CollapsibleSection>
          </div>
        </CollapsibleSection>
      </CardContent>
    </Card>
  );
};
