import { useState, FormEvent } from "react";
import { useTranslation } from "next-i18next";

import { register } from "sdk";

import { Link } from "components/LinkButton";

type FormFieldProps = {
  label: string;
  type: "email" | "password";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
};

export function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border p-2"
        required={required}
        disabled={disabled}
      />
    </div>
  );
}

type SubmitButtonProps = {
  text: string;
  loadingText: string;
  isLoading: boolean;
  disabled?: boolean;
};

export function SubmitButton({
  text,
  loadingText,
  isLoading,
  disabled = false,
}: SubmitButtonProps) {
  return (
    <div className="mb-4 flex justify-center">
      <button
        type="submit"
        className="bg-primary hover:bg-opacity-90 focus:ring-primary rounded-full px-4 py-2 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        disabled={isLoading || disabled}
      >
        {isLoading ? loadingText : text}
      </button>
    </div>
  );
}

type ErrorMessageProps = {
  message: string | null;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
      {message}
    </div>
  );
}

export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
}

export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }

  return { isValid: true };
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true };
}

export default function RegisterPage() {
  const { t } = useTranslation("pages/register");

  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="h-full">
      <header className="w-full text-center">
        <h1 className="py-8">
          <a href="/">
            <img src="/logo.svg" alt="Lightlist" className="inline h-[2rem]" />
          </a>
        </h1>
      </header>

      <div className="mx-auto flex h-full max-w-sm items-center justify-center py-12">
        <div className="w-full px-4 pb-16">
          <h2 className="mb-6 text-center text-xl font-semibold">
            {t("Sign Up")}
          </h2>
          <ErrorMessage message={error} />

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              setIsLoading(true);
              register({ email, password })
                .then(() => {
                  window.location.href = "/app";
                })
                .catch((err) => {
                  setError(err.message);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
          >
            <FormField
              label={t("Email")}
              type="email"
              placeholder={t("Email")}
              value={email}
              onChange={setEmail}
              required
              disabled={isLoading}
            />

            <FormField
              label={t("Password")}
              type="password"
              placeholder={t("Password")}
              value={password}
              onChange={setPassword}
              required
              disabled={isLoading}
            />

            <SubmitButton
              text={t("Sign Up")}
              loadingText={t("Signing Up")}
              isLoading={isLoading}
            />
          </form>

          <div className="text-center">
            <Link href="/login">{t("Already have an account? Log in")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
