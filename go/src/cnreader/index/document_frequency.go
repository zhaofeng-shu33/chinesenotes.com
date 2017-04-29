/*
For every term, store the number of documents that contain the term
*/
package index

import (
	"bufio"
	"cnreader/config"
	"encoding/json"
	"io/ioutil"
	"log"
	"math"
	"os"
)

// File name for document index
const DOC_FREQ_FILE = "doc_freq.json"

// Map from term to number of documents referencing the term
type DocumentFrequency struct {
	DocFreq map[string]int
	N       *int // total number of documents
}

// Loaded from disk in contrast to partially ready and still accumulating data
var completeDF DocumentFrequency

func init () {
	df, err := ReadDocumentFrequency()
	if err != nil {
		log.Println("index.init Error reading document frequency: ", err)
	}
	completeDF = df
}

// Initializes a DocumentFrequency struct
func NewDocumentFrequency() DocumentFrequency {
	zero := 0
	return DocumentFrequency{
		DocFreq: map[string]int{},
		N: &zero,
	}
}

// Adds the given vocabulary to the map and increments the document count
// Param:
//   vocab - word frequencies are ignored, only the presence of the term is 
//           important
func (df *DocumentFrequency) AddVocabulary(vocab map[string]int) {
	for k, _ := range vocab {
		_, ok := df.DocFreq[k]
		if ok {
			df.DocFreq[k]++
		} else {
			df.DocFreq[k] = 1
		}
	}
	*df.N += 1
}

// Computes the inverse document frequency for the given term
// Param:
//   term: the term to find the idf for
func (df *DocumentFrequency) IDF(term string) (val float64, ok bool) {
	ndocs, ok := df.DocFreq[term]
	if ok && ndocs > 0 {
		val = math.Log10(float64(*df.N) / float64(ndocs))
	//log.Println("index.IDF: term, val, df.n, ", term, val, df.N)
	} 
	return val, ok
}

// Writes a document frequency object from a json file
func ReadDocumentFrequency() (df DocumentFrequency, e error) {
	dir := config.IndexDir()

	fname := dir + "/" + DOC_FREQ_FILE
	bytes, err := ioutil.ReadFile(fname)
	if err != nil {
		log.Println("index.ReadDocumentFrequency: error, ", err)
		return df, err
	}
	json.Unmarshal(bytes, &df)
	return df, err
}

// term frequency - inverse document frequency for the string
// Params
//   term: The term (word) to compute the tf-idf from
//   count: The count of the word in a specific document
func tfIdf(term string, count int) (val float64, ok bool) {
	idf, ok := completeDF.IDF(term)
	//log.Println("index.tfIdf: idf, term, ", idf, term)
	if ok {
		val = float64(count) * idf
	} else {
		//log.Println("index.tfIdf: could not compute tf-idf for, ", term)
	}
	return val, ok
}

// Writes the document frequency to json file
func (df *DocumentFrequency) WriteToFile() {
	dir := config.IndexDir()
	log.Println("index.DocumentFrequency.WriteToFile: N, ", df.N)
	fname := dir + "/" + DOC_FREQ_FILE
	f, err := os.Create(fname)
	if err != nil {
		log.Println("index.DocumentFrequency.WriteToFile: error, ", err)
		return
	}
	defer f.Close()
	w := bufio.NewWriter(f)
	encoder := json.NewEncoder(w)
	encoder.Encode(*df)
	w.Flush()
}