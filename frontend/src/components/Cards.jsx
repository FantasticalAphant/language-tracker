import {EllipsisVerticalIcon} from '@heroicons/react/20/solid'
import {Link} from "react-router-dom";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

// eslint-disable-next-line react/prop-types
export default function Cards({wordLists}) {
    return (
        <div>
            <h2 className="text-sm font-medium text-gray-500">User Lists</h2>
            <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {wordLists.map((wordList) => (
                    <li key={wordList.name} className="col-span-1 flex rounded-md shadow-sm">
                        <div
                            className={classNames(
                                "bg-pink-600", // allow user to choose color using color picker
                                'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white',
                            )}
                        >
                            {wordList.name[0]}
                        </div>
                        <div
                            className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                            <div className="flex-1 truncate px-4 py-2 text-sm">
                                <Link to={`/word_lists/${wordList.id}`}
                                      className="font-medium text-gray-900 hover:text-gray-600">
                                    {wordList.name}
                                </Link>
                                {/*TODO: print number of words in the list*/}
                                <p className="text-gray-500">{wordList.entries.length} Words</p>
                            </div>
                            <div className="flex-shrink-0 pr-2">
                                <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <span className="sr-only">Open options</span>
                                    <EllipsisVerticalIcon aria-hidden="true" className="h-5 w-5"/>
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
