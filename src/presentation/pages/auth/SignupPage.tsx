import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/presentation/hooks/useAuth";
import type { SignupRequest } from "@/domain/types";
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
  SIGNUP_LIMITS,
  type SignupOwnerFormData,
  type SignupBranchFormData,
} from "./signup.schema";

type Step = "owner" | "branch";

const STEPS: StepperStep[] = [
  { id: "owner", label: "Datos personales" },
  { id: "branch", label: "Sucursal" },
];

const labelClass =
  "text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300";
const iconClass =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500";
const primaryButtonClass =
  "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuth();
  const [step, setStep] = useState<Step>("owner");
  const [ownerData, setOwnerData] = useState<SignupOwnerFormData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ownerForm = useForm<SignupOwnerFormData>({
    resolver: zodResolver(signupOwnerSchema),
    mode: "onChange",
  });

  const branchForm = useForm<SignupBranchFormData>({
    resolver: zodResolver(signupBranchSchema),
  });

  const watchPassword = ownerForm.watch("password") || "";
  const watchConfirmPassword = ownerForm.watch("confirmPassword") || "";
  const doPasswordsMatch = passwordsMatch(watchPassword, watchConfirmPassword);

  // Paso 1: solo valida y avanza, NO llama al backend.
  const onSubmitOwner = (data: SignupOwnerFormData) => {
    clearError();
    setOwnerData(data);
    setStep("branch");
  };

  // Volver al paso 1 (desde el botón "Atrás" o desde el stepper).
  const goToOwnerStep = () => {
    clearError();
    setStep("owner");
  };

  // Paso 2: arma el payload completo y dispara el signup (única request al backend).
  const onSubmitBranch = async (branch: SignupBranchFormData) => {
    if (!ownerData) {
      setStep("owner");
      return;
    }
    clearError();

    const payload: SignupRequest = {
      user: {
        email: ownerData.email,
        password: ownerData.password,
        name: ownerData.name,
        lastName: ownerData.lastName,
      },
      organization: { name: ownerData.organizationName },
      branch: {
        name: branch.name,
        state: branch.state,
        city: branch.city,
        street: branch.street,
        exteriorNumber: branch.exteriorNumber,
        phone: branch.phone,
        rfc: branch.rfc || null,
        // Autodetectado del navegador, no es un campo visible del formulario.
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const result = await signup(payload);
    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="icon" />
      </div>

      {/* Logo */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">
            RESTIFY
          </span>
        </div>
      </div>

      {/* Stepper: indica el paso actual; clic en el paso 1 (completado) regresa */}
      <div className="mb-6 w-full max-w-[640px]">
        <Stepper
          steps={STEPS}
          currentStep={step === "owner" ? 0 : 1}
          onStepClick={(index) => index === 0 && goToOwnerStep()}
        />
      </div>

      {/* Título + subtítulo del paso */}
      <div className="mb-6 max-w-[640px] text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {step === "owner"
            ? "Datos Personales y Organización"
            : "Primera Sucursal"}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {step === "owner"
            ? "Comienza configurando tu perfil de administrador y los detalles de tu negocio."
            : "Configura los detalles operativos de tu ubicación principal para comenzar a recibir pedidos."}
        </p>
      </div>

      {/* Paso 1: Owner + Organización */}
      {step === "owner" && (
        <Card className="w-full max-w-[640px] shadow-lg border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
          <CardContent className="space-y-5 px-8 py-8">
            {error && (
              <div
                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg"
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
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {ownerForm.formState.errors.name && (
                    <span className="text-red-500 text-xs">
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
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {ownerForm.formState.errors.lastName && (
                    <span className="text-red-500 text-xs">
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
                    className={`pl-10 ${ownerForm.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {ownerForm.formState.errors.email && (
                  <span className="text-red-500 text-xs">
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
                    className={`pl-10 ${ownerForm.formState.errors.organizationName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {ownerForm.formState.errors.organizationName && (
                  <span className="text-red-500 text-xs">
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
                      className={`pr-10 ${ownerForm.formState.errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
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
                          ? "border-red-500 focus-visible:ring-red-500"
                          : doPasswordsMatch
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
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
                <span className="text-red-500 text-xs">
                  Las contraseñas no coinciden
                </span>
              )}
              {doPasswordsMatch && (
                <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1">
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
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  ¿Ya tienes una cuenta?{" "}
                </span>
                <Link
                  to="/auth/login"
                  className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-semibold"
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
        <Card className="w-full max-w-[640px] shadow-lg border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
          <CardContent className="space-y-5 px-8 py-8">
            {error && (
              <div
                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg"
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
                    className={`pl-10 ${branchForm.formState.errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {branchForm.formState.errors.name && (
                  <span className="text-red-500 text-xs">
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
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {branchForm.formState.errors.state && (
                    <span className="text-red-500 text-xs">
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
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {branchForm.formState.errors.city && (
                    <span className="text-red-500 text-xs">
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
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {branchForm.formState.errors.street && (
                    <span className="text-red-500 text-xs">
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
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {branchForm.formState.errors.exteriorNumber && (
                    <span className="text-red-500 text-xs">
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
                      className={`pl-10 ${branchForm.formState.errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </div>
                  {branchForm.formState.errors.phone && (
                    <span className="text-red-500 text-xs">
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
                    <span className="text-red-500 text-xs">
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
                  disabled={isLoading}
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
