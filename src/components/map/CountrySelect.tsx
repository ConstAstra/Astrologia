"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function CountrySelect({
  countries,
  selected,
  placeholder,
}: {
  countries: { id: string; name: string }[];
  selected?: string;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("country", value);
    else params.delete("country");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <select
      value={selected ?? ""}
      onChange={onChange}
      className="w-full max-w-xs rounded-lg border border-border-soft bg-background-elevated px-3 py-2 text-sm outline-none focus:border-gold/60 sm:w-auto"
    >
      <option value="">{placeholder}</option>
      {countries.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
