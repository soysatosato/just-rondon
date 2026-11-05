"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { Lock } from "lucide-react";

import GuideSectionCard from "@/components/guides/GuideSectionCard";
import { Button } from "@/components/ui/button";
import { useAuthAppearance } from "@/components/stamps/AuthCard";
import MarkdownBody from "../MarkdownBody";
import { t } from "./ui";
import type { CaseStorySection, Locale } from "./types";

/**
 * 審判所の記録の、線より後の節(components/jobs/case-story/gate.ts)。
 *
 * ページの HTML に入っているのは閉じた節の見出しだけ。ログインしている
 * 読者には /api/case-story から本文を取って出し、していない読者には見出しの
 * 一覧と登録の案内を出す。
 *
 * 登録・ログインのあとは同じ章の #continue に戻す。ここで続きが開く。
 *
 * GA4 に送るもの(gtag があるときだけ):
 * - case_story_gate_view   未ログインの読者に線を見せた
 * - case_story_gate_click  登録/ログインを押した(action: sign_up | sign_in)
 * - case_story_gate_unlock 押した人が戻ってきて続きが開いた
 *                          (new_account: 1 なら、このとき作られたアカウント)
 */

type Gtag = (
  command: "event",
  name: string,
  params: Record<string, string | number>,
) => void;

function track(name: string, params: Record<string, string | number>) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", name, params);
}

/** 登録・ログインを押した章。戻ってきたときに unlock を1度だけ数える。 */
const PENDING_KEY = "case-story-gate";

function readPending(): string | null {
  try {
    return sessionStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

function writePending(value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(PENDING_KEY);
    else sessionStorage.setItem(PENDING_KEY, value);
  } catch {
    // 数えられないだけで、続きは読める。
  }
}

/** このくらい前までに作られたアカウントは、線から登録したものとみなす。 */
const NEW_ACCOUNT_MS = 30 * 60 * 1000;

type Locked = { title: string; subtitle?: string };

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; sections: CaseStorySection[] }
  | { kind: "error" };

export default function MemberSections({
  slug,
  locale,
  from,
  locked,
}: {
  slug: string;
  locale: Locale;
  /** 線の前に出した節の数。節の番号をここから続ける。 */
  from: number;
  /** 閉じた節の見出し。未ログインの読者に何が読めるかを見せる。 */
  locked: Locked[];
}) {
  const strings = t(locale);
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { openSignIn, openSignUp } = useClerk();
  const appearance = useAuthAppearance();
  const [state, setState] = useState<State>({ kind: "idle" });
  const viewed = useRef(false);
  const unlocked = useRef(false);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetch(
        `/api/case-story?slug=${encodeURIComponent(slug)}&locale=${locale}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { sections: CaseStorySection[] };
      setState({ kind: "ready", sections: data.sections });
    } catch {
      setState({ kind: "error" });
    }
  }, [locale, slug]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      void load();
    } else if (!viewed.current) {
      viewed.current = true;
      track("case_story_gate_view", { chapter: slug, locale });
    }
  }, [isLoaded, isSignedIn, load, locale, slug]);

  // 線から登録・ログインして戻ってきた。
  useEffect(() => {
    if (state.kind !== "ready" || unlocked.current) return;
    if (readPending() !== slug) return;
    unlocked.current = true;
    writePending(null);
    const created = user?.createdAt?.getTime() ?? 0;
    track("case_story_gate_unlock", {
      chapter: slug,
      locale,
      new_account: Date.now() - created < NEW_ACCOUNT_MS ? 1 : 0,
    });
  }, [locale, slug, state.kind, user]);

  const open = (action: "sign_up" | "sign_in") => {
    track("case_story_gate_click", { chapter: slug, locale, action });
    writePending(slug);
    // 登録(Google/LINE で初めて来た人を含む)でもログインでも、この章の続きへ戻す。
    // 渡さないと登録後の既定の行き先(/stamps)に飛んでしまう。
    const back = `${pathname}#continue`;
    const options = {
      forceRedirectUrl: back,
      signUpForceRedirectUrl: back,
      signInForceRedirectUrl: back,
      appearance,
    };
    if (action === "sign_up") openSignUp(options);
    else openSignIn(options);
  };

  if (state.kind === "ready") {
    return (
      <div id="continue" className="mt-8 scroll-mt-20 space-y-8">
        {state.sections.map((section, i) => (
          <GuideSectionCard key={section.title}>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {from + i + 1}. {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {section.subtitle}
              </p>
            )}
            <MarkdownBody>{section.body}</MarkdownBody>
          </GuideSectionCard>
        ))}
      </div>
    );
  }

  // ログイン状態が分かるまでと、読み込み中・失敗は、見出しの一覧の上に一言だけ。
  const signedOut = isLoaded && !isSignedIn;

  return (
    <section
      id="continue"
      className="mt-8 scroll-mt-20 rounded-lg border border-neutral-300 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6"
    >
      {signedOut && (
        <>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            {strings.gateHeading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {strings.gateBody}
          </p>
        </>
      )}
      {state.kind === "loading" && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400" role="status">
          {strings.gateLoading}
        </p>
      )}
      {state.kind === "error" && (
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {strings.gateError}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-2 text-link underline underline-offset-2"
          >
            {strings.gateRetry}
          </button>
        </p>
      )}

      <p className="mt-5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {strings.gateLockedList}
      </p>
      <ol className="mt-2 space-y-2">
        {locked.map((section, i) => (
          <li key={section.title} className="text-sm leading-snug">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {from + i + 1}. {section.title}
            </span>
            {section.subtitle && (
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {section.subtitle}
              </span>
            )}
          </li>
        ))}
      </ol>

      {signedOut && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" size="lg" onClick={() => open("sign_up")}>
            {strings.gateSignUp}
          </Button>
          <Button
            type="button"
            variant="link"
            className="h-11 text-link"
            onClick={() => open("sign_in")}
          >
            {strings.gateSignIn}
          </Button>
        </div>
      )}
    </section>
  );
}
