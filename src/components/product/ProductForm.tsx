"use client";

import React from "react";

import { Input, Button, Image, Select, SelectItem } from "@nextui-org/react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { UploadButton } from "@/utils/uploadthing";
import { products } from "@/constants";
import axios from "axios";
import dynamic from "next/dynamic";
import ProductContract from "@/contracts/ProductContract";
import { useModal } from "@/lib/use-modal-store";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { HiOutlineXCircle } from "react-icons/hi";
import { getSigner } from "@/lib/hooks/getSigner";
import { useSession } from "next-auth/react";
const CustomEditor = dynamic(() => import("../custom-editor"), { ssr: false });

export default function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { handleSubmit, setValue, watch } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      type: "",
      images: [],
      description: "",
    },
  });
  const { onOpen } = useModal();
  const session = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!session?.data) {
      router.push("/");
    }
  }, [session, router]);

  const images = watch("images");

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    if (!session.data) {
      router.push("/");
    }

    if (data.images.length == 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (data.description.length == 0) {
      toast.error("Please write a description");
      return;
    }

    try {
      setIsLoading(true);
      let res = await axios.post("/api/files", data);
      let { IpfsHash } = res.data;
      console.log("IpfsHash", IpfsHash);
      const wallet = session?.data?.user?.wallet!;
      const signer = await getSigner(wallet);
      const contract = new ProductContract(signer);
      const tx = await contract.addProduct({
        address: wallet,
        cid: IpfsHash?.IpfsHash,
      });
      onOpen("success", { hash: tx, title: "ADD PRODUCT" });
      router.push("/account");
      router.refresh();
    } catch (error) {
      console.log("handleSubmit -> error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <div className="text-2xl font-bold flex items-center justify-center py-3">
        ADD PRODUCT
      </div>
      <div className="lg:grid lg:grid-cols-2 mb-6 lg:mb-2 space-y-4 lg:space-y-0 gap-4 w-full">
        <Input
          variant={"bordered"}
          label="Name"
          isClearable
          isDisabled={isLoading}
          isRequired
          placeholder="Enter your product name"
          onChange={(e) => setValue("name", e.target.value)}
        />
        <Select
          isRequired
          isDisabled={isLoading}
          label="Pick type Product"
          placeholder="Select a Product Type"
          onChange={(e) => setValue("type", e.target.value)}>
          {products.map((product) => (
            <SelectItem
              key={product.value}
              value={product.value}
              data-focus-visible>
              {product.label}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="relative pb-4 border-2 border-slate-200 rounded-2xl">
        <div className="text-sm text-slate-600 p-2">Product Images</div>
        {images.length == 0 ? (
          <div className="p-2 min-h-40 flex text-slate-500 items-center justify-center">
            Upload your product images
          </div>
        ) : (
          <div className="p-2 min-h-40 place-items-center grid grid-cols-3 lg:flex lg:flex-wrap gap-1 lg:justify-center items-center justify-start">
            {images.map((image: any, index: number) => (
              <div key={index} className="relative lg:w-40">
                <Image alt="NextUI Fruit Image with Zoom" src={image} />
                <div
                  className="z-10 hover:cursor-pointer absolute text-red-400  hover:text-red-600 top-0 right-1 h-4 w-4 lg:h-6 lg:w-6"
                  onClick={() =>
                    setValue("images", images.toSpliced(index, 1))
                  }>
                  <HiOutlineXCircle />
                </div>
              </div>
            ))}
          </div>
        )}
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res: any) => {
            // Do something with the response
            for (const file of res) {
              images.push(file.url);
            }
            setValue("images", images);
          }}
          onUploadError={(error: Error) => {
            toast.error("Upload image error!");
          }}
          appearance={{
            button: "text-blue-600 text-sm font-medium",
            container:
              "z-10 w-max flex-row rounded-lg border-cyan-300 bg-blue-200 px-1 border absolute transform -translate-x-1/2 inset-x-1/2 cursor-pointer hover:bg-blue-300 hover:border-cyan-400 hover:text-cyan-600 ",
            allowedContent: "hidden",
          }}
        />
      </div>
      <div className="pt-10 text-sm font-sm">Description:</div>
      <CustomEditor
        isRequired
        onChange={(e: any) => setValue("description", e)}
      />
      <div className="flex justify-center mt-3">
        <Button className="w-full lg:w-20" type="submit" isLoading={isLoading}>
          Submit
        </Button>
      </div>
    </form>
  );
}
