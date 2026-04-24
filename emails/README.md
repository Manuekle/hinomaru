# Email Templates — Hinomaru

Esta carpeta contiene las **6 plantillas HTML** para los correos transaccionales enviados por Supabase Auth.
Están diseñadas con la identidad visual de Hinomaru (rojo `#BC002D`, fondo `#F7F5F2`, tipografía Inter Tight).

## Plantillas disponibles

| Archivo | Tipo Supabase | Descripción |
|---------|---------------|-------------|
| `confirm-signup.html` | Confirm signup | Confirmar correo tras el registro |
| `invite-user.html` | Invite user | Invitar a un usuario nuevo |
| `magic-link.html` | Magic link | Inicio de sesión sin contraseña (OTP + enlace) |
| `change-email.html` | Change email address | Verificar nuevo correo al cambiarlo |
| `reset-password.html` | Reset password | Restablecer contraseña olvidada |
| `reauthentication.html` | Reauthentication | Verificar identidad antes de acción sensible |

## Variables de Supabase usadas

| Variable | Descripción |
|----------|-------------|
| `{{ .ConfirmationURL }}` | URL completa para confirmar / acceder (con código PKCE) |
| `{{ .Token }}` | Código OTP de 6 dígitos (magic link y reauthentication) |
| `{{ .TokenHash }}` | Hash del token para verificación OTP |
| `{{ .SiteURL }}` | URL base del sitio (configurado en Supabase Dashboard) |
| `{{ .Email }}` | Correo del destinatario |
| `{{ .Data }}` | Datos extra (e.g. nuevo correo en `change-email`) |
| `{{ .RedirectTo }}` | URL de redirección personalizada |

## Cómo configurar en Supabase

1. Ve a **Supabase Dashboard → Authentication → Email Templates**
2. Selecciona la plantilla correspondiente
3. Pega el contenido HTML del archivo
4. Guarda los cambios

> **Nota:** El asunto del correo se configura en el campo "Subject" del dashboard, no en el HTML.

## Flujo de autenticación completo (app)

```
/login
├── Iniciar sesión (email + contraseña)
├── Crear cuenta → email de confirmación → /auth/callback → /
├── ¿Olvidaste tu contraseña? → email de recuperación → /auth/callback?type=recovery → /auth/reset-password
├── Enlace mágico → email con OTP/link → /auth/callback → /
└── /auth/reset-password — formulario para nueva contraseña (requiere sesión de recovery)
```
