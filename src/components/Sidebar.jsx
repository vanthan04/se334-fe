import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Typography,
  Tooltip,
  styled,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { DataGrid } from "@mui/x-data-grid";

import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { viVN } from "@mui/x-data-grid/locales";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

import axios from "axios";
import { toast } from "react-toastify";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Sidebar = ({ setSelectedFileNames }) => {
  //State độc lập ở SideBar
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [listFileName, setListFileName] = useState([]);

  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const convert_data = (data) => {
    return data.map((item) => ({
      id: item.fileId,
      fileName: item.fileName,
    }));
  };

  const fetchListFileName = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/get-files");
      if (response.status === 200) {
        setListFileName(convert_data(response.data.dataResponse));
      }
    } catch (error) {
      toast.error("Lấy danh sách file không thành công");
    }
  };

  useEffect(() => {
    fetchListFileName();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
    }
  };
  const handlePredictAndSave = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Vui lòng chọn file!");
    }
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("File không đúng định dạng CSV hoặc Excel.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const toastId = toast.loading("Đang xử lý...");

      const response = await axios.post(
        "http://localhost:5000/api/predict-and-save",
        formData
      );
      // Cập nhật toast thành công
      toast.update(toastId, {
        render: response.data.message,
        type: "success",
        isLoading: false,
        closeOnClick: true,
      });
      setFileName("");
      await fetchListFileName();
    } catch (error) {
      console.error("Lỗi khi gửi file:", error);
      // Cập nhật toast thất bại
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi gửi file.",
        type: "error",
        isLoading: false,
        closeOnClick: true,
      });
    }
  };

  const handleRefreshListFileName = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/get-files");
      if (response.status === 200) {
        setListFileName(convert_data(response.data.dataResponse));
      }
    } catch (error) {
      toast.error("Lấy danh sách file không thành công");
    }
  };

  const handleDeleteListFileName = async () => {
    // Call APi để xóa 1 danh sách các filename bao gồm id.
    // Sau đó call lại api để lấy danh sách các filename gồm id và filename
    //Lấy danh sách các id được chọn
    const selectedListFileName = Array.from(rowSelectionModel.ids);
    if (selectedListFileName.length === 0) {
      toast.error("Vui lòng chọn danh sách cần xóa");
      setOpen(false);
      return;
    }

    const response = await axios.delete(
      "http://localhost:5000/api/delete-list-file",
      selectedListFileName
    );

    if (response.success) {
      toast.success("Xóa thành công!");
      await fetchListFileName();
    } else {
      //Log ra lỗi
      toast.error("Đã có lỗi khi xóa!");
    }
    return;
  };

  return (
    <Box
      sx={{
        minWidth: "150px",
        width: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Upload & Save Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 2,
          }}
        >
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ px: 2 }}
          >
            Upload
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
          {fileName ? (
            <Tooltip title={fileName}>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  mb: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  maxWidth: 200, // hoặc giá trị cố định phù hợp
                  textAlign: "center",
                  display: "block", // thêm cái này nếu cần
                }}
              >
                {fileName}
              </Typography>
            </Tooltip>
          ) : (
            <Box
              sx={{
                mt: 0.5,
                mb: 1,
                height: 20,
              }}
            />
          )}
        </Box>

        <Button
          variant="contained"
          color="success"
          sx={{
            alignSelf: "center",
            width: "90%",
          }}
          onClick={handlePredictAndSave}
        >
          Save and predict
        </Button>

        <Divider sx={{ width: "100%", my: 1 }} />
      </Box>
      {/* Item refresh and delete */}
      <Box
        sx={{
          mt: 0,
          width: "40%",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <IconButton
          aria-label="refresh"
          size="small"
          color="primary"
          onClick={handleRefreshListFileName}
        >
          <RefreshIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          aria-label="delete"
          size="small"
          color="error"
          onClick={handleClickOpen}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
        <Dialog
          open={open}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Bạn có chắc muốn xóa danh sách các file trên?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button color="error" onClick={handleDeleteListFileName}>
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* File list */}
      <Box style={{ mt: 1, height: 510, width: "100%" }}>
        {listFileName && listFileName.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 3 }}>
            Không tìm thấy danh sách tên file
          </Typography>
        ) : (
          <DataGrid
            rows={listFileName}
            columns={[{ field: "fileName", headerName: "File Name", flex: 1 }]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setSelectedFileNames(Array.from(newRowSelectionModel.ids));
              setRowSelectionModel(newRowSelectionModel);
            }}
            rowSelectionModel={rowSelectionModel}
            hideFooter
            disableColumnResize
            disableColumnSorting
            localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              ".MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "&.MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#d3dda1",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "#e5ebee", // Màu hàng chẵn
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#ffffff", // Màu hàng lẻ
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
