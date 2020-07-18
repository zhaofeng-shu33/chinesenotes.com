// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package for translation memory index
package tmindex

import (
	"fmt"
	"github.com/alexamies/chinesenotes-go/dicttypes"
	"io"
)

type indexEntry struct {
	c string
	term string
	count int
}

// Builds a translation memory index
func BuildIndex(w io.Writer, wdict map[string]dicttypes.Word) {
	tmindexUni := make(map[string]bool)
	for term, word := range wdict {
		for _, sense := range word.Senses {
			domain := sense.Domain
			for _, c := range term {
		  	line := fmt.Sprintf("%c\t%s\t%s\n", c, term, domain)
				if _, ok := tmindexUni[line]; ok {
					continue
				}
		  	io.WriteString(w, line)
		  	tmindexUni[line] = true
			}
		}
	}
}