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

import {
    Dialog,
    DialogContent
} from "~/components/ui/dialog";
import {
    Alert,
    AlertTitle
} from "~/components/ui/alert";


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

    const showAlert = (type: 'default' | 'destructive', message: string) => {
        setAlert({ type, message });

        setTimeout(() => {
            setAlert({
                type: 'default',
                message: '',
            });
        }, 1500);
    }
    
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
          sendEmailMutation({
            'email': form.email,
            'subject': form.subject,
            'name': form.name,
          },  {
            onSuccess: () => {
              showAlert('default', 'Thank you !');
              contactForm.reset();
              setContactFormVisible(false);
            },
            onError: (error) => {
              console.error(error);
              showAlert('destructive', 'Failed to contact us!');
            }
          })
    
          contactForm.reset();
          setContactFormVisible(false);
          showAlert('default', 'Your message has been sent!');
        } catch (error) {
          console.error(error);
        }
    };



    return (
        <>
            <header className="sticky top-0 z-50 bg-utopia-dark-grey p-4 py-6 shadow-lg">
                <div className="mx-auto flex max-w-7xl items-center">
                <Link href="/">
                    <Image
                    src="/favicon.png"
                    alt="utopia icon"
                    width="28"
                    height="28"
                    />
                </Link>
                <div className="ml-auto flex items-center gap-8">
                    <a
                    className="text-lg font-medium text-white"
                    href="instagram.com"
                    target="_blank"
                    >
                    Instagram
                    </a>
                    <a
                    className="text-lg font-medium text-white"
                    href="instagram.com"
                    target="_blank"
                    >
                    X
                    </a>
                    <div className="relative">
                    <button
                        className="text-lg font-medium text-white"
                        onClick={() => setContactFormVisible(!contactFormVisible)}
                    >
                        Contact Us
                    </button>
                    </div>
                </div>
                </div>
            </header>

            <Dialog open={contactFormVisible} onOpenChange={setContactFormVisible}>
                <DialogContent className="border-slate-800 bg-utopia-dark-grey bg-gradient-to-b from-utopia-blue to-utopia-yellow p-0.5 text-slate-400">
                    <Form {...contactForm}>
                        <form
                        className="flex flex-col gap-3 bg-utopia-dark-grey p-5"
                        onSubmit={contactForm.handleSubmit(handleSubmit)}
                        >
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
                                    {...field}
                                    ></textarea>
                                </div>
                                </FormControl>
                                <FormMessage></FormMessage>
                            </FormItem>
                            )}
                        />
                        <button
                            type="submit"
                            className="h-10 w-40 rounded-lg bg-white text-center font-medium uppercase mt-5"
                        >
                            Send
                        </button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {
                alert.message && (
                <div className="fixed left-2 right-2 top-2 z-[9999] p-2">
                    <Alert className="ml-auto w-max" variant={alert.type}>
                        <AlertTitle>{alert.message}</AlertTitle>
                    </Alert>
                </div>
                )
            }
    </>
    )
}