'use client'

import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from '@headlessui/react'
import {CheckIcon} from '@heroicons/react/24/outline'
import {useEffect, useState} from "react";

// eslint-disable-next-line react/prop-types
export default function WordListModal({isOpen, setIsOpen, entryId}) {
    const [lists, setLists] = useState([]);
    const [checkedLists, setCheckedLists] = useState([]); // lists that the entry is already in

    const [addedLists, setAddedLists] = useState([]); // lists that added the entry
    const [removedLists, setRemovedLists] = useState([]); // lists that removed the entry

    const token = localStorage.getItem("token");


    useEffect(() => {
        const getLists = async () => {
            const responses = await Promise.all([fetch("http://localhost:8000/wordlists", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }), fetch(`http://localhost:8000/wordlists/entries/${Number(entryId)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })]);
            const [listsData, checkedListsData] = await Promise.all(responses.map((response) => response.json()));
            setLists(listsData);
            setCheckedLists(checkedListsData);
        }

        getLists();
    }, [isOpen, entryId, token]);


    const handleUpdate = async () => {
        const queryParams = new URLSearchParams();

        // FIXME: with this implementation, there's probably going to be a bug if the user ticks and unticks the box in the same session

        addedLists.forEach(id => queryParams.append('add_wordlist_ids', id));
        removedLists.forEach(id => queryParams.append('remove_wordlist_ids', id));

        try {
            const responses = await Promise.all([
                fetch(`http://localhost:8000/wordlists/add/${entryId}?${queryParams.toString()}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                }), fetch(`http://localhost:8000/wordlists/remove/${entryId}?${queryParams.toString()}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            ]);

            // Optionally handle the response here
            const results = await Promise.all(responses.map((response) => response.json()));
            console.log(results);

            setIsOpen(false);
        } catch (error) {
            console.error('Error updating lists:', error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div>
                            <div
                                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <CheckIcon aria-hidden="true" className="h-6 w-6 text-green-600"/>
                            </div>
                            <div className="mt-3 text-center sm:mt-5">
                                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                    Add Entry to Lists?
                                </DialogTitle>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-900">
                                        <fieldset>
                                            <legend className="sr-only">Word Lists</legend>
                                            <div className="space-y-5">
                                                {lists.map((list, index) => (
                                                    <div key={index} className="relative flex items-start">
                                                        <div className="flex h-6 items-center">
                                                            <input
                                                                id="lists"
                                                                name="lists"
                                                                type="checkbox"
                                                                checked={checkedLists.includes(list["id"])}
                                                                aria-describedby="lists-description"
                                                                className="h-4 w-4 mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                                onChange={(e) => {
                                                                    if (e.target.checked) { // list was just added
                                                                        setAddedLists([...addedLists, list["id"]])
                                                                        setCheckedLists([...checkedLists, list["id"]])
                                                                    } else { // list was just removed
                                                                        setRemovedLists([...addedLists, list["id"]])
                                                                        setCheckedLists(checkedLists.filter((id) => id !== list["id"]))
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        {list["name"]}
                                                    </div>
                                                ))}
                                            </div>
                                        </fieldset>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleUpdate}
                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                data-autofocus
                                onClick={() => setIsOpen(false)}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                            >
                                Cancel
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
