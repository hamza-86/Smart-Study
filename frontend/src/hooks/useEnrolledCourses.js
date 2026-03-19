import { useQuery } from "@tanstack/react-query";
import { getEnrolledCoursesRequest } from "../services/api/course.api";

export const useEnrolledCourses = (enabled = true) =>
  useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: async () => {
      const result = await getEnrolledCoursesRequest();
      return result?.data || [];
    },
    enabled,
  });

export default useEnrolledCourses;
