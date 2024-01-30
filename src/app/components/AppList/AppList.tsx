import { NavLink } from "@mantine/core";
import Link from "next/link";
import { pages } from "../../components/pages";

export default function AppList() {
  return (
    <>
      {pages.map((page) => (
        <NavLink
          key={page.path}
          label={page.name}
          component={Link}
          href={`/${page.path}`}
        />
      ))}
    </>
  );
}
