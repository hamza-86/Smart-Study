import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BiSearch } from "react-icons/bi";
import CourseCard from "../components/CourseCard";
import Footer from "../components/Footer";
import { useGetCourses } from "../hooks";

const AllCourses = () => {
  const [search, setSearch] = useState("");
  const { data: courses = [], isLoading } = useGetCourses();

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.category?.name?.toLowerCase().includes(q) ||
        c.instructor?.firstName?.toLowerCase().includes(q)
    );
  }, [search, courses]);

  const Skeleton = () => (
    <div className="w-[280px] h-[300px] rounded-xl bg-richblack-800 animate-pulse" />
  );

  return (
    <>
      <div className="bg-richblack-900 min-h-screen w-full">
        <div className="bg-richblack-800 pt-24 pb-10 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-richblack-5 font-bold text-3xl lg:text-4xl mb-2"
            >
              All Courses
            </motion.h1>
            <p className="text-richblack-300 text-sm mb-6">{courses.length} courses available</p>

            <div className="relative max-w-md">
              <BiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400"
                size={18}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, topics, instructors..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-100 placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {isLoading ? (
            <div className="flex flex-wrap gap-6 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <motion.div
              className="flex flex-wrap gap-6 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filtered.map((course, index) => (
                <CourseCard
                  key={course._id}
                  index={index}
                  courseId={course._id}
                  title={course.title}
                  category={course.category?.name || "Uncategorized"}
                  price={course.price}
                  discountedPrice={course.discountedPrice}
                  thumbnail={course.thumbnail}
                  instructor={
                    course.instructor
                      ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim()
                      : "Unknown Instructor"
                  }
                  averageRating={course.averageRating}
                  totalStudents={course.totalStudents}
                  level={course.level}
                  totalDuration={course.totalDuration}
                />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="text-richblack-300 text-xl mb-2">No courses found</p>
              {search && (
                <button onClick={() => setSearch("")} className="mt-4 text-yellow-50 text-sm underline">
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllCourses;
