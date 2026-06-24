import type { EmploymentType, Gender, Religion } from "@/lib/api/types";

export const genderOptions: Array<{ value: Gender; label: string }> = [
  { value: "pria", label: "Pria" },
  { value: "wanita", label: "Wanita" },
];

export const employmentTypeOptions: Array<{ value: EmploymentType; label: string }> = [
  { value: "tni", label: "TNI" },
  { value: "pns", label: "PNS" },
  { value: "p3k", label: "P3K" },
];

export const religionOptions: Array<{ value: Religion; label: string }> = [
  { value: "islam", label: "Islam" },
  { value: "kristen_protestan", label: "Kristen Protestan" },
  { value: "katolik", label: "Katolik" },
  { value: "hindu", label: "Hindu" },
  { value: "buddha", label: "Buddha" },
  { value: "konghucu", label: "Konghucu" },
];

export function getEmploymentTypeLabel(value?: EmploymentType | null) {
  return employmentTypeOptions.find((option) => option.value === value)?.label ?? "-";
}

export function getGenderLabel(value?: Gender | null) {
  return genderOptions.find((option) => option.value === value)?.label ?? "-";
}

export function getReligionLabel(value?: Religion | null) {
  return religionOptions.find((option) => option.value === value)?.label ?? "-";
}

export function getIdentityNumberLabel(value?: EmploymentType | null) {
  if (value === "tni") return "NRP";
  if (value === "p3k") return "NI PPPK";
  return "NIP";
}

export function getRankOrGradeLabel(value?: EmploymentType | null) {
  if (!value) return "Pangkat/Golongan";
  return value === "tni" ? "Pangkat" : "Golongan";
}
