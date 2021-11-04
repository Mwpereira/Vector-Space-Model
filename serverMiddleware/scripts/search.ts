import fs from 'fs'
import * as sw from 'stopword'
import PostingEntry from '~/interfaces/PostingEntry'

const natural = require('natural')

const stopwords = fs.readFileSync('./static/common_words').toString('utf-8').split('\n')

export default class Search {
  public static searchKeyword(query: string, invertResult: any): any {
    query = 'I am interested in articles written either by Prieve or Udo Pooch'
    const fixedQuery = query.trim().toLowerCase()
    let words = fixedQuery.split(' ')

    // Check through settings to see if adjustments are required
    if (invertResult.settings.removeStopWords || invertResult.settings.stemWords) {
      if (invertResult.settings.removeStopWords) {
        words = sw.removeStopwords(words, stopwords)
      }

      if (invertResult.settings.stemWords) {
        for (let i = 0; i < words.length; i++) {
          words[i] = natural.PorterStemmer.stem(words[i])
        }
      }
    }

    const idfValues: number[] = []
    for (let i = 0; i < words.length; i++) {
      if (invertResult.dictionary[words[i]]) {
        idfValues.push(parseFloat(Math.log10(3204 / invertResult.dictionary[words[i]]).toFixed(3)))
      } else {
        idfValues.push(0)
      }
    }

    // Top-K - Index Elimination By Threshold
    const queryTerms: string[] = []
    if (words.length === 1) {
      queryTerms.push(words[0])
    } else {
      for (let i = 0; i < words.length; i++) {
        if (idfValues[i] > 1.60 && idfValues[i] < 3.51) {
          queryTerms.push(words[i])
        }
      }
    }

    // Get Relevant Documents + Terms
    const documents: PostingEntry[] = []
    const keywords: string[] = []
    const set = new Set();
    for (let i = 0; i < queryTerms.length; i++) {
      Object.keys(invertResult.postings[queryTerms[i]]).forEach((documentId: string) => {
        if (!set.has(documentId)) {
          documents.push(invertResult.postings[queryTerms[i]][documentId])
          if (invertResult.documents[documentId].keywords.length !== 0) {
            keywords.push(...invertResult.documents[documentId].keywords.split(' '))
          } else {
            keywords.push(...invertResult.documents[documentId].keywordsArr)
          }
        }
        set.add(documentId);
      })
    }

    // Go through each query term and collects relevant documents
    const terms = Array.from(new Set(keywords)).sort()
    const queryVector: number[] = []
    for (let i = 0; i < terms.length; i++) {
      documents.forEach((document: PostingEntry) => {
        if (invertResult.postings[terms[i]]) {
          if (invertResult.postings[terms[i]][document.documentId]) {
            document.vector.push(this.getWeight(invertResult, terms[i], document))
          } else {
            document.vector.push(0)
          }
        } else {
          document.vector.push(0)
        }
        const count = queryTerms.filter((v) => (v === terms[i])).length
        queryVector.push(this.getIDF(invertResult, terms[i]) * (1 + (count === 0 ? 0 : parseFloat(Math.log10(count).toFixed(3)))))
      })
    }

    const queryWeight = this.getQueryVector(queryVector)

    const results: any[] = []
    documents.forEach((document: PostingEntry) => {
      document.weight = this.getDocumentWeight(document)
      document.sim = this.getCosineSimilarity(document, queryVector, queryWeight)

      results.push({
        documentId: document.documentId,
        title: invertResult.documents[document.documentId].title,
        authors: invertResult.documents[document.documentId].authors,
        weight: document.weight
      })
    })

    results.sort((a, b) => {
      return b.weight - a.weight
    })

    console.log(results)
  }

  private static getCosineSimilarity(document: PostingEntry, queryVector: number[], queryWeight: number): number {
    let sum = 0
    for (let i = 0; i < queryVector.length; i++) {
      sum += document.vector[i] * queryVector[i]
    }
    return (sum) / (document.weight * queryWeight)
  }

  private static getQueryVector(weight: number[]) {
    let sum: number = 0
    for (let i = 0; i < weight.length; i++) {
      sum += Math.pow(weight[i], 2)
    }
    return Math.sqrt(sum)
  }

  private static getDocumentWeight(document: PostingEntry) {
    let sum: number = 0
    for (let i = 0; i < document.vector.length; i++) {
      sum += Math.pow(document.vector[i], 2)
    }
    return parseFloat(Math.sqrt(sum).toFixed(3))
  }

  private static getWeight(invertResult: any, word: string, document: PostingEntry) {
    return parseFloat((this.getIDF(invertResult, word) * this.getTF(invertResult, word, document.documentId)).toFixed(3))
  }

  private static getIDF(invertResult: any, word: string) {
    return invertResult.dictionary[word] ? Math.log(3204 / invertResult.dictionary[word]) : 0
  }

  private static getTF(invertResult: any, word: string, documentId: string) {
    return 1 + Math.log(invertResult.postings[word][documentId].termFrequency)
  }
}
