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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clientApiFetch } from "@/lib/api/client";
import type { EmploymentType, Me } from "@/lib/api/types";
import {
  employmentTypeOptions,
  genderOptions,
  getIdentityNumberLabel,
  getRankOrGradeLabel,
  religionOptions,
} from "@/lib/user-identity";

const profileSchema = z.object({
  fullName: z.string().trim().min(3, "Nama lengkap minimal 3 karakter").max(150),
  username: z.string().trim().min(3, "Username minimal 3 karakter").max(50),
  gender: z.enum(["pria", "wanita"]),
  employmentType: z.enum(["tni", "pns", "p3k"]),
  identityNumber: z.string().trim().max(50).optional(),
  rank: z.string().trim().max(50).optional(),
  grade: z.string().trim().max(50).optional(),
  religion: z.enum(["none", "islam", "kristen_protestan", "katolik", "hindu", "buddha", "konghucu"]),
  phoneNumber: z.string().trim().max(30).optional(),
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
  const [employmentType, setEmploymentType] = useState<EmploymentType>(me.employmentType ?? "tni");
  const router = useRouter();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: me.fullName,
      username: me.username,
      gender: me.gender ?? "pria",
      employmentType: me.employmentType ?? "tni",
      identityNumber: me.identityNumber ?? "",
      rank: me.rank ?? "",
      grade: me.grade ?? "",
      religion: me.religion ?? "none",
      phoneNumber: me.phoneNumber ?? "",
    },
  });
  const isTni = employmentType === "tni";

  async function onSubmit(values: ProfileValues) {
    setSubmitting(true);
    try {
      await clientApiFetch<Me>("/api/v1/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: values.fullName,
          username: values.username,
          gender: values.gender,
          employmentType: values.employmentType,
          identityNumber: values.identityNumber?.trim() ? values.identityNumber.trim() : null,
          rank: values.employmentType === "tni" && values.rank?.trim() ? values.rank.trim() : null,
          grade: values.employmentType !== "tni" && values.grade?.trim() ? values.grade.trim() : null,
          religion: values.religion === "none" ? null : values.religion,
          phoneNumber: values.phoneNumber?.trim() ? values.phoneNumber.trim() : null,
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
        <CardDescription>Perbarui nama lengkap, username, dan identitas kamu.</CardDescription>
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-4 rounded-md border px-3 py-2">
                      {genderOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                          <RadioGroupItem value={option.value} />
                          {option.label}
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Pekerjaan</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        setEmploymentType(value as EmploymentType);
                        field.onChange(value);
                        if (value === "tni") {
                          form.setValue("grade", "");
                        } else {
                          form.setValue("rank", "");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employmentTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getIdentityNumberLabel(employmentType as EmploymentType)}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Opsional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={isTni ? "rank" : "grade"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getRankOrGradeLabel(employmentType as EmploymentType)}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Opsional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agama</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opsional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak diisi</SelectItem>
                        {religionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor HP</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Opsional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmploymentType(me.employmentType ?? "tni");
                  form.reset();
                }}
              >
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
