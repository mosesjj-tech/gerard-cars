/* =====================================================
   GERARD CARS - COMPLETE WEBSITE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* =====================================================
     MOBILE NAVIGATION
  ===================================================== */

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("active");

      menuToggle.setAttribute("aria-expanded", String(isOpen));

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
      });
    });
  }

  /* =====================================================
     CURRENT YEAR
  ===================================================== */

  const currentYearElements = document.querySelectorAll(".current-year");

  currentYearElements.forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  /* =====================================================
     DATABASE CONFIGURATION
     
     IMPORTANT:
     We are now using Railway instead of Cloudflare Tunnel.
  ===================================================== */

  const GERARD_API_URL =
    "https://mosesjj-techgithubio-production.up.railway.app";

  /* =====================================================
     WEBSITE ELEMENTS
  ===================================================== */

  const carsContainer = document.getElementById("carsContainer");
  const carsLoading = document.getElementById("carsLoading");
  const vehicleCount = document.getElementById("vehicleCount");
  const carSelect = document.getElementById("car");
  const searchInput = document.getElementById("carSearch");
  const noResults = document.getElementById("noResults");

  /* =====================================================
     MODAL ELEMENTS
  ===================================================== */

  const carModal = document.getElementById("carModal");
  const modalImage = document.getElementById("modalImage");
  const modalCarName = document.getElementById("modalCarName");
  const modalPrice = document.getElementById("modalPrice");
  const modalYear = document.getElementById("modalYear");
  const modalTransmission = document.getElementById("modalTransmission");
  const modalFuel = document.getElementById("modalFuel");
  const modalLocation = document.getElementById("modalLocation");
  const modalWhatsApp = document.getElementById("modalWhatsApp");
  const closeModal = document.getElementById("closeModal");

  let allCars = [];

  /* =====================================================
     IMAGE URL FIX

     Converts database image paths such as:

     images/toyota-camry.png

     into:

     https://mosesjj-techgithubio-production.up.railway.app/images/toyota-camry.png

     This allows the deployed website to load vehicle
     pictures from the Railway backend.
  ===================================================== */

  function getImageUrl(imagePath) {
    const fallbackImage = "/images/toyota-camry.png";

    if (!imagePath) {
      return GERARD_API_URL + fallbackImage;
    }

    const image = String(imagePath).trim();

    if (!image) {
      return GERARD_API_URL + fallbackImage;
    }

    /* Already a complete URL */
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    /* Remove leading ./ */
    let cleanPath = image.replace(/^\.\//, "");

    /* Remove leading slash */
    cleanPath = cleanPath.replace(/^\/+/, "");

    /*
      If the database contains:

      images/car.png

      use:

      https://railway-url/images/car.png
    */

    return `${GERARD_API_URL}/${cleanPath}`;
  }

  /* =====================================================
     FORMAT PRICE
  ===================================================== */

  function formatPrice(price) {
    const number = Number(price);

    if (Number.isNaN(number)) {
      return price || "Contact Dealer";
    }

    return "₦" + number.toLocaleString("en-NG");
  }

  /* =====================================================
     ESCAPE HTML
  ===================================================== */

  function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
  }

  /* =====================================================
     WHATSAPP LINK
  ===================================================== */

  function createWhatsAppLink(carName) {
    const message =
      `Hello Gerard Cars, I am interested in the ${carName}. ` +
      `Please provide more information.`;

    return "https://wa.me/2347048329554?text=" + encodeURIComponent(message);
  }

  /* =====================================================
     CREATE CAR CARD
  ===================================================== */

  function createCarCard(car) {
    const article = document.createElement("article");

    article.className = "car-card";

    const carName = `${car.brand || ""} ${car.model || ""}`.trim();

    const price = formatPrice(car.price);

    const year = car.year || "Contact Dealer";

    const description =
      car.description || "Quality vehicle available at Gerard Cars.";

    /*
      Convert the database image path into the
      public Railway image URL.
    */

    const image = getImageUrl(car.image);

    const availability = Number(car.available) === 1 ? "Available" : "Sold";

    article.dataset.car = carName.toLowerCase();

    article.innerHTML = `
      <div class="car-photo">

        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(carName)}"
          loading="lazy"
          onerror="this.style.display='none';"
        />

        <span class="car-badge">
          ${escapeHTML(availability)}
        </span>

        <div class="car-name">
          ${escapeHTML(carName)}
        </div>

      </div>

      <div class="car-info">

        <span class="car-category">
          ${escapeHTML(car.category || "Vehicle")}
        </span>

        <h3>
          ${escapeHTML(carName)}
        </h3>

        <p>
          ${escapeHTML(description)}
        </p>

        <div class="price">
          ${escapeHTML(price)}
        </div>

        <div class="car-buttons">

          <button
            class="btn details-btn"
            type="button"
          >
            View Details
          </button>

          <a
            class="btn outline-btn"
            href="${createWhatsAppLink(carName)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact Dealer
          </a>

        </div>

      </div>
    `;

    /* =====================================================
       VIEW DETAILS
    ===================================================== */

    const detailsButton = article.querySelector(".details-btn");

    detailsButton.addEventListener("click", function () {
      openCarModal(car);
    });

    return article;
  }

  /* =====================================================
     OPEN CAR MODAL
  ===================================================== */

  function openCarModal(car) {
    if (!carModal) {
      return;
    }

    const carName = `${car.brand || ""} ${car.model || ""}`.trim();

    /*
      Use the Railway image URL here too.
    */

    const image = getImageUrl(car.image);

    if (modalImage) {
      modalImage.src = image;
      modalImage.alt = carName;
    }

    if (modalCarName) {
      modalCarName.textContent = carName;
    }

    if (modalPrice) {
      modalPrice.textContent = formatPrice(car.price);
    }

    if (modalYear) {
      modalYear.textContent = car.year || "Contact Dealer";
    }

    if (modalTransmission) {
      modalTransmission.textContent = car.transmission || "Automatic";
    }

    if (modalFuel) {
      modalFuel.textContent = car.fuel || "Petrol";
    }

    if (modalLocation) {
      modalLocation.textContent = car.location || "Ago, Lagos, Nigeria";
    }

    if (modalWhatsApp) {
      modalWhatsApp.href = createWhatsAppLink(carName);
    }

    carModal.style.display = "flex";

    carModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    setTimeout(function () {
      if (closeModal) {
        closeModal.focus();
      }
    }, 50);
  }

  /* =====================================================
     CLOSE CAR MODAL
  ===================================================== */

  function closeCarModal() {
    if (!carModal) {
      return;
    }

    carModal.style.display = "none";

    carModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
  }

  if (closeModal) {
    closeModal.addEventListener("click", closeCarModal);
  }

  if (carModal) {
    carModal.addEventListener("click", function (event) {
      if (event.target === carModal) {
        closeCarModal();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeCarModal();
    }
  });

  /* =====================================================
     UPDATE CAR SELECT
  ===================================================== */

  function updateCarSelect(cars) {
    if (!carSelect) {
      return;
    }

    carSelect.innerHTML = '<option value="">Select a car</option>';

    cars.forEach(function (car) {
      const option = document.createElement("option");

      const carName = `${car.brand || ""} ${car.model || ""}`.trim();

      option.value = carName;

      option.textContent = carName;

      carSelect.appendChild(option);
    });
  }

  /* =====================================================
     DISPLAY CARS
  ===================================================== */

  function displayCars(cars) {
    if (!carsContainer) {
      return;
    }

    carsContainer.innerHTML = "";

    if (!cars || cars.length === 0) {
      if (carsLoading) {
        carsLoading.style.display = "none";
      }

      if (noResults) {
        noResults.style.display = "block";

        const heading = noResults.querySelector("h3");

        const paragraph = noResults.querySelector("p");

        if (heading) {
          heading.textContent = "No cars available";
        }

        if (paragraph) {
          paragraph.textContent = "Please check back soon.";
        }
      }

      if (vehicleCount) {
        vehicleCount.textContent = "0+";
      }

      return;
    }

    if (carsLoading) {
      carsLoading.style.display = "none";
    }

    if (noResults) {
      noResults.style.display = "none";
    }

    if (vehicleCount) {
      vehicleCount.textContent = `${cars.length}+`;
    }

    cars.forEach(function (car) {
      const card = createCarCard(car);

      carsContainer.appendChild(card);
    });

    updateCarSelect(cars);
  }

  /* =====================================================
     LOAD CARS FROM DATABASE
  ===================================================== */

  async function loadCars() {
    if (!carsContainer) {
      return;
    }

    try {
      if (carsLoading) {
        carsLoading.style.display = "block";

        carsLoading.textContent = "Loading available cars...";
      }

      console.log("🔗 Connecting to Gerard Cars API:", GERARD_API_URL);

      const response = await fetch(`${GERARD_API_URL}/api/cars`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      console.log("🚗 Cars received from database:", data);

      if (Array.isArray(data)) {
        allCars = data;
      } else if (data && Array.isArray(data.cars)) {
        allCars = data.cars;
      } else {
        allCars = [];
      }

      displayCars(allCars);

      console.log(`✅ ${allCars.length} cars loaded successfully.`);
    } catch (error) {
      console.error("❌ Unable to load cars:", error);

      if (carsLoading) {
        carsLoading.style.display = "block";

        carsLoading.textContent = "Unable to load cars from the server.";
      }

      if (noResults) {
        noResults.style.display = "block";

        const heading = noResults.querySelector("h3");

        const paragraph = noResults.querySelector("p");

        if (heading) {
          heading.textContent = "Unable to load vehicles";
        }

        if (paragraph) {
          paragraph.textContent = "Please check the Gerard Cars server.";
        }
      }
    }
  }

  /* =====================================================
     SEARCH CARS
  ===================================================== */

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchText = searchInput.value.toLowerCase().trim();

      if (searchText === "") {
        displayCars(allCars);

        return;
      }

      const filteredCars = allCars.filter(function (car) {
        const searchableText = `
              ${car.brand || ""}
              ${car.model || ""}
              ${car.description || ""}
              ${car.year || ""}
              ${car.category || ""}
            `.toLowerCase();

        return searchableText.includes(searchText);
      });

      displayCars(filteredCars);

      if (filteredCars.length === 0) {
        if (noResults) {
          noResults.style.display = "block";

          const heading = noResults.querySelector("h3");

          const paragraph = noResults.querySelector("p");

          if (heading) {
            heading.textContent = "No cars found";
          }

          if (paragraph) {
            paragraph.textContent = "Try searching for another vehicle.";
          }
        }
      }
    });
  }

  /* =====================================================
     CONTACT FORM
  ===================================================== */

  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function () {
      const submitButton = contactForm.querySelector(".form-submit");

      if (submitButton) {
        submitButton.textContent = "Sending...";

        submitButton.disabled = true;

        setTimeout(function () {
          submitButton.disabled = false;

          submitButton.textContent = "Send Inquiry";
        }, 5000);
      }
    });
  }

  /* =====================================================
     SMOOTH NAVIGATION
  ===================================================== */

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  /* =====================================================
     START WEBSITE
  ===================================================== */

  console.log("🚗 GERARD CARS WEBSITE LOADED");

  console.log("🔗 Railway API:", GERARD_API_URL);

  loadCars();
});
