import Layout from "../components/Layout.jsx";
import {useState} from "react";
import {API_URL} from "../../utils/api.js";

export default function VideoTranscriptsPage() {
    const [url, setUrl] = useState("");
    const [transcriptInfo, setTranscriptInfo] = useState({});

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

            setTranscriptInfo(data);
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

            <div className="my-4 justify-self-center">
                {transcriptInfo["id"] && <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${transcriptInfo["id"]}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen>
                </iframe>}
            </div>

            <div>
                <ol className="list-decimal space-y-2">
                    {transcriptInfo["transcript"] && transcriptInfo["transcript"].map((subtitle, index) => (
                        <li key={index}>
                            <p>Text: {subtitle["text"]}</p>
                            <p>Start: {subtitle["start"]}</p>
                            <p>Duration: {subtitle["duration"]}</p>
                        </li>))}
                </ol>
            </div>
        </Layout>)
}