import { SetHtmlLang } from "./SetHtmlLang";

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SetHtmlLang />
      {children}
    </>
  );
}
