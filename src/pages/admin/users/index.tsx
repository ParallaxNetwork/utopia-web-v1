/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useState } from "react";
import AdminLayout from "../layout";
import { api } from "~/utils/api";
import { zodResolver } from "@hookform/resolvers/zod"
import { BiMessageSquareEdit, BiTrash } from "react-icons/bi";
import { z } from "zod";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"

import {
    Alert,
    AlertTitle
} from "~/components/ui/alert"


import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"

import { useForm } from "react-hook-form";
import { IUserCreate, IUserUpdate} from "~/validation/userValidation";
import {User} from "@prisma/client";

export default function AdminUsers() {
    const { data: users, refetch } = api.user.get.useQuery();
    const { mutate: createMutation } = api.user.create.useMutation();
    const { mutate: updateMutation } = api.user.update.useMutation();
    const { mutate: deleteMutation } = api.user.delete.useMutation();

    const [search, setSearch] = useState("");

    const [userFormDialogVisible, setUserFormDialogVisible] = useState(false);
    const [userUpdateFormDialogVisible, setUserUpdateFormDialogVisible] = useState(false);
    const [userFormDialogBusy, setUserFormDialogBusy] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User>();

    const [alert, setAlert] = useState<{
        type: 'default' | 'destructive',
        message: string
    }>({
        type: 'default',
        message: ''
    });

    const userForm = useForm<IUserCreate>({
        resolver: zodResolver(
            z.object({
                name: z
                    .string({ required_error: "Name is required" })
                    .trim()
                    .max(255, { message: "Name must not be more than 255 chars long" }),
                email: z
                    .string({ required_error: "Email is required" })
                    .trim()
                    .email()
                    .max(255, { message: "Email must not be more than 255 chars long" }),
                password: z
                    .string({ required_error: "Password is required" })
                    .trim()
                    .min(6, {
                        message: "Password must be at least 6 chars",
                    })
                    .max(255, { message: "Password must not be more than 1024 chars long" })
            })
        )
    });

    const userUpdateForm = useForm<IUserUpdate>({
        resolver: zodResolver(
            z.object({
                id: z.number(),
                name: z
                    .string({ required_error: "Name is required" })
                    .trim()
                    .min(3, {
                        message: "Name must be at least 3 chars",
                    })
                    .max(255, { message: "Name must not be more than 255 chars long" }),
                email: z
                    .string({ required_error: "Email is required" })
                    .trim()
                    .min(3, {
                        message: "Email must be at least 3 chars",
                    })
                    .max(255, { message: "Email must not be more than 255 chars long" }),
                password: z
                    .string({ required_error: "Password is required" })
                    .trim()
                    .min(6, {
                        message: "Password must be at least 6 chars",
                    })
                    .max(255, { message: "Password must not be more than 1024 chars long" })
                    .optional()
            })
            .refine((data) => (Boolean(data.id) || Boolean(data.name?.length)), {
                message: 'User field required',
                path: ['name'],
            })
        ),
    });

    const handleSubmitCreate = async (form: IUserCreate) => {
        console.log("Here")
        submitUserCreate(form).catch(console.error);
    }
    const handleSubmitUpdate = async (form: IUserUpdate) => {
        submitUserUpdate(form).catch(console.error);
    }

    const submitUserUpdate = async (form: IUserUpdate) => {
        try {
            setUserFormDialogBusy(true);

            updateMutation(form, {
                onSuccess: () => {
                    showAlert('default', 'User Updated!');
                    refetch().catch(console.error);
                    userForm.reset();
                    handleUpdateDialogVisibility(false);
                    setUserFormDialogBusy(false);
                },
                onError: (error) => {
                    console.error(error);
                    showAlert('destructive', error.message);
                    setUserFormDialogBusy(false);
                }
            });
        } catch (error) {
            console.error(error);
            showAlert('destructive', 'Failed to upload image!');
            setUserFormDialogBusy(false);
        }
    }

    const submitUserCreate = async (form: IUserCreate) => {

        try {
            setUserFormDialogBusy(true);

            createMutation(form, {
                onSuccess: () => {
                    showAlert('default', 'User Created!');
                    refetch().catch(console.error);
                    userForm.reset();
                    handleCreateDialogVisibility(false);
                    setUserFormDialogBusy(false);
                },
                onError: (error) => {
                    console.error(error);
                    showAlert('destructive', 'Failed to create User!');
                    setUserFormDialogBusy(false);
                }
            });

        } catch (error) {
            console.error(error);
            showAlert('destructive', 'Failed to upload image!');
            setUserFormDialogBusy(false);
        }
    }


    const handleCreateDialogVisibility = (e: boolean) => {
        if (!e) {
            userForm.reset();
            userForm.setValue('name', '');
            userForm.setValue('email', '');
            userForm.setValue('password', '');
        }
        setUserFormDialogVisible(e);
    }


    const handleUpdateDialogVisibility = (e: boolean) => {
        if (!e) {
            userUpdateForm.reset();
            userUpdateForm.setValue('name', '');
            userUpdateForm.setValue('email', '');
            userUpdateForm.setValue('id', 0);
        }
        setUserUpdateFormDialogVisible(e);
    }

    const handleEditUser = (user: IUserUpdate) => {
        userUpdateForm.setValue('id', user.id);
        userUpdateForm.setValue('name', user.name);
        userUpdateForm.setValue('email', user.email);
        userUpdateForm.setValue('password', '');

        setUserUpdateFormDialogVisible(true);
    }

    const handleDeleteUser = () => {
        if (!userToDelete) return;

        deleteMutation({ id: userToDelete.id }, {
            onSuccess: () => {
                showAlert('default', 'Event Deleted!');
                refetch().catch(console.error);
                setUserToDelete(undefined);
            },
            onError: (error) => {
                console.error(error);
                showAlert('destructive', 'Failed to delete event!');
            }
        })
    }

    const showAlert = (type: 'default' | 'destructive', message: string) => {
        setAlert({
            type,
            message,
        });

        setTimeout(() => {
            setAlert({
                type: 'default',
                message: '',
            });
        }, 1500);
    }

    return (
        <>
            <AdminLayout>
                <div className="flex h-full flex-col overflow-hidden p-4">
                    <div className="py-4">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin" className="text-slate-600">Home</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-slate-400">Users</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <h1 className="text-2xl font-bold text-slate-400">Users</h1>
                    </div>
                    <div className="flex items-center justify-between pb-2 pt-6">
                        <Input
                            className="rounded-md border border-slate-800 h-8 w-56 bg-utopia-admin-bg  "
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            className="px-4 border-2 border-utopia-admin-border bg-utopia-button-bg"
                            onClick={() => setUserFormDialogVisible(true)}>
                            Create
                        </Button>
                    </div>
                    <div className="overflow-hidden bg-utopia-admin-bg text-white">
                        <Table className="border border-slate-800">
                            <TableHeader className="sticky top-0">
                                <TableRow className="bg-utopia-admin-bg border-slate-800 hover:bg-utopia-admin-bg">
                                    <TableHead className="w-[200px]">Name</TableHead>
                                    <TableHead className="w-[200px]">Email</TableHead>
                                    <TableHead className="w-[200px]">Role</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="overflow-auto border-r-slate-800">
                                {
                                    users?.length ?
                                        users.map((user, index) => (
                                            <TableRow key={index} className="border-slate-800 hover:bg-transparent">
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell className="font-medium">{user.email}</TableCell>
                                                <TableCell className="font-medium">{
                                                    user.role.split('_').join(' ')
                                                }</TableCell>
                                                <TableCell align="right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Button className="bg-slate-50 p-3 hover:bg-slate-200" onClick={() => {
                                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                            // @ts-expect-error
                                                            handleEditUser(user);
                                                        }}>
                                                            <BiMessageSquareEdit className="text-xl text-slate-600" />
                                                        </Button>
                                                        {
                                                            user.role !== "SUPER_ADMIN" ?
                                                                <Button title="Delete Event" className="bg-red-700 p-3 hover:bg-red-900" onClick={() => setUserToDelete(user)}>
                                                                    <BiTrash className="text-xl text-white-600" />
                                                                </Button> : ''
                                                        }
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        :
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={4} className="text-center">
                                                <p className="text-slate-500 pb-4">User still empty. Create One</p>
                                                <Button
                                                    className="px-4 border-2 border-utopia-admin-border bg-utopia-button-bg"
                                                    onClick={() => setUserFormDialogVisible(true)}>
                                                    Create
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </AdminLayout>

            <Dialog open={userFormDialogVisible} onOpenChange={handleCreateDialogVisibility}>
                <DialogContent className="bg-utopia-admin-bg text-slate-400 border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                        <DialogDescription>Fill in the form to create new user</DialogDescription>
                    </DialogHeader>
                    <Form {...userForm}>
                        <form onSubmit={userForm.handleSubmit(handleSubmitCreate)}>
                            <FormField
                                control={userForm.control}
                                defaultValue=""
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g: Utopia Admin Rey" className="text-slate-400 bg-transparent border-slate-800" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={userForm.control}
                                defaultValue=""
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g: user@utopia.com" className="text-slate-400 bg-transparent border-slate-800" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={userForm.control}
                                defaultValue=""
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g: eh3br#!ajrj" className="text-slate-400 bg-transparent border-slate-800" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="mt-8" disabled={userFormDialogBusy}>Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Dialog open={userUpdateFormDialogVisible} onOpenChange={setUserUpdateFormDialogVisible}>
                <DialogContent className="bg-utopia-admin-bg text-slate-400 border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                        <DialogDescription>Fill in the form to create new user</DialogDescription>
                    </DialogHeader>
                    <Form {...userUpdateForm}>
                        <form onSubmit={userUpdateForm.handleSubmit(handleSubmitUpdate)}>
                            <FormField
                                control={userUpdateForm.control}
                                defaultValue=""
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g: Utopia Admin Rey" className="text-slate-400 bg-transparent border-slate-800" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={userUpdateForm.control}
                                defaultValue=""
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g: user@utopia.com" className="text-slate-400 bg-transparent border-slate-800" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={userUpdateForm.control}
                                defaultValue=""
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g: eh3br#!ajrj" className="text-slate-400 bg-transparent border-slate-800" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="mt-8" disabled={userFormDialogBusy}>Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={Boolean(userToDelete)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the event.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(undefined)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {
                alert.message && (
                    <div className="fixed top-2 left-2 right-2 p-2 z-[9999]">
                        <Alert className="w-max ml-auto" variant={alert.type}>
                            <AlertTitle>{alert.message}</AlertTitle>
                        </Alert>
                    </div>
                )
            }
        </>
    );
}
