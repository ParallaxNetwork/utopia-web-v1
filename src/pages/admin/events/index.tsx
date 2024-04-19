/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useState } from "react";
import AdminLayout from "../layout";
import Image from "next/image";
import { api } from "~/utils/api";
import { zodResolver } from "@hookform/resolvers/zod"
import {BiMessageSquareEdit, BiTrash} from "react-icons/bi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";


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


import { type EventWithImages } from "~/server/api/routers/event";
import { type IEventUpdate } from "~/validation/eventValidation";
import {BsEyeFill, BsEyeSlashFill} from "react-icons/bs";


export default function AdminEvents() {
  const { data: events, refetch } = api.event.get.useQuery();
  const { mutate: createMutation } = api.event.create.useMutation();
  const { mutate: updateMutation } = api.event.update.useMutation();
  const { mutate: deleteMutation } = api.event.delete.useMutation();
  const { mutate: publishMutation } = api.event.publish.useMutation();
  const { mutate: unpublishMutation } = api.event.unpublish.useMutation();

  // const [search, setSearch] = useState("");

  const [eventToDelete, setEventToDelete] = useState<EventWithImages>();
  const [eventToPublish, setEventToPublish] = useState<EventWithImages>();
  const [eventToUnpublish, setEventToUnpublish] = useState<EventWithImages>();

  const [alert, setAlert] = useState<{
    type: 'default' | 'destructive',
    message: string
  }>({
    type: 'default',
    message: ''
  });

  const eventForm = useForm<IEventUpdate>({
    resolver: zodResolver(
      z.object({
        id: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .refine((data) => (Boolean(data.id) || Boolean(data.name?.length)), {
        message: 'Event Name field required',
        path: ['name'],
      })
    )
  })
  const [eventFormDialogVisible, setEventFormDialogVisible] = useState(false);
  const [eventFormDialogBusy, setEventFormDialogBusy] = useState(false);


  const [filePreview, setFilePreview] = useState<{
    name: string
    path: string
    progress: number
    file: File | null
  }[]>([]);
  
  const handleChangeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = e.target.files;
    
    const promises = Array.from(files).map((file) => {
      const reader = new FileReader();

      return new Promise<{
        name: string
        path: string
        progress: number
        file: File
      }>((resolve) => {
        reader.onload = (e) => {
          resolve({
            name: file.name,
            progress: 0,
            path: (e.target?.result ?? '') as string,
            file,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
    .then((result) => setFilePreview(result))
    .catch(console.error);
  };

  const handleUploadImage = async () => {
    const imagePaths: string[] = [];

    await new Promise((resolve) => {
      filePreview.forEach(async (file, index) => {
        if (file.file) {
          const formData = new FormData();
          formData.append("image", file.file);
    
          const result = await new Promise<{ data: string[] }>((resolve) => {
            axios.post("/api/upload-event", formData, {
              onUploadProgress: (progressEvent) => file.progress = progressEvent.loaded }
            )
            .then(({ data }) => setTimeout(() => resolve(data), 100))
            .catch(console.error);
          });
    
          imagePaths.push(...result.data);
        }

        if (index === filePreview.length - 1) {
          resolve(null);
        }
      })
    })

    return imagePaths;
  }


  const handleSubmit = async (form: IEventUpdate) => {
    if (eventForm.getValues().id) submitEventUpdate(form).catch(console.error);
    else submitEventCreate(form).catch(console.error);
  };

  
  const submitEventUpdate = async (form: IEventUpdate) => {
    try {
      setEventFormDialogBusy(true);
  
      const imagePaths = await handleUploadImage();

      updateMutation({
        id: form.id!,
        name: form.name!,
        description: form.description,
        images: imagePaths,
      }, {
        onSuccess: () => {
          showAlert('default', 'Event Updated!');
          refetch().catch(console.error);
          eventForm.reset();
          handleCreateDialogVisibility(false);
          setEventFormDialogBusy(false);
        },
        onError: (error) => {
          console.error(error);
          showAlert('destructive', 'Failed to update event!');
          setEventFormDialogBusy(false);
        }
      });
    } catch (error) {
      console.error(error);
      showAlert('destructive', 'Failed to upload image!');
      setEventFormDialogBusy(false);
    }
  }

  const submitEventCreate = async (form: IEventUpdate) => {
    if(!filePreview.length) {
      showAlert('destructive', 'Please upload at least one image!');
      return;
    }

    try {
      setEventFormDialogBusy(true);

      const imagePaths = await handleUploadImage();

      createMutation({
        name: form.name!,
        description: form.description,
        images: imagePaths,
      }, {
        onSuccess: () => {
          showAlert('default', 'Event Created!');
          refetch().catch(console.error);
          eventForm.reset();
          handleCreateDialogVisibility(false);
          setEventFormDialogBusy(false);
        },
        onError: (error) => {
          console.error(error);
          showAlert('destructive', 'Failed to create event!');
          setEventFormDialogBusy(false);
        }
      });

    } catch (error) {
      console.error(error);
      showAlert('destructive', 'Failed to upload image!');
      setEventFormDialogBusy(false);
    }
  }


  const handleCreateDialogVisibility = (e: boolean) => {
    if (!e) {
      eventForm.reset();
      eventForm.setValue('id', undefined);
      eventForm.setValue('name', '');
      eventForm.setValue('description', '');
      eventForm.setValue('images', []);
      setFilePreview([]);
    }
    setEventFormDialogVisible(e);
  }

  const handleEditEvent = (event: EventWithImages) => {
    eventForm.setValue('id', event.id);
    eventForm.setValue('name', event.name);
    eventForm.setValue('description', event.description ?? '');
    eventForm.setValue('images', []);

    setFilePreview([
      ...event.images.map((image) => ({
        name: image.path,
        path: image.path,
        progress: 100,
        file: null
      }))
    ])

    setEventFormDialogVisible(true);
  }


  const handleDeleteEvent = () => {
    if (!eventToDelete) return;

    deleteMutation({ id: eventToDelete.id }, {
      onSuccess: () => {
        showAlert('default', 'Event Deleted!');
        refetch().catch(console.error);
        setEventToDelete(undefined);
      },
      onError: (error) => {
        console.error(error);
        showAlert('destructive', 'Failed to delete event!');
      }
    })
  }

  const handlePublishEvent = () => {
    if (!eventToPublish) return;

    publishMutation({ id: eventToPublish.id }, {
      onSuccess: () => {
        showAlert('default', 'Event Published!');
        refetch().catch(console.error);
        setEventToPublish(undefined);
      },
      onError: (error) => {
        console.error(error);
        showAlert('destructive', 'Failed to publish the event!');
      }
    })
  }

  const handleUnpublishEvent = () => {
    if (!eventToUnpublish) return;

    unpublishMutation({ id: eventToUnpublish.id }, {
      onSuccess: () => {
        showAlert('default', 'Event Unpublish!');
        refetch().catch(console.error);
        setEventToUnpublish(undefined);
      },
      onError: (error) => {
        console.error(error);
        showAlert('destructive', 'Failed to unpublish event!');
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
          <Breadcrumb className="text-white">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin" className="text-slate-600">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-400">Events</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
            <h1 className="text-2xl font-bold text-slate-400">Events</h1>
          </div>
          <div className="flex items-center justify-between pb-2 pt-6">
            <div></div>
            {/*<Input*/}
            {/*  className="rounded-md border border-slate-800 h-8 w-56 bg-utopia-dark-grey"*/}
            {/*  placeholder="Search"*/}
            {/*  value={search}*/}
            {/*  onChange={(e) => setSearch(e.target.value)}*/}
            {/*/>*/}
            <Button 
                className="px-4 border-2 border-utopia-admin-border bg-utopia-button-bg"
                onClick={() => setEventFormDialogVisible(true)}>
                Create
            </Button>
          </div>
          <div className="overflow-hidden bg-utopia-admin-bg text-white">
            <Table className="border border-slate-800">
              <TableHeader className="sticky top-0">
                <TableRow className="border-b border-t border-slate-800 bg-utopia-admin-bg hover:bg-utopia-admin-bg">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[300px]">Image</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-auto border-r-slate-800">
                  {
                    events?.length ?
                    events.map((event, index) => (
                    <TableRow key={index} className="border-slate-800 hover:bg-transparent">
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>
                            <div className="grid grid-cols-2 gap-3 place-items-center">
                                {
                                    event.images.map((image, index) => (
                                        <Image
                                            key={index}
                                            src={`${image.path ?? ''}`}
                                            alt={`Image of ${event.name}'s Event`}
                                            height={100}
                                            width={100}
                                        />
                                    ))
                                }
                            </div>
                        </TableCell>
                        <TableCell>{(event.description && event.description !== "") ? event.description : '-'}</TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-3">
                            <Button title="Edit Event" className="bg-utopia-button-bg p-3 hover:bg-slate-800" onClick={() => handleEditEvent(event)}>
                                <BiMessageSquareEdit className="text-xl text-white-600" />
                            </Button>
                            <Button title="Delete Event" className="bg-red-700 p-3 hover:bg-red-900" onClick={() => setEventToDelete(event)}>
                                <BiTrash className="text-xl text-white-600" />
                            </Button>
                            {
                              event.status === 'DRAFT' ?
                              <Button title="Publish Event" className="bg-slate-700 p-3 hover:bg-slate-900" onClick={() => setEventToPublish(event)}>
                                <BsEyeSlashFill className="text-xl text-white-600" />
                              </Button>
                              :
                              <Button title="Unpublish Event" className="bg-slate-700 p-3 hover:bg-slate-900" onClick={() => setEventToUnpublish(event)}>
                                <BsEyeFill className="text-xl text-white-600" />
                              </Button>
                            }
                          </div>
                        </TableCell>
                    </TableRow>
                    ))
                    :
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="text-center">
                        <p className="text-slate-500 pb-4">Event still empty. Create One</p>
                        <Button 
                            className="px-4 border-2 border-utopia-admin-border bg-utopia-button-bg"
                            onClick={() => setEventFormDialogVisible(true)}>
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

      <Dialog open={eventFormDialogVisible} onOpenChange={handleCreateDialogVisibility}>
        <DialogContent className="bg-utopia-admin-bg text-slate-400 border-slate-800">
            <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
                <DialogDescription>Fill in the form to create new Event</DialogDescription>
            </DialogHeader>
            <Form {...eventForm}>
                <form onSubmit={eventForm.handleSubmit(handleSubmit)}>
                    <FormField
                        control={eventForm.control}
                        defaultValue=""
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g: Utopia Weeks" className="text-slate-400 bg-transparent border-slate-800" {...field} />
                            </FormControl>
                            <FormMessage></FormMessage>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={eventForm.control}
                        defaultValue=""
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Description</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g: Utopia Weeks" className="text-slate-400 bg-transparent border-slate-800" {...field} />
                            </FormControl>
                            <FormMessage></FormMessage>
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                      <FormField
                          defaultValue={undefined}
                          name="images"
                          render={(_) => (
                          <FormItem>
                              <FormLabel>Event Image</FormLabel>
                              <FormControl>
                                <>
                                  <input type="file" className="" multiple accept="image/png, image/jpeg, image/webp" onInput={handleChangeImages} />
                                  <div className="grid grid-cols-3 gap-3 h-20 w-full">
                                    { 
                                      filePreview.map((file, index) => (
                                      <div className="relative" key={index}>
                                        <Image
                                          className="object-contain border rounded"
                                          src={file.path}
                                          alt={`Preview Event Image (File ${index + 1} of ${filePreview.length})`}
                                          fill
                                        />
                                      </div>
                                      ))
                                  }
                                  </div>
                                </>
                              </FormControl>
                              <FormMessage></FormMessage>
                          </FormItem>
                          )}
                      />
                      </div>
                    </div>
                    <Button type="submit" className="mt-8 bg-utopia-button-bg" disabled={eventFormDialogBusy}>Submit</Button>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(eventToDelete)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(undefined)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(eventToPublish)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will publish the event so anyone can see the event. You can un-publish it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToPublish(undefined)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishEvent}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(eventToUnpublish)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unpublish the event, so the event can no longer being seen. You can re-publish it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToUnpublish(undefined)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnpublishEvent}>Continue</AlertDialogAction>
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
