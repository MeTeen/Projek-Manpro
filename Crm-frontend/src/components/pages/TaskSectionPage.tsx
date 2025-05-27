import React, { useState, useEffect, useCallback } from 'react';
import Header from '../dashboard/Header';
import Sidebar from '../dashboard/Sidebar';
import taskService, { Task } from '../../services/taskService';
import { format } from 'date-fns';
import { MdCheckCircle, MdRadioButtonUnchecked, MdDelete, MdAddCircleOutline, MdErrorOutline, MdInfoOutline, MdListAlt } from 'react-icons/md'; // Tambahkan ikon

// Define the animation style (jika masih ingin digunakan, jika tidak, bisa dihapus)
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
  const StatCard: React.FC<{ title: string; value: number | string; color?: string; icon?: React.ReactNode }> = ({ title, value, color, icon }) => (
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


  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
      <style>{spinAnimation}</style> {/* Jika Anda masih menggunakan ini untuk loading spinner */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div style={{ flex: 1, overflowY: 'auto' }}> {/* Konten utama bisa di-scroll */}
        <Header 
          // Pastikan Header menerima props ini atau sesuaikan
          onAddNewClick={() => { /* Logika jika ada dropdown di header */ }} 
          onCustomerCreated={() => { /* Logika jika ada customer creation dari header */ }}
        />
        
        <main style={{ padding: '24px' }}> {/* Ganti kelas dengan style inline */}
          {/* Page Title */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', margin: 0 }}>
              Manajemen Tugas
            </h1>
            {/* Tombol Aksi Utama (jika ada, misal: Tambah Tugas Cepat) bisa diletakkan di sini */}
          </div>
          
          {/* Task Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <StatCard title="Total Tugas" value={stats.total} color="#3B82F6" icon={<MdListAlt size={24}/>} />
            <StatCard title="Menunggu Dikerjakan" value={stats.pending} color="#F59E0B" icon={<MdInfoOutline size={24}/>} />
            <StatCard title="Selesai" value={stats.completed} color="#10B981" icon={<MdCheckCircle size={24}/>} />
            <StatCard title="Tugas Hari Ini" value={stats.today} color="#6366F1" />
          </div>
          
          {/* Add New Task Form in a Card */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            marginBottom: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              Tambah Tugas Baru
            </h2>
            {formError && (
              <div style={{ color: '#EF4444', backgroundColor: '#FEF2F2', padding: '10px 15px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdErrorOutline /> {formError}
              </div>
            )}
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 400px' /* Lebar fleksibel untuk input teks */ }}>
                <label htmlFor="newTaskContent" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>
                  Deskripsi Tugas
                </label>
                <input 
                  id="newTaskContent"
                  type="text"
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  placeholder="Masukkan deskripsi tugas..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', height: '42px' }}
                />
              </div>
              <div style={{ flex: '0 1 180px' /* Lebar tetap untuk tanggal */ }}>
                <label htmlFor="newTaskDate" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>
                  Tanggal
                </label>
                <input 
                  id="newTaskDate"
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', height: '42px' }}
                />
              </div>
              <button 
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4F46E5', // Warna utama aplikasi Anda
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  height: '42px', // Samakan tinggi dengan input
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isLoading ? 0.7 : 1
                }}
                disabled={isLoading}
              >
                <MdAddCircleOutline size={18} /> Tambah
              </button>
            </form>
          </div>
          
          {/* Task List in a Card */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden' // Untuk menjaga border radius pada konten internal
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>Daftar Tugas</h2>
            </div>
            {isLoading && !tasks.length ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{marginTop: '10px'}}>Memuat tugas...</p>
              </div>
            ) : !isLoading && tasks.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
                <MdInfoOutline size={48} style={{ marginBottom: '16px', color: '#9CA3AF' }} />
                <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Tidak ada tugas.</p>
                <p style={{ fontSize: '14px' }}>Silakan tambahkan tugas baru menggunakan form di atas.</p>
              </div>
            ) : (
              <div style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}> {/* Batasi tinggi dan buat scrollable */}
                {tasks.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Urutkan berdasarkan tanggal
                      .map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderBottom: '1px solid #F3F4F6', // Border lebih halus antar item
                      backgroundColor: task.isCompleted ? '#F9FAFB' : 'white',
                      opacity: task.isCompleted ? 0.7 : 1,
                      transition: 'background-color 0.2s ease, opacity 0.2s ease'
                    }}
                  >
                    <div 
                      style={{ marginRight: '16px', cursor: 'pointer' }}
                      onClick={() => handleToggleComplete(task)}
                      title={task.isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
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
                        Batas Waktu: {format(new Date(task.date), 'dd MMM yyyy')}
                      </div>
                    </div>
                    <div style={{ 
                        padding: '4px 10px', 
                        backgroundColor: task.isCompleted ? '#D1FAE5' : '#FEF3C7', // Warna tag lebih lembut
                        color: task.isCompleted ? '#065F46' : '#92400E',
                        borderRadius: '12px', // Lebih rounded
                        fontSize: '12px',
                        fontWeight: '500',
                        marginRight: '16px',
                        minWidth: '80px',
                        textAlign: 'center'
                    }}>
                      {task.isCompleted ? 'Selesai' : 'Pending'}
                    </div>
                    <button
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        color: '#EF4444',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => handleDeleteTask(task.id)}
                      title="Hapus tugas"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskSectionPage;