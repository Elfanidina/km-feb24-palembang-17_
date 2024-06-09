let cachedData = null;

// Variabel untuk menyimpan data yang akan dipakai untuk visualisasi dan filter
let filteredData = [];

// Fungsi untuk mengambil data jika belum ada dalam cache
async function fetchDataIfNeeded() {
  // Cek apakah data sudah ada dalam cache
  if (cachedData === null) {
    try {
      // Jika belum, fetch data dari URL
      const response = await fetch(
        "https://raw.githubusercontent.com/Nindiiina12/coffee/main/coffee.json"
      );
      cachedData = await response.json();
      // Set filteredData sama dengan cachedData saat pertama kali diambil
      filteredData = cachedData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  // Kembalikan data yang di-fetch (atau yang ada dalam cache)
  return cachedData;
}

// Filtering Data

function filterData(event) {
  if (event) {
    event.preventDefault();  // Mencegah submit form default
  }
  const month = document.getElementById("monthDropdown").value;
  const location = document.getElementById("storeDropdown").value;

  if (cachedData === null) {
    console.error("Data belum di-fetch. Panggil fetchDataIfNeeded() terlebih dahulu.");
    return;
  }

  filteredData = cachedData.filter(item => {
    const [monthItem] = item.transaction_date.split("/").map(Number);
    const monthMatch = month === "" || monthItem === Number(month);
    const locationMatch = location === "" || item.store_location === location;
    return monthMatch && locationMatch;
  });

  calculateTotalRevenue(filteredData);
  calculateTotalProductSales(filteredData);

  updateMonthlyRevenueChart(filteredData);
  updateRevenueByDayOfWeekChart(filteredData);
  updateCategoryProductQtyChart(filteredData);
  updateTopProductsQtyChart(filteredData);
  updateLowestProductsQtyChart(filteredData);
}

// Fungsi untuk mengupdate chart dan table dengan data awal
function initializeChartsAndTables(data) {
  calculateTotalRevenue(data);
  calculateTotalProductSales(data);

  updateMonthlyRevenueChart(data);
  updateRevenueByDayOfWeekChart(data);
  updateCategoryProductQtyChart(data);
  updateTopProductsQtyChart(data);
  updateLowestProductsQtyChart(data);
}

// Menunggu hingga DOM siap sebelum menambahkan event listener dan menginisialisasi chart dan table
document.addEventListener("DOMContentLoaded", () => {
  // Event listener untuk tombol filter
  document.getElementById("applyFiltersButton").addEventListener("click", filterData);

  // Fetch data saat halaman dimuat
  fetchDataIfNeeded().then(data => {
    if (data) {
      initializeChartsAndTables(data);
    }
  }).catch(error => {
    console.error("Error fetching data:", error);
  });
});

// Memanggil fungsi fetchDataIfNeeded dan menampilkan hasilnya di console
fetchDataIfNeeded().then(data => {
  console.log(data);
}).catch(error => {
  console.error('Error fetching data:', error);
});

// Fungsi untuk menghitung total revenue
function calculateTotalRevenue(data) {
  const totalRevenue = data.reduce((total, item) => total + item.transaction_qty * item.unit_price, 0);
  displayTotalRevenue(totalRevenue);
}

// Fungsi untuk menghitung total product sales
function calculateTotalProductSales(data) {
  const totalProductSales = data.reduce((total, item) => total + item.transaction_qty, 0);
  displayTotalProductSales(totalProductSales);
}

// Fungsi untuk menampilkan total revenue
function displayTotalRevenue(total) {
  const totalRevenueElement = document.getElementById("totalRevenue");
  totalRevenueElement.textContent = `$${total.toFixed(2)}`;
}

// Fungsi untuk menampilkan total product sales
function displayTotalProductSales(total) {
  const totalProductSalesElement = document.getElementById("totalProductSales");
  totalProductSalesElement.textContent = total;
}

// End of Filtering

let monthlyRevenueChart, revenueByDayOfWeekChart, categoryProductQtyChart, topProductsQtyChart, lowestProductsQtyChart;

// Function to get filtered data
function getFilteredData() {
  return filteredData;
}

// Function to update the monthly revenue chart
function updateMonthlyRevenueChart(data) {
  const monthlyRevenue = {};
  data.forEach(item => {
    const [month] = item.transaction_date.split("/").map(Number);
    if (!monthlyRevenue[month]) {
      monthlyRevenue[month] = 0;
    }
    monthlyRevenue[month] += item.transaction_qty * item.unit_price;
  });

  const labels = Object.keys(monthlyRevenue).map(month => new Date(2023, month - 1).toLocaleString('default', { month: 'long' }));
  const dataset = Object.values(monthlyRevenue);

  const config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Revenue',
        data: dataset,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 180000
        }
      },
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'start',
          offset: -20,
          color: 'blue',
          font: {
            weight: 'bold'
          },
          formatter: (value) => {
            return value.toFixed(2); // Ensure values have two decimal places
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  };

  const ctx = document.getElementById('monthlyRevenueChart').getContext('2d');
  if (monthlyRevenueChart) {
    monthlyRevenueChart.data = config.data;
    monthlyRevenueChart.update();
  } else {
    monthlyRevenueChart = new Chart(ctx, config);
  }
}

