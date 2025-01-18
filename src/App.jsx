import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const notify = () => toast('Here is your toast.');

  return (
    <>
      <div>
      <button onClick={notify}>Make me a toast</button>
      <Toaster />
    </div>
    </>
  )
}

export default App
