import './App.css'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SentencesPage from "./pages/SentencesPage.jsx";
import DictionaryPage from "./pages/DictionaryPage.jsx";
import HSKListsPage from "./pages/HSKListsPage.jsx";
import AnalyzerPage from "./pages/AnalyzerPage.jsx";
import TranslatorPage from "./pages/TranslatorPage.jsx";
import WordListsPage from "./pages/WordListsPage.jsx";

function App() {
    return (
        <Router>
            <div>
                {/* Define your routes */}
                <main>
                    <Routes>
                        {/* Default Route */}
                        <Route path="/" element={<HomePage/>}/>
                        <Route path={"/dictionary"} element={<DictionaryPage/>}/>
                        <Route path={"/hsk_lists"} element={<HSKListsPage/>}/>
                        <Route path={"/sentences"} element={<SentencesPage/>}/>
                        <Route path={"/analyzer"} element={<AnalyzerPage/>}/>
                        <Route path={"/translator"} element={<TranslatorPage/>}/>
                        <Route path={"/word_lists"} element={<WordListsPage/>}/>
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App
