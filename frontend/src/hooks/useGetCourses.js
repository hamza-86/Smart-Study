import { useQuery } from "@tanstack/react-query";
import { getCoursesRequest } from "../services/api/course.api";

export const useGetCourses = (filters = {}) =>
  useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      const result = await getCoursesRequest(filters);
      return result?.data || [];
    },
    staleTime: 60 * 1000,
  });

export default useGetCourses;
