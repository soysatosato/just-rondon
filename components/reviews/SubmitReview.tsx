"use client";
import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import { Card } from "@/components/ui/card";
import RatingInput from "@/components/form/RatingInput";
import { createMuseumReviewAction } from "@/utils/actions/museums";
import { useUser } from "@clerk/nextjs";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";

export default function SubmitReview({
  museumSlug,
  museumId,
}: {
  museumId: string;
  museumSlug: string;
}) {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // SSR時は何も描画しない

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-center mb-4">レビュー</h2>
      <Card className="p-4 max-w-4xl mx-auto">
        <FormContainer action={createMuseumReviewAction}>
          <input hidden value={museumId} name="museumId" />
          <input hidden value={museumSlug} name="museumSlug" />
          <div className="flex items-center gap-3">
            <RatingInput name="rating" />
            <Input
              name="comment"
              placeholder="感想をシェア..."
              className="flex-1"
            />
            {user ? (
              <SubmitButton text="投稿" />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                ログインして投稿
              </p>
            )}
          </div>
        </FormContainer>
      </Card>
    </div>
  );
}
