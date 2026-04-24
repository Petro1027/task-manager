import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { saveAuthSession } from "../lib/auth";
import { API_BASE_URL } from "../lib/api";

const loginFormSchema = z.object({
  email: z.string().trim().email("Adj meg egy érvényes email címet"),
  password: z.string().min(1, "A jelszó megadása kötelező").max(100, "Túl hosszú jelszó"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type LoginSuccessResponse = {
  message: string;
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
};

type ErrorResponse = {
  message?: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;

        setServerError(errorData.message || "Sikertelen bejelentkezés.");
        return;
      }

      const successData = (await response.json()) as LoginSuccessResponse;

      saveAuthSession({
        accessToken: successData.accessToken,
        user: successData.user,
      });

      navigate("/");
    } catch {
      setServerError("A szerver nem érhető el. Ellenőrizd, hogy fut-e a backend.");
    }
  };

  return (
    <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
      <main className="mx-auto w-full max-w-xl">
        <div className="rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <Link
            to="/"
            className="text-sm text-[#646cff] transition hover:text-[#535bf2]"
          >
            ← Vissza a főoldalra
          </Link>

          <h1 className="mt-6 text-3xl font-semibold">Bejelentkezés</h1>

          <p className="mt-3 text-[rgba(255,255,255,0.72)]">
            Itt már a valódi backend
            <code className="mx-1 rounded bg-[#242424] px-2 py-1 text-sm text-[#646cff]">
              /api/auth/login
            </code>
            endpointot használjuk.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
                placeholder="pelda@email.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                Jelszó
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
                placeholder="Add meg a jelszavad"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#646cff] px-5 py-3 font-medium text-white transition hover:bg-[#535bf2] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[rgba(255,255,255,0.65)]">
            Nincs még fiókod?{" "}
            <Link to="/register" className="text-[#646cff] hover:text-[#535bf2]">
              Regisztráció
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
