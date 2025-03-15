"use client";

import React, { useState } from "react";
import { clientApi } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CommentView = ({ postId }: { postId: string }) => {
  const { data, isLoading, isError, refetch } =
    clientApi.comment.getCommentsByPostId.useQuery({ postId });

  const { toast } = useToast();

  const approveComment = clientApi.comment.approveComment.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment approved successfully!",
        variant: "default",
      });
      void refetch();
    },
    onError: (error) => {
      console.error("Error approving comment:", error);
      toast({
        title: "Error",
        description: "An error occurred while approving the comment.",
        variant: "destructive",
      });
    },
  });

  const deleteComment = clientApi.comment.deleteComment.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment deleted successfully!",
        variant: "default",
      });
      void refetch();
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the comment.",
        variant: "destructive",
      });
    },
  });

  const [selectedComment, setSelectedComment] = useState<string | null>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data || data.length === 0) {
    return <div>No comments available</div>;
  }

  const handleApprove = async (id: string) => {
    await approveComment.mutateAsync({ id });
  };

  const handleDelete = async (id: string) => {
    await deleteComment.mutateAsync({ id });
  };

  const handleReadMore = (comment: string) => {
    setSelectedComment(comment);
  };

  const handleCloseModal = () => {
    setSelectedComment(null);
  };

  return (
    <div className="container mx-auto mt-16 p-6">
      <h1 className="mb-6 text-2xl font-semibold">List of Comments</h1>
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.map((comment) => (
          <Card
            key={comment.id}
            className="flex w-full flex-col justify-between shadow-lg"
          >
            <CardContent className="flex-grow p-4">
              <p className="break-words">
                {comment.message.length > 50 ? (
                  <>
                    {`${comment.message.substring(0, 50)}...`}
                    <Button
                      variant="link"
                      onClick={() => handleReadMore(comment.message)}
                    >
                      Read More
                    </Button>
                  </>
                ) : (
                  comment.message
                )}
              </p>
              <p className="text-sm text-gray-500">By: {comment.name}</p>
              <p className="text-sm text-gray-500">Email: {comment.email}</p>
            </CardContent>
            <div className="flex justify-end space-x-2 p-4">
              <Button
                onClick={() => handleApprove(comment.id)}
                className={`${
                  comment.approved
                    ? "cursor-not-allowed bg-gray-500 text-white"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
                disabled={comment.approved}
              >
                {comment.approved ? "Already Approved" : "Approve"}
              </Button>
              <Button
                onClick={() => handleDelete(comment.id)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedComment && (
        <Dialog open={true} onOpenChange={handleCloseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Full Comment</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto break-words">
              <p>{selectedComment}</p>
            </div>
            <DialogFooter>
              <Button onClick={handleCloseModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CommentView;
