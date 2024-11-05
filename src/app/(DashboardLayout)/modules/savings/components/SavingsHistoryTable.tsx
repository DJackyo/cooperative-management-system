import { DataGrid, GridColDef } from "@mui/x-data-grid";

const SavingsHistoryTable = () => {
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "date", headerName: "Fecha", width: 180 },
    { field: "amount", headerName: "Monto", width: 150 },
  ];

  const rows = [
    { id: 1, date: "2024-11-01", amount: "$200" },
    { id: 2, date: "2024-11-10", amount: "$150" },
    { id: 3, date: "2024-11-15", amount: "$300" },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: { pageSize: 5 },
        },
      }}
      pageSizeOptions={[5, 10, 20]}
      style={{ height: 400, width: "100%" }}
    />
  );
};

export default SavingsHistoryTable;
