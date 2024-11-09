import {useEffect, useState} from "react";
import EmptyState from "../components/EmptyState.jsx";
import Cards from "../components/Cards.jsx";
import {useParams} from "react-router";
import Layout from "../components/Layout.jsx";
import IndividualWordList from "../components/IndividualWordList.jsx";

export default function WordListsPage() {
    const [data, setData] = useState([]);
    const [listName, setListName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {listId} = useParams();

    async function handleSubmit(event) {
        event.preventDefault();
        setListName("");
        const response = await fetch("http://localhost:8000/wordlists/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: listName}),
            }
        )

        const data = await response.json();

        setData(prevData => [...prevData, data]);
        console.log(data);
    }

    useEffect(() => {
        console.log(listId);
        setIsLoading(true);
        fetch("http://localhost:8000/wordlists")
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setData(data)
                setIsLoading(false);
            })
            .catch(err => console.log(err));
    }, []);

    const name = "Word Lists";

    return (
        <>
            <Layout headerName={name} tabName={name}>
                <div>
                    {isLoading ? (
                        "loading"
                    ) : data ? (
                        listId ? (
                            <IndividualWordList wordList={data.find((wordList) => wordList.id === Number(listId))}/>
                        ) : (
                            <Cards wordLists={data}/>
                        )
                    ) : (
                        <EmptyState/>
                    )}
                </div>
            </Layout>
            {!listId && <form onSubmit={handleSubmit}>
                <div className="flex justify-end space-x-2 pr-3">
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={listName}
                        onChange={(event) => setListName(event.target.value)}
                        placeholder="List Name"
                        className="block w-40 border-2 px-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 rounded"
                    />
                    <button
                        type="submit"
                        disabled={!listName.trim()}
                        className={`rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${listName.trim() ? "bg-indigo-600" : "bg-indigo-300 cursor-not-allowed"}`}
                    >
                        Create New List
                    </button>
                </div>
            </form>}
        </>
    )
}
