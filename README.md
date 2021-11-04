# 📌 Group Members

- Michael Pereira
- Hitarth Chudgar (500888845)

# 🔍 Vector Space Model

This project requires [node.js](https://nodejs.org/en/download/).

## Build Setup

```bash
# install dependencies
$ yarn install 

# serve with hot reload at localhost:8080
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start
```

Alternatively, can use *npm* instead of yarn.

## Dictionary & Postings

Both files can be found under ```generated``` directory when the program generates them when a keyword is searched.

## CACM Resources

All files required for the assignment is found under the ```static``` directory.

## 📚 Frameworks

-   _Nuxt.js_ - for building user interfaces and connecting Javascript/Typescript code
-   _Bulma_ - for UI components and styling

## 🔐 Back-End

### Dependencies

-   _express_ - for running a server locally to access local files
-   _stopword_ - for removing stopwords from strings
-   _natural_ - for stemming words in strings

## 🎨 Front-End

### Dependencies

-   _Buefy_ - for using UI components for Vue.js based on Bulma
-   _axios_ - for the promise based HTTP client to handle requests

## 📝 Program Details

### Posting list order

The posting lists are in the ascending order of document ID.

Within the posting file, it is via the names:

term [documentId, TF [positions]]

### top-K method and value

To find our IDF threshold value we made use of:
Finding a set A of documents that are contenders, where K< |A| << N

We made use of the index-elimination method: as it onnly considers documents containing terms whose idfexceeds a threshold, and containing many (or all) of the query terms.

Our threshold values were: 

idfValues[i] > 1.60 && idfValues[i] < 3.51 (1.60, 3.51) - based on lower and upper limit of document matching.

Hence, K values lies between 1.60 and 3.51.

### tf-idf weighting scheme

We made use of the conventional weighthing scheme for tf-idf like so:

Step 1: Computing the Term Frequency(tf)

<img width="234" alt="Screen Shot 2021-11-03 at 10 06 39 PM" src="https://user-images.githubusercontent.com/20516641/140245422-bf2fc9d5-f6fb-423c-a860-661358566c6b.png">

fij measures term frequency in document.

Step 2: Compute the Inverse Document Frequency – idf

idfi= log(N/dfi) where N is the number of documents in the collection, dfimeasures how many documents term ki occurs in

Step 3: Calculating the weighting scheme

Combining IDF factors with TF

wij= tfij* idfi


