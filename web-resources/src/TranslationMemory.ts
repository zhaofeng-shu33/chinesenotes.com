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
 *  @fileoverview  JavaScript functions for sending and displaying search
 * results for the translation memory feature.
 */
import { fromEvent } from "rxjs";
import { ajax } from "rxjs/ajax";
import { catchError, map, retry } from "rxjs/operators";
import { TranslationMemoryView } from "./TranslationMemoryView";

export class TranslationMemory {
  public readonly NO_INPUT_MSG = "Please enter search criteria";
  private view: TranslationMemoryView;

  /**
   * Initialize the app to accept document search form events
   * @param {TranslationMemoryView} view - To display status and results
   */
  constructor(view: TranslationMemoryView) {
    this.view = view;
  }

  /**
   * Initialize the app to accept document search form events
   */
  public init() {
    console.log("TranslationMemory constructor");
    const findForm = document.getElementById("findTMForm");
    const findInput = document.getElementById("findTMInput");
    if (findForm && findInput) {
      fromEvent(findForm, "submit").subscribe(
      () => {
        this.makeRequest("/translation_memory", findInput.value);
      });
    }
  }

  /**
   * Send an AJAX request
   * @param {string} url - The URL to send the request to
   * @param {string} chinese - The chinese text to lookup
   */
  private makeRequest(urlString: string, chinese: string) {
    console.log(`makeRequest: urlString = ${urlString}`);
    this.view.showMessage("Searching ...");
    ajax.getJSON(urlString).pipe(
      map(
        (data) => {
          const jsonObj = data as IDocSearchRestults;
          const termsFound = jsonObj.Terms;
          this.view.showResults(termsFound, navHelper);
        }),
      catchError(
        (error) => {
          console.log(`TranslationMemory.makeDataSource errors ${error}`);
            // Retry with a delay
            this.view.showMessage("Error fetching data, retrying ...");
            const retriable = ajax.getJSON(urlString).pipe(delay(5000),
                                                           retry(5));
            retriable.subscribe(
              (data1) => {
                const jsonObj1 = data1 as IDocSearchRestults;
                const termsFound1 = jsonObj1.Terms;
                this.view.showResults(termsFound1);
              },
              (err) => {
                console.log(`makeRequest, failed after retries: ${err}`);
                this.view.showMessage("Unable to fetch data, giving up");
              },
            );
            return of("Completed retries");
          }
      }),
    ).subscribe(
      (x) => {
        console.log(`makeDataSource ${x}`);
      },
    );
  }