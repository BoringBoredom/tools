import IconButton from "@mui/material/IconButton";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import { useState } from "react";

import { Line } from "react-chartjs-2";
//import 'chart.js/auto';
import {
  Chart as ChartJS,
  defaults,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
);

defaults.animation = false;
defaults.events = [];
defaults.font.size = 20;
defaults.borderColor = "rgb(70,70,70)";
defaults.color = "rgb(255,255,255)";

const values = [
  "STDEV",
  "Min",
  "Avg",
  90,
  91,
  92,
  93,
  94,
  95,
  96,
  97,
  98,
  99,
  99.1,
  99.2,
  99.3,
  99.4,
  99.5,
  99.6,
  99.7,
  99.8,
  99.9,
  "Max",
];

const colorList = [
  "rgb(255,0,0)",
  "rgb(0,255,0)",
  "rgb(0,0,255)",
  "rgb(255,255,0)",
  "rgb(0,255,255)",
  "rgb(255,0,255)",
  "rgb(192,192,192)",
  "rgb(128,128,128)",
  "rgb(128,0,0)",
  "rgb(128,128,0)",
  "rgb(0,128,0)",
  "rgb(128,0,128)",
  "rgb(0,128,128)",
  "rgb(0,0,128)",
];

const options = {
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
  layout: {
    padding: 50,
  },
};

function processData(file, fileName) {
  const lines = file.replaceAll("\r", "").split("\n");
  const splitFirstRow = lines[0].toLowerCase().split(",");

  let latencyColumn = "";
  if (splitFirstRow.includes("mspclatency")) {
    latencyColumn = splitFirstRow.indexOf("mspclatency");
  } else if (splitFirstRow.includes("pc + displaylatency(msec)")) {
    latencyColumn = splitFirstRow.indexOf("pc + displaylatency(msec)");
  } else {
    latencyColumn = 1;
  }

  const latencies = [];
  let total = 0;

  for (const line of lines.slice(1)) {
    const latency = parseFloat(line.split(",")[latencyColumn]);

    if (!isNaN(latency)) {
      latencies.push(latency);
      total += latency;
    }
  }

  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const samples = sortedLatencies.length;
  const avg = total / samples;

  const bench = {
    file_name: fileName,
    samples: samples,
    STDEV: Math.sqrt(
      latencies.reduce(
        (previous, current) => previous + (current - avg) ** 2,
        0
      ) /
        (samples - 1)
    ),
    Min: sortedLatencies[0],
    Avg: avg,
    Max: sortedLatencies[samples - 1],
  };

  for (const value of values) {
    if (!isNaN(value)) {
      bench[value] = sortedLatencies[Math.ceil((value / 100) * samples) - 1];
    }
  }

  return bench;
}

export default function RLA() {
  const [benches, setBenches] = useState([]);

  async function handleFileChange(ev) {
    const newBenches = [];

    for (const file of ev.target.files) {
      if (benches.length >= 13) {
        break;
      }

      newBenches.push(processData(await file.text(), file.name.slice(0, -4)));
    }

    setBenches((previousBenches) => [...previousBenches, ...newBenches]);

    ev.target.value = "";
  }

  return (
    <>
      <IconButton
        color="primary"
        component="label"
        style={{ position: "fixed", top: "100px", left: 0 }}
      >
        <input
          type="file"
          accept=".csv"
          multiple
          hidden
          onChange={handleFileChange}
        />
        <FileUploadIcon fontSize="large" />
      </IconButton>

      {benches.length > 0 && (
        <div>
          <Line
            datasetIdKey="id"
            options={options}
            data={{
              labels: values,
              datasets: benches.map((bench, index) => {
                return {
                  id: index,
                  label: bench.file_name + ` | ${bench.samples} samples`,
                  data: values.map((value) => bench[value]),
                  backgroundColor: colorList[index],
                  borderColor: colorList[index],
                };
              }),
            }}
          />
        </div>
      )}
    </>
  );
}
