import {
    createTRPCRouter,
    publicProcedure,
} from "~/server/api/trpc";
import * as z from "zod";
import MailService from "~/server/api/services/MailService";

const createMailSchema = z.object({
    name: z.string().min(1),
    email: z.string().min(1),
    subject: z.string().min(1),
})
export const mailRouter = createTRPCRouter({
    post: publicProcedure
        .input(createMailSchema)
        .mutation(async ({ ctx, input }) => {
                const mailService = new MailService;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                await mailService.sendMail({
                    from: input.email,
                    to: "dhafinjulda@gmail.com",
                    cc: "",
                    bcc: "",
                    text: "",
                    subject: "Utopia Contact Us Inqury",
                    html: `<div>
                        <p>Name: ${input.name}</p>
                        <p>Email: ${input.email}</p>
                        <p>Subject: ${input.subject}</p>
                    </div>`,
                });
            }
        ),
});