import React from "react";
import { Doughnut } from "react-chartjs-2";
import { DARK_BLUE, LIGHT_BLUE } from "../common/theme";

export default function DoughnutBody(props) {
  const { allocated, total } = props;
  const available = Math.round(100 * (total - allocated)) / 100;

  return (
    <Doughnut
      legend={{
        position: "right",
        onClick: () => {},
      }}
      data={{
        labels: [
          `Allocated: $${allocated.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`,
          `Available: $${available.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`,
        ],
        datasets: [
          {
            data: available >= 0 ? [allocated, available] : [1, 0],
            backgroundColor:
              available >= 0 ? [DARK_BLUE, LIGHT_BLUE] : ["red", LIGHT_BLUE],
          },
        ],
      }}
      options={{
        tooltips: { enabled: false },
      }}
    />
  );
}
