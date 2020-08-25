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
      label: function (tooltipItem) {
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
          callback: function (value) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

const buildChartData = (country = "worldwide", data, casesType) => {
  const chartData = [];
  let lastDataPoint;
  if (data.message) {
    return chartData;
  }

  if (country === "worldwide") {
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
  } else {
    for (let date in data["timeline"][casesType]) {
      if (lastDataPoint) {
        const newDataPoint = {
          x: date,
          y: data["timeline"][casesType][date] - lastDataPoint,
        };
        chartData.push(newDataPoint);
      }
      lastDataPoint = data["timeline"][casesType][date];
    }
  }
  return chartData;
};

function LineGraph({ graphCountry = "worldwide", casesType = "cases" }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const url =
      graphCountry === "worldwide"
        ? "https://disease.sh/v3/covid-19/historical/all?lastdays=60"
        : `https://disease.sh/v3/covid-19/historical/${graphCountry}?lastdays=60`;
    const fetchData = async () => {
      await fetch(url)
        .then((res) => res.json())
        .then((data) => {
          let chartData = buildChartData(graphCountry, data, casesType);
          setData(chartData);
        });
    };

    fetchData();
  }, [graphCountry, casesType]);
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
