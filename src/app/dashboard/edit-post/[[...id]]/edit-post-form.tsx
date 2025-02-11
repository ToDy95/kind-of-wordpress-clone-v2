"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { clientApi } from "@/trpc/react";
import { postSchema } from "@/server/schemas/post-schemas";
import { Separator } from "@/components/ui/separator";
import MDEditor from "@uiw/react-md-editor";

const canApprove = (role: string) => role === "WRITER" || role === "ADMIN";
const canPublish = (role: string) => role === "ADMIN";
const canDelete = (role: string) => role === "WRITER" || role === "ADMIN";

const EditPostForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id")!;
  const { data, isLoading } = clientApi.post.getPostById.useQuery({
    id: id,
  });
  const [userRole, setUserRole] = useState<string>("ADMIN");

  const [editorContent, setEditorContent] = useState(data?.content);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: data?.title ?? "",
      content: data?.content ?? "",
      id: data?.id ?? "",
      published: data?.published ?? false,
      createdAt: data?.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data?.updatedAt ? new Date(data.updatedAt) : new Date(),
      approvedById: data?.approvedById ?? null,
      editedById: data?.editedById ?? null,
      createdById: data?.createdById ?? "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        title: data.title,
        content: data.content,
        id: data.id,
        published: data.published,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        approvedById: data.approvedById,
        editedById: data.editedById,
        createdById: data.createdById,
      });
      setEditorContent(data.content);
    }
  }, [data, form]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!id) {
    router.push("/dashboard");
  }

  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    try {
      const { mutateAsync } = clientApi.post.updatePost.useMutation();
      await mutateAsync({
        id: data.id,
        ...data,
        editedById: "currentUserId", // Adaugă ID-ul utilizatorului curent
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async () => {
    if (!canApprove(userRole)) {
      throw new Error("Unauthorized");
    }
    try {
      const { mutateAsync } = clientApi.post.approvePost.useMutation();
      await mutateAsync({ id: id });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handlePublish = async () => {
    if (!canPublish(userRole)) {
      throw new Error("Unauthorized");
    }
    try {
      const { mutateAsync } = clientApi.post.publishPost.useMutation();
      await mutateAsync({ id: id });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!canDelete(userRole)) {
      throw new Error("Unauthorized");
    }
    try {
      const { mutateAsync } = clientApi.post.deletePost.useMutation();
      await mutateAsync({ id: id });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Top Buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Content</h1>
        <div className="space-x-2">
          {canApprove(userRole) && (
            <Button onClick={handleApprove}>Approve</Button>
          )}
          {canPublish(userRole) && (
            <Button onClick={handlePublish}>Publish</Button>
          )}
          {canDelete(userRole) && (
            <Button onClick={handleDelete}>Delete</Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Title"
                    {...field}
                    className="p-2 text-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">Content</FormLabel>
                <FormControl>
                  <MDEditor
                    id="editor"
                    className="rounded-md border p-2"
                    onChange={(value) => {
                      setEditorContent(value);
                      field.onChange(value);
                    }}
                    value={editorContent}
                    autoCapitalize="none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!!data?.editedById && (
            <p className="text-sm text-gray-500">
              Edited by: {data.editedBy?.name}
            </p>
          )}

          <Separator />

          {/* Bottom Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export { EditPostForm };
