const express = require("express");
const db = require("../database/database");
const authenticateAdmin = require("../middleware/auth");
const upload = require("../upload");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// =====================================================
// SETTINGS
// =====================================================

// TOTAL PHOTOS PER VEHICLE
// 1 main image + 5 gallery images = 6 total
const MAX_TOTAL_IMAGES = 6;

// =====================================================
// HELPER - GET IMAGES FOLDER
// =====================================================

const imagesFolder = path.join(__dirname, "..", "images");

// =====================================================
// HELPER - DELETE IMAGE FILE
// =====================================================

function deleteImageFile(imagePath) {
  try {
    if (!imagePath) {
      return;
    }

    const imageFile = path.join(imagesFolder, path.basename(imagePath));

    if (fs.existsSync(imageFile)) {
      fs.unlinkSync(imageFile);
    }
  } catch (error) {
    console.error("DELETE IMAGE FILE ERROR:", error);
  }
}

// =====================================================
// GET ALL CARS
// PUBLIC
// =====================================================

router.get("/", (req, res) => {
  try {
    const cars = db
      .prepare("SELECT * FROM cars ORDER BY created_at DESC")
      .all();

    res.json({
      success: true,
      cars: cars,
    });
  } catch (error) {
    console.error("GET ALL CARS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch cars",
    });
  }
});

// =====================================================
// GET ONE CAR + GALLERY
// PUBLIC
// =====================================================

router.get("/:id", (req, res) => {
  try {
    const car = db
      .prepare("SELECT * FROM cars WHERE id = ?")
      .get(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const gallery = db
      .prepare(
        `
        SELECT id, car_id, image, created_at
        FROM car_gallery
        WHERE car_id = ?
        ORDER BY created_at ASC
        `,
      )
      .all(req.params.id);

    res.json({
      success: true,
      car: car,
      gallery: gallery,
    });
  } catch (error) {
    console.error("GET ONE CAR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch car",
    });
  }
});

// =====================================================
// GET CAR GALLERY
// PUBLIC
// =====================================================

router.get("/:id/gallery", (req, res) => {
  try {
    const car = db
      .prepare("SELECT id FROM cars WHERE id = ?")
      .get(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const gallery = db
      .prepare(
        `
        SELECT id, car_id, image, created_at
        FROM car_gallery
        WHERE car_id = ?
        ORDER BY created_at ASC
        `,
      )
      .all(req.params.id);

    res.json({
      success: true,
      gallery: gallery,
    });
  } catch (error) {
    console.error("GET GALLERY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch vehicle gallery",
    });
  }
});

// =====================================================
// ADD CAR
// ADMIN ONLY
// =====================================================

