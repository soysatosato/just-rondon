"use client";

import { useEffect } from "react";
import { loadAdMaxScript, registerAdMax } from "@/lib/admax";

type Props = {
  id?: string;
};

export default function AdMaxOverlay({
  id = "79695e0a0c519cbdc2aa4d409afe80c4",
}: Props) {
  useEffect(() => {
    let mounted = true;

    async function init() {
      registerAdMax(id, "overlay");
      try {
        await loadAdMaxScript();
      } catch (error) {
        console.error(error);
      }
    }

    if (mounted) init();

    return () => {
      mounted = false;
      // layout常駐前提なので unregister は基本しない
    };
  }, [id]);

  return null;
}
