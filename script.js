document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.getElementById('burger-menu');
    const navLinks = document.getElementById('nav-links');
    const navbar = document.querySelector('.navbar');
  
    // Toggle visibility using a dedicated class for clarity
    burgerMenu.addEventListener('click', () => {
      navLinks.classList.toggle('show'); // Replace 'active' with 'show' (adjust class name if needed)
    });
  });
  