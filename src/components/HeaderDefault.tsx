import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Alert, AlertTitle } from "~/components/ui/alert";
import ButtonDefault from "./button/button-default";

const contactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
});

type IContact = z.infer<typeof contactSchema>;

export default function HeaderDefault() {
  const { mutate: sendEmailMutation } = api.mail.post.useMutation();

  const [contactFormVisible, setContactFormVisible] = useState(false);

  const [alert, setAlert] = useState<{
    type: "default" | "destructive";
    message: string;
  }>({
    type: "default",
    message: "",
  });

  const showAlert = (type: "default" | "destructive", message: string) => {
    setAlert({ type, message });

    setTimeout(() => {
      setAlert({
        type: "default",
        message: "",
      });
    }, 1500);
  };

  const contactForm = useForm<IContact>({
    resolver: zodResolver(
      z.object({
        name: z.string(),
        email: z.string().email(),
        subject: z.string(),
      }),
    ),
  });

  const handleSubmit = async (form: IContact) => {
    try {
      sendEmailMutation(
        {
          email: form.email,
          subject: form.subject,
          name: form.name,
        },
        {
          onSuccess: () => {
            showAlert("default", "Thank you !");
            contactForm.reset();
            setContactFormVisible(false);
          },
          onError: (error) => {
            console.error(error);
            showAlert("destructive", "Failed to contact us!");
          },
        },
      );

      contactForm.reset();
      setContactFormVisible(false);
      showAlert("default", "Your message has been sent!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 flex items-center gap-2 bg-black/15 h-20 z-50">
        <div className="flex items-center gap-6 w-full mx-auto max-w-7xl">
          <Link href="/">
            <Image
              src="/images/logo-utopia.png"
              alt="utopia icon"
              width="40"
              height="40"
            />
          </Link>
          <a
            href="x.com"
            target="_blank"
            className="block ml-auto">
            <Image
              src="/images/social/social-x-white.png"
              alt="twitter icon"
              width={25}
              height={25}
            />
          </a>
          <a
            href="discord.com"
            target="_blank"
            className="block">
            <Image
              src="/images/social/social-discord-white.png"
              alt="discord icon"
              width={25}
              height={25}
            />
          </a>
          <a
            href="instagram.com"
            target="_blank"
            className="block">
            <Image
              src="/images/social/social-ig-white.png"
              alt="instagram icon"
              width={25}
              height={25}
            />
          </a>
          <a
            href="whatsapp.com"
            target="_blank"
            className="block">
            <Image
              src="/images/social/social-wa-white.png"
              alt="whatsapp icon"
              width={25}
              height={25}
            />
          </a>
          <div className="relative">
            <ButtonDefault
              className="w-44"
              onClick={() => setContactFormVisible(!contactFormVisible)}>
              Connect With Us
            </ButtonDefault>
          </div>
        </div>
      </header>

      <Dialog
        open={contactFormVisible}
        onOpenChange={setContactFormVisible}>
        <DialogContent className="border-slate-800 bg-utopia-dark-grey bg-gradient-to-b from-utopia-blue to-utopia-yellow p-0.5 text-slate-400">
          <Form {...contactForm}>
            <form
              className="flex flex-col gap-3 bg-utopia-dark-grey p-5"
              onSubmit={contactForm.handleSubmit(handleSubmit)}>
              <h2 className="text-lg font-bold">Contact Us</h2>
              <FormField
                control={contactForm.control}
                defaultValue=""
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <div className="rounded-lg bg-gradient-to-b from-utopia-blue to-utopia-yellow p-0.5">
                        <input
                          type="text"
                          className="w-full rounded-md bg-white p-2"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                defaultValue=""
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="rounded-lg bg-gradient-to-b from-utopia-blue to-utopia-yellow p-0.5">
                        <input
                          type="email"
                          className="w-full rounded-md bg-white p-2"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                defaultValue=""
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <div className="rounded-lg bg-gradient-to-b from-utopia-blue to-utopia-yellow p-0.5 pb-0">
                        <textarea
                          rows={5}
                          className="w-full resize-none rounded-md bg-white p-2"
                          {...field}></textarea>
                      </div>
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
              <button
                type="submit"
                className="mt-5 h-10 w-40 rounded-lg bg-white text-center font-medium uppercase">
                Send
              </button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {alert.message && (
        <div className="fixed left-2 right-2 top-2 z-[9999] p-2">
          <Alert
            className="ml-auto w-max"
            variant={alert.type}>
            <AlertTitle>{alert.message}</AlertTitle>
          </Alert>
        </div>
      )}
    </>
  );
}
