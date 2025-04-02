import TodoList from './components/TodoList.jsx'

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <TodoList />
    </div>
  )
}

export default App
