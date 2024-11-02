import {useState} from "react";
import TextArea from "../components/TextArea.jsx";
import Layout from "../components/Layout.jsx";

export default function AnalyzerPage() {
    const [data, setData] = useState([])
    const [text, setText] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8000/analyzer', {
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
            console.log('Success:', data);
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
                <ul className="list-disc">
                    <TextArea onTextSubmit={handleSubmit} text={text} setText={setText}
                              action={"analyze"}/>
                </ul>
            </Layout>
            {data && JSON.stringify(data.text)}
        </>
    )
}
