import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { todoAPI } from '../services/api'
import './AddTaskPage.css'

function AddTaskPage() {
  const navigate = useNavigate()
  const [taskName, setTaskName] = useState('')
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      const response = await todoAPI.getAll()
      if (response.status === 'success') {
        setTodos(response.data.todos)
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
    }
  }

  const handleAddTask = async () => {
    if (!taskName.trim()) {
      setError('Please enter a task name')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await todoAPI.create(taskName)
      if (response.status === 'success') {
        setSuccess('Task added successfully!')
        setTaskName('')
        await loadTodos()
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (err) {
      console.error('Add task error:', err)
      setError(err.response?.data?.message || 'Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTask = async (todoId) => {
    try {
      const response = await todoAPI.toggle(todoId)
      if (response.status === 'success') {
        await loadTodos()
      }
    } catch (err) {
      console.error('Toggle task error:', err)
      setError('Failed to update task')
    }
  }

  const handleDeleteTask = async (todoId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      const response = await todoAPI.delete(todoId)
      if (response.status === 'success') {
        await loadTodos()
      }
    } catch (err) {
      console.error('Delete task error:', err)
      setError('Failed to delete task')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAddTask()
    }
  }

  return (
    <div className="add-task-page">
      <div className="task-page-header">
        <button className="task-back-button" onClick={() => navigate('/home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>Add Task</h1>
      </div>

      <div className="task-content">
        {error && <div className="task-error-msg">{error}</div>}
        {success && <div className="task-success-msg">{success}</div>}

        <div className="task-input-section">
          <input
            type="text"
            className="task-input-field"
            placeholder="Enter your Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          <button 
            className="task-add-button"
            onClick={handleAddTask}
            disabled={loading || !taskName.trim()}
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>

        <div className="task-list-section">
          <div className="task-section-divider">
            <span>Your Task</span>
          </div>

          {todos.length === 0 ? (
            <div className="task-empty-state">
              <div className="task-empty-icon">📝</div>
              <p>No tasks yet. Add your first task!</p>
            </div>
          ) : (
            <div className="task-list">
              {todos.map((todo) => (
                <div 
                  key={todo._id} 
                  className={`task-item ${todo.isCompleted ? 'completed' : ''}`}
                >
                  <div className="task-checkbox-wrapper">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={todo.isCompleted}
                      onChange={() => handleToggleTask(todo._id)}
                    />
                  </div>
                  <div className="task-details">
                    <p className="task-name">{todo.taskName}</p>
                    <p className="task-date">
                      {new Date(todo.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    className="task-delete-button"
                    onClick={() => handleDeleteTask(todo._id)}
                    title="Delete task"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M10 11L10 17M14 11L14 17M4 7L20 7M6 7L6 19C6 20.1046 6.89543 21 8 21L16 21C17.1046 21 18 20.1046 18 19L18 7M9 7L9 4L15 4L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddTaskPage
