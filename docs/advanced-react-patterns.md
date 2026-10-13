# Patrones Avanzados de React en este Proyecto

> Documentación de conceptos que no suelen aparecer en tutoriales básicos pero que se usan en este codebase.

---

## 1. AbortController + AbortSignal — Cancelación de Requests

**Archivos:** `src/hooks/useFetch.ts`, `src/context/auth/AuthProvider.tsx`, `src/services/auth.service.ts`

```ts
const controller = new AbortController();
fetchJson(url, { signal: controller.signal });

// Cleanup en useEffect
return () => controller.abort();
```

**Para qué sirve:** Cancela peticiones HTTP en vuelo cuando:

- El usuario navega a otra página (cleanup del useEffect)
- Hace click en "cancelar"
- Inicia otra request (evita race conditions)

> **Nota:** `fetch` nativo soporta `signal`; **axios no** (usa `cancelToken` legacy). Este proyecto usa `fetch` puro.

---

## 2. useCallback con Closures Estables + useRef

**Archivos:** `src/context/auth/AuthProvider.tsx`, `src/hooks/useFetch.ts`

```ts
const logout = useCallback(() => {
  activeRequest.current?.abort(); // useRef = mutable, no cambia entre renders
  clearAuthSession();
  dispatch({ type: 'ANONYMOUS' });
}, []); // Array vacío = NUNCA se recrea
```

**Truco clave:** Usan `useRef` para guardar el `AbortController` actual. Como `useRef` no dispara re-renders, el callback accede al controller **más reciente** sin estar en el dependency array.

---

## 3. Patrón "Guard" con useRef para Race Conditions

**Archivo:** `src/context/auth/AuthProvider.tsx` (líneas 37-48, 73-93)

```ts
const controller = new AbortController();
activeRequest.current = controller; // Marca "este es el request activo"

const user = await authService.getCurrentUser(token, controller.signal);
if (activeRequest.current !== controller) return; // GUARD: otro request tomó el control
```

**Evita:** Que una request lenta (ej. login) sobrescriba el estado después de una rápida (ej. logout). Es **concurrencia manual** en React.

---

## 4. useReducer para Formularios Complejos

**Archivos:** `src/components/auth/AuthForm.tsx`, `src/components/auth/auth-form.reducer.ts`

```ts
const [{ values, errors }, dispatch] = useReducer(authFormReducer, initialState);

dispatch({ type: 'fieldChanged', field, value });
dispatch({ type: 'validationFailed', errors });
```

**Ventaja vs useState:** Estado relacionado (valores + errores + touched) en **un solo objeto**, transiciones predecibles, fácil testear el reducer en aislamiento.

---

## 5. Context + useMemo para Evitar Re-renders Masivos

**Archivo:** `src/context/auth/AuthProvider.tsx` (líneas 147-158)

```ts
const value = useMemo<AuthContextValue>(
  () => ({
    user: state.user,
    accessToken: state.accessToken,
    status: state.status,
    isSubmitting: state.isSubmitting,
    error: state.error,
    login,
    register,
    cancelPendingAuth,
    logout,
    clearError,
  }),
  [state, login, register, cancelPendingAuth, logout, clearError],
);
```

Sin `useMemo`, **cualquier cambio en AuthProvider** haría re-render a **todo el árbol** que use `useAuth()`. El memo evita crear objeto nuevo en cada render.

---

## 6. useRef para Flags Mutables sin Re-render

**Archivo:** `src/components/auth/AuthForm.tsx` (línea 25)

```ts
const submittingRef = useRef(false);

const handleSubmit = async (event) => {
  event.preventDefault();
  if (submittingRef.current || isSubmitting) return; // Guard doble-submit

  submittingRef.current = true;
  try {
    await register(...);
  } finally {
    submittingRef.current = false;
  }
};
```

**Por qué no useState:** `useState` dispararía re-render innecesario. `useRef` es **sincrónico y muta sin avisar a React**. Ideal para guards de doble-click / double-submit.

---

## 7. Cleanup Sincrónico de Event Listeners / Intervals

**Archivo:** `src/context/auth/AuthProvider.tsx` (líneas 122-145)

