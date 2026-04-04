import { z } from 'zod';

// Regex para senha forte: mínimo 8 caracteres, 1 maiúscula, 1 número
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Schema para email
 */
export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório.')
  .email('Email inválido.');

/**
 * Schema para senha simples (login)
 */
export const passwordSchema = z
  .string()
  .min(1, 'Senha é obrigatória.')
  .min(6, 'Senha deve ter no mínimo 6 caracteres.');

/**
 * Schema para senha forte (cadastro)
 */
export const strongPasswordSchema = z
  .string()
  .min(1, 'Senha é obrigatória.')
  .min(8, 'Senha deve ter no mínimo 8 caracteres.')
  .regex(
    passwordRegex,
    'Senha deve conter pelo menos 1 letra maiúscula e 1 número.'
  );

/**
 * Schema para username
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username deve ter no mínimo 3 caracteres.')
  .max(30, 'Username deve ter no máximo 30 caracteres.')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e _');

/**
 * Schema para login (identifier pode ser email ou username)
 */
export const signInSchema = z.object({
  identifier: z.string().min(1, 'Email ou username é obrigatório.'),
  password: passwordSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;

/**
 * Schema para cadastro
 */
export const signUpSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  password: strongPasswordSchema,
  phone: z.string().optional(),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

/**
 * Schema para recuperação de senha
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Schema para alterar senha
 */
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: strongPasswordSchema,
    confirmNewPassword: z.string().min(1, 'Confirmação de senha é obrigatória.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
