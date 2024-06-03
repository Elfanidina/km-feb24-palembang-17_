document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.getElementById('burger-menu');
    const navLinks = document.getElementById('nav-links');
    const navbar = document.querySelector('.navbar');
  
    // Toggle visibility using a dedicated class for clarity
    burgerMenu.addEventListener('click', () => {
      navLinks.classList.toggle('show'); // Replace 'active' with 'show' (adjust class name if needed)
    });
  });
  

  $(document).ready(function() {
    fetch('product.json')
      .then(response => response.json())
      .then(data => {
  
        let table = $('#productTable').DataTable({
          data: data,
          dom: 'lrftp',
          
          columns: [
            { data: 'product_id' },
            { data: 'product_category' },
            { data: 'store_location' },
            { data: 'transaction_qty' },
            { data: 'unit_price' }
          ]
        });
  
      })
      .catch(error => console.error('Error fetching data:', error));
  });
  