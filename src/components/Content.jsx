import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { BarChart } from "@mui/x-charts";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";

import axios from "axios";
import { toast } from "react-toastify";

const Content = ({ selectedFileNames }) => {
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs());
  const [typeStatistic, setTypeStatistic] = useState("alltime");

  const [dataBar, setDataBar] = useState({ series: [], xAxis: [] });
  const [dataLine, setDataLine] = useState({ series: [], xLabels: [] });
  const [showDetail, setShowDetail] = useState(false);

  const [dataPie, setDataPie] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);

  const convertStatsByTimeToChartData = (stats_by_time) => {
    const xLabels = Object.keys(stats_by_time).sort();
    const positive = [];
    const negative = [];
    const neutral = [];

    xLabels.forEach((date) => {
      positive.push(stats_by_time[date].positive || 0);
      negative.push(stats_by_time[date].negative || 0);
      neutral.push(stats_by_time[date].neutral || 0);
    });

    const series = [
      { label: "positive", data: positive },
      { label: "negative", data: negative },
      { label: "neutral", data: neutral },
    ];

    return { series, xLabels };
  };

  const convert_response_to_bar_chart = (stats_by_file) => {
    const labels = ["positive", "negative", "neutral"];
    const files = Object.keys(stats_by_file);
    const xAxis = [{ data: files }];

    const series = labels.map((label) => ({
      label,
      data: files.map((file) => stats_by_file[file][label] || 0),
    }));

    return { series, xAxis };
  };

  const handleChangeType = async (event) => {
    setTypeStatistic(event.target.value);
    setDataLine({ series: [], xLabels: [] });
    setDataBar({ series: [], xAxis: [] });
    setDataPie([]);
    setShowDetail(false);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/start-end-time",
        selectedFileNames
      );
      setStartTime(dayjs(response.data.start_time));
      setEndTime(dayjs(response.data.end_time));
    } catch (error) {
      setStartTime(dayjs());
      setEndTime(dayjs());
      console.log(error);
    }
  };

  const handleOnClickStatistic = async (event) => {
    event.preventDefault();
    if (startTime.isAfter(endTime)) {
      toast.error("Thời gian bắt đầu không được lớn hơn thời gian kết thúc"); 
      return;
    }
    const payload = {
      startTime: startTime.format("YYYY-MM-DD HH:mm:ss"),
      endTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
      typeStatistic,
      selectedFileNames,
    };
    try {
      const response = await axios.post(
        "http://localhost:5000/api/statistic",
        payload
      );

      // Line chart
      if (typeStatistic === "month" || typeStatistic === "year") {
        const { series, xLabels } = convertStatsByTimeToChartData(
          response.data.stats_by_time
        );
        setDataLine({ series, xLabels });
      }

      // Bar chart
      const { series, xAxis } = convert_response_to_bar_chart(
        response.data.stats_by_file
      );
      setDataBar({ series, xAxis });
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleDetailsInfoFile = (data) => {
    const fileName = dataBar.xAxis[0].data[data.dataIndex];
    setSelectedFileName(fileName);
    const fileStats = dataBar.series.reduce((acc, series) => {
      acc[series.label] = series.data[data.dataIndex];
      return acc;
    }, {});

    const total = Object.values(fileStats).reduce((sum, val) => sum + val, 0);

    const pieData = Object.entries(fileStats).map(([label, value]) => ({
      label,
      value,
      percent: ((value / total) * 100).toFixed(1),
    }));

    setDataPie([
      {
        data: pieData,
        arcLabel: (item) => `${item.percent}%`,
      },
    ]);
    setShowDetail(true);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {selectedFileNames && selectedFileNames.length !== 0 && (
        <Box
          sx={{
            height: 60,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            py: 1,
            mb: 4,
          }}
        >
          <FormControl variant="standard" sx={{ ml: 2, minWidth: 150 }}>
            <InputLabel id="typeOfStatistic">Loại thống kê</InputLabel>
            <Select
              labelId="typeOfStatistic"
              id="typeOfStatistic"
              value={typeStatistic}
              onChange={handleChangeType}
              label="typeOfStatistic"
            >
              <MenuItem value="alltime">Tất cả</MenuItem>
              <MenuItem value="month">Tháng</MenuItem>
              <MenuItem value="year">Năm</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            {(typeStatistic === "month" || typeStatistic === "year") && (
              <>
                <DatePicker
                  sx={{ ml: 3 }}
                  label="Thời gian bắt đầu"
                  value={startTime}
                  onChange={setStartTime}
                  format={typeStatistic === "month" ? "MM/YYYY" : "YYYY"}
                  views={
                    typeStatistic === "month" ? ["month", "year"] : ["year"]
                  }
                />
                <DatePicker
                  sx={{ ml: 3 }}
                  label="Thời gian kết thúc"
                  value={endTime}
                  onChange={setEndTime}
                  format={typeStatistic === "month" ? "MM/YYYY" : "YYYY"}
                  views={
                    typeStatistic === "month" ? ["year", "month"] : ["year"]
                  }
                />
              </>
            )}
          </LocalizationProvider>

          <Button
            sx={{ ml: "auto", mr: 10, height: 40 }}
            onClick={handleOnClickStatistic}
            variant="contained"
            color="primary"
          >
            Statistic
          </Button>
        </Box>
      )}
      <Box sx={{ height: 400, display: "flex", flexDirection: "row" }}>
        <Box sx={{ mr: "30px" }}>
          <BarChart
            width={800}
            height={300}
            sx={{
              "& g.MuiChartsAxis-directionX .MuiChartsAxis-tickLabel tspan": {
                fontSize: "18px",
                cursor: "pointer",
              },
            }}
            onAxisClick={(event, data) => handleDetailsInfoFile(data)}
            series={dataBar.series}
            xAxis={dataBar.xAxis}
          />
        </Box>
        <Box>
          {showDetail && (
            <Box>
              <h3 style={{ marginBottom: "16px" }}>
                Chi tiết: {selectedFileName}
              </h3>
              <PieChart
                series={[
                  {
                    arcLabel: (item) => `${item.label}: ${item.value}`,
                    arcLabelMinAngle: 35,
                    arcLabelRadius: "60%",
                    ...dataPie[0],
                  },
                ]}
                sx={{
                  [`& .${pieArcLabelClasses.root}`]: {
                    fontWeight: "bold",
                  },
                }}
                width={250}
                height={250}
              />
            </Box>
          )}
        </Box>
      </Box>

      {(typeStatistic === "year" || typeStatistic === "month") && (
        <Box sx={{ height: 600 }}>
          <LineChart
            height={500}
            series={dataLine.series}
            xAxis={[{ scaleType: "point", data: dataLine.xLabels }]}
            yAxis={[{ width: 50 }]}
            margin={{ right: 50 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Content;
