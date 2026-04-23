import React, { useState, useEffect } from 'react';

const API_URL = '/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from the API on load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [tasks]);

  // Add a new task
  const addTask = async (e) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const task = await response.json();
      setTasks([...tasks, task]);
      setNewTaskTitle('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle task completion
  const toggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(t => (t.id === taskId ? updatedTask : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
        setTasks(tasks);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div style={styles.container}><p>Loading tasks...</p></div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Task Manager</h1>

      {error && (
        <div style={styles.error}>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <form onSubmit={addTask} style={styles.form}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter a new task..."
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <p style={styles.empty}>No tasks yet. Add one above!</p>
      ) : (
        <ul style={styles.list}>
          {tasks.map(task => (
            <li key={task.id} style={styles.listItem}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
              />
              <span style={{
                ...styles.taskTitle,
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? '#999' : '#333',
              }}>
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  taskTitle: {
    flex: 1,
    fontSize: '16px',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
};

export default App;
