import React, { useState, useEffect } from 'react';
import taskService, { Task } from '../../services/taskService';
import { format } from 'date-fns';

// Define the animation style
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Removed props interface since no props are needed anymore
const TaskSection: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Add the keyframes animation to the document head */}
      <style>{spinAnimation}</style>
      
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

      {isLoading ? (
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
          <div style={{ fontSize: '14px' }}>No tasks are currently available</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
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
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: task.isCompleted ? '#28a745' : '#ffc107',
                marginRight: '15px'
              }} />
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
                fontWeight: '500'
              }}>
                {task.isCompleted ? 'Completed' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskSection; 