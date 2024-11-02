import {useEffect, useState} from "react";
import EmptyState from "../components/EmptyState.jsx";
import Cards from "../components/Cards.jsx";
import {useParams} from "react-router";
import Navbar from "../components/NavBar.jsx";

export default function WordListsPage() {
    const [data, setData] = useState([]);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {listId} = useParams();

    async function handleSubmit(event) {
        event.preventDefault();
        setName("");
        const response = await fetch("http://localhost:8000/wordlists/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: name}),
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


    return (
        <>
            {/*
        This example requires updating your template:

        ```
        <html class="h-full">
        <body class="h-full">
        ```
      */}
            <div className="min-h-full">
                <Navbar currentTab={"Word Lists"}/>

                <div className="py-10">
                    <header>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Word
                                Lists</h1>
                        </div>
                    </header>
                    <main>
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                            {isLoading ? (
                                "loading"
                            ) : data ? (
                                listId ? (
                                    JSON.stringify(data.find((wordList) => wordList.id === Number(listId)))
                                ) : (
                                    <Cards wordLists={data}/>
                                )
                            ) : (
                                <EmptyState/>
                            )}
                        </div>
                    </main>
                </div>
                {!listId && <form onSubmit={handleSubmit}>
                    <div className="flex justify-end space-x-2 pr-3">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="List Name"
                            className="block w-40 border-2 px-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Create New List
                        </button>
                    </div>
                </form>}
            </div>
        </>
    )
}
