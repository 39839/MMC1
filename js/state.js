// State Management Module
export const state = {
    commentaryData: null,
    currentParshaRef: null,
    currentParshaIndex: -1,
    allParshas: [],
    isLoading: false,
    currentParshaSignificance: null,
    currentParshaSignificanceName: null
};

export function setState(updates) {
    Object.assign(state, updates);
}

export function getState() {
    return { ...state };
}
