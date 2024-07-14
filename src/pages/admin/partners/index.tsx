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
import { zodResolver } from "@hookform/resolvers/zod";
import { BiMessageSquareEdit, BiTrash } from "react-icons/bi";
import axios from "axios";
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
} from "~/components/ui/breadcrumb";

import { Alert, AlertTitle } from "~/components/ui/alert";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

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

import { useForm } from "react-hook-form";
import {
  partnerGroupSchema,
  partnerUpdateSchema,
  type IPartnerUpdate,
  type IPartnerGroup,
} from "~/validation/partnerValidation";
import { type PartnerWithImages } from "~/server/api/routers/partner";
import type { Partner } from "@prisma/client";

export default function AdminPartners() {
  const [search, setSearch] = useState("");

  const [filePreview, setFilePreview] = useState<
    {
      name: string;
      path: string;
      progress: number;
      file: File | null;
    }[]
  >([]);

  const [alert, setAlert] = useState<{
    type: "default" | "destructive";
    message: string;
  }>({
    type: "default",
    message: "",
  });

  //#region Partner Group
  const { data: partnerGroups, refetch: partnerGroupsRefetch } =
    api.partner.getPartnerGroups.useQuery();
  const { mutate: createPartnerGroup } =
    api.partner.createPartnerGroup.useMutation();
  const { mutate: updatePartnerGroup } =
    api.partner.updatePartnerGroup.useMutation();

  const partnerGroupForm = useForm<IPartnerGroup>({
    resolver: zodResolver(partnerGroupSchema),
  });

  const [partnerGroupFormDialogVisible, setPartnerGroupFormDialogVisible] =
    useState(false);
  const [partnerGroupFormDialogBusy, setPartnerGroupFormDialogBusy] =
    useState(false);

  function handlePartnerGroupEdit(partnerGroup: IPartnerGroup) {
    partnerGroupForm.reset();
    partnerGroupForm.setValue("id", partnerGroup.id);
    partnerGroupForm.setValue("name", partnerGroup.name);
    setPartnerGroupFormDialogVisible(true);
  }

  function handlePartnerGroupFormVisibility(e: boolean) {
    if (e === false) {
      partnerGroupForm.reset();
      partnerGroupForm.setValue("id", undefined);
      partnerGroupForm.setValue("name", "");
    }
    setPartnerGroupFormDialogVisible(e);
  }

  function onPartnerGroupSubmit(data: IPartnerGroup) {
    setPartnerGroupFormDialogBusy(true);

    if (data.id) {
      updatePartnerGroup(data, {
        onSuccess: () => {
          handlePartnerGroupFormVisibility(false);
          partnerGroupsRefetch().catch(console.error);
        },
        onError: console.error,
        onSettled: () => setPartnerGroupFormDialogBusy(false),
      });
      return;
    }

    createPartnerGroup(data, {
      onSuccess: () => {
        handlePartnerGroupFormVisibility(false);
        partnerGroupsRefetch().catch(console.error);
      },
      onError: console.error,
      onSettled: () => setPartnerGroupFormDialogBusy(false),
    });
  }

  const { mutate: deletePartnerGroup } =
    api.partner.deletePartnerGroup.useMutation();
  const [partnerGroupToDelete, setPartnerGroupToDelete] = useState<number>();

  const handleDeletePartnerGroup = () => {
    if (!partnerGroupToDelete) return;

    deletePartnerGroup(
      { id: partnerGroupToDelete },
      {
        onSuccess: () => {
          showAlert("default", "Partner Group Deleted!");
          partnerGroupsRefetch().catch(console.error);
          setPartnerGroupToDelete(undefined);
        },
        onError: (error: unknown) => {
          console.error(error);
          showAlert("destructive", "Failed to delete Partner Group!");
        },
      },
    );
  };
  //#endregion

  //#region Partner
  const { mutate: createPartner } = api.partner.createPartner.useMutation();
  const { mutate: updatePartner } = api.partner.updatePartner.useMutation();

  const [partnerFormDialogVisible, setPartnerFormDialogVisible] =
    useState(false);
  const [partnerFormDialogBusy, setPartnerFormDialogBusy] = useState(false);

  const partnerForm = useForm<IPartnerUpdate>({
    resolver: zodResolver(partnerUpdateSchema),
  });

  function handlePartnerFormVisibility(e: boolean, partnerGroupId?: number) {
    if (!partnerGroupId) {
      partnerForm.reset();
      partnerForm.setValue("id", undefined);
      partnerForm.setValue("partnerCategoryId", undefined);
      partnerForm.setValue("name", "");
      partnerForm.setValue("description", "");
      setFilePreview([]);
      setPartnerFormDialogVisible(e);
      return;
    }

    partnerForm.setValue("partnerCategoryId", partnerGroupId);
    setPartnerFormDialogVisible(e);
  }

  function onPartnerSubmit(data: IPartnerUpdate) {
    if (data.id) {
      submitPartnerUpdate(data).catch(console.error);
      return;
    }
    submitPartnerCreate(data).catch(console.error);
  }

  async function submitPartnerUpdate(form: IPartnerUpdate) {
    try {
      setPartnerFormDialogBusy(true);

      const imagePaths = await handleUploadImage();

      updatePartner(
        {
          ...form,
          images: imagePaths,
        },
        {
          onSuccess: () => {
            showAlert("default", "Partner Updated!");
            handlePartnerFormVisibility(false);
          },
          onError: (error) => {
            console.error(error);
            showAlert("destructive", "Failed to update Partner!");
          },
          onSettled: () => setPartnerFormDialogBusy(false),
        },
      );
    } catch (error) {
      console.error(error);
      showAlert("destructive", "Failed to upload image!");
      setPartnerFormDialogBusy(false);
    }
  }

  const submitPartnerCreate = async (form: IPartnerUpdate) => {
    if (!filePreview.length) {
      showAlert("destructive", "Please upload at least one image!");
      return;
    }

    try {
      setPartnerFormDialogBusy(true);

      const imagePaths = await handleUploadImage();

      createPartner(
        {
          ...form,
          images: imagePaths,
        },
        {
          onSuccess: () => {
            showAlert("default", "Partner Created!");
            partnerGroupsRefetch().catch(console.error);
            handlePartnerFormVisibility(false);
          },
          onError: (error) => {
            console.error(error);
            showAlert("destructive", "Failed to create Partner!");
          },
          onSettled: () => setPartnerFormDialogBusy(false),
        },
      );
    } catch (error) {
      console.error(error);
      showAlert("destructive", "Failed to upload image!");
      setPartnerFormDialogBusy(false);
    }
  };

  const handleEditPartner = (partner: PartnerWithImages) => {
    partnerForm.setValue("id", partner.id);
    partnerForm.setValue("partnerCategoryId", partner.partnerGroup.id);
    partnerForm.setValue("name", partner.name);
    partnerForm.setValue("description", partner.description ?? "");
    partnerForm.setValue("images", []);

    setFilePreview([
      ...partner.images.map((image) => ({
        name: image.path,
        path: image.path,
        progress: 100,
        file: null,
      })),
    ]);

    setPartnerFormDialogVisible(true);
  };

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
      .then((result) => setFilePreview(result))
      .catch(console.error);
  };

  const handleUploadImage = async () => {
    const imagePaths: string[] = [];

    await new Promise((resolve) => {
      filePreview.forEach(async (file, index) => {
        if (file.file) {
          const path = await new Promise<string>((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file.file!);
          });

          imagePaths.push(path);
        }

        if (index === filePreview.length - 1) {
          resolve(null);
        }
      });
    });

    return imagePaths;
  };

  const { mutate: deletePartner } = api.partner.deletePartner.useMutation();
  const [partnerToDelete, setPartnerToDelete] = useState<Partner>();
  const handleDeletePartner = () => {
    if (!partnerToDelete) return;

    deletePartner(
      { id: partnerToDelete.id },
      {
        onSuccess: () => {
          showAlert("default", "Event Deleted!");
          partnerGroupsRefetch().catch(console.error);
          setPartnerToDelete(undefined);
        },
        onError: (error: unknown) => {
          console.error(error);
          showAlert("destructive", "Failed to delete event!");
        },
      },
    );
  };
  //#endregion

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
                  <BreadcrumbPage className="text-slate-400">
                    Partners
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold text-slate-400">Partners</h1>
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
              onClick={() => handlePartnerGroupFormVisibility(true)}>
              Create
            </Button>
          </div>
          <div className="overflow-hidden bg-utopia-admin-bg text-white">
            <Table className="border border-slate-800">
              <TableHeader className="sticky top-0">
                <TableRow className="bg-utopia-admin-bg border-slate-800 hover:bg-utopia-admin-bg">
                  <TableHead className="w-[200px]">Group Name</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-auto border-r-slate-800">
                {partnerGroups?.length ? (
                  partnerGroups.map((partnerGroup, index) => (
                    <>
                      <TableRow
                        key={index}
                        className="border-slate-800 hover:bg-transparent">
                        <TableCell className="font-medium">
                          {partnerGroup.name}
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              className="px-4 border-2 border-utopia-admin-border bg-utopia-button-bg"
                              onClick={() =>
                                handlePartnerFormVisibility(
                                  true,
                                  partnerGroup.id,
                                )
                              }>
                              Add Partner
                            </Button>
                            <Button
                              className="bg-slate-50 p-3 hover:bg-slate-200"
                              onClick={() =>
                                handlePartnerGroupEdit(partnerGroup)
                              }>
                              <BiMessageSquareEdit className="text-xl text-slate-600" />
                            </Button>
                            <Button
                              title="Delete Event"
                              className="bg-red-700 p-3 hover:bg-red-900"
                              disabled={Boolean(partnerGroup.partners.length)}
                              onClick={() =>
                                setPartnerGroupToDelete(partnerGroup.id)
                              }>
                              <BiTrash className="text-xl text-white-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow
                        key={index}
                        className="border-slate-800 hover:bg-transparent">
                        <TableCell colSpan={3}>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Partner Name</TableHead>
                                <TableHead>Partner Images</TableHead>
                                <TableHead>Partner URL</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {partnerGroup.partners.map((partner, index) => (
                                <TableRow key={index}>
                                  <TableCell>{partner.name}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                      {partner.images.map((image, index) => (
                                        <Image
                                          key={index}
                                          src={image.path}
                                          alt=""
                                          height={64}
                                          width={64}
                                        />
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>{partner.description}</TableCell>
                                  <TableCell align="right">
                                    <div className="flex items-center justify-end gap-3">
                                      <Button
                                        className="bg-slate-50 p-3 hover:bg-slate-200"
                                        onClick={() =>
                                          handleEditPartner(partner)
                                        }>
                                        <BiMessageSquareEdit className="text-xl text-slate-600" />
                                      </Button>
                                      <Button
                                        title="Delete Event"
                                        className="bg-red-700 p-3 hover:bg-red-900"
                                        onClick={() =>
                                          setPartnerToDelete(partner)
                                        }>
                                        <BiTrash className="text-xl text-white-600" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    </>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="text-center">
                      <p className="text-slate-500 pb-4">
                        Partner still empty. Create One
                      </p>
                      <Button
                        className="px-4 border-2 border-utopia-admin-border bg-utopia-button-bg"
                        onClick={() => setPartnerFormDialogVisible(true)}>
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
        open={partnerGroupFormDialogVisible}
        onOpenChange={handlePartnerGroupFormVisibility}>
        <DialogContent className="bg-utopia-admin-bg text-slate-400 border-slate-800">
          <DialogHeader>
            <DialogTitle>Create Partner&apos;s Group</DialogTitle>
            <DialogDescription>
              Fill in the form to create new group
            </DialogDescription>
          </DialogHeader>
          <Form {...partnerGroupForm}>
            <form
              onSubmit={partnerGroupForm.handleSubmit(onPartnerGroupSubmit)}>
              <FormField
                control={partnerGroupForm.control}
                defaultValue=""
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g: Developer Team"
                        className="text-slate-400 bg-transparent border-slate-800"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mt-8"
                disabled={partnerGroupFormDialogBusy}>
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={partnerFormDialogVisible}
        onOpenChange={handlePartnerFormVisibility}>
        <DialogContent className="bg-utopia-admin-bg text-slate-400 border-slate-800">
          <DialogHeader>
            <DialogTitle>Create Partner</DialogTitle>
            <DialogDescription>
              Fill in the form to create new Partner
            </DialogDescription>
          </DialogHeader>
          <Form {...partnerForm}>
            <form onSubmit={partnerForm.handleSubmit(onPartnerSubmit)}>
              <FormField
                control={partnerForm.control}
                defaultValue=""
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g: Utopia Media Partner"
                        className="text-slate-400 bg-transparent border-slate-800"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={partnerForm.control}
                defaultValue=""
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g: https://partner.com"
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
                    name="images"
                    render={(_) => (
                      <FormItem>
                        <FormLabel>Partner Image</FormLabel>
                        <FormControl>
                          <>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onInput={handleChangeImages}
                            />
                            <div className="grid grid-cols-3 gap-3 h-20 w-full">
                              {filePreview.map((file, index) => (
                                <div
                                  className="relative"
                                  key={index}>
                                  <Image
                                    className="object-contain border border-slate-800 rounded"
                                    src={file.path}
                                    alt={`Preview Event Image (File ${index + 1} of ${filePreview.length})`}
                                    fill
                                  />
                                </div>
                              ))}
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
                disabled={partnerFormDialogBusy}>
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(partnerGroupToDelete)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setPartnerGroupToDelete(undefined)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePartnerGroup}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(partnerToDelete)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              partner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPartnerToDelete(undefined)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePartner}>
              Continue
            </AlertDialogAction>
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
