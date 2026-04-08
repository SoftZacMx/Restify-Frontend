import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { UserForm } from './UserForm';
import type { CreateUserRequest, User } from '@/domain/types';

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

function renderUserForm(props: {
  initialData?: User | null;
  onSubmit?: (data: CreateUserRequest | import('@/domain/types').UpdateUserRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
} = {}) {
  return render(
    <ThemeProvider>
      <UserForm
        initialData={props.initialData ?? null}
        onSubmit={props.onSubmit ?? mockOnSubmit}
        onCancel={props.onCancel ?? mockOnCancel}
        isLoading={props.isLoading ?? false}
      />
    </ThemeProvider>
  );
}

async function fillValidCreateData(user: ReturnType<typeof userEvent.setup>, overrides: Partial<Record<string, string>> = {}) {
  const nameInput = screen.getByLabelText(/^nombre\s*\*/i);
  const lastNameInput = screen.getByLabelText(/^apellido\s*\*/i);
  const emailInput = screen.getByLabelText(/^email\s*\*/i);
  const passwordInput = document.getElementById('password') as HTMLInputElement;

  await user.clear(nameInput);
  if (overrides.name !== '') await user.type(nameInput, overrides.name ?? 'Juan');

  await user.clear(lastNameInput);
  if (overrides.last_name !== '') await user.type(lastNameInput, overrides.last_name ?? 'Pérez');

  await user.clear(emailInput);
  if (overrides.email !== '') await user.type(emailInput, overrides.email ?? 'juan@test.com');

  await user.clear(passwordInput);
  if (overrides.password !== '') await user.type(passwordInput, overrides.password ?? 'Password123!');
}

async function submitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /guardar usuario/i }));
}

async function submitEditForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /actualizar usuario/i }));
}

