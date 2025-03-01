import Layout from "../components/Layout.jsx";

export default function VideoTranscriptsPage() {

    const handleSubmit = async () => {
    }

    return (
        <Layout headerName={"Transcripts"} tabName={"Video Transcripts"}>
            <div className="text-sm -mt-8">
                Get transcripts for videos on YouTube
            </div>
            <div className="mt-5 grid">
                <form onSubmit={handleSubmit}>
                    <input
                        id="text"
                        name="text"
                        type="text"
                        placeholder="YouTube URL"
                        aria-label="YouTube URL"
                        className="block w-full rounded-md bg-white p-1 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                    <button type="submit" className="bg-indigo-500 text-gray-100 p-1 mt-2 rounded-md">
                        Submit
                    </button>
                </form>
            </div>
        </Layout>)
}