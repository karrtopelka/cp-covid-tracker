import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  aspectRatio: 1,
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

const buildChartData = (data, casesType) => {
  const chartData = [];
  let lastDataPoint;

  for (let date in data[casesType]) {
    if (lastDataPoint) {
      const newDataPoint = {
        x: date,
        y: data[casesType][date] - lastDataPoint,
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[casesType][date];
  }
  return chartData;
};

function LineGraph({ casesType = "cases" }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=60")
        .then((res) => res.json())
        .then((data) => {
          console.table(data);
          let chartData = buildChartData(data, casesType);
          setData(chartData);
        });
    };

    fetchData();
  }, [casesType]);

  console.log(casesType);
  return (
    <div style={{ height: "220px", marginTop: "10px" }}>
      {data?.length > 0 && (
        <Line
          options={options}
          data={{
            datasets: [
              {
                backgroundColor: [
                  `${
                    casesType === "cases"
                      ? "rgba(153, 102, 255, 0.2)"
                      : casesType === "recovered"
                      ? "rgba(75, 192, 192, 0.2)"
                      : "rgba(255, 99, 132, 0.2)"
                  }`,
                ],
                borderColor: [
                  `${
                    casesType === "cases"
                      ? "rgba(153, 102, 255, 1)"
                      : casesType === "recovered"
                      ? "rgba(75, 192, 192, 1)"
                      : "rgba(255, 99, 132, 1)"
                  }`,
                ],
                data: data,
              },
            ],
          }}
        />
      )}
    </div>
  );
}

export default LineGraph;