// Function to update the revenue by day of the week chart
function updateRevenueByDayOfWeekChart(data) {
  const dayOfWeekRevenue = Array(7).fill(0);
  data.forEach(item => {
    const [month, day, year] = item.transaction_date.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    dayOfWeekRevenue[dayOfWeek] += item.transaction_qty * item.unit_price;
  });

  const config = {
    context: document.getElementById('revenueByDayOfWeekChart').getContext('2d'),
    type: 'bar',
    data: {
      labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      datasets: [{
        label: 'Revenue by Day of Week',
        data: dayOfWeekRevenue,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 105000
        }
      },
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'start',
          offset: -20,
          color: 'purple',
          font: {
            weight: 'bold'
          },
          formatter: (value) => {
            return value.toFixed(2); // Ensure values have two decimal places
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  };

  if (revenueByDayOfWeekChart) {
    revenueByDayOfWeekChart.data = config.data;
    revenueByDayOfWeekChart.update();
  } else {
    revenueByDayOfWeekChart = new Chart(config.context, config);
  }
}

// Function to update the category product quantity chart
function updateCategoryProductQtyChart(data) {
  const categoryQty = {};
  data.forEach(item => {
    if (!categoryQty[item.product_category]) {
      categoryQty[item.product_category] = 0;
    }
    categoryQty[item.product_category] += item.transaction_qty;
  });

  const labels = Object.keys(categoryQty);
  const dataset = Object.values(categoryQty);

  const config = {
    context: document.getElementById('categoryProductQtyChart').getContext('2d'),
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Category Product Qty Sold',
        data: dataset,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 90000
        }
      },
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'start',
          offset: -20,
          color: 'orange',
          font: {
            weight: 'bold'
          },
          formatter: (value, ctx) => {
            return value;
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  };

  const ctx = document.getElementById('categoryProductQtyChart').getContext('2d');
  if (categoryProductQtyChart) {
    categoryProductQtyChart.data = config.data;
    categoryProductQtyChart.update();
  } else {
    categoryProductQtyChart = new Chart(ctx, config);
  }


}

// Function to update the top products sold by quantity chart

function updateTopProductsQtyChart(data = []) {
  const productQty = {};
  data.forEach(item => {
    if (!productQty[item.product_detail]) {
      productQty[item.product_detail] = 0;
    }
    productQty[item.product_detail] += item.transaction_qty;
  });

  const sortedProducts = Object.entries(productQty).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = sortedProducts.map(([name]) => name);
  const dataset = sortedProducts.map(([, qty]) => qty);

  const config = {
    context: document.getElementById('topProductsQtyChart').getContext('2d'),
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Top Products Sold by Qty',
        data: dataset,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 5000
        }
      },
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'start',
          offset: -20,
          color: 'blue',
          font: {
            weight: 'bold'
          },
          formatter: (value) => {
            return value;
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  };


  const ctx = document.getElementById('topProductsQtyChart').getContext('2d');
  if (topProductsQtyChart) {
    topProductsQtyChart.data = config.data;
    topProductsQtyChart.update();
  } else {
    topProductsQtyChart = new Chart(ctx, config);
  }
}


// Function to update the lowest products sold by quantity chart

function updateLowestProductsQtyChart(data = []) {
  const productQty = {};
  data.forEach(item => {
    if (!productQty[item.product_detail]) {
      productQty[item.product_detail] = 0;
    }
    productQty[item.product_detail] += item.transaction_qty;
  });

  const sortedProducts = Object.entries(productQty).sort((a, b) => a[1] - b[1]).slice(0, 5);
  const labels = sortedProducts.map(([product]) => product);
  const dataset = sortedProducts.map(([, qty]) => qty);

  const config = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Lowest Products Sold by Qty',
        data: dataset,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 200
        }
      },
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'start',
          offset: -20,
          color: 'red',
          font: {
            weight: 'bold'
          },
          formatter: (value) => {
            return value;
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  };

  const ctx = document.getElementById('lowestProductsQtyChart').getContext('2d');
  if (lowestProductsQtyChart) {
    lowestProductsQtyChart.data = config.data;
    lowestProductsQtyChart.update();
  } else {
    lowestProductsQtyChart = new Chart(ctx, config);
  }
}

// End of Chart

//DataTable
$(document).ready(async function () {
  // Fetch data
  const data = await fetchDataIfNeeded();

  // Filter data to get 100 entries from each month
  const filteredData = {};
  data.forEach(entry => {
    const date = new Date(entry.transaction_date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (!filteredData[monthYear]) {
      filteredData[monthYear] = [];
    }
    if (filteredData[monthYear].length < 25) {
      filteredData[monthYear].push(entry);
    }
  });

  // Populate DataTable
  const table = $('#dataTable').DataTable({
    data: Object.values(filteredData).flat(),
    columns: [
      { data: 'transaction_date' },
      { data: 'transaction_qty' },
      { data: 'store_location' },
      { data: 'unit_price' },
      { data: 'product_category' },
      { data: 'product_detail' }
    ]
  });
});


async function fetchDataIfNeeded() {
  if (cachedData === null) {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/Nindiiina12/coffee/main/coffee.json"
      );
      cachedData = await response.json();
      filteredData = cachedData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  return cachedData;
}

document.addEventListener('DOMContentLoaded', () => {
  const burgerMenu = document.getElementById('burger-menu');
  const navLinks = document.getElementById('nav-links');
  const navbar = document.querySelector('.navbar');

  // Toggle visibility using a dedicated class for clarity
  burgerMenu.addEventListener('click', () => {
    navLinks.classList.toggle('show'); // Replace 'active' with 'show' (adjust class name if needed)
  });
});
