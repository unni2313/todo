import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = 'https://todobackend2-1.onrender.com/api/todos';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [todoDate, setTodoDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setTodos(data);
    } catch (err) {
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      if (editingTodo) {
        const { data } = await axios.put(`${API_URL}/${editingTodo._id}`, {
          text: newTodo.trim(),
          date: todoDate ? todoDate.toISOString().split('T')[0] : editingTodo.date,
          completed: editingTodo.completed
        });
        setTodos(todos.map(todo => todo._id === editingTodo._id ? data : todo));
        setEditingTodo(null);
      } else {
        const { data } = await axios.post(API_URL, { 
          text: newTodo.trim(),
          date: todoDate ? todoDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setTodos([data, ...todos]);
      }
      setNewTodo('');
      setTodoDate(null);
    } catch (err) {
      setError(editingTodo ? 'Failed to update todo' : 'Failed to create todo');
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setNewTodo(todo.text);
    setTodoDate(todo.date ? new Date(todo.date) : null);
  };

  const handleCancel = () => {
    setEditingTodo(null);
    setNewTodo('');
    setTodoDate(null);
  };

  const handleToggle = async (id) => {
    try {
      const todo = todos.find(t => t._id === id);
      const { data } = await axios.put(`${API_URL}/${id}`, {
        ...todo,
        completed: !todo.completed
      });
      setTodos(todos.map(todo => 
        todo._id === id ? data : todo
      ));
    } catch (err) {
      setError('Failed to update todo');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
      if (editingTodo && editingTodo._id === id) {
        handleCancel();
      }
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" 
           style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="spinner-grow" 
             style={{ color: '#4c6fff', width: '3rem', height: '3rem' }} 
             role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5 px-3" 
         style={{ 
           background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
           backdropFilter: 'blur(10px)'
         }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="card-header border-0 p-4"
               style={{
                 background: 'linear-gradient(135deg, #4c6fff 0%, #6c8fff 100%)',
                 borderBottom: '1px solid rgba(255,255,255,0.1)'
               }}>
            <h1 className="display-6 mb-0 text-center text-white fw-bold d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-check2-circle"></i>
              Task Manager
            </h1>
          </div>

          {error && (
            <div className="alert alert-danger m-3 mb-0 d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close ms-auto" 
                onClick={() => setError('')}
              />
            </div>
          )}

          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      id="todoInput"
                      placeholder="What needs to be done?"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      style={{
                        borderRadius: '12px',
                        height: '60px'
                      }}
                    />
                    <label htmlFor="todoInput">What needs to be done?</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-floating">
                    <DatePicker
                      selected={todoDate}
                      onChange={(date) => setTodoDate(date)}
                      minDate={new Date()}
                      className="form-control form-control-lg border-2"
                      placeholderText="Select due date"
                      dateFormat="MMMM d, yyyy"
                      style={{
                        borderRadius: '12px',
                        height: '60px',
                        width: '100%'
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-2 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg flex-grow-1 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4c6fff 0%, #6c8fff 100%)',
                      border: 'none',
                      height: '60px'
                    }}
                  >
                    {editingTodo ? (
                      <>
                        <i className="bi bi-check2-circle"></i>
                        
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-lg"></i>
                        Add
                      </>
                    )}
                  </button>
                  {editingTodo && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg d-flex align-items-center justify-content-center"
                      onClick={handleCancel}
                      style={{
                        borderRadius: '12px',
                        height: '60px',
                        width: '60px'
                      }}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="todo-list">
              {todos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-list-check text-primary" style={{ fontSize: '4rem' }}></i>
                  <p className="lead mb-0 mt-3 text-muted fw-semibold">
                    Your task list is empty. Time to be productive!
                  </p>
                </div>
              ) : (
                todos.map(todo => (
                  <div
                    key={todo._id}
                    className={`todo-item d-flex align-items-center gap-3 p-4 mb-3 rounded-3 ${
                      editingTodo && editingTodo._id === todo._id ? 'border-primary' : ''
                    }`}
                    style={{
                      backgroundColor: todo.completed ? '#f8f9fa' : 'white',
                      border: '2px solid',
                      borderColor: editingTodo && editingTodo._id === todo._id ? '#4c6fff' : '#e9ecef',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input border-2"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo._id)}
                        style={{ 
                          width: '1.5em', 
                          height: '1.5em',
                          cursor: 'pointer',
                          borderRadius: '6px'
                        }}
                      />
                    </div>
                    
                    <div className="flex-grow-1">
                      <span
                        className={`${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}
                        style={{ 
                          fontSize: '1.1rem',
                          fontWeight: 500
                        }}
                      >
                        {todo.text}
                      </span>
                      {todo.date && (
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <i className="bi bi-calendar3 text-muted"></i>
                          <small className="text-muted">
                            Due: {new Date(todo.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleEdit(todo)}
                        className={`btn btn-link p-2 rounded-circle ${todo.completed ? 'text-muted' : 'text-primary'}`}
                        title="Edit task"
                        disabled={todo.completed}
                        style={{
                          opacity: todo.completed ? 0.5 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(todo._id)}
                        className="btn btn-link text-danger p-2 rounded-circle"
                        title="Delete task"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoList; 