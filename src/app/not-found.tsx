import s from "./components/not-found.module.css";
import { Stack } from "@mantine/core";
import Link from "next/link";

export default function NotFound() {
  return (
    <Stack className={s.centerText}>
      <p>Not Found</p>
      <Link href="/">Return Home</Link>
    </Stack>
  );
}
