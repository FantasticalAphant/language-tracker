/*
  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
'use client'

// eslint-disable-next-line react/prop-types
export default function TextArea({onTextSubmit, text, setText, action}) {

    return (
        <div className="flex items-start space-x-4">
            <div className="min-w-0 flex-1">
                <form onSubmit={onTextSubmit} className="relative">
                    <div
                        className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                        <label htmlFor="comment" className="sr-only">
                            Text to {action}
                        </label>
                        <textarea
                            id="comment"
                            name="comment"
                            rows={10}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={`Text to ${action}...`}
                            className="block w-full resize-none border-0 bg-transparent p-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-2xl sm:leading-6"
                        />

                        {/* Spacer element to match the height of the toolbar */}
                        <div aria-hidden="true" className="py-2">
                            {/* Matches height of button in toolbar (1px border + 36px content height) */}
                            <div className="py-px">
                                <div className="h-9"/>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                        <div className="flex items-center space-x-5">
                            <div className="flex items-center">
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                type="submit"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                {/* eslint-disable-next-line react/prop-types */}
                                {action[0].toUpperCase() + action.slice(1)}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
