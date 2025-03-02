import Layout from "../components/Layout.jsx";
import {useState} from "react";
import {API_URL} from "../../utils/api.js";

export default function VideoTranscriptsPage() {
    const [url, setUrl] = useState("");
    const [transcript, setTranscript] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `${API_URL}/videos/transcript?video_url=${encodeURIComponent(url)}`
            )

            if (!response.ok) {
                throw Error("GET failed");
            }

            const data = await response.json();

            setTranscript(data);
            setUrl("");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <Layout headerName={"Transcripts"} tabName={"Video Transcripts"}>
            <div className="text-sm -mt-8">
                Get transcripts for videos on YouTube
            </div>
            <div className="mt-5 grid">
                <form onSubmit={e => handleSubmit(e)}>
                    <input
                        id="text"
                        name="text"
                        type="text"
                        placeholder="YouTube URL"
                        aria-label="YouTube URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="block w-full rounded-md bg-white p-1 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                    <button type="submit" className="bg-indigo-500 text-gray-100 p-1 mt-2 rounded-md">
                        Submit
                    </button>
                </form>
            </div>
            <div>
                {JSON.stringify(transcript)}
            </div>
        </Layout>)
}