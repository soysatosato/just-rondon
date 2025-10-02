import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import ContactForm from "./ContactForm";
import { Button } from "../ui/button";
import { MdEmail } from "react-icons/md";

export default function ContactDialog() {
  return (
    <Dialog>
      <div className="flex justify-center mt-6">
        <DialogTrigger asChild>
          <Button
            className="group relative px-6 py-3 font-semibold text-white
               rounded-full overflow-hidden shadow-lg
               bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
               transition-transform duration-300 hover:scale-105 hover:shadow-xl"
          >
            <span className="relative z-10 flex items-center gap-2">
              <MdEmail className="text-xl" />
              ロンドん！無料ガイドのお問い合わせ
            </span>
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition duration-300" />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            無料ガイドツアーのお問い合わせ
          </DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-gray-300">
            通常午前10時から<strong>主要作品のみを回る無料ガイドツアー</strong>
            を請け負っています。
            <br />
            ご興味のある方は、ご希望の日程や人数・美術館(ナショナルギャラリーor大英博物館)を含めてご記入のうえ、以下のフォームからご連絡ください。
            <br />
            「全部は回れないけれど、絶対に見逃したくない作品だけは押さえたい」
            ——そんな方にぴったりの１時間です。
          </DialogDescription>
        </DialogHeader>

        <ContactForm />
      </DialogContent>
    </Dialog>
  );
}
