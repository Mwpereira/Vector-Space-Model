import express from 'express'
import Invert from './scripts/invert'
import Search from './scripts/search'

const app = express()
const bodyParser = require('body-parser')

let invertResult = {
  dictionary: {},
  postings: {},
  documents: {},
  settings: {
    removeStopWords: false,
    stemWords: false
  }
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post('/invert', (req, res) => {
  try {
    invertResult.settings = {
      removeStopWords: req.body.removeStopWords,
      stemWords: req.body.stemWords
    }
    const data = Invert.runScript(invertResult.settings)
    invertResult = {
      dictionary: data.dictionary,
      postings: data.postings,
      documents: data.documents,
      settings: data.settings
    }
    res.json({
      documents: Object.entries(invertResult.documents).length,
      terms: Object.entries(invertResult.dictionary).length
    })
  } catch {
    res.status(404).json({
      error: 'Server Error'
    })
  }
})

app.post('/search', (req, res) => {
  try {
    if (Object.keys(invertResult.documents).length === 0) {
      res.status(404).json({
        error: 'Please Invert Index First'
      })
      return
    }
    const response = Search.searchKeyword(req.body.keyword, invertResult)
    res.json({ ...response })
  } catch(error) {
    console.log(error)
    res.status(404).json({
      error: 'Server Error'
    })
  }
})

module.exports = app
