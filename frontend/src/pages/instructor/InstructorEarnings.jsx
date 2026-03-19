/**
 * InstructorEarnings Page
 * FILE: src/pages/instructor/InstructorEarnings.jsx
 *
 * Displays instructor earnings and revenue analytics
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../../components/Footer";
import EmptyState from "../../components/common/EmptyState";
import { fadeIn } from "../../utils/motion";

const EarningCard = ({ period, amount, index }) => (
  <motion.div
    variants={fadeIn("up", "spring", index * 0.1, 1)}
    className="bg-richblack-800 border border-richblack-700 rounded-lg p-6"
  >
    <p className="text-richblack-400 text-sm">{period}</p>
    <p className="text-richblack-5 text-2xl font-bold mt-2">${amount.toFixed(2)}</p>
  </motion.div>
);

const TransactionRow = ({ transaction, index }) => (
  <motion.tr
    variants={fadeIn("left", "spring", index * 0.1, 1)}
    className="border-b border-richblack-700 hover:bg-richblack-800 transition"
  >
    <td className="px-6 py-4 text-richblack-200 text-sm">{transaction.courseTitle}</td>
    <td className="px-6 py-4 text-richblack-300 text-sm">{transaction.studentName}</td>
    <td className="px-6 py-4 text-richblack-300 text-sm">${transaction.amount.toFixed(2)}</td>
    <td className="px-6 py-4 text-richblack-400 text-xs">{transaction.date}</td>
    <td className="px-6 py-4">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        transaction.status === "Completed"
          ? "bg-caribbeangreen-900 text-caribbeangreen-200"
          : "bg-yellow-900 text-yellow-200"
      }`}>
        {transaction.status}
      </span>
    </td>
  </motion.tr>
);

const InstructorEarnings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);

  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    transactions: [],
  });

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    
    // TODO: Fetch earnings from backend
    // Placeholder data
    setEarnings({
      totalEarnings: 45230,
      monthlyEarnings: 12450,
      weeklyEarnings: 2800,
      transactions: [
        { id: 1, courseTitle: "React Basics", studentName: "John Doe", amount: 99.99, date: "2024-03-15", status: "Completed" },
        { id: 2, courseTitle: "Advanced JavaScript", studentName: "Jane Smith", amount: 149.99, date: "2024-03-14", status: "Completed" },
        { id: 3, courseTitle: "Web Development", studentName: "Bob Wilson", amount: 199.99, date: "2024-03-13", status: "Pending" },
      ],
    });
  }, [token, dispatch, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="loader" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex justify-center items-start bg-richblack-900 min-h-screen"
      >
        <div className="mt-16 w-full max-w-6xl px-4 pb-16">
          {/* Header */}
          <div className="pt-10 mb-8">
            <h1 className="text-richblack-5 font-bold text-3xl">My Earnings</h1>
            <p className="text-richblack-400 text-sm mt-2">
              Track your revenue and earnings
            </p>
          </div>

          {/* Earnings Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <EarningCard period="Total Earnings" amount={earnings.totalEarnings} index={0} />
            <EarningCard period="This Month" amount={earnings.monthlyEarnings} index={1} />
            <EarningCard period="This Week" amount={earnings.weeklyEarnings} index={2} />
          </motion.div>

          {/* Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-richblack-800 border border-richblack-700 rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-richblack-700">
              <h2 className="text-richblack-5 font-bold text-lg">
                Recent Transactions
              </h2>
            </div>

            {earnings.transactions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-richblack-700 border-b border-richblack-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Course</th>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Student</th>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.transactions.map((transaction, index) => (
                    <TransactionRow key={transaction.id} transaction={transaction} index={index} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12">
                <EmptyState
                  title="No Transactions Yet"
                  message="Your earnings will appear here once you get your first sale."
                />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default InstructorEarnings;
