import {beforeEach, describe, expect, it, vi} from "vitest";
import HSKListsPage from "../HSKListsPage.jsx";
import {act, render, screen, waitFor} from "@testing-library/react";
import {TestWrapper} from "../../../utils/test-utils.jsx";

const level1Words = [
    {
        simplified: "的",
        traditional: "的",
        pinyin: "de5",
        definition: "indicates possession, like adding 's to a noun"
    },
    {
        simplified: "我",
        traditional: "我",
        pinyin: "wo3",
        definition: "I; me"
    }
];

const level2Words = [
    {
        simplified: "就",
        traditional: "就",
        pinyin: "jiu4",
        definition: "then; at once; just; only; with regard to"
    },
    {
        simplified: "要",
        traditional: "要",
        pinyin: "yao4, yao1",
        definition: "to want; to need; will/shall; important | demand; request"
    },
    {
        simplified: "知道",
        traditional: "知道",
        pinyin: "zhi1dao5",
        definition: "know; be aware of"
    }
];

describe('HSKListsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        global.fetch = vi.fn((url) => {
            // not the ideal format but it works for now
            const level = url.includes('level/2') ? level2Words : level1Words;
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(level)
            });
        });
    });

    it('renders HSK words from backend', async () => {
        render(
            <TestWrapper>
                <HSKListsPage/>
            </TestWrapper>
        );

        await waitFor(() => {
            const word1 = screen.getAllByText('的');
            const word2 = screen.getAllByText('我');
            expect(word1).toHaveLength(2);
            expect(word2).toHaveLength(2);
        });

        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/level/1/words');

        expect(screen.getByText('2 Words')).toBeInTheDocument();
    });

    it('updates data when changing HSK level', async () => {
        render(
            <TestWrapper>
                <HSKListsPage/>
            </TestWrapper>
        );

        act(() => {
            screen.getByText('2').click();
        });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/level/2/words');
        });

        await waitFor(() => {
            const word1 = screen.getAllByText('就');
            const word2 = screen.getAllByText('要');
            const word3 = screen.getAllByText('知道');
            expect(word1).toHaveLength(2);
            expect(word2).toHaveLength(2);
            expect(word3).toHaveLength(2);

            // make sure that words from level 1 don't show
            expect(screen.queryByText('的')).not.toBeInTheDocument();
        });

        expect(screen.getByText('3 Words')).toBeInTheDocument();
    });
})
