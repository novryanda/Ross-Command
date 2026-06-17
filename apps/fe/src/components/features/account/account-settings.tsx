"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PasswordSettingsForm } from "@/components/features/admin/password-settings-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clientApiFetch } from "@/lib/api/client";
import type { Me } from "@/lib/api/types";

const profileSchema = z.object({
  fullName: z.string().trim().min(3, "Nama lengkap minimal 3 karakter").max(150),
  username: z.string().trim().min(3, "Username minimal 3 karakter").max(50),
  nip: z.string().trim().max(50).optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function AccountSettings({ me }: { me: Me }) {
  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="security">Keamanan</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfilePanel me={me} />
      </TabsContent>

      <TabsContent value="security">
        <PasswordSettingsForm />
      </TabsContent>
    </Tabs>
  );
}

function ProfilePanel({ me }: { me: Me }) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: me.fullName,
      username: me.username,
      nip: me.nip ?? "",
    },
  });

  async function onSubmit(values: ProfileValues) {
    setSubmitting(true);
    try {
      await clientApiFetch<Me>("/api/v1/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: values.fullName,
          username: values.username,
          nip: values.nip?.trim() ? values.nip.trim() : null,
        }),
      });
      toast.success("Profil berhasil diperbarui");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui profil");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Perbarui nama lengkap, username, dan NIP kamu.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Opsional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2Icon className="animate-spin" /> : null}
                Simpan perubahan
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
