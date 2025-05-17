import { useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import "dayjs/locale/vi";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { BarChart } from "@mui/x-charts";
import axios from "axios";
import { toast } from "react-toastify";

const Content = ({ selectedFileNames }) => {
  //Quản lí options
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs());
  const [typeStatistic, setTypeStatistic] = useState("alltime");

  const [data, setData] = useState([]);
  const [showDetail, setShowDetail] = useState(false);

  //Mock data
  const series = [
    {
      label: "positive",
      data: [12, 8],
    },
    {
      label: "negative",
      data: [3, 7],
    },
    {
      label: "neutral",
      data: [5, 2],
    },
  ];

  const xAxis = [{ data: ["file1.txt", "file2.txt"] }];

  const conver_response_to_data_chart = (data) => {
    const xAxis = [{ data: data.map((item) => item.filename) }];

    const labels = ["positive", "negative", "neutral"];

    const series = labels.map((label) => ({
      label,
      data: data.map((item) => item[label]),
    }));

    return { series, xAxis };
  };

  const handleChangeType = async (event) => {
    if (event.target.value === "alltime") {
      setTypeStatistic(event.target.value);
      return;
    }
    const response = await axios.post(
      "http://localhost:5000/api/start-end-time",
      selectedFileNames
    );
    console.log(response);
  };

  const handleOnClickStatistic = async (event) => {
    event.preventDefault();
    const payload = {
      startTime: startTime.format("YYYY-MM-DD"),
      endTime: endTime.format("YYYY-MM-DD"),
      typeStatistic: typeStatistic,
      selectedFileNames: selectedFileNames,
    };
    console.log("data send BE", payload);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/start-end-time",
        payload
      );
      //  console.log(typeof startTime.format("YYYY-MM-DD"));
      //  console.log(endTime.format("YYYY-MM-DD"));
      //  console.log(typeStatistic);
      //  console.log(selectedFileNames);

      // if (response.status === 200) {

      // }
      
    } catch (error) {
      toast.error("Có lỗi xảy ra", response.data.message);
    }
  };
  const handleDetailsInfoFile = (event) => {
    console.log(event);
    event.preventDefault();
    const clickedLabel = event.label;
    console.log(clickedLabel);
  };
  //   const dataMultiFile =
  return (
    <Box sx={{ flexGrow: 1 }}>
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
            <MenuItem value="day">Ngày</MenuItem>
            <MenuItem value="month">Tháng</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          {typeStatistic === "day" && (
            <>
              <DatePicker
                sx={{ ml: 3 }}
                label="Thời gian bắt đầu"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                format="DD/MM/YYYY"
              />
              <DatePicker
                sx={{ ml: 3 }}
                label="Thời gian kết thúc"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                format="DD/MM/YYYY"
              />
            </>
          )}

          {typeStatistic === "month" && (
            <>
              <DatePicker
                sx={{ ml: 3 }}
                views={["year", "month"]}
                label="Thời gian bắt đầu"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                format="MM/YYYY"
              />
              <DatePicker
                sx={{ ml: 3 }}
                views={["year", "month"]}
                label="Thời gian kết thúc"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                format="MM/YYYY"
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

      <Box sx={{ height: 400, display: "flex", flexDirection: "row" }}>
        <Box sx={{ width: "900px" }}>
          <BarChart
            width={800}
            height={300}
            sx={{
              "& g.MuiChartsAxis-directionX .MuiChartsAxis-tickLabel tspan": {
                fontSize: "18px",
                cursor: "pointer",
              },
            }}
            onAxisClick={handleDetailsInfoFile}
            series={series}
            xAxis={xAxis}
          />
        </Box>
        <Box>Chỗ này vẽ biểu đồ tròn cụ thể</Box>
      </Box>
      <Box sx={{ height: 400 }}>Chỗ này sẽ hiển thị cột</Box>
    </Box>
  );
};

export default Content;
