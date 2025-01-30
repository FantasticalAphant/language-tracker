import {useState} from "react";
import TextArea from "../components/TextArea.jsx";
import Layout from "../components/Layout.jsx";
import {API_URL} from "../../utils/api.js";
import {useLocalStorage} from "react-use";

export default function TranslatorPage() {
    const [data, setData] = useState([])
    const [text, setText] = useState('');
    const [history, setHistory] = useLocalStorage("translatorHistory", [])

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${API_URL}/translator`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({text: text}),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setData(data)

            const prevHistory = history;
            setHistory([...prevHistory, data].slice(-9));

            setText("");
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <>
            <Layout headerName={"Translator (DeepL)"} tabName={"Translator"}>
                <TextArea onTextSubmit={handleSubmit} text={text} setText={setText}
                          action={"translate"}/>

                <div className="mt-10 text-center text-2xl text-orange-700">
                    {data && data["translated_text"]}
                </div>

                <div className="text-3xl">
                    History:
                    {history.map(item => (
                        JSON.stringify(item)
                    ))}
                </div>
            </Layout>
        </>
    )
}
