export function AuthBrandingPanel() {
  return (
    <div className="relative flex h-full min-h-128 flex-col overflow-hidden rounded-4xl bg-zinc-950 p-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_42%)]" />

      <div className="relative space-y-4">
        <div>
          <p className="text-lg font-semibold tracking-tight">Command Center</p>
          <p className="text-sm text-white/60">Social Command</p>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-white/70">
          Tugas. Pantau. Eksekusi. Satu pusat kendali operasi siber di bawah struktur komando.
        </p>
      </div>

      <div className="relative mt-auto grid gap-8 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Siap memimpin operasi?</p>
          <p className="text-sm leading-relaxed text-white/60">
            Buat tugas, pantau progress anggota, dan pastikan pelaksanaan tepat waktu dari dashboard pimpinan.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Butuh bantuan?</p>
          <p className="text-sm leading-relaxed text-white/60">
            Jika akun terkunci atau lupa password, hubungi Admin untuk reset akses dan verifikasi identitas.
          </p>
        </div>
      </div>
    </div>
  );
}
