import fs from 'fs'
import * as sw from 'stopword'
import ResultEntry from '~/interfaces/ResultEntry'

const natural = require('natural')

const stopwords = fs.readFileSync('./static/common_words').toString('utf-8').split('\n')

export default class Search {
  public static searchKeyword(keyword: string, invertResult: any): any {
    let word = keyword.trim().toLowerCase()
    const results: ResultEntry[] = []

    // Check through settings to see if adjustments are required
    if (invertResult.settings.removeStopWords || invertResult.settings.stemWords) {
      let tempArr = []
      if (invertResult.settings.removeStopWords) {
        tempArr = sw.removeStopwords([word], stopwords)
        word = tempArr[0]
      }

      if (invertResult.settings.stemWords) {
        word = natural.PorterStemmer.stem(word)
      }
    }

    if (invertResult.dictionary[word]) {
      // Check to see if term exists in the dictionary
      Object.keys(invertResult.postings[word]).forEach((documentId) => {
        const entry: ResultEntry = {
          ranking: 0,
          title: invertResult.documents[documentId].title,
          authors: invertResult.postings[word][documentId].authors,
        }
        results.push(entry)
      })
      console.info('Results Found!')
      return { results }
    } else {
      console.info('No Results Found!');
      return { results: [] }
    }
  }
}
