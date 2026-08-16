```javascript
/* =====================================================
   GERARD CARS - COMPLETE WEBSITE JAVASCRIPT
   Includes:
   - Mobile navigation
   - Vehicle database
   - Vehicle search
   - Vehicle details modal
   - WhatsApp links
   - Contact form
   - Gerard Cars AI chatbot
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
        isOpen ? "Close navigation menu" : "Open navigation menu"
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

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    let cleanPath = image.replace(/^\.\//, "");
    cleanPath = cleanPath.replace(/^\/+/, "");

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

    return (
      "https://wa.me/2347048329554?text=" +
      encodeURIComponent(message)
    );
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

    const image = getImageUrl(car.image);

    const availability =
      Number(car.available) === 1 ? "Available" : "Sold";

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
      modalTransmission.textContent =
        car.transmission || "Automatic";
    }

    if (modalFuel) {
      modalFuel.textContent = car.fuel || "Petrol";
    }

    if (modalLocation) {
      modalLocation.textContent =
        car.location || "Ago, Lagos, Nigeria";
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

    carSelect.innerHTML =
      '<option value="">Select a car</option>';

    cars.forEach(function (car) {
      const option = document.createElement("option");

      const carName =
        `${car.brand || ""} ${car.model || ""}`.trim();

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

        carsLoading.textContent =
          "Loading available cars...";
      }

      console.log(
        "🔗 Connecting to Gerard Cars API:",
        GERARD_API_URL
      );

      const response = await fetch(
        `${GERARD_API_URL}/api/cars`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "🚗 Cars received from database:",
        data
      );

      if (Array.isArray(data)) {
        allCars = data;
      } else if (data && Array.isArray(data.cars)) {
        allCars = data.cars;
      } else {
        allCars = [];
      }

      displayCars(allCars);

      console.log(
        `✅ ${allCars.length} cars loaded successfully.`
      );
    } catch (error) {
      console.error(
        "❌ Unable to load cars:",
        error
      );

      if (carsLoading) {
        carsLoading.style.display = "block";

        carsLoading.textContent =
          "Unable to load cars from the server.";
      }

      if (noResults) {
        noResults.style.display = "block";

        const heading = noResults.querySelector("h3");
        const paragraph = noResults.querySelector("p");

        if (heading) {
          heading.textContent =
            "Unable to load vehicles";
        }

        if (paragraph) {
          paragraph.textContent =
            "Please check the Gerard Cars server.";
        }
      }
    }
  }

  /* =====================================================
     SEARCH CARS
  ===================================================== */

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchText =
        searchInput.value.toLowerCase().trim();

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

          const heading =
            noResults.querySelector("h3");

          const paragraph =
            noResults.querySelector("p");

          if (heading) {
            heading.textContent = "No cars found";
          }

          if (paragraph) {
            paragraph.textContent =
              "Try searching for another vehicle.";
          }
        }
      }
    });
  }

  /* =====================================================
     CONTACT FORM
  ===================================================== */

  const contactForm =
    document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function () {
      const submitButton =
        contactForm.querySelector(".form-submit");

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

  document
    .querySelectorAll('a[href^="#"]')
    .forEach(function (link) {
      link.addEventListener("click", function (event) {
        const targetId =
          link.getAttribute("href");

        if (!targetId || targetId === "#") {
          return;
        }

        const target =
          document.querySelector(targetId);

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
     GERARD CARS AI CHATBOT
  ===================================================== */

  function createChatbot() {
    /* Prevent duplicate chatbot */
    if (document.getElementById("gerardChatbot")) {
      return;
    }

    const chatbot = document.createElement("div");

    chatbot.id = "gerardChatbot";

    chatbot.innerHTML = `
      <button
        id="gerardChatButton"
        type="button"
        aria-label="Open Gerard Cars AI assistant"
      >
        💬
        <span>Chat with us</span>
      </button>

      <div
        id="gerardChatWindow"
        aria-hidden="true"
      >

        <div class="gerard-chat-header">

          <div>
            <strong>🚗 Gerard Cars</strong>
            <small>AI Customer Assistant</small>
          </div>

          <button
            id="gerardChatClose"
            type="button"
            aria-label="Close chatbot"
          >
            ×
          </button>

        </div>

        <div
          id="gerardChatMessages"
          class="gerard-chat-messages"
        >

          <div class="gerard-message bot">
            Hello! 👋 Welcome to Gerard Cars.
            <br><br>
            I can help you with our available cars,
            prices, vehicle information and how to
            contact us.
            <br><br>
            What would you like to know?
          </div>

        </div>

        <div class="gerard-chat-input-area">

          <input
            id="gerardChatInput"
            type="text"
            placeholder="Ask about our cars..."
            autocomplete="off"
          />

          <button
            id="gerardChatSend"
            type="button"
          >
            Send
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(chatbot);

    /* =====================================================
       CHATBOT STYLES
    ===================================================== */

    const style = document.createElement("style");

    style.id = "gerardChatbotStyles";

    style.textContent = `
      #gerardChatbot {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 99999;
        font-family: Arial, Helvetica, sans-serif;
      }

      #gerardChatButton {
        border: none;
        background: #111827;
        color: white;
        border-radius: 50px;
        padding: 15px 20px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 8px 25px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.2s ease;
      }

      #gerardChatButton:hover {
        transform: translateY(-2px);
      }

      #gerardChatWindow {
        display: none;
        position: absolute;
        right: 0;
        bottom: 65px;
        width: 360px;
        max-width: calc(100vw - 30px);
        height: 520px;
        max-height: calc(100vh - 100px);
        background: white;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 15px 50px rgba(0,0,0,0.3);
        border: 1px solid #e5e7eb;
      }

      #gerardChatWindow.open {
        display: flex;
        flex-direction: column;
      }

      .gerard-chat-header {
        background: #111827;
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .gerard-chat-header strong {
        display: block;
        font-size: 16px;
      }

      .gerard-chat-header small {
        display: block;
        margin-top: 4px;
        opacity: 0.8;
        font-size: 12px;
      }

      #gerardChatClose {
        border: none;
        background: transparent;
        color: white;
        font-size: 28px;
        cursor: pointer;
        line-height: 1;
      }

      .gerard-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        background: #f8fafc;
      }

      .gerard-message {
        max-width: 85%;
        padding: 11px 13px;
        margin-bottom: 10px;
        border-radius: 14px;
        line-height: 1.45;
        font-size: 14px;
        word-wrap: break-word;
      }

      .gerard-message.bot {
        background: white;
        color: #111827;
        border: 1px solid #e5e7eb;
        margin-right: auto;
        border-bottom-left-radius: 4px;
      }

      .gerard-message.user {
        background: #111827;
        color: white;
        margin-left: auto;
        border-bottom-right-radius: 4px;
      }

      .gerard-message.typing {
        opacity: 0.7;
        font-style: italic;
      }

      .gerard-chat-input-area {
        display: flex;
        gap: 8px;
        padding: 12px;
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      #gerardChatInput {
        flex: 1;
        min-width: 0;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 11px;
        font-size: 14px;
        outline: none;
      }

      #gerardChatInput:focus {
        border-color: #111827;
      }

      #gerardChatSend {
        border: none;
        background: #111827;
        color: white;
        border-radius: 10px;
        padding: 0 15px;
        font-weight: 700;
        cursor: pointer;
      }

      #gerardChatSend:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 600px) {

        #gerardChatbot {
          right: 12px;
          bottom: 12px;
        }

        #gerardChatButton {
          width: 56px;
          height: 56px;
          padding: 0;
          justify-content: center;
          border-radius: 50%;
          font-size: 22px;
        }

        #gerardChatButton span {
          display: none;
        }

        #gerardChatWindow {
          position: fixed;
          right: 10px;
          left: 10px;
          bottom: 78px;
          width: auto;
          height: min(560px, calc(100vh - 100px));
          max-width: none;
        }
      }
    `;

    document.head.appendChild(style);

    /* =====================================================
       CHATBOT ELEMENTS
    ===================================================== */

    const chatButton =
      document.getElementById("gerardChatButton");

    const chatWindow =
      document.getElementById("gerardChatWindow");

    const chatClose =
      document.getElementById("gerardChatClose");

    const chatMessages =
      document.getElementById("gerardChatMessages");

    const chatInput =
      document.getElementById("gerardChatInput");

    const chatSend =
      document.getElementById("gerardChatSend");

    /* =====================================================
       OPEN CHAT
    ===================================================== */

    function openChat() {
      chatWindow.classList.add("open");

      chatWindow.setAttribute(
        "aria-hidden",
        "false"
      );

      setTimeout(function () {
        chatInput.focus();
      }, 100);
    }

    /* =====================================================
       CLOSE CHAT
    ===================================================== */

    function closeChat() {
      chatWindow.classList.remove("open");

      chatWindow.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    chatButton.addEventListener("click", function () {
      if (chatWindow.classList.contains("open")) {
        closeChat();
      } else {
        openChat();
      }
    });

    chatClose.addEventListener("click", closeChat);

    /* =====================================================
       ADD CHAT MESSAGE
    ===================================================== */

    function addChatMessage(message, type) {
      const messageElement =
        document.createElement("div");

      messageElement.className =
        `gerard-message ${type}`;

      /*
        Convert new lines into visible line breaks.
        Text is escaped first for safety.
      */

      messageElement.innerHTML =
        escapeHTML(message).replace(/\n/g, "<br>");

      chatMessages.appendChild(messageElement);

      chatMessages.scrollTop =
        chatMessages.scrollHeight;

      return messageElement;
    }

    /* =====================================================
       SEND MESSAGE TO RAILWAY
    ===================================================== */

    async function sendChatMessage() {
      const message = chatInput.value.trim();

      if (!message) {
        return;
      }

      addChatMessage(message, "user");

      chatInput.value = "";

      chatInput.disabled = true;
      chatSend.disabled = true;

      const typingMessage =
        addChatMessage(
          "Gerard Cars AI is typing...",
          "bot typing"
        );

      try {
        console.log(
          "🤖 Sending chatbot request to:",
          `${GERARD_API_URL}/api/chat`
        );

        const response = await fetch(
          `${GERARD_API_URL}/api/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              message: message,
            }),
          }
        );

        const data = await response.json();

        typingMessage.remove();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              `Server returned ${response.status}`
          );
        }

        addChatMessage(
          data.reply ||
            "Sorry, I could not answer that right now.",
          "bot"
        );
      } catch (error) {
        console.error(
          "❌ Gerard Cars chatbot error:",
          error
        );

        typingMessage.remove();

        addChatMessage(
          "Sorry, the Gerard Cars assistant is temporarily unavailable. Please contact us on WhatsApp or call 07048329554.",
          "bot"
        );
      } finally {
        chatInput.disabled = false;
        chatSend.disabled = false;

        chatInput.focus();
      }
    }

    /* =====================================================
       SEND BUTTON
    ===================================================== */

    chatSend.addEventListener(
      "click",
      sendChatMessage
    );

    /* =====================================================
       ENTER KEY
    ===================================================== */

    chatInput.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {
          event.preventDefault();

          sendChatMessage();
        }
      }
    );
  }

  /* =====================================================
     START WEBSITE
  ===================================================== */

  console.log(
    "🚗 GERARD CARS WEBSITE LOADED"
  );

  console.log(
    "🔗 Railway API:",
    GERARD_API_URL
  );

  console.log(
    "🤖 Gerard Cars AI Chatbot: ENABLED"
  );

  loadCars();

  /* Start chatbot */
  createChatbot();
});
```
