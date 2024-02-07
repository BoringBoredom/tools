"use client";

import s from "./Calculator.module.css";
import { Stack, NumberInput, Tooltip, Table } from "@mantine/core";
import React from "react";

const sensitivities = [
  [1 / 32, "1/32", "1"],
  [1 / 16, "1/16", "2"],
  [1 / 8, "1/8"],
  [2 / 8, "2/8", "3"],
  [3 / 8, "3/8"],
  [4 / 8, "4/8", "4"],
  [5 / 8, "5/8"],
  [6 / 8, "6/8", "5"],
  [7 / 8, "7/8"],
  [1, "1", "6"],
  [1.25, "1.25"],
  [1.5, "1.5", "7"],
  [1.75, "1.75"],
  [2, "2", "8"],
  [2.25, "2.25"],
  [2.5, "2.5", "9"],
  [2.75, "2.75"],
  [3, "3", "10"],
  [3.25, "3.25"],
  [3.5, "3.5", "11"],
];

function DisplayDPI({
  efDpi,
  multiplier,
}: {
  efDpi: number;
  multiplier: number;
}) {
  const dpi = efDpi / multiplier;

  if (Number.isInteger(dpi)) {
    return <Table.Td>{dpi}</Table.Td>;
  }

  return (
    <Tooltip label="rounded to the nearest integer">
      <Table.Td>{`*${Math.round(dpi)}`}</Table.Td>
    </Tooltip>
  );
}

export default function Calculator() {
  const [efDPI, setEfDPI] = React.useState<number>(1600);

  return (
    <Stack>
      <Tooltip
        label={`DPI you'd normally use @ stock setting (New Panel: 10/20 or Legacy Panel: 6/11) with "Enhance pointer precision" disabled`}
      >
        <div>
          <NumberInput
            label="*eDPI (DPI @ stock)"
            value={efDPI}
            onChange={(value) => {
              if (typeof value === "number") {
                setEfDPI(value);
              }
            }}
            min={1}
            max={10000000}
            clampBehavior="strict"
            allowNegative={false}
            allowDecimal={false}
            stepHoldDelay={250}
            stepHoldInterval={1}
          />
        </div>
      </Tooltip>
      <Table striped withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={s.alignRight}>DPI</Table.Th>
            <Tooltip label="HKEY_CURRENT_USER\Control Panel\Mouse -> MouseSensitivity">
              <Table.Th className={s.alignRight}>
                *Registry / New Panel
              </Table.Th>
            </Tooltip>
            <Table.Th className={s.alignRight}>Legacy Panel</Table.Th>
            <Table.Th className={s.alignRight}>Multiplier</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sensitivities.map((row, index) => {
            return (
              <Table.Tr key={row[1]} className={s.alignRight}>
                <DisplayDPI efDpi={efDPI} multiplier={row[0] as number} />
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td>{row[2]}</Table.Td>
                <Table.Td>{row[1]}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
