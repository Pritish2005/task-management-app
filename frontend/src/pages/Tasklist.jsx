import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    id: null,
    title: "",
    priority: 1,
    status: "pending",
    startTime: "",
    endTime: "",
  });
  const [sortOption, setSortOption] = useState("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Utility function to format datetime for datetime-local input
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Fetch tasks on page load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://task-management-app-backend-h0xd.onrender.com/api/task", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.status === 404) {
          setTasks([]);
          setError("No Tasks found");
        } else {
          const data = await response.json();
          setTasks(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tasks. Please check your API or network.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Add or Update a task
  const handleSubmitTask = async () => {
    if (new Date(taskForm.endTime) < new Date(taskForm.startTime)) {
      toast.error("End time cannot be earlier than start time!");
      return;
    }

    try {
      const response = await fetch(
        "https://task-management-app-backend-h0xd.onrender.com/api/task" +
          (taskForm.id ? `/${taskForm.id}` : ""),
        {
          method: taskForm.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: taskForm.title,
            priority: taskForm.priority,
            startTime: taskForm.startTime,
            endTime: taskForm.endTime,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save task");
      }

      const savedTask = await response.json();

      if (taskForm.id) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === savedTask._id ? savedTask : task
          )
        );
      } else {
        setTasks((prevTasks) => [...prevTasks, savedTask]);
      }

      setShowModal(false);
      toast.success("Task saved successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Update task status
  const handleUpdateStatus = async (taskId, status) => {
    try {
      const response = await fetch(
        `https://task-management-app-backend-h0xd.onrender.com/api/task/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `https://task-management-app-backend-h0xd.onrender.com/api/task/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Sort tasks based on selected option
  const sortedTasks = () => {
    switch (sortOption) {
      case "completed":
        return [...tasks].sort((a, b) =>
          a.status === b.status ? 0 : a.status === "finished" ? -1 : 1
        );
      case "startDate":
        return [...tasks].sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );
      case "endDate":
        return [...tasks].sort(
          (a, b) => new Date(a.endTime) - new Date(b.endTime)
        );
      default:
        return tasks;
    }
  };

  // Open modal to add or edit task
  const handleOpenModal = (task = null) => {
    setShowModal(true);
    if (task) {
      setTaskForm({
        id: task._id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        startTime: formatDateTime(task.startTime),
        endTime: formatDateTime(task.endTime),
      });
    } else {
      setTaskForm({
        id: null,
        title: "",
        priority: 1,
        status: "pending",
        startTime: "",
        endTime: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task List</h1>
        <div className="flex items-center space-x-4">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            <option value="default">Default</option>
            <option value="completed">Sort by Completed</option>
            <option value="startDate">Sort by Start Date</option>
            <option value="endDate">Sort by End Date</option>
          </select>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-indigo-500 rounded-md hover:bg-indigo-600 text-white"
          >
            + Add Task
          </button>
        </div>
      </div>

      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks().map((task) => (
          <div
            key={task._id}
            className="bg-gray-800 p-4 rounded-md shadow-lg flex flex-col"
          >
            <div
  key={task._id}
  className="relative bg-gray-800 p-4 rounded-md shadow-lg flex flex-col"
>
  {/* Delete Icon */}
  <button
    onClick={() => handleDeleteTask(task._id)}
    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
    aria-label="Delete Task"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>

  <h2 className="text-lg font-bold">{task.title}</h2>
  <p className="text-sm">
    <span
      className={`font-semibold ${
        task.status === "pending" ? "text-red-400" : "text-green-400"
      }`}
    >
      {task.status}
    </span>{" "}
    | Priority: {task.priority}
  </p>
  <p className="text-sm mt-2">
    Start: {new Date(task.startTime).toLocaleString()}
  </p>
  <p className="text-sm">
    End: {new Date(task.endTime).toLocaleString()}
  </p>
  <div className="mt-4 flex justify-between">
    <button
      onClick={() => handleOpenModal(task)}
      className="px-2 py-1 bg-blue-500 rounded-md hover:bg-blue-600 text-white"
    >
      Edit
    </button>
    <button
      onClick={() =>
        handleUpdateStatus(
          task._id,
          task.status === "pending" ? "finished" : "pending"
        )
      }
      className={`px-2 py-1 rounded-md ${
        task.status === "pending"
          ? "bg-green-500 hover:bg-green-600"
          : "bg-red-500 hover:bg-red-600"
      } text-white`}
    >
      {task.status === "pending" ? "Mark as Finished" : "Mark as Pending"}
    </button>
  </div>
</div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-md shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {taskForm.id ? "Edit Task" : "Add New Task"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={taskForm.title}
                placeholder="Task Title"
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5].map((priority) => (
                  <option key={priority} value={priority}>
                    Priority {priority}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={taskForm.startTime}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, startTime: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="datetime-local"
                value={taskForm.endTime}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, endTime: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="mt-2">
                <button
                  onClick={() => {
                    const now = new Date().toISOString().slice(0, 16);
                    setTaskForm({ ...taskForm, startTime: now});
                  }}
                  className="px-2 py-1 bg-gray-700 rounded-md hover:bg-gray-800 text-white text-sm"
                >
                  Set Start to Now
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTask}
                className="px-4 py-2 bg-indigo-500 rounded-md hover:bg-indigo-600"
              >
                {taskForm.id ? "Update Task" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
