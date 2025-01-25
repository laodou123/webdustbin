
// Function to export notifications as CSV
export const exportToCSV = (data) => {
  let csvContent =
    "data:text/csv;charset=utf-8," +
    data.map((e) => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "notifications_log.csv");
  document.body.appendChild(link); // Required for FF

  link.click();
  document.body.removeChild(link);
};