```ts
useEffect(() => {
  if (state.expiresAt === null) return;
  const expiresAt = state.expiresAt;
  const sessionRequest = activeRequest.current;
  let timeout: ReturnType<typeof setTimeout>;

  const checkExpiration = () => {
    if (activeRequest.current !== sessionRequest) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      logout();
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(checkExpiration, Math.min(remaining, 2_147_483_647));
    }
  };

  timeout = setTimeout(
    checkExpiration,
    Math.max(0, Math.min(expiresAt - Date.now(), 2_147_483_647)),
  );
  window.addEventListener('focus', checkExpiration);
  document.addEventListener('visibilitychange', checkExpiration);

  return () => {
    clearTimeout(timeout);
    window.removeEventListener('focus', checkExpiration);
    document.removeEventListener('visibilitychange', checkExpiration);
  };
}, [state.expiresAt, logout]);
```

**Detalle sutil:** `checkExpiration` usa `logout` (estable por useCallback) y `expiresAt` (del dependency array). Si no estuviera en el array, el closure vería valor **viejo**.

---

## 8. Inyección de AbortSignal en Servicios (Dependency Injection)

**Archivos:** `src/services/auth.service.ts`, `src/context/auth/AuthProvider.tsx`

```ts
// Servicio recibe signal como parámetro opcional
login: (credentials, signal?: AbortSignal) =>
  apiClient.post('/auth/login', credentials, { signal }),

// Provider lo inyecta
const authenticate = useCallback(async (
  submit: (signal: AbortSignal) => Promise<AuthToken>,
): Promise<boolean> => {
  const controller = new AbortController();
  const token = await submit(controller.signal); // submit = (signal) => authService.login(cred, signal)
}, []);
```

**Patrón:** El componente **controla** la cancelación, el servicio solo **obedece**. Desacopla lógica de red de ciclo de vida de UI.

---

## 9. Tipo `ReactNode` para Children Tipado

**Archivo:** `src/context/auth/AuthProvider.tsx` (línea 9)

```ts
export const AuthProvider = ({ children }: { children: ReactNode }) => { ... }
```

`ReactNode` = `ReactElement | string | number | null | undefined | ReactFragment`. Es **lo que acepta un componente como hijos**, no `JSX.Element` (que es solo un elemento único).

---

## 10. `void` para Ignorar Promesa Intencionalmente

**Archivo:** `src/context/auth/AuthProvider.tsx` (línea 62)

```ts
void restoreSession(); // "Sé que es async, no me importa el resultado aquí"
```

Evita warning de ESLint "Promise returned but not awaited" cuando **sabes** que el cleanup del useEffect maneja errores.

---

## Tabla Resumen: Nivel de Dificultad

| Concepto                                     | Archivos                                               | Nivel             |
| -------------------------------------------- | ------------------------------------------------------ | ----------------- |
| AbortController race guards                  | AuthProvider, useFetch                                 | Avanzado          |
| useRef como "variable de instancia"          | AuthProvider (activeRequest), AuthForm (submittingRef) | Intermedio        |
| useCallback + useRef para callbacks estables | AuthProvider (logout, authenticate)                    | Avanzado          |
| useReducer para forms                        | AuthForm + auth-form.reducer                           | Intermedio        |
| useMemo en Context value                     | AuthProvider                                           | Avanzado          |
| DI de AbortSignal en services                | auth.service + AuthProvider                            | Arquitectura      |
| Cleanup sincrónico de listeners/intervals    | AuthProvider (session expiry)                          | Intermedio        |
| ReactNode para children                      | AuthProvider                                           | Básico-Intermedio |
| void para promesas ignoradas                 | AuthProvider                                           | Intermedio        |

---

## Referencias Relacionadas

- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [React Docs: useRef](https://react.dev/reference/react/useRef)
- [React Docs: useCallback](https://react.dev/reference/react/useCallback)
- [React Docs: useMemo](https://react.dev/reference/react/useMemo)
- [React Docs: useReducer](https://react.dev/reference/react/useReducer)
- [React Docs: Context](https://react.dev/learn/passing-data-deeply-with-context)
