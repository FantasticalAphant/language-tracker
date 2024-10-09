import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/20/solid'
import React from 'react';

// eslint-disable-next-line react/prop-types
const PaginationComponent = ({totalResults, resultsPerPage, currentPage}) => {
    const totalPages = Math.ceil(totalResults / resultsPerPage);

    const generatePageNumbers = () => {
        const pageNumbers = [];
        const rangeStart = Math.max(1, currentPage - 1);
        const rangeEnd = Math.min(totalPages, currentPage + 1);

        if (rangeStart > 1) {
            pageNumbers.push(1);
            if (rangeStart > 2) pageNumbers.push('...');
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            pageNumbers.push(i);
        }

        if (rangeEnd < totalPages) {
            if (rangeEnd < totalPages - 1) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    const pageNumbers = generatePageNumbers();

    const startResult = ((currentPage - 1) * resultsPerPage) + 1;
    const endResult = Math.min(currentPage * resultsPerPage, totalResults);

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <a
                    href="#"
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Previous
                </a>
                <a
                    href="#"
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Next
                </a>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startResult}</span> to <span
                        className="font-medium">{endResult}</span> of{' '}
                        <span className="font-medium">{totalResults}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <a
                            href="#"
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true"/>
                        </a>
                        {pageNumbers.map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    ...
                  </span>
                                ) : (
                                    <a
                                        href="#"
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                            page === currentPage
                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                        }`}
                                        aria-current={page === currentPage ? 'page' : undefined}
                                    >
                                        {page}
                                    </a>
                                )}
                            </React.Fragment>
                        ))}
                        <a
                            href="#"
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true"/>
                        </a>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default PaginationComponent;
