import React, { useState } from "react";
import { Box, Divider } from "@mui/material";
import Content from "./Content";
import Sidebar from "./SideBar";

export default function MainComponent() {
  const [selectedFileNames, setSelectedFileNames] = useState([]);
  
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh", // Chiều cao toàn màn hình
        overflow: "hidden", // Tránh toàn bộ trang bị scroll
      }}
    >
      {/* Sidebar cố định */}
      <Sidebar setSelectedFileNames={setSelectedFileNames} />

      {/* Divider */}
      <Divider orientation="vertical" flexItem />

      {/* Content cuộn được */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto", // Cuộn theo chiều dọc
          pr: 2,
          pl: 4,
          py: 2,
        }}
      >
        <Content selectedFileNames={selectedFileNames}/>
      </Box>
    </Box>
  );
}
