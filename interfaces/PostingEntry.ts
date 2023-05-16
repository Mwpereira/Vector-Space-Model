export default interface PostingEntry {
    documentId: string;
    frequency: number;
    termFrequency: number;
    positions: number[];
    vector: number[];
    weight: number;
    sim?: number;
}
