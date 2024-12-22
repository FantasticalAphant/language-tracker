import {describe, it} from "vitest";
import HSKListsPage from "../HSKListsPage.jsx";
import {render} from "@testing-library/react";
import {TestWrapper} from "../../../utils/test-utils.jsx";

describe('HSKListsPage', () => {
    it('renders page for HSK lists', () => {
        render(
            <TestWrapper>
                <HSKListsPage/>
            </TestWrapper>
        );
    })
})
