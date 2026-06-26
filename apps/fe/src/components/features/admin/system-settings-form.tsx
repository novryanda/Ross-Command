"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  fetchSystemSettings,
  testApifyConnection,
  updateSystemSettings,
} from "@/lib/api/system-settings";
import type { ApifyActorsConfig, SocialPlatform, SystemSettings } from "@/lib/api/types";
import { platformLabel } from "@/components/komando/badges";

const platformKeys: SocialPlatform[] = [
  "instagram",
  "twitter_x",
  "facebook",
  "tiktok",
  "youtube",
  "other",
];

const emptyActors: ApifyActorsConfig = {
  instagram: "",
  twitter_x: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  other: "",
};

export function SystemSettingsForm({ initialSettings }: { initialSettings: SystemSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [apifyApiToken, setApifyApiToken] = useState("");
  const [apifyWebhookSecret, setApifyWebhookSecret] = useState("");
  const [apifyActors, setApifyActors] = useState<ApifyActorsConfig>({
    ...emptyActors,
    ...initialSettings.apifyActors,
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload: {
        apifyApiToken?: string;
        apifyWebhookSecret?: string;
        apifyActors: ApifyActorsConfig;
      } = { apifyActors };

      if (apifyApiToken.trim()) {
        payload.apifyApiToken = apifyApiToken.trim();
      }
      if (apifyWebhookSecret.trim()) {
        payload.apifyWebhookSecret = apifyWebhookSecret.trim();
      }

      const response = await updateSystemSettings(payload);
      setSettings(response.data);
      setApifyApiToken("");
      setApifyWebhookSecret("");
      toast.success("Konfigurasi sistem berhasil disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfigurasi");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    const tokenToTest = apifyApiToken.trim();
    if (!tokenToTest && !settings.hasApifyApiToken) {
      toast.error("Masukkan Apify API token terlebih dahulu");
      return;
    }

    setTesting(true);
    try {
      const response = await testApifyConnection(tokenToTest || undefined);
      toast.success(
        response.data.username
          ? `Terhubung ke Apify sebagai ${response.data.username}`
          : "Koneksi Apify berhasil",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menguji koneksi Apify");
    } finally {
      setTesting(false);
    }
  }

  async function handleReload() {
    try {
      const response = await fetchSystemSettings();
      setSettings(response.data);
      setApifyActors({ ...emptyActors, ...response.data.apifyActors });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat ulang konfigurasi");
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      {!settings.encryptionKeyConfigured ? (
        <Alert variant="destructive">
          <AlertTitle>Kunci enkripsi belum valid</AlertTitle>
          <AlertDescription>
            Set <code className="text-xs">SETTINGS_ENCRYPTION_KEY</code> di API (64 karakter hex / 32 byte)
            lalu restart server API.
          </AlertDescription>
        </Alert>
      ) : !settings.secretsDecryptable ? (
        <Alert variant="destructive">
          <AlertTitle>Rahasia tersimpan tidak bisa dibaca</AlertTitle>
          <AlertDescription>
            Kunci enkripsi berbeda dari saat data disimpan. Simpan ulang token dan webhook secret di form ini.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Integrasi Apify</CardTitle>
          <CardDescription>
            Konfigurasi kredensial Apify dan mapping actor per platform untuk scrape metrik blasting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="apifyApiToken">Apify API Token</Label>
            <Input
              id="apifyApiToken"
              type="password"
              placeholder={settings.hasApifyApiToken ? "Kosongkan jika tidak ingin mengubah" : "Masukkan token Apify"}
              value={apifyApiToken}
              onChange={(event) => setApifyApiToken(event.target.value)}
              autoComplete="off"
            />
            {settings.apifyApiToken ? (
              <p className="text-muted-foreground text-xs">
                Tersimpan: {settings.apifyApiToken}. Tes koneksi memakai token di form jika diisi,
                jika tidak memakai token tersimpan.
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Token bisa langsung diuji tanpa disimpan terlebih dahulu.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apifyWebhookSecret">Apify Webhook Secret</Label>
            <Input
              id="apifyWebhookSecret"
              type="password"
              placeholder={
                settings.hasApifyWebhookSecret
                  ? "Kosongkan jika tidak ingin mengubah"
                  : "Masukkan webhook secret"
              }
              value={apifyWebhookSecret}
              onChange={(event) => setApifyWebhookSecret(event.target.value)}
              autoComplete="off"
            />
            {settings.apifyWebhookSecret ? (
              <p className="text-muted-foreground text-xs">Tersimpan: {settings.apifyWebhookSecret}</p>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Actor ID per Platform</p>
            <p className="text-muted-foreground text-xs">
              Format: <code className="text-xs">username~actor-name</code> (slash / otomatis
              dikonversi). Contoh: <code className="text-xs">apify~instagram-post-scraper</code>
            </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {platformKeys.map((platform) => (
                <div key={platform} className="grid gap-1.5">
                  <Label htmlFor={`actor-${platform}`}>{platformLabel[platform]}</Label>
                  <Input
                    id={`actor-${platform}`}
                    placeholder="username~actor-name"
                    value={apifyActors[platform] ?? ""}
                    onChange={(event) =>
                      setApifyActors((current) => ({
                        ...current,
                        [platform]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => void handleReload()}>
              Muat Ulang
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={testing || (!settings.hasApifyApiToken && !apifyApiToken.trim())}
              onClick={() => void handleTestConnection()}
            >
              {testing ? <Loader2Icon className="animate-spin" /> : null}
              Tes Koneksi Apify
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2Icon className="animate-spin" /> : null}
              Simpan Konfigurasi
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
