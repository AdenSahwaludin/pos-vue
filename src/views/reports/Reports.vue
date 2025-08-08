<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Laporan & Analytics</h1>
      </v-col>
    </v-row>

    <!-- Date Range Filter -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedPeriod"
          :items="periodItems"
          label="Periode"
          variant="outlined"
          @update:modelValue="updateDateRange"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="startDate"
          label="Tanggal Mulai"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="endDate"
          label="Tanggal Akhir"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn color="primary" @click="generateReport" :loading="loading" block>
          <v-icon class="mr-2">mdi-chart-line</v-icon>
          Generate Laporan
        </v-btn>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card color="primary">
          <v-card-text class="text-white">
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">Total Penjualan</div>
                <div class="text-h4">
                  Rp {{ formatCurrency(reportData.totalSales) }}
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48">mdi-cash</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="success">
          <v-card-text class="text-white">
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">Total Transaksi</div>
                <div class="text-h4">{{ reportData.totalTransactions }}</div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48">mdi-receipt</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="info">
          <v-card-text class="text-white">
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">Rata-rata per Transaksi</div>
                <div class="text-h4">
                  Rp {{ formatCurrency(reportData.averageTransaction) }}
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48">mdi-calculator</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="warning">
          <v-card-text class="text-white">
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">Profit Margin</div>
                <div class="text-h4">{{ reportData.profitMargin }}%</div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48">mdi-trending-up</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Tren Penjualan
          </v-card-title>
          <v-card-text>
            <div id="sales-chart" style="height: 400px">
              <!-- Chart will be rendered here -->
              <div
                class="d-flex align-center justify-center"
                style="height: 100%"
              >
                <div class="text-center">
                  <v-icon size="64" class="text-grey-lighten-1"
                    >mdi-chart-line</v-icon
                  >
                  <div class="text-grey-lighten-1 mt-2">
                    Chart akan ditampilkan di sini
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-chart-pie</v-icon>
            Produk Terlaris
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(product, index) in reportData.topProducts"
                :key="product.id"
              >
                <template v-slot:prepend>
                  <v-chip
                    :color="getTopProductColor(index)"
                    size="small"
                    class="mr-3"
                  >
                    {{ index + 1 }}
                  </v-chip>
                </template>

                <v-list-item-title>{{ product.nama }}</v-list-item-title>
                <v-list-item-subtitle
                  >{{ product.sold }} terjual</v-list-item-subtitle
                >

                <template v-slot:append>
                  <div class="text-right">
                    <div class="font-weight-medium">
                      Rp {{ formatCurrency(product.revenue) }}
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detailed Tables -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Pelanggan Teratas
            <v-spacer></v-spacer>
            <v-btn icon size="small" @click="exportCustomerReport">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="customerHeaders"
              :items="reportData.topCustomers"
              :loading="loading"
              density="compact"
              hide-default-footer
            >
              <template v-slot:item.total_spent="{ item }">
                Rp {{ formatCurrency(item.total_spent) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-account</v-icon>
            Performa Kasir
            <v-spacer></v-spacer>
            <v-btn icon size="small" @click="exportCashierReport">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="cashierHeaders"
              :items="reportData.cashierPerformance"
              :loading="loading"
              density="compact"
              hide-default-footer
            >
              <template v-slot:item.total_sales="{ item }">
                Rp {{ formatCurrency(item.total_sales) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Export Options -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-download</v-icon>
            Export Laporan
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-btn
                  color="success"
                  variant="outlined"
                  @click="exportToExcel"
                  :loading="exporting"
                  block
                >
                  <v-icon class="mr-2">mdi-file-excel</v-icon>
                  Export ke Excel
                </v-btn>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="error"
                  variant="outlined"
                  @click="exportToPDF"
                  :loading="exporting"
                  block
                >
                  <v-icon class="mr-2">mdi-file-pdf-box</v-icon>
                  Export ke PDF
                </v-btn>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="printReport"
                  block
                >
                  <v-icon class="mr-2">mdi-printer</v-icon>
                  Print Laporan
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactions";
import { useProductStore } from "@/stores/products";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const transactionStore = useTransactionStore();
const productStore = useProductStore();

// Date and period filters
const selectedPeriod = ref("thisMonth");
const startDate = ref("");
const endDate = ref("");
const loading = ref(false);
const exporting = ref(false);

const periodItems = [
  { title: "Hari Ini", value: "today" },
  { title: "Minggu Ini", value: "thisWeek" },
  { title: "Bulan Ini", value: "thisMonth" },
  { title: "Tahun Ini", value: "thisYear" },
  { title: "Custom", value: "custom" },
];

// Report data
const reportData = ref({
  totalSales: 0,
  totalTransactions: 0,
  averageTransaction: 0,
  profitMargin: 0,
  topProducts: [],
  topCustomers: [],
  cashierPerformance: [],
  dailySales: [],
});

// Table headers
const customerHeaders = [
  { title: "Nama", key: "nama" },
  { title: "Total Transaksi", key: "transaction_count" },
  { title: "Total Belanja", key: "total_spent" },
];

const cashierHeaders = [
  { title: "Nama Kasir", key: "nama" },
  { title: "Transaksi", key: "transaction_count" },
  { title: "Total Penjualan", key: "total_sales" },
];

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID").format(value || 0);
};

const getTopProductColor = (index) => {
  const colors = ["gold", "silver", "bronze", "grey", "grey"];
  return colors[index] || "grey";
};

const updateDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today":
      startDate.value = today.toISOString().split("T")[0];
      endDate.value = today.toISOString().split("T")[0];
      break;
    case "thisWeek":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      startDate.value = weekStart.toISOString().split("T")[0];
      endDate.value = today.toISOString().split("T")[0];
      break;
    case "thisMonth":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.value = monthStart.toISOString().split("T")[0];
      endDate.value = today.toISOString().split("T")[0];
      break;
    case "thisYear":
      const yearStart = new Date(today.getFullYear(), 0, 1);
      startDate.value = yearStart.toISOString().split("T")[0];
      endDate.value = today.toISOString().split("T")[0];
      break;
  }
};

const generateReport = async () => {
  try {
    loading.value = true;

    // Filter transactions by date range
    const filteredTransactions = transactionStore.transactions.filter(
      (transaction) => {
        const transDate = new Date(transaction.tanggal.seconds * 1000);
        const start = new Date(startDate.value);
        const end = new Date(endDate.value + "T23:59:59");
        return (
          transDate >= start &&
          transDate <= end &&
          transaction.status === "selesai"
        );
      }
    );

    // Calculate summary data
    const totalSales = filteredTransactions.reduce(
      (sum, t) => sum + t.total,
      0
    );
    const totalTransactions = filteredTransactions.length;
    const averageTransaction =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Mock data for demonstration
    reportData.value = {
      totalSales,
      totalTransactions,
      averageTransaction,
      profitMargin: 25.5, // Mock profit margin
      topProducts: [
        { id: "1", nama: "Minyak Herbal Premium", sold: 150, revenue: 4500000 },
        { id: "2", nama: "Minyak Tradisional", sold: 120, revenue: 3600000 },
        { id: "3", nama: "Minyak Aromaterapi", sold: 100, revenue: 3000000 },
        { id: "4", nama: "Minyak Kelapa Murni", sold: 80, revenue: 2400000 },
        { id: "5", nama: "Minyak Zaitun Extra", sold: 60, revenue: 1800000 },
      ],
      topCustomers: [
        { nama: "John Doe", transaction_count: 25, total_spent: 2500000 },
        { nama: "Jane Smith", transaction_count: 20, total_spent: 2000000 },
        { nama: "Ahmad Rahman", transaction_count: 18, total_spent: 1800000 },
        { nama: "Siti Nurhaliza", transaction_count: 15, total_spent: 1500000 },
        { nama: "Budi Santoso", transaction_count: 12, total_spent: 1200000 },
      ],
      cashierPerformance: [
        { nama: "Admin User", transaction_count: 180, total_sales: 18000000 },
        { nama: "Kasir User", transaction_count: 120, total_sales: 12000000 },
      ],
    };
  } catch (error) {
    console.error("Error generating report:", error);
  } finally {
    loading.value = false;
  }
};

const exportToExcel = async () => {
  try {
    exporting.value = true;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Laporan Penjualan CV Sari Bumi Sakti"],
      ["Periode", `${startDate.value} - ${endDate.value}`],
      [""],
      ["Total Penjualan", `Rp ${formatCurrency(reportData.value.totalSales)}`],
      ["Total Transaksi", reportData.value.totalTransactions],
      [
        "Rata-rata per Transaksi",
        `Rp ${formatCurrency(reportData.value.averageTransaction)}`,
      ],
      ["Profit Margin", `${reportData.value.profitMargin}%`],
    ];

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");

    // Top products sheet
    const productsWS = XLSX.utils.json_to_sheet(reportData.value.topProducts);
    XLSX.utils.book_append_sheet(wb, productsWS, "Produk Terlaris");

    // Top customers sheet
    const customersWS = XLSX.utils.json_to_sheet(reportData.value.topCustomers);
    XLSX.utils.book_append_sheet(wb, customersWS, "Pelanggan Teratas");

    // Save file
    const fileName = `Laporan_Penjualan_${startDate.value}_${endDate.value}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("Export to Excel failed:", error);
  } finally {
    exporting.value = false;
  }
};

const exportToPDF = async () => {
  try {
    exporting.value = true;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Laporan Penjualan CV Sari Bumi Sakti", 20, 20);

    // Period
    doc.setFontSize(12);
    doc.text(`Periode: ${startDate.value} - ${endDate.value}`, 20, 35);

    // Summary
    doc.text("Ringkasan:", 20, 50);
    doc.text(
      `Total Penjualan: Rp ${formatCurrency(reportData.value.totalSales)}`,
      20,
      65
    );
    doc.text(`Total Transaksi: ${reportData.value.totalTransactions}`, 20, 75);
    doc.text(
      `Rata-rata per Transaksi: Rp ${formatCurrency(
        reportData.value.averageTransaction
      )}`,
      20,
      85
    );
    doc.text(`Profit Margin: ${reportData.value.profitMargin}%`, 20, 95);

    // Save
    const fileName = `Laporan_Penjualan_${startDate.value}_${endDate.value}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Export to PDF failed:", error);
  } finally {
    exporting.value = false;
  }
};

const exportCustomerReport = () => {
  const ws = XLSX.utils.json_to_sheet(reportData.value.topCustomers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pelanggan Teratas");
  XLSX.writeFile(
    wb,
    `Laporan_Pelanggan_${startDate.value}_${endDate.value}.xlsx`
  );
};

const exportCashierReport = () => {
  const ws = XLSX.utils.json_to_sheet(reportData.value.cashierPerformance);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Performa Kasir");
  XLSX.writeFile(wb, `Laporan_Kasir_${startDate.value}_${endDate.value}.xlsx`);
};

const printReport = () => {
  window.print();
};

onMounted(async () => {
  updateDateRange("thisMonth");
  await Promise.all([
    transactionStore.fetchTransactions(),
    productStore.fetchProducts(),
  ]);
  await generateReport();
});
</script>

<style scoped>
@media print {
  .v-btn {
    display: none !important;
  }
}
</style>
