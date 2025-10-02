"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { LuShare2 } from "react-icons/lu";

import {
  TwitterShareButton,
  EmailShareButton,
  LineShareButton,
  TwitterIcon,
  EmailIcon,
  LineIcon,
} from "react-share";

export default function ShareButton({
  museumId,
  name,
}: {
  name: string;
  museumId: string;
}) {
  const url = process.env.NEXT_PUBLIC_WEBSITE_URL;
  const shareUrl = `${url}/museums/${museumId}`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <LuShare2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        className="flex items-center justify-center gap-x-2 w-full"
      >
        <TwitterShareButton url={shareUrl} title={name}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LineShareButton url={shareUrl} title={name}>
          <LineIcon size={32} round />
        </LineShareButton>
        <EmailShareButton url={shareUrl} title={name}>
          <EmailIcon size={32} round />
        </EmailShareButton>
      </PopoverContent>
    </Popover>
  );
}
