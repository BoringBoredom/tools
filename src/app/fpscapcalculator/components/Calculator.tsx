"use client";

import { NumberInput, Paper, Grid, Stack } from "@mantine/core";
import React from "react";
import s from "./Calculator.module.css";

function DisplayCap({
  refreshRate,
  fpsLimit,
}: {
  refreshRate: number;
  fpsLimit: number;
}) {
  const fpsCaps = new Set<number>();

  for (
    let multiplier = 1, cap = refreshRate * multiplier;
    cap <= fpsLimit;
    multiplier++, cap = refreshRate * multiplier
  ) {
    fpsCaps.add(cap);
  }

  for (
    let divider = 1, cap = refreshRate / divider;
    cap >= 1;
    divider++, cap = refreshRate / divider
  ) {
    if (refreshRate % divider === 0 && cap <= fpsLimit) {
      fpsCaps.add(cap);
    }
  }

  const sortedFpsCaps = [...fpsCaps].sort((a, b) => a - b);

  return (
    <Grid columns={6} className={s.centerText}>
      {sortedFpsCaps.map((cap) => (
        <Grid.Col key={cap} span={1}>
          <Paper className={s.background}>{cap}</Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
}

export default function Calculator() {
  const [refreshRate, setRefreshRate] = React.useState(240);
  const [fpsLimit, setFpsLimit] = React.useState(1000);

  return (
    <Stack className={s.width}>
      <NumberInput
        label="Monitor Refresh Rate"
        value={refreshRate}
        onChange={(value) => {
          if (typeof value === "number") {
            setRefreshRate(value);
          }
        }}
        min={1}
        max={100000}
        clampBehavior="strict"
        allowNegative={false}
        allowDecimal={false}
        stepHoldDelay={250}
        stepHoldInterval={1}
      />
      <NumberInput
        label="FPS Limit"
        value={fpsLimit}
        onChange={(value) => {
          if (typeof value === "number") {
            setFpsLimit(value);
          }
        }}
        min={1}
        max={100000}
        clampBehavior="strict"
        allowNegative={false}
        allowDecimal={false}
        stepHoldDelay={250}
        stepHoldInterval={1}
      />
      <DisplayCap refreshRate={refreshRate} fpsLimit={fpsLimit} />
    </Stack>
  );
}
