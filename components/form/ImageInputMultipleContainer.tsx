"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import FormContainer from "./FormContainer";
import ImageInput from "./ImageInput";
import { SubmitButton } from "./Buttons";
import { type actionFunction } from "@/utils/types";

type props = {
  images: string[];
  name: string;
  action: actionFunction;
  text: string;
  children?: React.ReactNode;
};

export default function ImageInputMultipleContainer(props: props) {
  const { images, name, action, text } = props;
  const [isUpdateFormVisible, setUpdateFormVisible] = useState(false);
  const [previewUrls] = useState<string[]>(images || []);
  return (
    <div>
      <div className="flex gap-4 mb-4">
        {previewUrls.length > 0 ? (
          previewUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${name} preview ${i + 1}`}
              width={100}
              height={100}
              className="rounded object-cover w-24 h-24"
              loading="lazy"
              decoding="async"
            />
          ))
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-400">
            No images
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setUpdateFormVisible((prev) => !prev)}
      >
        {text}
      </Button>

      {isUpdateFormVisible && (
        <div className="max-w-lg mt-4">
          <FormContainer action={action}>
            {props.children}
            <ImageInput multiple name="images" />
            <SubmitButton size="sm" />
          </FormContainer>
        </div>
      )}
    </div>
  );
}
