import './App.css'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SentencesPage from "./pages/SentencesPage.jsx";
import DictionaryPage from "./pages/DictionaryPage.jsx";
import HSKListsPage from "./pages/HSKListsPage.jsx";
import AnalyzerPage from "./pages/AnalyzerPage.jsx";
import TranslatorPage from "./pages/TranslatorPage.jsx";
import WordListsPage from "./pages/WordListsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import SentencePage from "./pages/SentencePage.jsx";
import LogInPage from "./pages/LogInPage.jsx";
import {AuthProvider, ProtectedRoute} from "./contexts/AuthContext.jsx";

function App() {

    return (
        <AuthProvider>
            <Router>
                <div>
                    {/* Define your routes */}
                    <main>
                        <Routes>
                            {/* Default Route */}
                            <Route path='*' element={<NotFoundPage/>}/>
                            <Route path={"/"} element={<HomePage/>}/>
                            <Route path={"/login"} element={<LogInPage/>}/>
                            <Route path={"/dictionary"} element={<DictionaryPage/>}/>
                            <Route path={"/hsk_lists"} element={<HSKListsPage/>}/>
                            <Route path={"/sentences"} element={<SentencesPage/>}/>
                            <Route path={"/sentences/:sentenceId"} element={<SentencePage/>}/>
                            <Route path={"/analyzer"} element={<AnalyzerPage/>}/>
                            <Route path={"/translator"} element={<TranslatorPage/>}/>
                            <Route
                                path={"/word_lists/:listId"}
                                element={
                                    <ProtectedRoute>
                                        <WordListsPage/>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path={"/word_lists"}
                                element={
                                    <ProtectedRoute>
                                        <WordListsPage/>
                                    </ProtectedRoute>
                                }
                            />
                            {/*<Route*/}
                            {/*    path={"/"}*/}
                            {/*    element={*/}
                            {/*        isAuthenticated ?*/}
                            {/*            <Navigate to={"/dashboard"} replace/> :*/}
                            {/*            <Navigate to={"/login"} replace/>*/}
                            {/*    }*/}
                            {/*/>*/}
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App
