import type { UploadedPhoto } from "@/components/forms/photo-uploader";

export interface TaskFormState {
  service: string;
  title: string;
  description: string;
  photos: UploadedPhoto[];
  area: string;
  landmark: string;
  when: "today" | "this-week" | "date" | "";
  date: string;
  budget: string;
}

export type TaskErrors = Partial<Record<keyof TaskFormState, string>>;

export interface StepProps {
  form: TaskFormState;
  set: (patch: Partial<TaskFormState>) => void;
  errors: TaskErrors;
}

export const EMPTY_TASK: TaskFormState = {
  service: "",
  title: "",
  description: "",
  photos: [],
  area: "Yaba",
  landmark: "",
  when: "",
  date: "",
  budget: "",
};

export function validateStep(step: number, f: TaskFormState): TaskErrors {
  const e: TaskErrors = {};
  if (step === 0 && !f.service) e.service = "Pick the kind of job.";
  if (step === 1) {
    if (f.title.trim().length < 4) e.title = "Give the job a short title, e.g. “Kitchen sink leak”.";
    if (f.description.trim().length < 15) e.description = "Add a few more details so providers can price it.";
  }
  if (step === 2) {
    if (!f.area) e.area = "Choose the area.";
    if (!f.when) e.when = "Choose when you need it done.";
    if (f.when === "date" && !f.date) e.date = "Pick a date.";
  }
  if (step === 3) {
    const n = Number(f.budget);
    if (!f.budget) e.budget = "Enter your budget.";
    else if (n < 1000) e.budget = "Budget should be at least ₦1,000.";
  }
  return e;
}