router.post("/", authenticateAdmin, upload.single("image"), (req, res) => {
  try {
    const brand = req.body.brand;
    const model = req.body.model;
    const year = req.body.year;
    const price = req.body.price;
    const description = req.body.description;
    const available = req.body.available;

    if (!brand || !model || !price) {
      if (req.file) {
        deleteImageFile("images/" + req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Brand, model and price are required",
      });
    }

    let imagePath = "";

    if (req.file) {
      imagePath = "images/" + req.file.filename;
    }

    const result = db
      .prepare(
        `
          INSERT INTO cars (
            brand,
            model,
            year,
            price,
            description,
            image,
            available
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
      )
      .run(
        brand.trim(),
        model.trim(),
        year ? Number(year) : null,
        Number(price),
        description ? description.trim() : "",
        imagePath,
        available === undefined ? 1 : Number(available),
      );

    const newCar = db
      .prepare("SELECT * FROM cars WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Car added successfully",
      car: newCar,
    });
  } catch (error) {
    console.error("ADD CAR ERROR:", error);

    if (req.file) {
      deleteImageFile("images/" + req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: error.message || "Unable to add car",
    });
  }
});

// =====================================================
// EDIT CAR
// ADMIN ONLY
// IMAGE OPTIONAL
// =====================================================

router.put("/:id", authenticateAdmin, upload.single("image"), (req, res) => {
  try {
    const existingCar = db
      .prepare("SELECT * FROM cars WHERE id = ?")
      .get(req.params.id);

    if (!existingCar) {
      if (req.file) {
        deleteImageFile("images/" + req.file.filename);
      }

      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const brand = req.body.brand;
    const model = req.body.model;
    const year = req.body.year;
    const price = req.body.price;
    const description = req.body.description;
    const available = req.body.available;

    if (!brand || !model || !price) {
      if (req.file) {
        deleteImageFile("images/" + req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Brand, model and price are required",
      });
    }

    let imagePath = existingCar.image || "";

    if (req.file) {
      imagePath = "images/" + req.file.filename;

      // Delete previous main image
      if (existingCar.image) {
        deleteImageFile(existingCar.image);
      }
    }

    db.prepare(
      `
        UPDATE cars
        SET
          brand = ?,
          model = ?,
          year = ?,
          price = ?,
          description = ?,
          image = ?,
          available = ?
        WHERE id = ?
        `,
    ).run(
      brand.trim(),
      model.trim(),
      year ? Number(year) : null,
      Number(price),
      description ? description.trim() : "",
      imagePath,
      available === undefined ? 1 : Number(available),
      req.params.id,
    );

    const updatedCar = db
      .prepare("SELECT * FROM cars WHERE id = ?")
      .get(req.params.id);

    res.json({
      success: true,
      message: "Car updated successfully",
      car: updatedCar,
    });
  } catch (error) {
    console.error("UPDATE CAR ERROR:", error);

    if (req.file) {
      deleteImageFile("images/" + req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: error.message || "Unable to update car",
    });
  }
});

// =====================================================
// DELETE CAR
// ADMIN ONLY
// =====================================================

router.delete("/:id", authenticateAdmin, (req, res) => {
  try {
    const car = db
      .prepare("SELECT * FROM cars WHERE id = ?")
      .get(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // Delete main image
    if (car.image) {
      deleteImageFile(car.image);
    }

    // Get gallery images
    const galleryImages = db
      .prepare("SELECT image FROM car_gallery WHERE car_id = ?")
      .all(req.params.id);

    // Delete gallery image files
    galleryImages.forEach((galleryImage) => {
      deleteImageFile(galleryImage.image);
    });

    // Delete car.
    // Gallery records are removed by ON DELETE CASCADE.
    db.prepare("DELETE FROM cars WHERE id = ?").run(req.params.id);

    res.json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CAR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete car",
    });
  }
});

// =====================================================
// UPLOAD IMAGE TEST
// ADMIN ONLY
// =====================================================

router.post(
  "/upload-image",
  authenticateAdmin,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image was uploaded",
        });
      }

      const imagePath = "images/" + req.file.filename;

      res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
        image: imagePath,
      });
    } catch (error) {
      console.error("UPLOAD IMAGE ERROR:", error);

      if (req.file) {
        deleteImageFile("images/" + req.file.filename);
      }

      res.status(500).json({
        success: false,
        message: error.message || "Unable to upload image",
      });
    }
  },
);

// =====================================================
// ADD VEHICLE GALLERY IMAGES
// ADMIN ONLY
//
// IMPORTANT:
// The main car image is NOT stored in car_gallery.
//
// TOTAL VEHICLE LIMIT:
// 1 main image + 5 gallery images = 6 pictures
// =====================================================

router.post(
  "/:id/gallery",
  authenticateAdmin,
  upload.array("images", 5),
  (req, res) => {
    try {
      const car = db
        .prepare("SELECT * FROM cars WHERE id = ?")
        .get(req.params.id);

      if (!car) {
        if (req.files) {
          req.files.forEach((file) => {
            deleteImageFile("images/" + file.filename);
          });
        }

        return res.status(404).json({
          success: false,
          message: "Car not found",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No gallery images were uploaded",
        });
      }

      // Count existing gallery images
      const existingGalleryCount = Number(
        db
          .prepare("SELECT COUNT(*) AS count FROM car_gallery WHERE car_id = ?")
          .get(req.params.id).count,
      );

      // One picture is the main image.
      // The remaining available slots are gallery slots.
      const hasMainImage = Boolean(car.image);

      const totalImages = (hasMainImage ? 1 : 0) + existingGalleryCount;

      const remainingSlots = MAX_TOTAL_IMAGES - totalImages;

      if (remainingSlots <= 0) {
        req.files.forEach((file) => {
          deleteImageFile("images/" + file.filename);
        });

        return res.status(400).json({
          success: false,
          message: "This vehicle already has the maximum of 6 pictures.",
        });
      }

      if (req.files.length > remainingSlots) {
        req.files.forEach((file) => {
          deleteImageFile("images/" + file.filename);
        });

        return res.status(400).json({
          success: false,
          message: `Only ${remainingSlots} more picture(s) can be added. Maximum is 6 pictures per vehicle.`,
        });
      }

      const insertGallery = db.prepare(
        `
        INSERT INTO car_gallery (
          car_id,
          image
        )
        VALUES (?, ?)
        `,
      );

      const addGalleryImages = db.transaction((files) => {
        for (const file of files) {
          const imagePath = "images/" + file.filename;

          insertGallery.run(req.params.id, imagePath);
        }
      });

      addGalleryImages(req.files);

      const gallery = db
        .prepare(
          `
          SELECT id, car_id, image, created_at
          FROM car_gallery
          WHERE car_id = ?
          ORDER BY created_at ASC
          `,
        )
        .all(req.params.id);

      res.status(201).json({
        success: true,
        message: `${req.files.length} gallery picture(s) added successfully`,
        gallery: gallery,
        totalPictures: (hasMainImage ? 1 : 0) + gallery.length,
        maximumPictures: MAX_TOTAL_IMAGES,
      });
    } catch (error) {
      console.error("ADD GALLERY ERROR:", error);

      if (req.files) {
        req.files.forEach((file) => {
          deleteImageFile("images/" + file.filename);
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Unable to add gallery images",
      });
    }
  },
);

// =====================================================
// DELETE ONE GALLERY IMAGE
// ADMIN ONLY
// =====================================================

router.delete("/gallery/:galleryId", authenticateAdmin, (req, res) => {
  try {
    const galleryImage = db
      .prepare(
        `
          SELECT *
          FROM car_gallery
          WHERE id = ?
          `,
      )
      .get(req.params.galleryId);

    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    // Delete physical image file
    deleteImageFile(galleryImage.image);

    // Delete database record
    db.prepare("DELETE FROM car_gallery WHERE id = ?").run(
      req.params.galleryId,
    );

    res.json({
      success: true,
      message: "Gallery image deleted successfully",
    });
  } catch (error) {
    console.error("DELETE GALLERY IMAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete gallery image",
    });
  }
});

module.exports = router;
