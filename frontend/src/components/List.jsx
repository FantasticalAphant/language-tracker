import {PlusIcon} from "@heroicons/react/20/solid";
import WordListModal from "./WordListModal.jsx";
import {useState} from "react";

const headings = ['Simplified', 'Traditional', 'Pinyin', 'Definition'];

// TODO: split this into two components: one for dictionary and one for hsk lists
// eslint-disable-next-line react/prop-types
export default function List({words, isOpen, setIsOpen}) {
    const [currentWordId, setCurrentWordId] = useState(null);

    const handleOpenModal = (wordId) => {
        setCurrentWordId(wordId);
        setIsOpen(true);
    }

    return (
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                    <tr className="divide-x divide-grey-200">
                        {headings.map((heading) => (
                            <th
                                key={heading}
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                {heading}
                            </th>
                        ))}
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                    {words.map((word, index) => (
                        <>
                            <tr key={index} className="divide-x even:bg-gray-50">
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{word.simplified}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{word.traditional}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {setIsOpen ? word.pronunciations.map(p => p.pinyin).join("") : word.pinyin}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {setIsOpen ? word.definitions.map(d => d.definition).join(" ") : word.definition}
                                </td>
                            </tr>
                            {
                                setIsOpen &&
                                <button
                                    onClick={() => handleOpenModal(word["id"])}
                                    className="rounded-full bg-indigo-600 p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    <PlusIcon aria-hidden="true" className="h-4 w-4"/>
                                </button>
                            }
                        </>
                    ))}
                    </tbody>
                </table>
            </div>
            {setIsOpen &&
                <WordListModal entryId={currentWordId} isOpen={isOpen}
                               setIsOpen={setIsOpen}/>
            }
        </div>
    )
}
