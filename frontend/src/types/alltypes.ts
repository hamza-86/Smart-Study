export type AccountType = "Student" | "Instructor" | "Admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType;
  avatar?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  discountedPrice?: number | null;
  totalStudents?: number;
  averageRating?: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  error: null | {
    statusCode: number;
    errorType: string;
    details?: unknown;
  };
}
