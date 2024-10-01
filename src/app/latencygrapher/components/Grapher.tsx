"use client";

import s from "./Grapher.module.css";
import { ActionIcon, FileButton, Group, Tooltip } from "@mantine/core";
import { IconUpload, IconCopy, IconDownload } from "@tabler/icons-react";
import React from "react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  defaults,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip as ChartTooltip,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  ChartTooltip
);

defaults.animation = false;
defaults.font.size = 20;
defaults.borderColor = "rgb(70,70,70)";
defaults.color = "rgb(255,255,255)";
defaults.normalized = true;

interface Bench {
  fileName: string;
  uploaded: string;
  samples: number;
  metrics: {
    stdev: number;
    min: number;
    avg: number;
    max: number;
    percentiles: Record<number, number>;
  };
}

type Benches = Bench[];

const percentileList = [
  90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 99.1, 99.2, 99.3, 99.4, 99.5, 99.6,
  99.7, 99.8, 99.9,
];

const colorList = [
  "#800000",
  "#008000",
  "#00bfff",
  "#ff8c00",
  "#ff00ff",
  "#deb887",
  "#00ff00",
  "#0000ff",
  "#000080",
  "#2f4f4f",
  "#ffff54",
  "#dda0dd",
  "#ff1493",
  "#7fffd4",
];

function processData(file: string, fileName: string) {
  const lines = file.split("\n");
  const splitFirstRow = lines[0].trim().toLowerCase().split(",");

  let latencyColumn = 0;
  if (splitFirstRow.includes("mspclatency")) {
    latencyColumn = splitFirstRow.indexOf("mspclatency");
  } else if (splitFirstRow.includes("pc + displaylatency(msec)")) {
    latencyColumn = splitFirstRow.indexOf("pc + displaylatency(msec)");
  } else if (splitFirstRow.includes("allinputtophotonlatency")) {
    latencyColumn = splitFirstRow.indexOf("allinputtophotonlatency");
  } else if (splitFirstRow.includes("clicktophotonlatency")) {
    latencyColumn = splitFirstRow.indexOf("clicktophotonlatency");
  }

  const latencies: number[] = [];
  let total = 0;

  for (const line of lines.slice(1)) {
    const latency = parseFloat(line.trim().split(",")[latencyColumn]);

    if (!Number.isNaN(latency) && latency !== 0) {
      latencies.push(latency);
      total += latency;
    }
  }

  const sortedLatencies = latencies.toSorted((a, b) => a - b);
  const samples = sortedLatencies.length;
  const avg = total / samples;

  const percentiles: Record<number, number> = {};
  for (const percentile of percentileList) {
    percentiles[percentile] =
      sortedLatencies[Math.ceil((percentile / 100) * samples) - 1];
  }

  const bench: Bench = {
    fileName,
    uploaded: Date.now().toString(),
    samples,
    metrics: {
      stdev: Math.sqrt(
        latencies.reduce(
          (previous, current) => previous + (current - avg) ** 2,
          0
        ) /
          (samples - 1)
      ),
      min: sortedLatencies[0],
      avg,
      max: sortedLatencies[samples - 1],
      percentiles,
    },
  };

  return bench;
}

async function handleUpload(
  files: File[],
  benches: Benches,
  setBenches: React.Dispatch<React.SetStateAction<Benches>>,
  resetRef: React.RefObject<() => void>
) {
  const newBenches: Benches = [];

  for (const file of files) {
    if (
      benches.length + newBenches.length <= 13 &&
      file.name.endsWith(".csv")
    ) {
      newBenches.push(processData(await file.text(), file.name.slice(0, -4)));
    }
  }

  setBenches((previousBenches) => previousBenches.concat(newBenches));

  resetRef.current?.();
}

function exportChart(download: boolean) {
  void html2canvas(document.body, {
    scrollY: 0,
    ignoreElements: (element) =>
      element.tagName === "BUTTON" ||
      element.id === "button-container" ||
      element.tagName === "NOSCRIPT" ||
      !!element.getAttribute("data-portal"),
    height: document.getElementById("chart-container")?.scrollHeight,
  }).then((canvas) => {
    canvas.toBlob((blob) => {
      if (blob) {
        if (download) {
          saveAs(blob, "export.png");
        } else {
          void navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
        }
      }
    });
  });
}

export default function Grapher() {
  const [benches, setBenches] = React.useState<Benches>([]);
  const resetRef = React.useRef<() => void>(null);

  return (
    <>
      <Group className={s.buttons} id="button-container">
        {benches.length > 0 && (
          <>
            <Tooltip label="Export to clipboard">
              <ActionIcon
                size="2rem"
                variant="subtle"
                color="gray"
                onClick={() => {
                  exportChart(false);
                }}
              >
                <IconCopy size="2rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Export as PNG">
              <ActionIcon
                size="2rem"
                variant="subtle"
                color="gray"
                onClick={() => {
                  exportChart(true);
                }}
              >
                <IconDownload size="2rem" />
              </ActionIcon>
            </Tooltip>
          </>
        )}
        <FileButton
          resetRef={resetRef}
          multiple
          accept=".csv"
          onChange={(files) => {
            void handleUpload(files, benches, setBenches, resetRef);
          }}
        >
          {(props) => (
            <Tooltip label="Upload files (max. 14)">
              <ActionIcon size="2rem" variant="subtle" color="gray" {...props}>
                <IconUpload size="2rem" />
              </ActionIcon>
            </Tooltip>
          )}
        </FileButton>
      </Group>

      {benches.length > 0 && (
        <div id="chart-container" className={s.container}>
          <Line
            datasetIdKey="datasetIdKey"
            data={{
              labels: [
                "STDEV",
                "Min",
                "Avg",
                ...percentileList.map((percentile) => percentile.toString()),
                "Max",
              ],
              datasets: benches.map((bench, index) => ({
                datasetIdKey: bench.fileName + bench.uploaded,
                label: `${
                  bench.fileName
                } | ${bench.samples.toString()} samples`,
                backgroundColor: colorList[index],
                borderColor: colorList[index],
                data: [
                  { x: "STDEV", y: bench.metrics.stdev },
                  { x: "Min", y: bench.metrics.min },
                  { x: "Avg", y: bench.metrics.avg },
                  ...percentileList.map((percentile) => {
                    return {
                      x: percentile.toString(),
                      y: bench.metrics.percentiles[percentile],
                    };
                  }),
                  { x: "Max", y: bench.metrics.max },
                ],
              })),
            }}
            options={{
              parsing: false,
              maintainAspectRatio: false,
              events: ["click", "mousemove"],
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Percentile & co.",
                  },
                },
                y: {
                  min: 0,
                  title: {
                    display: true,
                    text: "ms",
                  },
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </>
  );
}
