import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  postSchema,
  type extendedPostType,
  type postType,
} from "@/server/schemas/post-schemas";

export const postRouter = createTRPCRouter({
  // ADD POST TO DB
  create: protectedProcedure
    .input(z.object({ title: z.string().min(1), content: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content,
          published: false,
          createdBy: { connect: { id: ctx.session.user.id } },
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
              email: true,
            },
          },
          approvedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      console.log(post);

      return post;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts: extendedPostType[] = await ctx.db.post.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        editedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return posts;
  }),

  approvePost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "WRITER" &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }
      return ctx.db.post.update({
        where: { id: input.id },
        data: { approvedById: ctx.session.user.id },
      });
    }),

  updatePost: protectedProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
          published: input.published,
          editedById: ctx.session.user.id,
        },
      });
    }),

  publishPost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.post.update({
        where: { id: input.id },
        data: { published: true },
      });
    }),

  unpublishPost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      return ctx.db.post.update({
        where: { id: input.id },
        data: { published: false },
      });
    }),

  deletePost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "WRITER" &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      //FIRST DELETE ALL COMMENTS RELATED TO POST
      await ctx.db.$transaction([
        ctx.db.comment.deleteMany({
          where: { postId: input.id },
        }),
        //THEN DELETE POST
        ctx.db.post.delete({
          where: { id: input.id },
        }),
      ]);
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
