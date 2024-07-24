/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */

import React, {useState} from "react";
import AdminLayout from "../layout";
import Image from "next/image";
import {api} from "~/utils/api";
import {zodResolver} from "@hookform/resolvers/zod";
import {BiMessageSquareEdit, BiTrash} from "react-icons/bi";

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "~/components/ui/table";

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "~/components/ui/dialog";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

import {Alert, AlertTitle} from "~/components/ui/alert";

import {Button} from "~/components/ui/button";
import {Input} from "~/components/ui/input";

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "~/components/ui/form";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import {useForm} from "react-hook-form";
import {type GalleryWithImage} from "~/server/api/routers/news";
import {gallerySchema, type IGallery} from "~/validation/galleryValidation";
import {TextArea} from "~/components/ui/text-area";
import Link from "next/link";

export default function AdminGalleries() {
  const { data: nrews, refetch } = api.news.get.useQuery();
  const { mutate: createMutation } = api.news.create.useMutation();
  const { mutate: updateMutation } = api.news.update.useMutation();
  const { mutate: deleteMutation } = api.news.delete.useMutation();

  // const [search, setSearch] = useState("");

  const [GalleryFormDialogVisible, setGalleryFormDialogVisible] = useState(false);
  const [galleryFormDialogBusy, setPartnerFormDialogBusy] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<GalleryWithImage>();

  type FilePreview = {
    name: string;
    path: string;
    progress: number;
    file: File | null;
  }

  const [filePreview, setFilePreview] = useState<FilePreview|null>(null);

  const [alert, setAlert] = useState<{
    type: "default" | "destructive";
    message: string;
  }>({
    type: "default",
    message: "",
  });

  const galleryForm = useForm<IGallery>({
    resolver: zodResolver(gallerySchema),
  });

  const handleChangeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = e.target.files;

    const promises = Array.from(files).map((file) => {
      const reader = new FileReader();
      return new Promise<{
        name: string;
        path: string;
        progress: number;
        file: File;
      }>((resolve) => {
        reader.onload = (e) => {
          resolve({
            name: file.name,
            progress: 0,
            path: (e.target?.result ?? "") as string,
            file,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((result) => result.map((file) => setFilePreview(file)))
      .catch(console.error);
  };

  const handleUploadImage = async () => {
    return await new Promise<string>((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(filePreview!.file!);
    });
  };

  const handleSubmit = async (form: IGallery) => {
    if (galleryForm.getValues().id) submitPartnerUpdate(form).catch(console.error);
    else submitPartnerCreate(form).catch(console.error);
  };

  const submitPartnerUpdate = async (form: IGallery) => {
    try {
      setPartnerFormDialogBusy(true);

      const imagePaths = await handleUploadImage();

      if(!imagePaths) return;

      updateMutation(
        {
          id: form.id,
          name: form.name,
          description: form.description,
          image: imagePaths,
        },
        {
          onSuccess: () => {
            showAlert("default", "Gallery Updated!");
            refetch().catch(console.error);
            galleryForm.reset();
            handleCreateDialogVisibility(false);
            setPartnerFormDialogBusy(false);
          },
          onError: (error) => {
            console.error(error);
            showAlert("destructive", "Failed to update News!");
            setPartnerFormDialogBusy(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
      showAlert("destructive", "Failed to upload image!");
      setPartnerFormDialogBusy(false);
    }
  };

  const submitPartnerCreate = async (form: IGallery) => {
    if (!filePreview) {
      showAlert("destructive", "Please upload at least one image!");
      return;
    }

    try {
      setPartnerFormDialogBusy(true);

      const imagePaths = await handleUploadImage();

      createMutation(
        {
          name: form.name,
          description: form.description,
          image: imagePaths,
          url: form.url
        },
        {
          onSuccess: () => {
            showAlert("default", "News Created!");
            refetch().catch(console.error);
            galleryForm.reset();
            handleCreateDialogVisibility(false);
            setPartnerFormDialogBusy(false);
          },
          onError: (error) => {
            console.error(error);
            showAlert("destructive", "Failed to create Partner!");
            setPartnerFormDialogBusy(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
      showAlert("destructive", "Failed to upload image!");
      setPartnerFormDialogBusy(false);
    }
  };

  const [formAction, setFormAction] = useState("Create");

  const handleCreateDialogVisibility = (e: boolean) => {
    if (!e) {
      galleryForm.reset();
      galleryForm.setValue("id", undefined);
      galleryForm.setValue("name", "");
      galleryForm.setValue("description", "");
      galleryForm.setValue("image", "");
      setFilePreview(null);
    }
    setFormAction("Create");
    setGalleryFormDialogVisible(e);
  };

  const handleEditPartner = (partner: GalleryWithImage) => {
    galleryForm.setValue("id", partner.id);
    galleryForm.setValue("name", partner.name);
    galleryForm.setValue("description", partner.description ?? "");
    galleryForm.setValue("image", partner.image.path);
    setFormAction("Edit");

    setFilePreview({
      name: partner.image.path,
      path: partner.image.path,
      progress: 100,
      file: null,
    });

    setGalleryFormDialogVisible(true);
  };

  const handleDeleteGallery = () => {
    if (!galleryToDelete) return;

    deleteMutation(
      { id: galleryToDelete.id },
      {
        onSuccess: () => {
          showAlert("default", "Gallery Deleted!");
          refetch().catch(console.error);
          setGalleryToDelete(undefined);
        },
        onError: (error) => {
          console.error(error);
          showAlert("destructive", "Failed to delete event!");
        },
      },
    );
  };

  const showAlert = (type: "default" | "destructive", message: string) => {
    setAlert({
      type,
      message,
    });

    setTimeout(() => {
      setAlert({
        type: "default",
        message: "",
      });
    }, 1500);
  };

  return (
    <>
      <AdminLayout>
        <div className="flex h-full flex-col overflow-hidden p-4">
          <div className="py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/admin"
                    className="text-slate-600">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-400">News</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold text-slate-400">News</h1>
          </div>
          <div className="flex items-center justify-between pb-2 pt-6">
            {/*<Input*/}
            {/*  className="rounded-md border border-slate-800 h-8 w-56 bg-utopia-admin-bg  "*/}
            {/*  placeholder="Search"*/}
            {/*  value={search}*/}
            {/*  onChange={(e) => setSearch(e.target.value)}*/}
            {/*/>*/}
            <div></div>
            <Button
              className="px-4 border-2 border-utopia-admin-border bg-utopia-button-bg"
              onClick={() => setGalleryFormDialogVisible(true)}>
              Create
            </Button>
          </div>
          <div className="overflow-hidden bg-utopia-admin-bg text-white">
            <Table className="border border-slate-800">
              <TableHeader className="sticky top-0">
                <TableRow className="bg-utopia-admin-bg border-slate-800 hover:bg-utopia-admin-bg">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[200px]">Image</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Url</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-auto border-r-slate-800">
                {nrews?.length ? (
                  nrews.map((gallery, index) => (
                    <TableRow
                      key={index}
                      className="border-slate-800 hover:bg-transparent">
                      <TableCell className="font-medium">{gallery.name}</TableCell>
                      <TableCell>
                        <div className="grid grid-cols-2 gap-3">
                          {gallery.image &&
                            <Image
                              src={`${gallery.image.path ?? ""}`}
                              alt={`Image of ${gallery.name}`}
                              height={40}
                              width={40}
                            />
                          }
                        </div>
                      </TableCell>
                      <TableCell>{gallery.description}</TableCell>
                      <TableCell>{ gallery.url ? <Link target="_blank" href={gallery.url}>Click Here</Link> : '-' }</TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            className="bg-slate-50 p-3 hover:bg-slate-200"
                            onClick={() => handleEditPartner(gallery)}>
                            <BiMessageSquareEdit className="text-xl text-slate-600" />
                          </Button>
                          <Button
                            title="Delete Event"
                            className="bg-red-700 p-3 hover:bg-red-900"
                            onClick={() => setGalleryToDelete(gallery)}>
                            <BiTrash className="text-xl text-white-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="text-center">
                      <p className="text-slate-500 pb-4">News still empty. Create One</p>
                      <Button
                        className="px-4 border-2 border-utopia-admin-border bg-utopia-button-bg"
                        onClick={() => setGalleryFormDialogVisible(true)}>
                        Create
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminLayout>

      <Dialog
        open={GalleryFormDialogVisible}
        onOpenChange={handleCreateDialogVisibility}>
        <DialogContent className="bg-utopia-admin-bg text-slate-400 border-slate-800">
          <DialogHeader>
            <DialogTitle>{formAction} News</DialogTitle>
            <DialogDescription>Fill in the form to create new Gallery</DialogDescription>
          </DialogHeader>
          <Form {...galleryForm}>
            <form onSubmit={galleryForm.handleSubmit(handleSubmit)}>
              <FormField
                control={galleryForm.control}
                defaultValue=""
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g: Utopia News"
                        className="text-slate-400 bg-transparent border-slate-800"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={galleryForm.control}
                defaultValue=""
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TextArea placeholder="e.g: Utopia Weeks" className="text-slate-400 bg-transparent border-slate-800" {...field} rows={5} maxLength={255} />
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={galleryForm.control}
                defaultValue=""
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Url</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g: https://instagram.com/..."
                        className="text-slate-400 bg-transparent border-slate-800"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    defaultValue={undefined}
                    name="image"
                    render={(_) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onInput={handleChangeImages}
                            />
                            <div className="grid grid-cols-3 gap-3 h-20 w-full">
                              {filePreview?.path && (
                                <div className="relative">
                                  <Image
                                    className="object-contain border border-slate-800 rounded"
                                    src={filePreview.path}
                                    alt={`Preview News Image`}
                                    fill
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="mt-8"
                disabled={galleryFormDialogBusy}>
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(galleryToDelete)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGalleryToDelete(undefined)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGallery}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {alert.message && (
        <div className="fixed top-2 left-2 right-2 p-2 z-[9999]">
          <Alert
            className="w-max ml-auto"
            variant={alert.type}>
            <AlertTitle>{alert.message}</AlertTitle>
          </Alert>
        </div>
      )}
    </>
  );
}
