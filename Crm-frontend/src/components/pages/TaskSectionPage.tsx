import React, { useState, useEffect } from 'react';
import Header from '../dashboard/Header';
import Sidebar from '../dashboard/Sidebar';
import taskService, { Task } from '../../services/taskService';
import { format } from 'date-fns';

// Define the animation style
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TaskSectionPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    today: 0
  });
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch tasks data
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
      
      // Calculate statistics
      const completed = fetchedTasks.filter(task => task.isCompleted).length;
      const pending = fetchedTasks.length - completed;
      
      // Calculate today's tasks
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      const todayTasks = fetchedTasks.filter(task => {
        const taskDate = new Date(task.date);
        return format(taskDate, 'yyyy-MM-dd') === todayString;
      }).length;
      
      setStats({
        total: fetchedTasks.length,
        pending,
        completed,
        today: todayTasks
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskContent.trim()) {
      setError('Task content cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      await taskService.createTask({
        date: newTaskDate,
        content: newTaskContent
      });
      
      // Reset form
      setNewTaskContent('');
      setNewTaskDate(format(new Date(), 'yyyy-MM-dd'));
      
      // Refresh tasks
      fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      setIsLoading(true);
      await taskService.deleteTask(id);
      
      // Refresh tasks
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      setIsLoading(true);
      await taskService.updateTask(task.id, {
        isCompleted: !task.isCompleted
      });
      
      // Refresh tasks
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Add the keyframes animation to the document head */}
      <style>{spinAnimation}</style>

      <Sidebar collapsed={sidebarCollapsed} />
      
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`} style={{ flex: 1, overflow: 'auto' }}>
        <Header 
          onAddNewClick={() => {}} 
          onCustomerCreated={() => {}}
        />
        
        <div className="page-content" style={{ padding: '24px', backgroundColor: '#f9f9f9', minHeight: 'calc(100vh - 60px)' }}>
          <div className="container-fluid">
            {/* Page Title with style */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="page-title-box" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  marginBottom: '24px'
                }}>
                  <h4 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Task Management</h4>
                </div>
              </div>
            </div>
            
            {/* Task Stats Card */}
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  height: '100%'
                }}>
                  <h5 style={{ color: '#6c757d', fontSize: '14px', marginBottom: '12px' }}>Total Tasks</h5>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0' }}>
                    {isLoading ? '...' : stats.total}
                  </h3>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  height: '100%'
                }}>
                  <h5 style={{ color: '#6c757d', fontSize: '14px', marginBottom: '12px' }}>Pending</h5>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0', color: 'var(--warning)' }}>
                    {isLoading ? '...' : stats.pending}
                  </h3>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  height: '100%'
                }}>
                  <h5 style={{ color: '#6c757d', fontSize: '14px', marginBottom: '12px' }}>Completed</h5>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0', color: 'var(--success)' }}>
                    {isLoading ? '...' : stats.completed}
                  </h3>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  height: '100%'
                }}>
                  <h5 style={{ color: '#6c757d', fontSize: '14px', marginBottom: '12px' }}>Today's Tasks</h5>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0', color: 'var(--primary)' }}>
                    {isLoading ? '...' : stats.today}
                  </h3>
                </div>
              </div>
            </div>
            
            {/* Add New Task Form */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card" style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  backgroundColor: 'white',
                  padding: '0',
                  overflow: 'hidden',
                  border: 'none'
                }}>
                  <div className="card-header" style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px 20px', 
                    borderBottom: '1px solid #eee'
                  }}>
                    <h5 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Add New Task</h5>
                  </div>
                  <div className="card-body" style={{ padding: '20px' }}>
                    {error && (
                      <div style={{ 
                        color: 'white', 
                        backgroundColor: '#dc3545', 
                        padding: '10px 15px', 
                        borderRadius: '4px', 
                        marginBottom: '16px' 
                      }}>
                        {error}
                      </div>
                    )}
                    <div className="row">
                      <div className="col-md-8 mb-3">
                        <input 
                          type="text"
                          value={newTaskContent}
                          onChange={(e) => setNewTaskContent(e.target.value)}
                          placeholder="Enter task description"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div className="col-md-2 mb-3">
                        <input 
                          type="date"
                          value={newTaskDate}
                          onChange={(e) => setNewTaskDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div className="col-md-2 mb-3">
                        <button 
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: 'var(--indigo-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                          onClick={handleAddTask}
                          disabled={isLoading}
                        >
                          Add Task
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Task Content */}
            <div className="row">
              <div className="col-12">
                <div className="card" style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  backgroundColor: 'white',
                  padding: '0',
                  overflow: 'hidden',
                  border: 'none',
                  minHeight: '400px'
                }}>
                  <div className="card-header" style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px 20px', 
                    borderBottom: '1px solid #eee'
                  }}>
                    <h5 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Task List</h5>
                  </div>
                  <div className="card-body" style={{ padding: '20px' }}>
                    {isLoading && !tasks.length ? (
                      <div style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{ 
                            display: 'inline-block', 
                            width: '20px', 
                            height: '20px', 
                            border: '3px solid #ccc', 
                            borderTopColor: 'var(--indigo-600)', 
                            borderRadius: '50%', 
                            animation: 'spin 1s linear infinite' 
                          }}></span>
                        </div>
                        <div>Loading tasks...</div>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: '#6c757d',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px dashed #dee2e6'
                      }}>
                        <div style={{ fontSize: '16px', marginBottom: '10px' }}>No tasks found</div>
                        <div style={{ fontSize: '14px' }}>Add a new task using the form above</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
                        {tasks.map(task => (
                          <div
                            key={task.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '15px',
                              borderRadius: '6px',
                              border: '1px solid #eee',
                              backgroundColor: task.isCompleted ? '#f8f9fa' : 'white',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div 
                              style={{ 
                                width: '20px', 
                                height: '20px', 
                                border: '2px solid ' + (task.isCompleted ? '#28a745' : '#6c757d'),
                                borderRadius: '4px',
                                marginRight: '15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: task.isCompleted ? '#28a745' : 'white'
                              }}
                              onClick={() => handleToggleComplete(task)}
                            >
                              {task.isCompleted && (
                                <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                textDecoration: task.isCompleted ? 'line-through' : 'none',
                                color: task.isCompleted ? '#6c757d' : 'inherit',
                                fontSize: '16px',
                                fontWeight: '500',
                                marginBottom: '5px'
                              }}>
                                {task.content}
                              </div>
                              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                Due: {format(new Date(task.date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <div style={{ 
                              padding: '4px 8px', 
                              backgroundColor: task.isCompleted ? '#d4edda' : '#fff3cd',
                              color: task.isCompleted ? '#155724' : '#856404',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              marginRight: '15px'
                            }}>
                              {task.isCompleted ? 'Completed' : 'Pending'}
                            </div>
                            <button
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSectionPage; 