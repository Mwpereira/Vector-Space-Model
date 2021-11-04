import fs from 'fs'
import Search from '../scripts/search'

const query = fs.readFileSync('./static/query.text').toString('utf-8').split('\n')
const qrels = fs.readFileSync('./static/qrels.text').toString('utf-8').split('\n')

export default class Eval {
  public static queries: any

  public static evaluateIRSystem(invertResult) {
    this.runQuery(invertResult, {})

    return this.getMAP(invertResult)
  }

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

  private static getMAP(invertResult) {
    const results = []
    Object.keys(this.queries).forEach((queryId) => {
      this.queries[queryId].qrels.sort()
      this.queries[queryId].searchResult = Search.query(this.queries[queryId].query, invertResult)
      this.queries[queryId].map = this.calcPrecision(queryId)
      results.push({
        // @ts-ignore
        query: this.queries[queryId].query.toString(),
        // @ts-ignore
        queryId,
        // @ts-ignore
        map: this.queries[queryId].map
      })
    })

    return results
  }

  private static calcPrecision(queryId: string) {
    let p = 0
    const count = 1
    for (let i = 0; i < this.queries[queryId].searchResult.length; i++) {
      for (let j = 0; j < this.queries[queryId].qrels.length; j++) {
        if (this.queries[queryId].searchResult[i].documentId === this.queries[queryId].qrels[j]) {
          p += count / j
        }
        if (j > i) {
          break
        }
      }
    }
    return p  / this.queries[queryId].searchResult.length
  }

  private static getRPrecision() {
    return 0;
  }
}
