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
import {type NewsWithImage} from "~/server/api/routers/news";
import {gallerySchema, type IGallery} from "~/validation/galleryValidation";
import {TextArea} from "~/components/ui/text-area";
import Link from "next/link";

export default function AdminGalleries() {
  const { data: news, refetch } = api.news.get.useQuery();
  const { mutate: createMutation } = api.news.create.useMutation();
  const { mutate: updateMutation } = api.news.update.useMutation();
  const { mutate: deleteMutation } = api.news.delete.useMutation();

  // const [search, setSearch] = useState("");

  const [newsFormDialogVisible, setNewsFormDialogVisible] = useState(false);
  const [newsFormDialogBusy, setNewsFormDialogBusy] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsWithImage>();

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

  const newsForm = useForm<IGallery>({
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
    try {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        if (!filePreview?.file) {
          reject('Invalid file');
          return;
        }

        // Handle the file read operation
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject('Error reading file');
        reader.readAsDataURL(filePreview.file); // Ensure it's a Blob or File type
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return false; // Return false when an error occurs
    }
  };

  const handleSubmit = async (form: IGallery) => {
    if (newsForm.getValues().id) submitNewsUpdate(form).catch(console.error);
    else submitNewsCreate(form).catch(console.error);
  };

  const submitNewsUpdate = async (form: IGallery) => {
    try {
      setNewsFormDialogBusy(true);

      const imagePaths = await handleUploadImage();

      updateMutation(
        {
          id: form.id,
          name: form.name,
          description: form.description,
          image: imagePaths ? imagePaths : '',
        },
        {
          onSuccess: () => {
            showAlert("default", "News Updated!");
            refetch().catch(console.error);
            newsForm.reset();
            handleCreateDialogVisibility(false);
            setNewsFormDialogBusy(false);
          },
          onError: (error) => {
            console.error(error);
            showAlert("destructive", "Failed to update News!");
            setNewsFormDialogBusy(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
      showAlert("destructive", "Failed to upload image!");
      setNewsFormDialogBusy(false);
    }
  };

  const submitNewsCreate = async (form: IGallery) => {
    if (!filePreview) {
      showAlert("destructive", "Please upload at least one image!");
      return;
    }

    try {
      setNewsFormDialogBusy(true);

      const imagePaths = await handleUploadImage();

      if (!imagePaths) {
        showAlert("destructive", "Failed to upload image!");
        setNewsFormDialogBusy(false);
        return;
      }

      createMutation(
        {
          name: form.name,
          description: form.description,
          image: imagePaths ? imagePaths :'',
          url: form.url
        },
        {
          onSuccess: () => {
            showAlert("default", "News Created!");
            refetch().catch(console.error);
            newsForm.reset();
            handleCreateDialogVisibility(false);
            setNewsFormDialogBusy(false);
          },
          onError: (error) => {
            console.error(error);
            showAlert("destructive", "Failed to create News!");
            setNewsFormDialogBusy(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
      showAlert("destructive", "Failed to upload image!");
      setNewsFormDialogBusy(false);
    }
  };

  const [formAction, setFormAction] = useState("Create");

  const handleCreateDialogVisibility = (e: boolean) => {
    if (!e) {
      newsForm.reset();
      newsForm.setValue("id", undefined);
      newsForm.setValue("name", "");
      newsForm.setValue("description", "");
      newsForm.setValue("image", "");
      setFilePreview(null);
    }
    setFormAction("Create");
    setNewsFormDialogVisible(e);
  };

  const handleEditNews = (news: NewsWithImage) => {
    newsForm.setValue("id", news.id);
    newsForm.setValue("name", news.name);
    newsForm.setValue("description", news.description ?? "");
    newsForm.setValue("image", news.image.path);
    setFormAction("Edit");

    setFilePreview({
      name: news.image.path,
      path: news.image.path,
      progress: 100,
      file: null,
    });

    setNewsFormDialogVisible(true);
  };

  const handleDeleteNews = () => {
    if (!newsToDelete) return;

    deleteMutation(
      { id: newsToDelete.id },
      {
        onSuccess: () => {
          showAlert("default", "News Deleted!");
          refetch().catch(console.error);
          setNewsToDelete(undefined);
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
              onClick={() => setNewsFormDialogVisible(true)}>
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
                {news?.length ? (
                  news.map((newsItem, index) => (
                    <TableRow
                      key={index}
                      className="border-slate-800 hover:bg-transparent">
                      <TableCell className="font-medium">{newsItem.name}</TableCell>
                      <TableCell>
                        <div className="grid grid-cols-2 gap-3">
                          {newsItem.image &&
                            <Image
                              src={`${newsItem.image.path ?? ""}`}
                              alt={`Image of ${newsItem.name}`}
                              height={40}
                              width={40}
                            />
                          }
                        </div>
                      </TableCell>
                      <TableCell>{newsItem.description}</TableCell>
                      <TableCell>{ newsItem.url ? <Link target="_blank" href={newsItem.url}>Click Here</Link> : '-' }</TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            className="bg-slate-50 p-3 hover:bg-slate-200"
                            onClick={() => handleEditNews(newsItem)}>
                            <BiMessageSquareEdit className="text-xl text-slate-600" />
                          </Button>
                          <Button
                            title="Delete Event"
                            className="bg-red-700 p-3 hover:bg-red-900"
                            onClick={() => setNewsToDelete(newsItem)}>
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
                        onClick={() => setNewsFormDialogVisible(true)}>
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
        open={newsFormDialogVisible}
        onOpenChange={handleCreateDialogVisibility}>
        <DialogContent className="bg-utopia-admin-bg text-slate-400 border-slate-800">
          <DialogHeader>
            <DialogTitle>{formAction} News</DialogTitle>
            <DialogDescription>Fill in the form to create new News</DialogDescription>
          </DialogHeader>
          <Form {...newsForm}>
            <form onSubmit={newsForm.handleSubmit(handleSubmit)}>
              <FormField
                control={newsForm.control}
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
                control={newsForm.control}
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
                control={newsForm.control}
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
                disabled={newsFormDialogBusy}>
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(newsToDelete)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewsToDelete(undefined)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNews}>Continue</AlertDialogAction>
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
