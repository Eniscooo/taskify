import type { UploadedPhoto } from "@/components/forms/photo-uploader";

export interface SellFormState {
  photos: UploadedPhoto[];
  title: string;
  category: string;
  condition: string;
  price: string;
  negotiable: boolean;
  area: string;
  delivery: string;
  description: string;
}

export const EMPTY_SELL_FORM: SellFormState = {
  photos: [],
  title: "",
  category: "",
  condition: "",
  price: "",
  negotiable: true,
  area: "Yaba",
  delivery: "",
  description: "",
};
