import React, { useState, useEffect, useCallback } from 'react';
import Header from '../dashboard/Header';
import Sidebar from '../dashboard/Sidebar';
import { 
  Button, 
  ErrorState, 
  FormInput, 
  LoadingSpinner
} from '../ui';
import taskService, { Task } from '../../services/taskService';
import { format } from 'date-fns';
import { MdCheckCircle, MdRadioButtonUnchecked, MdDelete, MdAddCircleOutline, MdInfoOutline, MdListAlt } from 'react-icons/md';

const TaskSectionPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null); // Error spesifik untuk form
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    today: 0
  });
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed); // Definisikan toggleSidebar

  // Handle responsive sidebar (jika diperlukan, kode Anda sebelumnya sudah ada)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
      
      const completed = fetchedTasks.filter(task => task.isCompleted).length;
      const pending = fetchedTasks.length - completed;
      
      const todayString = format(new Date(), 'yyyy-MM-dd');
      const todayTasks = fetchedTasks.filter(task => {
        try {
            return format(new Date(task.date), 'yyyy-MM-dd') === todayString;
        } catch (e) {
            console.warn("Invalid date format for task:", task);
            return false;
        }
      }).length;
      
      setStats({
        total: fetchedTasks.length,
        pending,
        completed,
        today: todayTasks
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Gagal memuat daftar tugas. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Mencegah reload halaman standar form
    setFormError(null);
    if (!newTaskContent.trim()) {
      setFormError('Isi tugas tidak boleh kosong.');
      return;
    }
    if (!newTaskDate) {
        setFormError('Tanggal tugas harus diisi.');
        return;
    }

    try {
      setIsLoading(true); // Atau state loading spesifik untuk form
      await taskService.createTask({
        date: newTaskDate,
        content: newTaskContent
      });
      setNewTaskContent('');
      setNewTaskDate(format(new Date(), 'yyyy-MM-dd'));
      await fetchTasks(); // Muat ulang tugas setelah menambah
    } catch (err) {
      console.error('Error adding task:', err);
      setFormError('Gagal menambahkan tugas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      try {
        setIsLoading(true);
        await taskService.deleteTask(id);
        await fetchTasks();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Gagal menghapus tugas.'); // Tampilkan error global jika perlu
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      setIsLoading(true);
      await taskService.updateTask(task.id, {
        isCompleted: !task.isCompleted,
        // Kirim field lain jika backend mengharapkannya atau untuk mencegah null/undefined
        date: task.date, 
        content: task.content,
      });
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Gagal memperbarui status tugas.');
    } finally {
      setIsLoading(false);
    }
  };
    // Komponen untuk Statistik Card
  const StatCard: React.FC<{ 
    title: string; 
    value: number | string; 
    color?: string; 
    icon?: React.ReactNode 
  }> = ({ title, value, color, icon }) => (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px',
      borderRadius: '8px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h5 style={{ color: '#6B7280', fontSize: '14px', margin: 0, fontWeight: 500 }}>{title}</h5>
        {icon && <span style={{ color: color || '#6B7280' }}>{icon}</span>}
      </div>
      <h3 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: color || '#1F2937' }}>
        {isLoading && typeof value === 'number' ? '...' : value}
      </h3>
    </div>
  );

  if (isLoading && tasks.length === 0) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Header 
            onAddNewClick={() => {}} 
            onCustomerCreated={() => {}}
          />
          <main style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
            <LoadingSpinner size="lg" text="Loading tasks..." />
          </main>
        </div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Header 
            onAddNewClick={() => {}} 
            onCustomerCreated={() => {}}
          />
          <main style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
            <ErrorState
              variant="error"
              message={error}
              actions={
                <Button variant="primary" onClick={fetchTasks}>
                  Try Again
                </Button>
              }
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Header 
          onAddNewClick={() => {}} 
          onCustomerCreated={() => {}}
        />
        
        <main style={{ padding: '24px' }}>
          {/* Page Title */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', margin: 0 }}>
              Task Management
            </h1>
          </div>
          
          {/* Task Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <StatCard title="Total Tasks" value={stats.total} color="#3B82F6" icon={<MdListAlt size={24}/>} />
            <StatCard title="Pending" value={stats.pending} color="#F59E0B" icon={<MdInfoOutline size={24}/>} />
            <StatCard title="Completed" value={stats.completed} color="#10B981" icon={<MdCheckCircle size={24}/>} />
            <StatCard title="Today's Tasks" value={stats.today} color="#6366F1" />
          </div>
          
          {/* Add New Task Form */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            marginBottom: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              Add New Task
            </h2>            {formError && (
              <div style={{ marginBottom: '16px' }}>
                <ErrorState
                  variant="error"
                  message={formError}
                />
              </div>
            )}
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 400px' }}>
                <FormInput
                  label="Task Description"
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  placeholder="Enter task description..."
                  required
                />
              </div>
              <div style={{ flex: '0 1 180px' }}>
                <FormInput
                  label="Date"
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading}
                style={{ height: '42px' }}
              >
                <MdAddCircleOutline size={18} style={{ marginRight: '6px' }} />
                Add Task
              </Button>
            </form>
          </div>          
          {/* Task List */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>Task List</h2>
            </div>
            
            {isLoading && !tasks.length ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <LoadingSpinner size="md" text="Loading tasks..." />
              </div>
            ) : !isLoading && tasks.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
                <MdInfoOutline size={48} style={{ marginBottom: '16px', color: '#9CA3AF' }} />
                <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>No tasks available.</p>
                <p style={{ fontSize: '14px' }}>Add a new task using the form above.</p>
              </div>
            ) : (
              <div style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}>
                {tasks
                  .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(task => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: task.isCompleted ? '#F9FAFB' : 'white',
                        opacity: task.isCompleted ? 0.7 : 1,
                        transition: 'background-color 0.2s ease, opacity 0.2s ease'
                      }}
                    >
                      <div 
                        style={{ marginRight: '16px', cursor: 'pointer' }}
                        onClick={() => handleToggleComplete(task)}
                        title={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {task.isCompleted ? 
                          <MdCheckCircle size={24} style={{ color: '#10B981' }} /> : 
                          <MdRadioButtonUnchecked size={24} style={{ color: '#9CA3AF' }} />
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          textDecoration: task.isCompleted ? 'line-through' : 'none',
                          color: task.isCompleted ? '#6B7280' : '#1F2937',
                          fontSize: '15px',
                          fontWeight: 500,
                          marginBottom: '4px'
                        }}>
                          {task.content}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          Due: {format(new Date(task.date), 'dd MMM yyyy')}
                        </div>
                      </div>
                      <div style={{ 
                        padding: '4px 10px', 
                        backgroundColor: task.isCompleted ? '#D1FAE5' : '#FEF3C7',
                        color: task.isCompleted ? '#065F46' : '#92400E',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginRight: '16px',
                        minWidth: '80px',
                        textAlign: 'center'
                      }}>
                        {task.isCompleted ? 'Complete' : 'Pending'}
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ 
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          color: '#EF4444',
                          border: 'none'
                        }}
                        title="Delete task"
                      >
                        <MdDelete size={18} />
                      </Button>
                    </div>
                  ))}              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskSectionPage;