import fs from 'fs'
import Search from '../scripts/search'

const query = fs.readFileSync('./static/query.text').toString('utf-8').split('\n')
const qrels = fs.readFileSync('./static/qrels.text').toString('utf-8').split('\n')

export default class Eval {
  public static queries: any

  public static evaluateIRSystem(invertResult) {
    this.runQuery(invertResult, {})

    return this.getEval(invertResult)
  }

  /**
   *  Retrieves queries from query.txt and obtains their rel values from qrels
   */
  private static runQuery(invertResult, queries) {
    let queryNumber = ''
    let action = ''
    for (let i = 0; i < query.length - 1; i++) {
      const text = query[i]
      switch (query[i].substring(0, 2)) {
        case('.I'):
          action = 'I'
          queryNumber = text.split(' ')[1]
          queries[queryNumber] = {
            query: '',
            qrels: [],
            searchResult: [],
            queryId: 0,
            map: 0
          }
          break
        case('.W'):
          action = 'W'
          break
        case('.A'):
          action = 'A'
          break
        case('.N'):
          action = 'N'
          break
        default:
          switch (action) {
            case('W'):
              queries[queryNumber].query += ` ${text}`
              break
            case('A'):
            case('N'):
              break
          }
      }
    }

    delete queries['0']

    try {
      for (let i = 0; i < qrels.length; i++) {
        const text = qrels[i].split(' ')
        if (text[0].startsWith('0')) {
          queries[text[0].charAt(1)].qrels.push(text[1])
        } else {
          queries[text[0]].qrels.push(text[1])
        }
      }
    } catch {
      console.log("Error")
    }

    Object.keys(queries).forEach((queryId) => {
      queries[queryId].searchResult = Search.query(queries[queryId].query, invertResult)
    })

    this.queries = queries
  }

  /**
   * Handles returning the results after retrieving MAP & R-P
   */
  private static getEval(invertResult) {
    const results = []
    Object.keys(this.queries).forEach((queryId) => {
      this.queries[queryId].searchResult = Search.query(this.queries[queryId].query, invertResult)
      const data = this.calcPrecision(queryId)
      this.queries[queryId].map = data.map
      this.queries[queryId].rp = data.rp
      results.push({
        // @ts-ignore
        query: this.queries[queryId].query.toString(),
        // @ts-ignore
        queryId,
        // @ts-ignore
        map: this.queries[queryId].map,
        // @ts-ignore
        rp: this.queries[queryId].rp
      })
    })

    return results
  }

  /**
   * Handles receiving MAP & R-Precision
   * MAP - Loops through query documents to see if their docs are within the relevant docs list
   *       and increases the count if they are and adds their precision value. Afterwards the total precision is divided
   *       by the total number of relevant documents.
   * R-P - Uses the amount of relevant documents and divided it by the total number of documents.
   */
  private static calcPrecision(queryId: string) {
    let p = 0
    let count = 0
    for (let i = 0; i < this.queries[queryId].qrels.length; i++) {
      for (let j = 0; j < this.queries[queryId].searchResult.length; j++) {
        if (this.queries[queryId].searchResult[j].documentId === this.queries[queryId].qrels[i]) {
          count++;
          p += count / (i + 1)
          break;
        }
      }
    }

    return {
      map: p / this.queries[queryId].searchResult.length,
      rp: this.getRPrecision(count, this.queries[queryId].searchResult.length)
    }
  }

  /**
   *  Calculate R-Precision based off the number of actual relevant docs / the total number of relevant documents
   */
  private static getRPrecision(rel: number, n: number) {
    return rel / n;
  }
}
