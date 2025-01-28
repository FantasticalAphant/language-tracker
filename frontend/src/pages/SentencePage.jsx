import {useEffect, useState} from "react";
import Layout from "../components/Layout.jsx";
import {useParams} from "react-router";
import {API_URL} from "../../utils/api.js";

export default function SentencePage() {
    const {sentenceId} = useParams();
    const [sentence, setSentence] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true)
        const fetchData = async () => {
            const response = await fetch(`${API_URL}/sentence/${sentenceId}`);
            const data = await response.json();
            setSentence(data);
            setIsLoading(false)
        }
        fetchData();
    }, [sentenceId])

    return (
        <div>
            <Layout>
                {isLoading ? (
                    <p>Getting Translation...</p>
                ) : (
                    <>
                        <p className="text-3xl">{sentence["text"]}</p>
                        <p className="text-3xl">{sentence["translated_sentence"]}</p>
                    </>
                )}
            </Layout>
        </div>
    )
}