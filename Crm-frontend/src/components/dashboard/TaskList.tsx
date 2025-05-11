import React from 'react';

const tasks = [
  { date: "23 Mar 2025", text: "Kumpulkan data prospek" },
  { date: "31 Mar 2025", text: "Kirim penawaran produk" },
  { date: "03 Apr 2025", text: "Perbarui pipeline penjualan" },
  { date: "10 Apr 2025", text: "Kirim survei pelanggan" },
  { date: "15 Apr 2025", text: "Susun laporan bulanan" },
  { date: "19 Apr 2025", text: "Evaluasi tim sales" }
];

const TaskList: React.FC = () => {
  return (
    <div>
      {tasks.map((task, index) => (
        <div key={index} className="task-item">
          <div className="task-date">{task.date}</div>
          <div className="task-text">{task.text}</div>
        </div>
      ))}
      <div className="mt-4">
        <button className="load-more flex items-center">
          <span className="mr-2">Add new task</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskList;
