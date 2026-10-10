import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  UtensilsCrossed,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Mail,
  Store,
  Phone,
  Crown,
} from "lucide-react";
import { useAuth } from "@/presentation/hooks/useAuth";
import type { SignupRequest } from "@/domain/types";
import type { SubscriptionPlan } from "@/domain/types/subscription.types";
import { subscriptionService } from "@/application/services/subscription.service";
import { formatCurrency } from "@/shared/utils/currency.utils";
import { showErrorToast } from "@/shared/utils/toast";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { ThemeToggle } from "@/presentation/components/ui/theme-toggle";
import { Stepper, type StepperStep } from "@/presentation/components/ui/stepper";
import {
  PasswordRequirements,
  passwordsMatch,
} from "@/presentation/components/ui/password-requirements";
import {
  signupOwnerSchema,
  signupBranchSchema,
  signupPlanSchema,
  SIGNUP_LIMITS,
  type SignupOwnerFormData,
  type SignupBranchFormData,
  type SignupPlanFormData,
} from "./signup.schema";

type Step = "owner" | "branch" | "plan";

const STEPS: StepperStep[] = [
  { id: "owner", label: "Datos personales" },
  { id: "branch", label: "Sucursal" },
  { id: "plan", label: "Plan" },
];

const labelClass =
  "text-xs font-bold uppercase tracking-wide text-foreground";
const iconClass =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground";
const primaryButtonClass =
  "bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white font-semibold shadow-lg shadow-primary/30";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuth();
  const [step, setStep] = useState<Step>("owner");
  const [ownerData, setOwnerData] = useState<SignupOwnerFormData | null>(null);
  const [branchData, setBranchData] = useState<SignupBranchFormData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const ownerForm = useForm<SignupOwnerFormData>({
    resolver: zodResolver(signupOwnerSchema),
    mode: "onChange",
  });

  const branchForm = useForm<SignupBranchFormData>({
    resolver: zodResolver(signupBranchSchema),
  });

  const planForm = useForm<SignupPlanFormData>({
    resolver: zodResolver(signupPlanSchema),
  });

  useEffect(() => {
    subscriptionService
      .getPlans()
      .then((data) => {
        setPlans(data);
        if (data.length > 0) planForm.setValue("planId", data[0].id);
      })
      .catch(() => showErrorToast("Error al cargar planes"))
      .finally(() => setIsLoadingPlans(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const watchPassword = ownerForm.watch("password") || "";
  const watchConfirmPassword = ownerForm.watch("confirmPassword") || "";
  const doPasswordsMatch = passwordsMatch(watchPassword, watchConfirmPassword);
  const selectedPlanId = planForm.watch("planId");

  // Paso 1: solo valida y avanza, NO llama al backend.
  const onSubmitOwner = (data: SignupOwnerFormData) => {
    clearError();
    setOwnerData(data);
    setStep("branch");
  };

  // Paso 2: solo valida y avanza, NO llama al backend.
  const onSubmitBranch = (data: SignupBranchFormData) => {
    clearError();
    setBranchData(data);
    setStep("plan");
  };

  // Volver al paso 1 (desde el botón "Atrás" o desde el stepper).
  const goToOwnerStep = () => {
    clearError();
    setStep("owner");
  };

  // Volver al paso 2.
  const goToBranchStep = () => {
    clearError();
    setStep("branch");
  };

  // Paso 3: arma el payload completo y dispara el signup (única request al backend).
  const onSubmitPlan = async (planData: SignupPlanFormData) => {
    if (!ownerData || !branchData) {
      setStep("owner");
      return;
    }
    clearError();

    const payload: SignupRequest = {
      planId: planData.planId,
      user: {
        email: ownerData.email,
        password: ownerData.password,
        name: ownerData.name,
        lastName: ownerData.lastName,
      },
      organization: { name: ownerData.organizationName },
      branch: {
        name: branchData.name,
        state: branchData.state,
        city: branchData.city,
        street: branchData.street,
        exteriorNumber: branchData.exteriorNumber,
        phone: branchData.phone,
        rfc: branchData.rfc || null,
        // Autodetectado del navegador, no es un campo visible del formulario.
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    // El registro ya no pide pago: la organización nace con el período de prueba
    // y el cobro solo se pide al vencer (o si el negocio decide pagar antes).
    const result = await signup(payload);
    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="icon" />
      </div>

      {/* Logo */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <span className="text-2xl font-serif font-bold tracking-wide text-foreground">
            RESTIFY
          </span>
        </div>
      </div>

      {/* Stepper: indica el paso actual; clic en un paso completado regresa */}
      <div className="mb-6 w-full max-w-[640px]">
        <Stepper
          steps={STEPS}
          currentStep={step === "owner" ? 0 : step === "branch" ? 1 : 2}
          onStepClick={(index) => {
            if (index === 0) goToOwnerStep();
            if (index === 1) goToBranchStep();
          }}
        />
      </div>

      {/* Título + subtítulo del paso */}
      <div className="mb-6 max-w-[640px] text-center">
        <h2 className="text-h3 text-foreground">
          {step === "owner" && "Datos Personales y Organización"}
          {step === "branch" && "Primera Sucursal"}
          {step === "plan" && "Elige tu Plan"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "owner" &&
            "Comienza configurando tu perfil de administrador y los detalles de tu negocio."}
          {step === "branch" &&
            "Configura los detalles operativos de tu ubicación principal para comenzar a recibir pedidos."}
          {step === "plan" &&
            "Selecciona el plan con el que quieres comenzar. Puedes cambiarlo más adelante."}
        </p>
      </div>

      {/* Paso 1: Owner + Organización */}
      {step === "owner" && (
        <Card className="w-full max-w-[640px] shadow-lg border-border bg-card">
          <CardContent className="space-y-5 px-8 py-8">
            {error && (
              <div
                className="bg-destructive-suave border border-destructive text-destructive-texto px-4 py-3 rounded-lg"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="ml-2">{error}</span>
              </div>
            )}

            <form
              onSubmit={ownerForm.handleSubmit(onSubmitOwner)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={labelClass}>
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    {...ownerForm.register("name")}
                    maxLength={SIGNUP_LIMITS.name}
                    placeholder="Juan"
                    className={
                      ownerForm.formState.errors.name
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {ownerForm.formState.errors.name && (
                    <span className="text-destructive text-xs">
                      {ownerForm.formState.errors.name.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className={labelClass}>
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    {...ownerForm.register("lastName")}
                    maxLength={SIGNUP_LIMITS.lastName}
                    placeholder="Pérez"
                    className={
                      ownerForm.formState.errors.lastName
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {ownerForm.formState.errors.lastName && (
                    <span className="text-destructive text-xs">
                      {ownerForm.formState.errors.lastName.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>
                  Email
                </Label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <Input
                    id="email"
                    {...ownerForm.register("email")}
                    placeholder="correo@ejemplo.com"
                    type="email"
                    className={`pl-10 ${ownerForm.formState.errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                </div>
                {ownerForm.formState.errors.email && (
                  <span className="text-destructive text-xs">
                    {ownerForm.formState.errors.email.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName" className={labelClass}>
                  Nombre de la organización
                </Label>
                <div className="relative">
                  <Store className={iconClass} />
                  <Input
                    id="organizationName"
                    {...ownerForm.register("organizationName")}
                    maxLength={SIGNUP_LIMITS.branchName}
                    placeholder="Mi Restaurante"
                    className={`pl-10 ${ownerForm.formState.errors.organizationName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                </div>
                {ownerForm.formState.errors.organizationName && (
                  <span className="text-destructive text-xs">
                    {ownerForm.formState.errors.organizationName.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className={labelClass}>
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      {...ownerForm.register("password")}
                      placeholder="Crea una contraseña"
                      type={showPassword ? "text" : "password"}
                      className={`pr-10 ${ownerForm.formState.errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground focus:outline-none"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className={labelClass}>
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      {...ownerForm.register("confirmPassword")}
                      placeholder="Repite la contraseña"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`pr-10 ${
                        watchConfirmPassword.length > 0 && !doPasswordsMatch
                          ? "border-destructive focus-visible:ring-destructive"
                          : doPasswordsMatch
                            ? "border-fresco focus-visible:ring-fresco"
                            : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground focus:outline-none"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback de password (aparece al escribir) */}
              <PasswordRequirements
                password={watchPassword}
                requireSpecialChar={false}
              />
              {watchConfirmPassword.length > 0 && !doPasswordsMatch && (
                <span className="text-destructive text-xs">
                  Las contraseñas no coinciden
                </span>
              )}
              {doPasswordsMatch && (
                <span className="text-fresco text-xs flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Las contraseñas coinciden
                </span>
              )}

              <Button
                type="submit"
                className={`w-full h-12 text-base ${primaryButtonClass}`}
              >
                Siguiente Paso
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center pt-1">
                <span className="text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                </span>
                <Link
                  to="/auth/login"
                  className="text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 hover:underline font-semibold"
                >
                  Inicia sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: Primera sucursal */}
      {step === "branch" && (
        <Card className="w-full max-w-[640px] shadow-lg border-border bg-card">
          <CardContent className="space-y-5 px-8 py-8">
            {error && (
              <div
                className="bg-destructive-suave border border-destructive text-destructive-texto px-4 py-3 rounded-lg"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="ml-2">{error}</span>
              </div>
            )}

            <form
              onSubmit={branchForm.handleSubmit(onSubmitBranch)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="branchName" className={labelClass}>
                  Nombre de la sucursal
                </Label>
                <div className="relative">
                  <Store className={iconClass} />
                  <Input
                    id="branchName"
                    {...branchForm.register("name")}
                    maxLength={SIGNUP_LIMITS.branchName}
                    placeholder="Sucursal Centro"
                    className={`pl-10 ${branchForm.formState.errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                </div>
                {branchForm.formState.errors.name && (
                  <span className="text-destructive text-xs">
                    {branchForm.formState.errors.name.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className={labelClass}>
                    Estado
                  </Label>
                  <Input
                    id="state"
                    {...branchForm.register("state")}
                    placeholder="Jalisco"
                    className={
                      branchForm.formState.errors.state
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {branchForm.formState.errors.state && (
                    <span className="text-destructive text-xs">
                      {branchForm.formState.errors.state.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className={labelClass}>
                    Ciudad
                  </Label>
                  <Input
                    id="city"
                    {...branchForm.register("city")}
                    placeholder="Guadalajara"
                    className={
                      branchForm.formState.errors.city
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {branchForm.formState.errors.city && (
                    <span className="text-destructive text-xs">
                      {branchForm.formState.errors.city.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street" className={labelClass}>
                    Calle
                  </Label>
                  <Input
                    id="street"
                    {...branchForm.register("street")}
                    placeholder="Av. Juárez"
                    className={
                      branchForm.formState.errors.street
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {branchForm.formState.errors.street && (
                    <span className="text-destructive text-xs">
                      {branchForm.formState.errors.street.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exteriorNumber" className={labelClass}>
                    Número Exterior
                  </Label>
                  <Input
                    id="exteriorNumber"
                    {...branchForm.register("exteriorNumber")}
                    placeholder="123"
                    className={
                      branchForm.formState.errors.exteriorNumber
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {branchForm.formState.errors.exteriorNumber && (
                    <span className="text-destructive text-xs">
                      {branchForm.formState.errors.exteriorNumber.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className={labelClass}>
                    Teléfono
                  </Label>
                  <div className="relative">
                    <Phone className={iconClass} />
                    <Input
                      id="phone"
                      {...branchForm.register("phone")}
                      type="tel"
                      inputMode="numeric"
                      maxLength={SIGNUP_LIMITS.phoneDigits}
                      placeholder="3312345678"
                      className={`pl-10 ${branchForm.formState.errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>
                  {branchForm.formState.errors.phone && (
                    <span className="text-destructive text-xs">
                      {branchForm.formState.errors.phone.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfc" className={labelClass}>
                    RFC (opcional)
                  </Label>
                  <Input
                    id="rfc"
                    {...branchForm.register("rfc")}
                    maxLength={SIGNUP_LIMITS.rfc}
                    placeholder="XAXX010101000"
                  />
                  {branchForm.formState.errors.rfc && (
                    <span className="text-destructive text-xs">
                      {branchForm.formState.errors.rfc.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToOwnerStep}
                  className="h-12 px-6 text-base"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
                <Button
                  type="submit"
                  className={`flex-1 h-12 text-base ${primaryButtonClass}`}
                >
                  Siguiente Paso
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Paso 3: Plan de suscripción */}
      {step === "plan" && (
        <Card className="w-full max-w-[640px] shadow-lg border-border bg-card">
          <CardContent className="space-y-5 px-8 py-8">
            {error && (
              <div
                className="bg-destructive-suave border border-destructive text-destructive-texto px-4 py-3 rounded-lg"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="ml-2">{error}</span>
              </div>
            )}

            <form
              onSubmit={planForm.handleSubmit(onSubmitPlan)}
              className="space-y-5"
            >
              {isLoadingPlans ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const isAnnual = plan.billingPeriod === "ANNUAL";
                    const priceDisplay = formatCurrency(plan.price / 100);
                    const periodLabel = isAnnual ? "/año" : "/mes";

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => planForm.setValue("planId", plan.id)}
                        className={`relative rounded-xl border-2 bg-card p-5 text-left transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-border dark:hover:border-border"
                        }`}
                      >
                        {isAnnual && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                            <span className="bg-fresco text-white text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Mejor valor
                            </span>
                          </div>
                        )}
                        <div className="text-center mt-1">
                          <h3 className="text-h3 text-foreground mb-1">
                            {plan.name}
                          </h3>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-h2 text-foreground">
                              {priceDisplay}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {periodLabel}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            45 días gratis · sin tarjeta
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {planForm.formState.errors.planId && (
                <span className="text-destructive text-xs">
                  {planForm.formState.errors.planId.message}
                </span>
              )}

              <div className="flex items-center gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToBranchStep}
                  className="h-12 px-6 text-base"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isLoadingPlans || !selectedPlanId}
                  className={`flex-1 h-12 text-base ${primaryButtonClass}`}
                >
                  {isLoading ? "Creando cuenta..." : "Completar Registro"}
                  {!isLoading && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