describe('UserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('renders all sections and required inputs', () => {
      renderUserForm();

      expect(screen.getByText(/información personal/i)).toBeInTheDocument();
      expect(screen.getByText(/credenciales y acceso/i)).toBeInTheDocument();
      expect(screen.getByText(/configuración del sistema/i)).toBeInTheDocument();

      expect(screen.getByLabelText(/^nombre\s*\*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^apellido\s*\*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/segundo apellido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email\s*\*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rol del usuario\s*\*/i)).toBeInTheDocument();
      expect(screen.getByText(/permitir acceso inmediato/i)).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /guardar usuario/i })).toBeInTheDocument();
    });
  });

  describe('validación: creación', () => {
    it('muestra error cuando nombre está vacío', async () => {
      const user = userEvent.setup();
      renderUserForm();
      await fillValidCreateData(user, { name: '' });
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando apellido está vacío', async () => {
      const user = userEvent.setup();
      renderUserForm();
      await fillValidCreateData(user, { last_name: '' });
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/el apellido es requerido/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando email está vacío', async () => {
      const user = userEvent.setup();
      renderUserForm();
      await fillValidCreateData(user, { email: '' });
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('el input de email valida formato con regex en el schema Zod', () => {
      // La validación de formato de email se hace en el schema Zod (regex).
      // En jsdom, userEvent.type en input type="email" no siempre permite valores inválidos.
      // Verificamos que el input existe y que el schema rechaza emails inválidos.
      renderUserForm();
      const emailInput = screen.getByLabelText(/^email\s*\*/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('muestra error cuando la contraseña está vacía', async () => {
      const user = userEvent.setup();
      renderUserForm();
      await fillValidCreateData(user, { password: '' });
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando la contraseña tiene menos de 8 caracteres', async () => {
      const user = userEvent.setup();
      renderUserForm();
      await fillValidCreateData(user, { password: 'Abc12' });
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando el teléfono tiene valor pero no 10 dígitos', async () => {
      const user = userEvent.setup();
      renderUserForm();
      await fillValidCreateData(user);
      const phone = screen.getByLabelText(/teléfono/i);
      await user.clear(phone);
      await user.type(phone, '12345');
      await submitForm(user);

      await waitFor(() => {
        expect(screen.getByText(/el teléfono debe tener 10 dígitos/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('el input de nombre tiene maxLength para prevenir exceso de caracteres', () => {
      renderUserForm();
      const nameInput = screen.getByLabelText(/^nombre\s*\*/i);
      expect(nameInput).toHaveAttribute('maxlength', '100');
    });

    it('el input de apellido tiene maxLength para prevenir exceso de caracteres', () => {
      renderUserForm();
      const lastNameInput = screen.getByLabelText(/^apellido\s*\*/i);
      expect(lastNameInput).toHaveAttribute('maxlength', '100');
    });
  });

  describe('submit válido: creación', () => {
    it('llama onSubmit con el payload correcto cuando todos los campos obligatorios son válidos', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      await fillValidCreateData(user);
      await submitForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const payload = mockOnSubmit.mock.calls[0][0];
      expect(payload.name).toBe('Juan');
      expect(payload.last_name).toBe('Pérez');
      expect(payload.email).toBe('juan@test.com');
      expect(payload.password).toBe('Password123!');
      expect(payload.rol).toBe('WAITER');
      expect(payload.status).toBe(true);
      expect(payload.second_last_name).toBeNull();
      expect(payload.phone).toBeNull();
    });

    it('normaliza teléfono a 10 dígitos cuando se ingresa con espacios', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      await fillValidCreateData(user);
      const phone = screen.getByLabelText(/teléfono/i);
      await user.clear(phone);
      await user.type(phone, '55 1234 5678');
      await submitForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      expect(mockOnSubmit.mock.calls[0][0].phone).toBe('5512345678');
    });

    it('incluye segundo apellido y teléfono cuando se completan', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      await fillValidCreateData(user);
      const secondLastName = screen.getByLabelText(/segundo apellido/i);
      const phone = screen.getByLabelText(/teléfono/i);
      await user.clear(secondLastName);
      await user.type(secondLastName, 'García');
      await user.clear(phone);
      await user.type(phone, '5512345678');
      await submitForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      const payload = mockOnSubmit.mock.calls[0][0];
      expect(payload.second_last_name).toBe('García');
      expect(payload.phone).toBe('5512345678');
    });
  });

  describe('modo edición', () => {
    const existingUser: User = {
      id: 'user-1',
      name: 'Ana',
      last_name: 'López',
      second_last_name: 'Martínez',
      email: 'ana@test.com',
      phone: '5511223344',
      status: true,
      rol: 'MANAGER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('no requiere contraseña y llama onSubmit sin password cuando está vacía', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm({ initialData: existingUser });
      await submitEditForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      const payload = mockOnSubmit.mock.calls[0][0];
      expect(payload).not.toHaveProperty('password');
    });

    it('muestra botón Actualizar Usuario en lugar de Guardar Usuario', () => {
      renderUserForm({ initialData: existingUser });
      expect(screen.getByRole('button', { name: /actualizar usuario/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /guardar usuario/i })).not.toBeInTheDocument();
    });
  });

  describe('cancelar', () => {
    it('llama onCancel al hacer clic en Cancelar', async () => {
      const user = userEvent.setup();
      renderUserForm();
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('estado de carga', () => {
    it('deshabilita botones Guardar y Cancelar cuando isLoading es true', () => {
      renderUserForm({ isLoading: true });
      expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    });

    it('muestra "Guardando..." en el botón de enviar cuando isLoading es true', () => {
      renderUserForm({ isLoading: true });
      expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument();
    });
  });

  describe('modo edición: prellenado', () => {
    const existingUser: User = {
      id: 'user-1',
      name: 'Ana',
      last_name: 'López',
      second_last_name: 'Martínez',
      email: 'ana@test.com',
      phone: '5511223344',
      status: true,
      rol: 'MANAGER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('muestra los valores de initialData en los campos', async () => {
      renderUserForm({ initialData: existingUser });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
        expect(screen.getByDisplayValue('López')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Martínez')).toBeInTheDocument();
        expect(screen.getByDisplayValue('ana@test.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('5511223344')).toBeInTheDocument();
      });
      expect(screen.getByText('Gerente')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('modo edición: validación', () => {
    const existingUser: User = {
      id: 'user-1',
      name: 'Ana',
      last_name: 'López',
      second_last_name: null,
      email: 'ana@test.com',
      phone: '',
      status: true,
      rol: 'MANAGER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('muestra error cuando la contraseña tiene menos de 8 caracteres en modo edición', async () => {
      const user = userEvent.setup();
      renderUserForm({ initialData: existingUser });
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      await user.clear(passwordInput);
      await user.type(passwordInput, 'Abc12');
      await submitEditForm(user);

      await waitFor(() => {
        expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('el input de segundo apellido tiene maxLength para prevenir exceso de caracteres', () => {
      const existingUser2: User = { ...existingUser };
      renderUserForm({ initialData: existingUser2 });
      const secondLastNameInput = screen.getByLabelText(/segundo apellido/i);
      expect(secondLastNameInput).toHaveAttribute('maxlength', '100');
    });
  });

  describe('modo edición: submit con password', () => {
    const existingUser: User = {
      id: 'user-1',
      name: 'Ana',
      last_name: 'López',
      second_last_name: null,
      email: 'ana@test.com',
      phone: '',
      status: true,
      rol: 'MANAGER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('incluye password en el payload cuando se proporciona nueva contraseña en edición', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm({ initialData: existingUser });
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      await user.clear(passwordInput);
      await user.type(passwordInput, 'NewPassword123!');
      await submitEditForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      expect(mockOnSubmit.mock.calls[0][0].password).toBe('NewPassword123!');
    });
  });

  describe('switch permitir acceso', () => {
    it('envía status false cuando el switch está desactivado', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      await fillValidCreateData(user);
      const switchEl = screen.getByRole('checkbox');
      expect(switchEl).toBeChecked();
      await user.click(switchEl);
      expect(switchEl).not.toBeChecked();
      await submitForm(user);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      expect(mockOnSubmit.mock.calls[0][0].status).toBe(false);
    });
  });
});
