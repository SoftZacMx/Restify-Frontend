import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

function fillValidCreateData(overrides: Partial<Record<string, string>> = {}) {
  const name = screen.getByLabelText(/^nombre\s*\*/i);
  const last_name = screen.getByLabelText(/^apellido\s*\*/i);
  const email = screen.getByLabelText(/^email\s*\*/i);

  fireEvent.change(name, { target: { value: overrides.name ?? 'Juan' } });
  fireEvent.change(last_name, { target: { value: overrides.last_name ?? 'Pérez' } });
  fireEvent.change(email, { target: { value: overrides.email ?? 'juan@test.com' } });
  const password = document.getElementById('password') as HTMLInputElement;
  expect(password).toBeTruthy();
  fireEvent.change(password, { target: { value: overrides.password ?? 'Password123!' } });
}

function submitForm() {
  const submitButton = screen.getByRole('button', { name: /guardar usuario/i });
  const form = submitButton.closest('form');
  if (form) form.setAttribute('noValidate', 'true');
  fireEvent.click(submitButton);
}

function submitEditForm() {
  const submitButton = screen.getByRole('button', { name: /actualizar usuario/i });
  const form = submitButton.closest('form');
  if (form) form.setAttribute('noValidate', 'true');
  fireEvent.click(submitButton);
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
      renderUserForm();
      fillValidCreateData({ name: '' });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando apellido está vacío', async () => {
      renderUserForm();
      fillValidCreateData({ last_name: '' });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/el apellido es requerido/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando email está vacío', async () => {
      renderUserForm();
      fillValidCreateData({ email: '' });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando el formato del email no es válido', async () => {
      renderUserForm();
      fillValidCreateData({ email: 'no-es-email' });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/el formato del email no es válido/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando la contraseña está vacía', async () => {
      renderUserForm();
      fillValidCreateData({ password: '' });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando la contraseña tiene menos de 8 caracteres', async () => {
      renderUserForm();
      fillValidCreateData({ password: 'Abc12' });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando el teléfono tiene valor pero no 10 dígitos', async () => {
      renderUserForm();
      fillValidCreateData();
      const phone = screen.getByLabelText(/teléfono/i);
      fireEvent.change(phone, { target: { value: '12345' } });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/el teléfono debe tener 10 dígitos/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando el nombre supera el máximo de caracteres', async () => {
      renderUserForm();
      fillValidCreateData({ name: 'a'.repeat(101) });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/el nombre no puede superar 100 caracteres/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando el apellido supera el máximo de caracteres', async () => {
      renderUserForm();
      fillValidCreateData({ last_name: 'a'.repeat(101) });
      submitForm();

      await waitFor(() => {
        expect(screen.getByText(/el apellido no puede superar 100 caracteres/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('submit válido: creación', () => {
    it('llama onSubmit con el payload correcto cuando todos los campos obligatorios son válidos', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      fillValidCreateData();
      submitForm();

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
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      fillValidCreateData();
      const phone = screen.getByLabelText(/teléfono/i);
      fireEvent.change(phone, { target: { value: '55 1234 5678' } });
      submitForm();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      expect(mockOnSubmit.mock.calls[0][0].phone).toBe('5512345678');
    });

    it('incluye segundo apellido y teléfono cuando se completan', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      fillValidCreateData();
      fireEvent.change(screen.getByLabelText(/segundo apellido/i), { target: { value: 'García' } });
      fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '5512345678' } });
      submitForm();

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
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm({ initialData: existingUser });
      fireEvent.change(screen.getByLabelText(/^nombre\s*\*/i), { target: { value: 'Ana' } });
      fireEvent.change(screen.getByLabelText(/^apellido\s*\*/i), { target: { value: 'López' } });
      fireEvent.change(screen.getByLabelText(/^email\s*\*/i), { target: { value: 'ana@test.com' } });
      const submitBtn = screen.getByRole('button', { name: /actualizar usuario/i });
      fireEvent.click(submitBtn);

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
    it('llama onCancel al hacer clic en Cancelar', () => {
      renderUserForm();
      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
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
      renderUserForm({ initialData: existingUser });
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'Abc12' } });
      fireEvent.change(screen.getByLabelText(/^nombre\s*\*/i), { target: { value: 'Ana' } });
      fireEvent.change(screen.getByLabelText(/^apellido\s*\*/i), { target: { value: 'López' } });
      fireEvent.change(screen.getByLabelText(/^email\s*\*/i), { target: { value: 'ana@test.com' } });
      submitEditForm();

      await waitFor(() => {
        expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('muestra error cuando el segundo apellido supera el máximo de caracteres', async () => {
      renderUserForm({ initialData: existingUser });
      fireEvent.change(screen.getByLabelText(/^nombre\s*\*/i), { target: { value: 'Ana' } });
      fireEvent.change(screen.getByLabelText(/^apellido\s*\*/i), { target: { value: 'López' } });
      fireEvent.change(screen.getByLabelText(/^email\s*\*/i), { target: { value: 'ana@test.com' } });
      fireEvent.change(screen.getByLabelText(/segundo apellido/i), { target: { value: 'a'.repeat(101) } });
      submitEditForm();

      await waitFor(() => {
        expect(screen.getByText(/el segundo apellido no puede superar 100 caracteres/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
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
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm({ initialData: existingUser });
      fireEvent.change(screen.getByLabelText(/^nombre\s*\*/i), { target: { value: 'Ana' } });
      fireEvent.change(screen.getByLabelText(/^apellido\s*\*/i), { target: { value: 'López' } });
      fireEvent.change(screen.getByLabelText(/^email\s*\*/i), { target: { value: 'ana@test.com' } });
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      submitEditForm();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      expect(mockOnSubmit.mock.calls[0][0].password).toBe('NewPassword123!');
    });
  });

  describe('switch permitir acceso', () => {
    it('envía status false cuando el switch está desactivado', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      fillValidCreateData();
      const switchEl = screen.getByRole('checkbox');
      expect(switchEl).toBeChecked();
      fireEvent.click(switchEl);
      expect(switchEl).not.toBeChecked();
      submitForm();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      expect(mockOnSubmit.mock.calls[0][0].status).toBe(false);
    });

    it('envía status true cuando el switch está activado', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      renderUserForm();
      fillValidCreateData();
      const switchEl = screen.getByRole('checkbox');
      expect(switchEl).toBeChecked();
      submitForm();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      expect(mockOnSubmit.mock.calls[0][0].status).toBe(true);
    });
  });

  describe('toggle mostrar/ocultar contraseña', () => {
    it('cambia el tipo del input de password a text al hacer clic en Mostrar contraseña', () => {
      renderUserForm();
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });

      expect(passwordInput.type).toBe('password');
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
      expect(screen.getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();
    });

    it('cambia a password de nuevo al hacer clic en Ocultar contraseña', () => {
      renderUserForm();
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      fireEvent.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
      expect(passwordInput.type).toBe('text');
      fireEvent.click(screen.getByRole('button', { name: /ocultar contraseña/i }));
      expect(passwordInput.type).toBe('password');
    });
  });
});
