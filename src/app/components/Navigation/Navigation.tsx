"use client";

import s from "./Navigation.module.css";
import { useDisclosure } from "@mantine/hooks";
import { Drawer, Burger, Center, NavLink } from "@mantine/core";
import AppList from "../AppList/AppList";
import Link from "next/link";

export default function Navigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { close, toggle }] = useDisclosure(false);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        onClick={close}
        title={<NavLink label="Home" component={Link} href="/" />}
        transitionProps={{ duration: 0 }}
        size="xs"
      >
        <AppList />
      </Drawer>
      <Burger
        className={s.burger}
        opened={opened}
        onClick={toggle}
        transitionDuration={0}
      />
      <Center className={s.main}>{children}</Center>
    </>
  );
}
