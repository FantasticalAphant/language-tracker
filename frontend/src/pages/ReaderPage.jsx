import Layout from "../components/Layout.jsx";
import {useState} from "react";

export default function ReaderPage() {
    const [text, setText] = useState(null);

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
            try {
                const content = await selectedFile.text();
                setText(content);
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }
    }

    return (
        <Layout headerName={"File Reader"} tabName={"Reader"}>
            <div className="mb-3">
                <input
                    type="file"
                    accept="text/plain,.txt"
                    onChange={handleFileChange}
                />
            </div>

            <div>
                {text}
            </div>
        </Layout>
    )
}