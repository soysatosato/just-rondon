import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/format";
import CommentFormDialog from "./CommentFormDialog";
import DeletePostDialog from "./DeletePostDialog";
import VoteButtons from "./VoteButtons";
import { AiOutlineEye } from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";
import { Button } from "../ui/button";

const countComments = (comments: any[]): number => {
  let count = 0;
  comments.forEach((c) => {
    count += 1; // 自分自身
    if (c.children) {
      count += countComments(c.children);
    }
  });
  return count;
};

const CommentItem: React.FC<{
  comment: any;
  level?: number;
  postId: number;
}> = ({ comment, level = 0, postId }) => {
  const indent = level * 6;
  const bgColor =
    level % 2 === 0
      ? "bg-gray-50 dark:bg-gray-700"
      : "bg-white dark:bg-gray-800";

  return (
    <div
      className={`border-l border-gray-300 dark:border-gray-600 p-3 rounded mb-3 ${bgColor}`}
      style={{ paddingLeft: `${indent * 4}px` }}
    >
      <div className="grid grid-cols-10 gap-2">
        <div className="col-span-8">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {comment.author}
          </span>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            {comment.content}
          </p>
        </div>

        <div className="col-span-2 flex flex-col justify-between items-end space-y-2 min-w-0">
          <VoteButtons
            id={comment.id}
            target="comment"
            initialVotes={comment.votes}
            size="sm"
          />
          <CommentFormDialog
            postId={postId}
            parentId={comment.id}
            triggerText="返信"
          />
        </div>
      </div>

      {/* 子コメント */}
      {comment.children &&
        comment.children.map((child: any) => (
          <CommentItem
            key={child.id}
            comment={child}
            level={level + 1}
            postId={postId}
          />
        ))}
    </div>
  );
};

const PostDetailClient: React.FC<{ post: any }> = ({ post }) => {
  return (
    <main className="w-full mx-auto px-2 sm:px-6 space-y-8 overflow-x-hidden">
      <Card className="relative hover:shadow-lg transition-shadow">
        <div className="absolute top-2 right-4 opacity-0 hover:opacity-100 transition-opacity">
          <DeletePostDialog postId={post.id} />
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 mt-2">
            {post.title}
          </CardTitle>
          <div className="flex justify-between items-start mt-2 text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex flex-col">
              <span>投稿者:{post.author}</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1">
              <AiOutlineEye className="w-4 h-4" />
              <span className="text-sm">{post.views}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <p className="text-gray-700 dark:text-gray-300 mb-5">
            {post.content}
          </p>
          <div className="flex justify-between items-center mb-5 text-sm">
            <div className="flex items-center space-x-8 text-gray-500 dark:text-gray-400">
              <VoteButtons
                id={post.id}
                target="post"
                initialVotes={post.votes}
              />
            </div>

            <div className="flex space-x-2">
              <CommentFormDialog
                postId={post.id}
                triggerText={
                  <Button
                    variant="outline"
                    className="h-8 px-2 flex items-center gap-1"
                  >
                    <FaCommentDots className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {countComments(post.comments).toString()}
                    </span>
                  </Button>
                }
              />
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-5 space-y-4">
            {post.comments.map((comment: any) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default PostDetailClient;
