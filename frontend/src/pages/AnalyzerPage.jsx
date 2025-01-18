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

                <div className="mt-10 text-center text-2xl text-orange-700">
                    {data && JSON.stringify(data.text)}
                </div>
            </Layout>
        </>
    )
}
