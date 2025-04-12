import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Login from "./pages/Login";

export default function Router() {
    const location = useLocation();
    return (
        <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Join />} />
        </Routes>
    )
}