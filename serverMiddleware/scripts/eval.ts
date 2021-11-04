import fs from 'fs'
import Search from '../scripts/search'

const query = fs.readFileSync('./static/query.text').toString('utf-8').split('\n')
const qrels = fs.readFileSync('./static/qrels.text').toString('utf-8').split('\n')

export default class Eval {
  public static queries: any

  public static evaluateIRSystem(invertResult) {
    this.runQuery(invertResult)

    // return {
    //   map: this.getMAP(),
    //   rprecision: this.getRPrecision()
    // }
  }

  private static runQuery(invertResult) {
    let queryNumber = ''
    let action = ''
    for (let i = 0; i < query.length; i++) {
      const text = query[i]
      switch (query[i].substring(0, 2)) {
        case('.I'):
          action = 'I'
          queryNumber = text.split(' ')[1]
          console.log(queryNumber)
          this.queries= {
            [queryNumber]: {
              query: '',
              qrels: [],
              searchResult: [],
              queryId: 0,
              documentId: 0
            }
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
              this.queries[queryNumber].query += ` ${text}`
              break
            case('A'):
            case('N'):
            case('K'):
              break
          }
      }
    }

    console.log(this.queries)

    for (let i = 1; i < qrels.length; i++) {
      const text = qrels[i].split(' ');
      if (text[i].startsWith('0')) {
        console.log(text[0].charAt(1))
        this.queries[text[0].charAt(1)].qrels.push(text[1])
      } else {
        this.queries[text[0]].qrels.push(text[1])
      }
    }

    Object.keys(this.queries).forEach((queryId) => {
      this.queries[queryId].searchResult = Search.query(this.queries[queryId].query, invertResult)
    })

    console.log(this.queries)
  }

  // private static getRPrecision(searchResult, invertResult) {
  //
  //
  //   return
  // }
}
