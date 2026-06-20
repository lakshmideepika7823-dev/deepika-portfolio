document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // STICKY HEADER & NAV HIGHLIGHTS (SCROLL SPY)
  // ==========================================================================
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const sections = document.querySelectorAll('.scroll-section');

  window.addEventListener('scroll', () => {
    // Sticky Header class toggle
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }

    // Scroll Spy: Highlight active navigation links
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120; // Offset for sticky header
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      updateActiveLinks(currentSectionId);
    }
  });

  function updateActiveLinks(id) {
    // Desktop Nav
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
      }
    });

    // Mobile Nav
    mobileNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
      }
    });
  }

  // ==========================================================================
  // MOBILE MENU INTERACTIVITY
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIcon = mobileMenuBtn.querySelector('.menu-icon');
  const closeIcon = mobileMenuBtn.querySelector('.close-icon');

  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      mobileMenu.classList.remove('open');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      document.body.style.overflow = 'auto'; // Re-enable body scroll
    } else {
      mobileMenu.classList.add('open');
      menuIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Disable body scroll when menu open
    }
  }

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

  // Close mobile menu when clicking a link
  const allMobileLinks = document.querySelectorAll('.mobile-nav-link');
  allMobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  // ==========================================================================
  // ATTENDANCE & BUNK PLANNER LOGIC
  // ==========================================================================
  const presentClassesInput = document.getElementById('presentClasses');
  const totalClassesInput = document.getElementById('totalClasses');
  const reqPercentInput = document.getElementById('reqPercent');
  const calcBtn = document.getElementById('calcBtn');
  
  const resPercent = document.getElementById('resPercent');
  const resStatus = document.getElementById('resStatus');
  const resAdvice = document.getElementById('resAdvice');

  function calculateAttendance() {
    let present = parseInt(presentClassesInput.value);
    let total = parseInt(totalClassesInput.value);
    let required = parseFloat(reqPercentInput.value);

    // Validate inputs
    if (isNaN(present) || isNaN(total) || isNaN(required)) {
      showWidgetError('Please fill in all inputs with valid numbers.');
      return;
    }

    if (present < 0 || total < 0 || required <= 0 || required > 100) {
      showWidgetError('Please check your values. Percentage must be between 1 and 100.');
      return;
    }

    if (present > total) {
      showWidgetError('Attended classes cannot exceed total classes conducted.');
      return;
    }

    let percentage = (present / total) * 100;
    resPercent.textContent = `${percentage.toFixed(1)}%`;

    if (percentage >= required) {
      // User is safe. Calculate how many classes they can bunk.
      // Math: present / (total + bunk) >= required/100 => bunk <= (present * 100 - required * total) / required
      resStatus.textContent = 'Status: Safe';
      resStatus.className = 'status-safe';

      if (required === 100) {
        resAdvice.textContent = 'You cannot bunk any classes if you want to maintain 100% attendance.';
        return;
      }

      let maxBunk = Math.floor((present * 100 - required * total) / required);
      if (maxBunk < 0) maxBunk = 0; // Guard against small rounding issues
      
      if (maxBunk === 0) {
        resAdvice.textContent = `You are on the limit! Bunking another class will drop your attendance below ${required}%.`;
      } else {
        resAdvice.textContent = `You can safely bunk ${maxBunk} more class${maxBunk > 1 ? 'es' : ''} without falling below ${required}%.`;
      }
    } else {
      // User needs to attend more classes.
      // Math: (present + x) / (total + x) >= required/100 => x >= (required * total - 100 * present) / (100 - required)
      resStatus.textContent = 'Status: Below Criteria';
      resStatus.className = 'status-danger';

      if (required === 100) {
        resAdvice.textContent = 'You already missed a class, you can never reach 100% attendance.';
        return;
      }

      let requiredClasses = Math.ceil((required * total - 100 * present) / (100 - required));
      resAdvice.textContent = `You need to attend ${requiredClasses} more class${requiredClasses > 1 ? 'es' : ''} consecutively to reach your goal of ${required}%.`;
    }
  }

  function showWidgetError(message) {
    resPercent.textContent = '--%';
    resStatus.textContent = 'Invalid Input';
    resStatus.className = 'status-danger';
    resAdvice.textContent = message;
  }

  // Calculate initially on load
  calculateAttendance();

  // Recalculate on click or when user adjusts values
  calcBtn.addEventListener('click', calculateAttendance);
  [presentClassesInput, totalClassesInput, reqPercentInput].forEach(input => {
    input.addEventListener('input', calculateAttendance);
  });

  // ==========================================================================
  // CONTACT FORM SIMULATION & VALIDATION
  // ==========================================================================
  const contactForm = document.getElementById('portfolioContactForm');
  const formSubmitBtn = document.getElementById('formSubmitBtn');
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
      showFormStatus('Please fill in all fields before sending.', 'error');
      return;
    }

    // Disable button & show sending state
    formSubmitBtn.disabled = true;
    formSubmitBtn.querySelector('span').textContent = 'Sending Message...';
    formStatus.classList.add('hidden');

    // Simulate API request delay (1.5 seconds)
    setTimeout(() => {
      showFormStatus(`Thank you, ${name}! Your message has been sent successfully.`, 'success');
      contactForm.reset();
      
      // Re-enable button after submit
      formSubmitBtn.disabled = false;
      formSubmitBtn.querySelector('span').textContent = 'Send Message';
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        formStatus.classList.add('hidden');
      }, 5000);
      
    }, 1500);
  });

  function showFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`; // Apply success/error class
    formStatus.classList.remove('hidden');
  }

  // Update footer year dynamically
  document.getElementById('currentYear').textContent = new Date().getFullYear();
});
