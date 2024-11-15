import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react"
import EmptyState from "../EmptyState.jsx";

describe('EmptyState', () => {
    it('renders empty state message and button', () => {
        render(<EmptyState />)

        // Check if main text elements are present
        expect(screen.getByText('No Word Lists')).toBeInTheDocument()
        expect(
            screen.getByText('Get started by creating a new word list.')
        ).toBeInTheDocument()

        // Check if button is present
        const button = screen.getByRole('button', { name: /new word list/i })
        expect(button).toBeInTheDocument()
    })
})
