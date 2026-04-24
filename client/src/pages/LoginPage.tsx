import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../app/auth-context";
import { useLanguage } from "../app/language-context";
import AuthPageShell from "../components/auth/AuthPageShell";
import { apiUrl } from "../lib/api";

const loginSchema = z.object({
  email: z.string().trim().email("Valid email address is required."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginSuccessResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type ErrorResponse = {
  message?: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { language } = useLanguage();
  const [serverError, setServerError] = useState("");

  const copy =
    language === "hu"
      ? {
        badge: "Bejelentkezés",
        title: "Üdv újra",
        description:
          "Lépj be a fiókodba, és folytasd a boardok, taskok és workflow-k kezelését.",
        sideTitle: "Mit tud most az app?",
        sideText:
          "A jelenlegi verzióban már működik az auth, a board kezelés, a task létrehozás, a szerkesztő modal és a drag and drop mentés is.",
        sideItems: [
          "JWT alapú bejelentkezés",
          "Board és task kezelés",
          "Task szerkesztés modalból",
          "Oszlopok közötti mozgatás",
        ],
        email: "Email",
        password: "Jelszó",
        submit: "Bejelentkezés",
        pending: "Belépés...",
        noAccount: "Még nincs fiókod?",
        register: "Regisztráció",
        backHome: "Vissza a főoldalra",
        fallbackError: "Sikertelen bejelentkezés.",
        networkError: "A szerver nem érhető el. Ellenőrizd, hogy fut-e a backend.",
        emailRequired: "Adj meg egy érvényes email címet.",
        passwordRequired: "A jelszó megadása kötelező.",
        placeholders: {
          email: "pelda@email.com",
          password: "Írd be a jelszavad",
        },
      }
      : {
        badge: "Sign in",
        title: "Welcome back",
        description:
          "Sign in to your account and continue managing boards, tasks, and workflows.",
        sideTitle: "What the app can do now",
        sideText:
          "The current version already supports auth, board handling, task creation, modal editing, and persisted drag and drop.",
        sideItems: [
          "JWT based authentication",
          "Board and task management",
          "Task editing from modal",
          "Cross-column task movement",
        ],
        email: "Email",
        password: "Password",
        submit: "Sign in",
        pending: "Signing in...",
        noAccount: "No account yet?",
        register: "Register",
        backHome: "Back to home",
        fallbackError: "Login failed.",
        networkError: "Server is not reachable. Check if the backend is running.",
        emailRequired: "Valid email address is required.",
        passwordRequired: "Password is required.",
        placeholders: {
          email: "example@email.com",
          password: "Enter your password",
        },
      };

  const localizedSchema = z.object({
    email: z.string().trim().email(copy.emailRequired),
    password: z.string().min(1, copy.passwordRequired),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(localizedSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as LoginSuccessResponse | ErrorResponse;

      if (!response.ok) {
        const errorMessage = "message" in data ? data.message : undefined;
        setServerError(errorMessage || copy.fallbackError);
        return;
      }

      const successData = data as LoginSuccessResponse;

      setSession({
        accessToken: successData.accessToken,
        user: successData.user,
      });

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setServerError(copy.networkError);
    }
  };

  const form = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <Link
          to="/"
          className="text-sm font-medium transition hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          ← {copy.backHome}
        </Link>
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {copy.email}
        </label>
        <input
          type="email"
          {...register("email")}
          placeholder={copy.placeholders.email}
          className="w-full rounded-2xl border px-4 py-3 outline-none"
          style={{
            borderColor: "var(--panel-border)",
            background: "var(--surface-3)",
            color: "var(--text-primary)",
          }}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {copy.password}
        </label>
        <input
          type="password"
          {...register("password")}
          placeholder={copy.placeholders.password}
          className="w-full rounded-2xl border px-4 py-3 outline-none"
          style={{
            borderColor: "var(--panel-border)",
            background: "var(--surface-3)",
            color: "var(--text-primary)",
          }}
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: "rgba(239, 68, 68, 0.28)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#fca5a5",
          }}
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
        }}
      >
        {isSubmitting ? copy.pending : copy.submit}
      </button>

      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {copy.noAccount}{" "}
        <Link
          to="/register"
          className="font-semibold transition hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          {copy.register}
        </Link>
      </p>
    </form>
  );

  return (
    <AuthPageShell
      badge={copy.badge}
      title={copy.title}
      description={copy.description}
      form={form}
      sideTitle={copy.sideTitle}
      sideText={copy.sideText}
      sideItems={copy.sideItems}
    />
  );
}

export default LoginPage;
