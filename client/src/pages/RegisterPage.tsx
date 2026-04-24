import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../app/auth-context";
import { useLanguage } from "../app/language-context";
import AuthPageShell from "../components/auth/AuthPageShell";
import { apiUrl } from "../lib/api";

type RegisterSuccessResponse = {
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

function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { language } = useLanguage();
  const [serverError, setServerError] = useState("");

  const copy =
    language === "hu"
      ? {
        badge: "Regisztráció",
        title: "Készíts új fiókot",
        description:
          "Hozz létre saját profilt, és kezdd el kezelni a boardjaidat, taskjaidat és workflow-jaidat.",
        sideTitle: "Miért hasznos ez a projekt?",
        sideText:
          "Ez a portfólióprojekt több modern frontend és backend technológiát fog össze egy működő, valós használati mintájú alkalmazásban.",
        sideItems: [
          "React + TypeScript frontend",
          "Node + Express backend",
          "PostgreSQL + Prisma adatbázis",
          "Auth, Kanban, drag and drop",
        ],
        name: "Név",
        email: "Email",
        password: "Jelszó",
        submit: "Regisztráció",
        pending: "Regisztráció...",
        hasAccount: "Van már fiókod?",
        login: "Bejelentkezés",
        backHome: "Vissza a főoldalra",
        fallbackError: "Sikertelen regisztráció.",
        networkError: "A szerver nem érhető el. Ellenőrizd, hogy fut-e a backend.",
        nameRequired: "A név megadása kötelező.",
        emailRequired: "Adj meg egy érvényes email címet.",
        passwordRequired: "A jelszónak legalább 6 karakter hosszúnak kell lennie.",
        placeholders: {
          name: "Példa Elek",
          email: "pelda@email.com",
          password: "Legalább 6 karakter",
        },
      }
      : {
        badge: "Register",
        title: "Create a new account",
        description:
          "Create your own profile and start managing your boards, tasks, and workflows.",
        sideTitle: "Why this project matters",
        sideText:
          "This portfolio project combines multiple modern frontend and backend technologies into a working app with realistic usage patterns.",
        sideItems: [
          "React + TypeScript frontend",
          "Node + Express backend",
          "PostgreSQL + Prisma database",
          "Auth, Kanban, drag and drop",
        ],
        name: "Name",
        email: "Email",
        password: "Password",
        submit: "Register",
        pending: "Registering...",
        hasAccount: "Already have an account?",
        login: "Sign in",
        backHome: "Back to home",
        fallbackError: "Registration failed.",
        networkError: "Server is not reachable. Check if the backend is running.",
        nameRequired: "Name is required.",
        emailRequired: "Valid email address is required.",
        passwordRequired: "Password must be at least 6 characters long.",
        placeholders: {
          name: "John Example",
          email: "example@email.com",
          password: "At least 6 characters",
        },
      };

  const localizedSchema = z.object({
    name: z.string().trim().min(1, copy.nameRequired),
    email: z.string().trim().email(copy.emailRequired),
    password: z.string().min(6, copy.passwordRequired),
  });

  type RegisterFormValues = z.infer<typeof localizedSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(localizedSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError("");

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as RegisterSuccessResponse | ErrorResponse;

      if (!response.ok) {
        const errorMessage = "message" in data ? data.message : undefined;
        setServerError(errorMessage || copy.fallbackError);
        return;
      }

      const successData = data as RegisterSuccessResponse;

      setSession({
        accessToken: successData.accessToken,
        user: successData.user,
      });

      navigate("/");
    } catch (error) {
      console.error("Register error:", error);
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
          {copy.name}
        </label>
        <input
          type="text"
          {...register("name")}
          placeholder={copy.placeholders.name}
          className="w-full rounded-2xl border px-4 py-3 outline-none"
          style={{
            borderColor: "var(--panel-border)",
            background: "var(--surface-3)",
            color: "var(--text-primary)",
          }}
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
        )}
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
        {copy.hasAccount}{" "}
        <Link
          to="/login"
          className="font-semibold transition hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          {copy.login}
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

export default RegisterPage;
