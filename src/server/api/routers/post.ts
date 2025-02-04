import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type postType } from "@/server/schemas/post-schemas";
export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  //ADD POST TO DB
  create: publicProcedure //protectedProcedure
    .input(z.object({ title: z.string().min(1), content: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content,
          published: true,
          // createdBy: { connect: { id: ctx.session.user.id } },
          createdBy: { connect: { id: "1" } },
        },
      });
    }),
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post: postType | null = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return post ?? null;
  }),
  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log(
        input.id,
        "input.id==========================================================",
      );

      type extendedPostType = postType & {
        createdBy: { name: string };
        editedBy: { name: string } | null;
        approvedBy: { name: string } | null;
      };

      const post: extendedPostType | null = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
          editedBy: {
            select: {
              name: true,
            },
          },
          approvedBy: {
            select: {
              name: true,
            },
          },
        },
      });

      console.log(post);

      return post;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts: postType[] = await ctx.db.post.findMany();
    return posts;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
