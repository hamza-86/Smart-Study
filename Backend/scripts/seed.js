const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const dbConnect = require("../config/dataBase");

const User = require("../models/User");
const Category = require("../models/Category");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

async function seed() {
  await dbConnect();

  const [webDev, dataScience, design] = await Promise.all([
    Category.findOneAndUpdate(
      { slug: "web-development" },
      { name: "Web Development", slug: "web-development", description: "Build modern web apps" },
      { upsert: true, new: true }
    ),
    Category.findOneAndUpdate(
      { slug: "data-science" },
      { name: "Data Science", slug: "data-science", description: "Data analysis and ML" },
      { upsert: true, new: true }
    ),
    Category.findOneAndUpdate(
      { slug: "ui-ux-design" },
      { name: "UI UX Design", slug: "ui-ux-design", description: "Design beautiful interfaces" },
      { upsert: true, new: true }
    ),
  ]);

  const instructorPassword = await bcrypt.hash("Instructor@123", 12);
  const studentPassword = await bcrypt.hash("Student@123", 12);

  const instructor = await User.findOneAndUpdate(
    { email: "instructor@smartstudy.dev" },
    {
      firstName: "Aisha",
      lastName: "Khan",
      email: "instructor@smartstudy.dev",
      password: instructorPassword,
      accountType: "Instructor",
      isVerified: true,
      isActive: true,
      headline: "Full-Stack Engineer and Mentor",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const studentOne = await User.findOneAndUpdate(
    { email: "student1@smartstudy.dev" },
    {
      firstName: "Rahul",
      lastName: "Mehta",
      email: "student1@smartstudy.dev",
      password: studentPassword,
      accountType: "Student",
      isVerified: true,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const studentTwo = await User.findOneAndUpdate(
    { email: "student2@smartstudy.dev" },
    {
      firstName: "Neha",
      lastName: "Sharma",
      email: "student2@smartstudy.dev",
      password: studentPassword,
      accountType: "Student",
      isVerified: true,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const coursesPayload = [
    {
      title: "MERN Mastery Bootcamp",
      description: "Build production-ready MERN apps from scratch.",
      price: 2499,
      category: webDev._id,
      thumbnail: "https://res.cloudinary.com/demo/image/upload/v1700000000/mern-course.jpg",
      instructor: instructor._id,
      status: "Published",
      publishedAt: new Date(),
      tags: ["mern", "react", "node"],
      whatYouWillLearn: ["Design APIs", "Build React frontends", "Deploy to production"],
      requirements: ["Basic JavaScript"],
    },
    {
      title: "Practical Data Science with Python",
      description: "Hands-on data science with pandas, visualization, and ML basics.",
      price: 1999,
      category: dataScience._id,
      thumbnail: "https://res.cloudinary.com/demo/image/upload/v1700000000/data-science-course.jpg",
      instructor: instructor._id,
      status: "Published",
      publishedAt: new Date(),
      tags: ["python", "ml", "analytics"],
      whatYouWillLearn: ["Analyze datasets", "Build simple ML models", "Interpret results"],
      requirements: ["Basic Python"],
    },
    {
      title: "UI UX Design Fundamentals",
      description: "Learn wireframing, visual hierarchy, and user-centric product design.",
      price: 1499,
      category: design._id,
      thumbnail: "https://res.cloudinary.com/demo/image/upload/v1700000000/uiux-course.jpg",
      instructor: instructor._id,
      status: "Published",
      publishedAt: new Date(),
      tags: ["ui", "ux", "figma"],
      whatYouWillLearn: ["Create wireframes", "Improve usability", "Build design systems"],
      requirements: ["No prior design experience required"],
    },
  ];

  const seededCourses = [];

  for (const payload of coursesPayload) {
    const course = await Course.findOneAndUpdate(
      { title: payload.title, instructor: instructor._id },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    seededCourses.push(course);
  }

  await User.findByIdAndUpdate(instructor._id, {
    $set: { courses: seededCourses.map((c) => c._id) },
  });

  await Category.findByIdAndUpdate(webDev._id, {
    $addToSet: { courses: seededCourses[0]._id },
  });
  await Category.findByIdAndUpdate(dataScience._id, {
    $addToSet: { courses: seededCourses[1]._id },
  });
  await Category.findByIdAndUpdate(design._id, {
    $addToSet: { courses: seededCourses[2]._id },
  });

  const enrollments = [
    { user: studentOne._id, course: seededCourses[0]._id },
    { user: studentOne._id, course: seededCourses[1]._id },
    { user: studentTwo._id, course: seededCourses[0]._id },
    { user: studentTwo._id, course: seededCourses[2]._id },
  ];

  for (const item of enrollments) {
    await Enrollment.findOneAndUpdate(
      { user: item.user, course: item.course },
      { user: item.user, course: item.course, status: "Active", amountPaid: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await User.findByIdAndUpdate(item.user, { $addToSet: { courses: item.course } });
    await Course.findByIdAndUpdate(item.course, { $addToSet: { studentsEnrolled: item.user } });
  }

  for (const course of seededCourses) {
    await Course.findByIdAndUpdate(course._id, {
      $set: {
        totalStudents: (await Enrollment.countDocuments({ course: course._id, status: "Active" })),
      },
    });
  }

  console.log("Seeding complete.");
  console.log("Instructor: instructor@smartstudy.dev / Instructor@123");
  console.log("Student 1: student1@smartstudy.dev / Student@123");
  console.log("Student 2: student2@smartstudy.dev / Student@123");

  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error("Seeding failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});
