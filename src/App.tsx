import { BrowserRouter } from "react-router-dom"
import Router from "./Router"
import { Header, Footer } from "./Structure"

function App() {

  return (
    <>
      <div className="h-screen flex flex-col">
        <BrowserRouter>
          <Header />
          <Router />
          <Footer />
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
