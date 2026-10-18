"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { LuShare2 } from "react-icons/lu";
import { SITE_URL } from "@/lib/seo";

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
  const shareUrl = `${SITE_URL}/museums/${museumId}`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* アイコンだけのボタンなので名前を付ける。以前は名前が無く、
            読み上げでは「ボタン」としか聞こえなかった。react-share の各ボタンは
            既定で "twitter" 等の英語名になるので、それも日本語で渡す。 */}
        <Button
          variant="outline"
          size="icon"
          aria-label={`${name}を共有`}
          className="h-11 w-11"
        >
          <LuShare2 aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        className="flex items-center justify-center gap-x-2 w-full"
      >
        <TwitterShareButton url={shareUrl} title={name} aria-label="Xで共有">
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LineShareButton url={shareUrl} title={name} aria-label="LINEで共有">
          <LineIcon size={32} round />
        </LineShareButton>
        <EmailShareButton url={shareUrl} title={name} aria-label="メールで送る">
          <EmailIcon size={32} round />
        </EmailShareButton>
      </PopoverContent>
    </Popover>
  );
}
