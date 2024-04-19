import {
  adminProtectedProcedure,
  createTRPCRouter,
  protectedProcedure
} from "~/server/api/trpc";
import {userIdSchema, userSchema, userUpdateSchema} from "~/validation/userValidation";
import {TRPCError} from "@trpc/server";
import bcrypt from "bcrypt";

export const userRouter = createTRPCRouter({
  get: adminProtectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany();
  }),

  create: protectedProcedure
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {

      if (await ctx.db.user.findUnique({
        where: {
          email : input.email
        }
      })){
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email Already Exist" });
      }

      return ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: "ADMIN",
          password: await bcrypt.hash(input.password, 10)
        },
      });
    }
  ),

  update: protectedProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {

      const checkUnique = await ctx.db.user.findFirst({
          where: {
              NOT: {
                  id: input.id
              },
              AND: {
                  email: input.email
              }

          }
      });

      if (checkUnique){
          throw Error("Email Already Registered to another user");
      }

      let password : string|void = ''

      if (input.password){
          password = await bcrypt.hash(input.password, 10);
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
          ...(password && { password: password})
        },
      });
    }
  ),

  delete: protectedProcedure
    .input(userIdSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
          where:{
              id: input.id
          }
      })

      if (!user){
          throw Error("Wrong user to delete");
      }

      if (user.role === "SUPER_ADMIN"){
          throw Error("Cannot Delete Super Admin");
      }

      return ctx.db.user.delete({
        where: { id: input.id }
      })
    }
  ),
});