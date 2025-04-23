import React, { useState } from 'react';
import { CheckCircle2, Clock, Plus, X } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  due: string;
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Review Route Efficiency Reports',
    description: 'Analyze and identify optimization opportunities in current routes',
    status: 'pending',
    priority: 'high',
    due: '2025-03-21T17:00'
  },
  {
    id: 2,
    title: 'Update Driver Assignments',
    description: 'Reassign drivers based on new route changes',
    status: 'in-progress',
    priority: 'medium',
    due: '2025-03-22T10:00'
  },
  {
    id: 3,
    title: 'Maintenance Schedule Review',
    description: 'Complete monthly maintenance schedule review',
    status: 'completed',
    priority: 'low',
    due: '2025-03-20T15:00'
  },
  {
    id: 4,
    title: 'GPS Coverage Analysis',
    description: 'Review GPS coverage gaps and propose solutions',
    status: 'pending',
    priority: 'high',
    due: '2025-03-21T15:00'
  }
];

const TasksWidget = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData }
          : task
      ));
    } else {
      const newTask: Task = {
        id: Math.max(...tasks.map(t => t.id)) + 1,
        title: taskData.title || '',
        description: taskData.description,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        due: taskData.due || new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const formatDueDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm" style={{ height: '237.34px' }}>
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-purple-600" />
            <h2 className="text-base font-semibold text-gray-900">Tasks</h2>
          </div>
          <button
            onClick={handleNewTask}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
          >
            <Plus size={14} />
            New Task
          </button>
        </div>

        <div className="mt-4 space-y-2 flex-1 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                task.status === 'completed' ? 'bg-gray-50' : 'bg-white'
              }`}
              onClick={() => handleEditTask(task)}
            >
              <div className={`mt-0.5 ${
                task.status === 'completed' 
                  ? 'text-green-500' 
                  : task.status === 'in-progress'
                  ? 'text-blue-500'
                  : 'text-gray-400'
              }`}>
                <CheckCircle2 size={14} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${
                    task.status === 'completed' 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-900'
                  }`}>
                    {task.title}
                  </p>
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{formatDueDate(task.due)}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px] max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form 
              className="p-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleSaveTask({
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  status: formData.get('status') as Task['status'],
                  priority: formData.get('priority') as Task['priority'],
                  due: formData.get('due') as string
                });
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingTask?.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingTask?.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    defaultValue={editingTask?.priority || 'medium'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingTask?.status || 'pending'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  name="due"
                  defaultValue={editingTask?.due?.slice(0, 16) || new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksWidget;