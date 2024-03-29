<template>
  <section class='section'>
    <section class='has-text-centered'>
      <h1 class='title'>Vector Space Model Program</h1>
      <h2 class='is-size-5'>Completed By: Michael Pereira & Hitarth Chudgar</h2>
    </section>
    <section class='my-5'>
      <h3 class='is-size-5 has-text-weight-bold mb-4'>Instructions</h3>
      <div class='is-size-6'>
        <p>1. Choose your preferred settings (you must click Invert after changing settings)</p>
        <p>2. Wait for the dictionary and postings files to generate</p>
        <p>3. Search and receive the relevant documents related to your keyword search</p>
        <p>4. After completing the previous three steps, run the evaluation</p>
      </div>
    </section>
    <section class='my-5'>
      <h3 class='is-size-5 has-text-weight-bold mb-4'>Settings</h3>
      <b-field>
        <b-checkbox v-model='removeStopwords'
                    type='is-warning'>
          Enable Stopword Removal
        </b-checkbox>
      </b-field>
      <b-field>
        <b-checkbox v-model='stemWords'
                    type='is-warning'>
          Enable Stemming
        </b-checkbox>
      </b-field>
      <b-button class='my-1' @click='invert()'>
        Invert
      </b-button>
      <div v-show='invertResults' class='my-4'>
        <p class='has-text-weight-bold mb-2'>Dictionary & Posting Files:</p>
        <p>Terms before preprocessing: {{ invertResults !== null ? '10446 Terms' : 'N/A' }} </p>
        <p>Terms after preprocessing: {{ invertResults !== null ? `${invertResults.terms} Terms` : 'N/A' }}</p>
      </div>
    </section>
    <section class='my-5'>
      <div class='columns'>
        <div class='column'>
          <b-field class='is-size-5 has-text-weight-bold mb-4'>Search Documents</b-field>
          <b-field>
            <b-input v-model='keyword'
                     placeholder='Keyword'
                     type='search'
                     icon-pack='fas'
                     icon='search'
                     @keydown.native.enter='search'>
            </b-input>
          </b-field>
          <b-button class='mt-1' @click='search'>
            Search
          </b-button>
        </div>
        <div class='column'>
        </div>
      </div>
    </section>
    <section class='my-5'>
      <div class='columns'>
        <div class='column'>
          <b-field class='is-size-5 has-text-weight-bold mb-4'>Run Evaluation</b-field>
          <b-button class='mt-1' @click='evaluate'>
            Run
          </b-button>
        </div>
        <div class='column'>
        </div>
      </div>
    </section>
    <section v-if='results' class='my-5'>
      <p class='is-size-5'><span class='has-text-weight-bold'>Results:</span> {{ results.length }} Document(s)</p>
      <div v-for='(result, index) in results' :key='result'>
        <div class='box my-5'>
          <p><span class='has-text-weight-bold'>Ranking:</span> {{ index + 1 }}</p>
          <p><span class='has-text-weight-bold'>Document Title:</span> {{ result.title }} </p>
          <p><span class='has-text-weight-bold'>Authors:</span> {{ result.authors || 'Not Provided' }}</p>
        </div>
      </div>
    </section>
    <section v-if='eval' class='my-5'>
      <p class='is-size-5'><span class='has-text-weight-bold'>Results:</span> {{ eval.length }} Evaluation(s)</p>
      <div v-for='result in eval' :key='result'>
        <div class='box my-5'>
          <p><span class='has-text-weight-bold'>Query Id:</span> {{ result.queryId }} </p>
          <p><span class='has-text-weight-bold'>Query:</span> {{ result.query }}</p>
          <p><span class='has-text-weight-bold'>MAP:</span> {{ (result.map ? result.map.toFixed(3) : 0) || 0 }}</p>
          <p><span class='has-text-weight-bold'>R-Precision:</span> {{ (result.rp ? result.rp.toFixed(3) : 0) || 0 }}
          </p>
        </div>
      </div>
    </section>
  </section>
</template>

<script lang='ts'>
import {Component, Vue} from 'nuxt-property-decorator'
import axios from 'axios'
import BuefyService from '~/services/buefy-service'

@Component
export default class Index extends Vue {
  private removeStopwords = false
  private stemWords = false
  private invertResults = null

  private keyword = ''
  private results = null
  private eval = null

  private async search() {
    // Allowing String
    if (/\S/.test(this.keyword)) {
      this.eval = null;
      await BuefyService.startLoading()
      await axios.post('/search', {
        keyword: this.keyword
      }).then(response => {
        // @ts-ignore
        this.results = response.data.searchResult
        BuefyService.successToast('Documents Retrieved')
      }).catch(error => {
        BuefyService.dangerToast(error.response.data.error)
      })
      await BuefyService.stopLoading()
    }
  }

  private async evaluate() {
    this.results = null;
    await BuefyService.startLoading()
    await axios.post('/eval', {
      keyword: this.keyword
    }).then(response => {
      // @ts-ignore
      this.eval = response.data
      console.log(this.eval)
      BuefyService.successToast('Evaluation Complete')
    }).catch(error => {
      BuefyService.dangerToast(error.response.data.error)
    })
    await BuefyService.stopLoading()
  }

  private async invert() {
    await BuefyService.startLoading()
    await axios.post('/invert', {
      removeStopWords: this.removeStopwords,
      stemWords: this.stemWords
    }).then(response => {
      // @ts-ignore
      this.invertResults = response.data
      BuefyService.successToast('Dictionary & Postings Generated')
    }).catch(error => {
      BuefyService.dangerToast(error.response.data.error)
    })
    await BuefyService.stopLoading()
  }
}
</script>

<style>
.toast.is-success {
  background-color: rgba(70, 201, 58, 0.1) !important;
}

.toast.is-danger {
  background-color: rgba(255, 71, 87, 0.1) !important;
}

.toast.is-success {
  color: rgb(70, 201, 58) !important;
}

.toast.is-danger {
  color: rgb(255, 71, 87) !important;
}
</style>
