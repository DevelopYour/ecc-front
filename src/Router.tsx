import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Join from "./components/Join";
import Login from "./components/Login";

export default function Router() {
    const location = useLocation();
    return (
        <main className="h-[90%] overflow-y-auto flex flex-col items-center justify-center py-12">
            <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Join />} />
            </Routes>
        </main>
    )
}