"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuickLoginButtons } from "@/components/features/auth/quick-login-buttons";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginValues = z.infer<typeof loginSchema>;

function getSafeNextPath(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//") || value.startsWith("/login") || value.startsWith("/lock-screen")) {
    return "/dashboard";
  }

  return value;
}

function getErrorMessage(code?: string, message?: string) {
  if (code === "ACCOUNT_LOCKED") return "Akun dikunci sementara. Hubungi Admin untuk membuka akses.";
  if (code === "RATE_LIMIT_EXCEEDED") return "Terlalu banyak percobaan. Coba lagi nanti.";
  if (code === "INVALID_EMAIL_OR_PASSWORD" || code === "INVALID_USERNAME_OR_PASSWORD") {
    return "Username atau password salah.";
  }
  return message ?? "Login gagal. Periksa username dan password kamu.";
}

export function LoginForm() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = getSafeNextPath(searchParams.get("next"));

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setError(null);

    const result = await authClient.signIn.username({
      username: values.username,
      password: values.password,
    });

    setSubmitting(false);

    if (result.error) {
      const message = getErrorMessage(result.error.code, result.error.message);
      if (result.error.code === "ACCOUNT_LOCKED") {
        router.push(`/lock-screen?username=${encodeURIComponent(values.username)}`);
        return;
      }
      setError(message);
      return;
    }

    toast.success("Selamat datang");
    router.push(next);
    router.refresh();
  }

  function handleQuickLogin(username: string, password: string) {
    form.setValue("username", username, { shouldValidate: true });
    form.setValue("password", password, { shouldValidate: true });
    setError(null);
  }

  return (
    <Card>
      <CardHeader className="space-y-3 text-center">
        <div className="bg-primary text-primary-foreground mx-auto flex size-10 items-center justify-center rounded-md">
          <ShieldCheckIcon className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Komando Center</CardTitle>
          <CardDescription>Sistem Manajemen Operasi Sosial Media</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="superadmin" autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        autoComplete="current-password"
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2Icon className="animate-spin" /> : null}
              Masuk
            </Button>
            <p className="text-muted-foreground text-center text-xs">Lupa password? Hubungi Admin.</p>
            <QuickLoginButtons onSelect={handleQuickLogin} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
