import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    totalTasks: 0,
    completedPercentage: 0,
    pendingPercentage: 0,
    avgCompletionTime: 0,
    pendingTasks: 0,
    totalTimeLapsed: 0,
    totalTimeToFinish: 0,
    prioritySummary: Array(5).fill({ pendingTasks: 0, timeLapsed: 0, timeToFinish: 0 }),
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/task", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        setTasks(data);

        // Calculate summary
        const totalTasks = data.length;
        const completedTasks = data.filter((task) => task.status === "finished");
        const pendingTasks = data.filter((task) => task.status === "pending");

        const avgCompletionTime =
          completedTasks.length > 0
            ? (
                completedTasks.reduce(
                  (acc, task) =>
                    acc +
                    (new Date(task.endTime) - new Date(task.startTime)) /
                      3600000, // Convert ms to hours
                  0
                ) / completedTasks.length
              ).toFixed(1)
            : 0;

        const pendingSummary = Array(5)
          .fill(0)
          .map((_, priority) => {
            const tasksByPriority = pendingTasks.filter(
              (task) => task.priority === priority + 1
            );
            const timeLapsed = tasksByPriority.reduce(
              (acc, task) =>
                acc + (Date.now() - new Date(task.startTime)) / 3600000, // Convert ms to hours
              0
            );
            const timeToFinish = tasksByPriority.reduce(
              (acc, task) =>
                acc + (new Date(task.endTime) - Date.now()) / 3600000,
              0
            );
            return {
              pendingTasks: tasksByPriority.length,
              timeLapsed: timeLapsed.toFixed(1),
              timeToFinish: timeToFinish.toFixed(1),
            };
          });

        setSummary({
          totalTasks,
          completedPercentage: ((completedTasks.length / totalTasks) * 100).toFixed(0),
          pendingPercentage: ((pendingTasks.length / totalTasks) * 100).toFixed(0),
          avgCompletionTime,
          pendingTasks: pendingTasks.length,
          totalTimeLapsed: pendingSummary.reduce((acc, p) => acc + parseFloat(p.timeLapsed), 0).toFixed(1),
          totalTimeToFinish: pendingSummary.reduce((acc, p) => acc + parseFloat(p.timeToFinish), 0).toFixed(1),
          prioritySummary: pendingSummary,
        });
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-bold">{summary.totalTasks}</h2>
          <p className="text-gray-300">Total Tasks</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-bold">{summary.completedPercentage}%</h2>
          <p className="text-gray-300">Tasks Completed</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-bold">{summary.pendingPercentage}%</h2>
          <p className="text-gray-300">Tasks Pending</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-bold">{summary.avgCompletionTime} hrs</h2>
          <p className="text-gray-300">Avg Time/Completed Task</p>
        </div>
      </div>

      {/* Pending Task Summary */}
      <h2 className="text-2xl font-bold mt-8">Pending Task Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-gray-800 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-bold">{summary.pendingTasks}</h2>
          <p className="text-gray-300">Pending Tasks</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-bold">{summary.totalTimeLapsed} hrs</h2>
          <p className="text-gray-300">Total Time Lapsed</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-bold">{summary.totalTimeToFinish} hrs</h2>
          <p className="text-gray-300">Total Time to Finish</p>
        </div>
      </div>

      {/* Pending Task Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pending Task Summary by Priority</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-gray-800 rounded-md overflow-hidden">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2 text-left text-gray-300">Task Priority</th>
                <th className="px-4 py-2 text-left text-gray-300">Pending Tasks</th>
                <th className="px-4 py-2 text-left text-gray-300">Time Lapsed (hrs)</th>
                <th className="px-4 py-2 text-left text-gray-300">Time to Finish (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {summary.prioritySummary.map((priority, index) => (
                <tr key={index} className="border-t border-gray-700">
                  <td className="px-4 py-2">Priority {index + 1}</td>
                  <td className="px-4 py-2">{priority.pendingTasks}</td>
                  <td className="px-4 py-2">{priority.timeLapsed}</td>
                  <td className="px-4 py-2">{priority.timeToFinish}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
