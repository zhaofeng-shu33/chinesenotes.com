/*
 * Licensed  under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 /**
  * @fileoverview Unit tests for WordFinderView
  */

import { WordFinderView } from "../src/WordFinderView";

const fixture =
`
<div id='fixture'>
  <span id="lookup-help-block"/>
  <div id="queryTerms">
    <h4 id="queryTermsTitle">Dictionary Lookup</h4>
    <div id="queryTermsDiv">
       <ul id="queryTermsList">
         <li>Placeholder</li>
       </ul>
    </div>
  </div>
</div>
`;

describe("WordFinderView", () => {
  describe("#showResults", () => {
    beforeEach(() => {
      document.body.insertAdjacentHTML("afterbegin", fixture);
    });
    afterEach(() => {
      document.body.removeChild(document.getElementById("fixture"));
    });
    it("should show a message about no results", () => {
      const emptyResults = {
        Collections: [],
        Documents: [],
        NumCollections: 0,
        NumDocuments: 0,
        Terms: [],
      };
      const view = new WordFinderView();
      view.showResults(emptyResults);
      const helpBlock = document.getElementById("lookup-help-block");
      expect(helpBlock!.innerHTML).toBe(view.NO_RESULTS_MSG);
    });
    xit("should show two words", () => {
      const twoResults = {
        Collections: [],
        Documents: [],
        NumCollections: 0,
        NumDocuments: 0,
        Query: "我悟空",
        Terms: [ {
          DictEntry: {
            HeadwordId: 321,
            Pinyin: "wǒ",
            Senses: [{
              English: "I",
              HeadwordId: "321",
              Id: 321,
              Notes: "",
              Pinyin: "321",
              Simplified: "我",
              Traditional: "\\N",
            }],
            Simplified: "我",
            Traditional: "\\N",
          },
          QueryText: "我",
          Senses: [],
        }, {
          DictEntry: {
            HeadwordId: 64177,
            Pinyin: "wùkōng",
            Senses: [{
              English: "Sun Wukong",
              HeadwordId: "64177",
              Id: 64177,
              Notes: "The Monkey King",
              Pinyin: "wùkōng",
              Simplified: "悟空",
              Traditional: "\\N",
            }],
            Simplified: "悟空",
            Traditional: "\\N",
          },
          QueryText: "悟空",
          Senses: [],
        }],
      };
      const view = new WordFinderView();
      view.showResults(twoResults);
      const list = document.getElementById("queryTermsList") as HTMLElement;
      expect(list!.childNodes.length).toBe(2);
    });
  });
});
