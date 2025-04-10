import { BrowserRouter } from "react-router-dom"
import Router from "./Router"
import { Footer, Header } from "./Structure"

function App() {
  return (
    <div className="h-screen flex flex-col">
      <BrowserRouter>
        <Header />
        <main className="flex-1 overflow-y-auto py-10 px-4 sm:px-10">
          <Router />
        </main>
        {/* <Footer /> */}
      </BrowserRouter>
    </div>
  )
}

export default App
