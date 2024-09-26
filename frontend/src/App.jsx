import './App.css'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SentencesPage from "./pages/SentencesPage.jsx";

function App() {
    return (
        <Router>
            <div>
                {/* Define your routes */}
                <main>
                    <Routes>
                        {/* Default Route */}
                        <Route path="/" element={<HomePage/>}/>
                        <Route path={"/sentences"} element={<SentencesPage/>}/>
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App
