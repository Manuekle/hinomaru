// Prints the sentence-builder chips the app makes for each sentence, using the app's own
// KanaGO/Data/SentenceChunks.swift. generate_audio.py compiles and runs this:
//   swiftc -parse-as-library KanaGO/Data/SentenceChunks.swift scripts/sentence_chunks.swift
// stdin: JSON array of sentences · stdout: JSON array of chip arrays, same order.
import Foundation

enum SentenceBuilder {}

@main
struct SentenceChunksCLI {
    static func main() throws {
        let sentences = try JSONDecoder().decode([String].self, from: FileHandle.standardInput.readDataToEndOfFile())
        let out = try JSONEncoder().encode(sentences.map(SentenceBuilder.chunks))
        FileHandle.standardOutput.write(out)
    }
}
