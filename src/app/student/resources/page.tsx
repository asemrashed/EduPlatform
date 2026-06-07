import { redirect } from "next/navigation";
import { RESOURCE_STUDENT_DEFAULT_HREF } from "@/lib/resources/config";

export default function StudentResourcesIndexPage() {
  redirect(RESOURCE_STUDENT_DEFAULT_HREF);
}
