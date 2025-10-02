"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import { SubmitButton } from "@/components/form/Buttons";
import { DeletePostAction } from "@/utils/actions/chatboard";
import { FaTrash } from "react-icons/fa";

type DeletePostDialogProps = {
  postId: string;
};

const DeletePostDialog: React.FC<DeletePostDialogProps> = ({ postId }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="p-0 w-2 h-2">
          <FaTrash className="text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md sm:mx-auto">
        <DialogHeader>
          <DialogTitle>この投稿を削除しますか？</DialogTitle>
        </DialogHeader>

        <FormContainer action={DeletePostAction}>
          <input type="hidden" name="postId" value={postId} />
          <FormInput
            name="deletePsswrd"
            type="password"
            label="削除用パスワード"
            placeholder="4文字の削除パスワードを入力"
          />
          <DialogFooter>
            <SubmitButton text="削除" className="mt-2" />
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePostDialog;
