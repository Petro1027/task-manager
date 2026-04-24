import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { API_BASE_URL } from "../lib/api";

const registerFormSchema = z.object({
  name: z.string().trim().min(2, "A név legalább 2 karakter legyen").max(100, "Túl hosszú név"),
  email: z.string().trim().email("Adj meg egy érvényes email címet"),
  password: z.string().min(8, "A jelszó legalább 8 karakter legyen").max(100, "Túl hosszú jelszó"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

type RegisterSuccessResponse = {
  message: string;
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

function RegisterPage() {
  const [serverError, setServerError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError("");
    setSuccessMessage("");

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as RegisterSuccessResponse | ErrorResponse;

    if (!response.ok) {
      setServerError(data.message || "Sikertelen regisztráció.");
      return;
    }

    setSuccessMessage("Sikeres regisztráció. Most már be tudsz jelentkezni.");
    reset();
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

          <h1 className="mt-6 text-3xl font-semibold">Regisztráció</h1>

          <p className="mt-3 text-[rgba(255,255,255,0.72)]">
            Itt már a valódi backend
            <code className="mx-1 rounded bg-[#242424] px-2 py-1 text-sm text-[#646cff]">
              /api/auth/register
            </code>
            endpointot használjuk.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                Név
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
                placeholder="Például: Teszt Béla"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="Legalább 8 karakter"
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

            {successMessage && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#646cff] px-5 py-3 font-medium text-white transition hover:bg-[#535bf2] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Regisztráció..." : "Regisztráció"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[rgba(255,255,255,0.65)]">
            Van már fiókod?{" "}
            <Link to="/login" className="text-[#646cff] hover:text-[#535bf2]">
              Bejelentkezés
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
