// import fs from 'fs'
//
// const query = fs.readFileSync('./static/query.text').toString('utf-8').split('\n')
// const qrels = fs.readFileSync('./static/qrels.text').toString('utf-8').split('\n')
//
// export default class Eval {
//   public static evaluateIRSystem(searchResult) {
//     return {
//       map: this.getMAP(searchResult),
//       rprecision: this.getRPrecision(searchResult)
//     }
//   }
//
//   private static getMAP(searchResult) {
//     let queries = {};
//     let action = ''
//     for (let i = 0; i < query.length; i++) {
//       const text = query[i]
//       switch (query[i].substring(0, 2)) {
//         case('.I'):
//           action = 'I'
//           documentId = text.split(' ')[1]
//           docs[documentId] = {
//             title: '',
//             abstract: '',
//             date: '',
//             authors: '',
//             citation: '',
//             keywords: '',
//             keywordsArr: []
//           }
//           break
//         case('.W'):
//           action = 'W'
//           break
//         case('.A'):
//           action = 'A'
//           break
//         case('.N'):
//           action = 'N'
//           break
//         default:
//           switch (action) {
//             case('W'):
//               docs[documentId].abstract += ` ${text}`
//               break
//             case('A'):
//               docs[documentId].authors += text.trim()
//               break
//             case('N'):
//             case('K'):
//               break
//             case('X'):
//               docs[documentId].citation += text.replace(/\t/g, ' ').trim()
//               break
//           }
//       }
//     }
//
//     return ;
//   }
//
//   private static getRPrecision(searchResult) {
//
//
//     return ;
//   }
// }
