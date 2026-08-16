const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const OpenAI = require("openai");

const db = require("./database/database");
const carsRouter = require("./routes/cars");
const adminRouter = require("./admin/admin");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const websiteFolder = path.join(__dirname, "..");

/* ========================================
   OPENAI
======================================== */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ========================================
   MIDDLEWARE
======================================== */

app.use(cors());

app.use(express.json());

/* ========================================
   TEST API
======================================== */

app.get("/api/test", (req, res) => {
  res.json({
    message: "Gerard Cars API is working!",
    status: "success",
  });
});

/* ========================================
   ADMIN
======================================== */

app.use("/api/admin", adminRouter);

/* ========================================
   CARS
======================================== */

app.use("/api/cars", carsRouter);

/* ========================================
   GERARD CARS AI CHATBOT
======================================== */

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Please enter a message.",
      });
    }

    /*
      Get the latest vehicles directly
      from the Gerard Cars database.

      IMPORTANT:
      This database uses better-sqlite3,
      so we use prepare().all().
    */

    let cars = [];

    try {
      cars = db.prepare("SELECT * FROM cars ORDER BY created_at DESC").all();
    } catch (databaseError) {
      console.error("CHATBOT DATABASE ERROR:", databaseError);
    }

    /*
      Convert vehicle information into text
      that the AI can use.
    */

    const vehicleInformation =
      cars.length > 0
        ? cars
            .map((car) => {
              return `
Vehicle:
Brand: ${car.brand || "N/A"}
Model: ${car.model || "N/A"}
Year: ${car.year || "N/A"}
Price: ${
                car.price
                  ? "₦" + Number(car.price).toLocaleString("en-NG")
                  : "Contact Dealer"
              }
Description: ${car.description || "N/A"}
Category: ${car.category || "Vehicle"}
Transmission: ${car.transmission || "Automatic"}
Fuel: ${car.fuel || "Petrol"}
Location: ${car.location || "Ago, Lagos, Nigeria"}
Available: ${Number(car.available) === 1 ? "Yes" : "No"}
`;
            })
            .join("\n--------------------\n")
        : "There are currently no vehicles available in the database.";

    /*
      AI instructions.
    */

    const systemPrompt = `
You are the official AI customer assistant for Gerard Cars.

Gerard Cars is a vehicle dealership located in:
Ago, Lagos, Nigeria.

Phone:
07048329554

WhatsApp:
07048329554

Your job is to help customers with questions about Gerard Cars and its vehicles.

You can answer questions about:
- Available cars
- Car names
- Prices
- Vehicle years
- Vehicle descriptions
- Transmission
- Fuel type
- Location
- How to contact Gerard Cars
- General questions about buying a vehicle from Gerard Cars

IMPORTANT RULES:

1. Only give vehicle information that is contained in the vehicle information provided below.

2. Never invent a vehicle, price, year, specification, discount, availability, or feature.

3. If a customer asks about a vehicle that is not listed, politely say that it is not currently listed and suggest contacting Gerard Cars.

4. If a customer asks for a price that is not available, say:
"Please contact Gerard Cars for the current price."

5. Keep responses friendly, helpful and reasonably short.

6. Do not claim that a vehicle is available if the database says it is sold.

7. When appropriate, encourage the customer to contact Gerard Cars through WhatsApp or phone.

CURRENT GERARD CARS VEHICLES:

${vehicleInformation}
`;

    /*
      Send the customer's message to OpenAI.
    */

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],
      max_tokens: 500,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I could not answer that right now. Please contact Gerard Cars on 07048329554.";

    res.json({
      success: true,
      reply: reply,
    });
  } catch (error) {
    console.error("CHATBOT ERROR:", error);

    res.status(500).json({
      success: false,
      error:
        "The Gerard Cars assistant is temporarily unavailable. Please contact us on 07048329554.",
    });
  }
});

/* ========================================
   WEBSITE
======================================== */

app.use(express.static(websiteFolder));

app.get("/", (req, res) => {
  res.sendFile(path.join(websiteFolder, "index.html"));
});

/* ========================================
   START SERVER
======================================== */

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("========================================");
  console.log("GERARD CARS BACKEND");
  console.log("========================================");
  console.log("Server: http://localhost:" + PORT);
  console.log("Admin login: /api/admin/login");
  console.log("Car API: /api/cars");
  console.log("Chatbot API: /api/chat");
  console.log("Website: http://localhost:" + PORT);
  console.log("Admin page: http://localhost:" + PORT + "/admin.html");
  console.log("========================================");
  console.log("SERVER IS RUNNING");
  console.log("");
});

server.on("error", (error) => {
  console.error("");
  console.error("SERVER ERROR:");
  console.error(error);
  console.error("");
});

server.on("close", () => {
  console.log("SERVER HAS CLOSED");
});

setInterval(() => {
  // Keep the Node.js process alive.
}, 1000);
