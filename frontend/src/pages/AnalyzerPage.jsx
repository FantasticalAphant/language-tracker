import {useState} from "react";
import TextArea from "../components/TextArea.jsx";
import Layout from "../components/Layout.jsx";
import {API_URL} from "../../utils/api.js";

export default function AnalyzerPage() {
    const [data, setData] = useState([])
    const [text, setText] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${API_URL}/analyzer`, {
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
            setText("");
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const name = "Analyzer";

    return (
        <>
            <Layout headerName={name} tabName={name}>
                <TextArea onTextSubmit={handleSubmit} text={text} setText={setText}
                          action={"analyze"}/>

                <div className="mt-10 text-2xl text-gray-700">
                    <ul className="grid grid-cols-5 gap-5">
                        {data && data.map(entry => (
                            <li key={entry["word"]} className="border rounded-md text-center">
                                <div>Word: {entry["word"]}</div>
                                <div>Count: {entry["count"]}</div>
                                <div>HSK Level: {entry["hsk_level"] || "N/A"}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </Layout>
        </>
    )
}
