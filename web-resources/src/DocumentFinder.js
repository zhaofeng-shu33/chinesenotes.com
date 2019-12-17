import { HrefVariableParser } from "./HrefVariableParser";
export class DocumentFinder {
    constructor() {
        this.MAX_TITLE_LEN = 80;
        this.httpRequest = new XMLHttpRequest();
    }
    init() {
        const findForm = document.getElementById("findAdvancedForm");
        const findInput = document.getElementById("findInput");
        if (findForm && findInput) {
            findForm.onsubmit = () => {
                let query = "";
                if (findInput && findInput instanceof HTMLInputElement) {
                    query = findInput.value;
                }
                console.log(`DocumentFinder.init query: ${query}`);
                const collectionInput = document.getElementById("findInCollection");
                if (collectionInput && collectionInput instanceof HTMLInputElement) {
                    let col = "";
                    col = collectionInput.value;
                    const url = "/advanced_search.html#?text=" + query +
                        "&collection=" + col;
                    window.location.href = url;
                    return false;
                }
                const redirectToFull = document.getElementById("redirectToFullText");
                if (redirectToFull) {
                    if (collectionInput && collectionInput instanceof HTMLInputElement) {
                        const url1 = "/advanced_search.html#?text=" + query +
                            "&fulltext=true" + collectionInput.value;
                        window.location.href = url1;
                        return false;
                    }
                }
                let action = "/findadvanced";
                if (findForm && findForm instanceof HTMLFormElement &&
                    !findForm.action.endsWith("#")) {
                    action = findForm.action;
                }
                const url2 = action + "/?query=" + query;
                this.makeSearchRequest(url2);
                return false;
            };
        }
        const href = window.location.href;
        const parser = new HrefVariableParser();
        if (href.includes("&")) {
            const query = parser.getHrefVariable(href, "text");
            if (findInput && findInput instanceof HTMLInputElement) {
                findInput.value = query;
            }
            const col = parser.getHrefVariable(href, "collection");
            let action = "/findadvanced";
            if (findForm && findForm instanceof HTMLFormElement &&
                !findForm.action.endsWith("#")) {
                action = findForm.action;
            }
            let url = action + "/?query=" + query;
            if (col) {
                url = action + "/?query=" + query + "&collection=" + col;
            }
            this.makeSearchRequest(url);
        }
    }
    makeSearchRequest(url) {
        console.log("makeSearchRequest: url = " + url);
        if (!this.httpRequest) {
            this.httpRequest = new XMLHttpRequest();
            if (!this.httpRequest) {
                console.log("Giving up :( Cannot create an XMLHTTP instance");
                return;
            }
        }
        this.httpRequest.onreadystatechange = () => {
            this.alertSearchContents(this.httpRequest);
        };
        this.httpRequest.open("GET", url);
        this.httpRequest.send();
        const helpBlock = document.getElementById("lookup-help-block");
        if (helpBlock) {
            helpBlock.innerHTML = "Searching ...";
        }
        console.log("makeRequest: Sent request");
    }
    alertSearchContents(httpRequest) {
        let topSimBigram = 1000.0;
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("alertContents: Got a successful response");
                console.log(httpRequest.responseText);
                const obj = JSON.parse(httpRequest.responseText);
                const helpBlock = document.getElementById("lookup-help-block");
                if (helpBlock) {
                    helpBlock.style.display = "none";
                }
                const numDocuments = obj.NumDocuments;
                const documents = obj.Documents;
                if (numDocuments > 0) {
                    console.log("alertContents: processing summary reults");
                    const spand = document.getElementById("NumDocuments");
                    if (spand && (numDocuments == 50)) {
                        spand.innerHTML = "limited to " + numDocuments;
                    }
                    else if (spand) {
                        spand.innerHTML = numDocuments;
                    }
                    if (numDocuments > 0) {
                        console.log("alertContents: detailed results for documents");
                        const dTable = document.getElementById("findDocResultsTable");
                        const dOldBody = document.getElementById("findDocResultsBody");
                        if (dTable && dOldBody && dOldBody.parentNode) {
                            dTable.removeChild(dOldBody);
                        }
                        const dTbody = document.createElement("tbody");
                        const numDoc = documents.length;
                        if (numDoc > 0) {
                            if ("SimBigram" in documents[0]) {
                                topSimBigram = parseFloat(documents[0].SimBigram);
                            }
                        }
                        for (const doc of documents) {
                            this.addDocument(doc, dTbody, topSimBigram);
                        }
                        if (dTable) {
                            dTable.appendChild(dTbody);
                            dTable.style.display = "block";
                        }
                        const docResultsDiv = document.getElementById("docResultsDiv");
                        if (docResultsDiv) {
                            docResultsDiv.style.display = "block";
                        }
                    }
                    const findResults = document.getElementById("findResults");
                    if (findResults) {
                        findResults.style.display = "block";
                    }
                }
                else {
                    const msg = "No matching results found in document collection";
                    const elem = document.getElementById("findResults");
                    if (elem) {
                        elem.style.display = "none";
                    }
                    const elem2 = document.getElementById("findError");
                    if (elem2) {
                        elem2.innerHTML = msg;
                        elem2.style.display = "block";
                    }
                }
                const terms = obj.Terms;
                if (terms) {
                    console.log("alertContents: detailed results for dictionary lookup");
                    const qPara = document.getElementById("queryTermsP");
                    const qOldBody = document.getElementById("queryTermsBody");
                    if (qPara && qOldBody) {
                        qPara.removeChild(qOldBody);
                    }
                    const qBody = document.createElement("span");
                    if ((terms.length > 0) && terms[0].DictEntry &&
                        (!terms[0].Senses || (terms[0].Senses.length == 0))) {
                        console.log("alertContents: Query contains Chinese words", terms);
                        let i = 0;
                        for (const term of terms) {
                            addTerm(term, terms.length, qBody, i);
                            i++;
                        }
                    }
                    else {
                        console.log("alertContents: not able to handle this case", terms);
                    }
                    if (qPara) {
                        qPara.appendChild(qBody);
                        qPara.style.display = "block";
                    }
                    const qTitle = document.getElementById("queryTermsTitle");
                    if (qTitle) {
                        qTitle.style.display = "block";
                    }
                    const queryTerms = document.getElementById("queryTerms");
                    if (queryTerms) {
                        queryTerms.style.display = "block";
                    }
                }
                else {
                    console.log("alertContents: not able to load dictionary terms", terms);
                }
            }
            else {
                const msg = "There was a problem with the request.";
                console.log(msg);
                const elem1 = document.getElementById("findResults");
                if (elem1) {
                    elem1.style.display = "none";
                }
                const elem3 = document.getElementById("findError");
                if (elem3) {
                    elem3.innerHTML = msg;
                    elem3.style.display = "block";
                }
            }
            const elem2 = document.getElementById("lookup-help-block");
            if (elem2) {
                elem2.style.display = "none";
            }
        }
    }
    addCollection(doc, td) {
        const colTitle = doc.CollectionTitle;
        const colFile = doc.CollectionFile;
        const tn1 = document.createTextNode("Collection: ");
        td.appendChild(tn1);
        const a1 = document.createElement("a");
        a1.setAttribute("href", colFile);
        let colTitleText = colTitle;
        if (colTitleText.length > this.MAX_TITLE_LEN) {
            colTitleText = colTitleText.substring(0, this.MAX_TITLE_LEN - 1) + "...";
        }
        const tn2 = document.createTextNode(colTitleText);
        a1.appendChild(tn2);
        td.appendChild(a1);
    }
    addDocument(doc, dTbody, topSimBigram) {
        if ("Title" in doc && doc.Title) {
            const title = doc.Title;
            const glossFile = doc.GlossFile;
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.setAttribute("class", "mdl-data-table__cell--non-numeric");
            tr.appendChild(td);
            const textNode1 = document.createTextNode("Title: ");
            td.appendChild(textNode1);
            const a = document.createElement("a");
            const url = `${glossFile}#?highlight=${doc.MatchDetails.LongestMatch}`;
            a.setAttribute("href", url);
            let titleText = title;
            if (titleText.length > this.MAX_TITLE_LEN) {
                titleText = titleText.substring(0, this.MAX_TITLE_LEN - 1) + "...";
            }
            const textNode = document.createTextNode(titleText);
            a.appendChild(textNode);
            td.appendChild(a);
            const br = document.createElement("br");
            td.appendChild(br);
            if (doc.CollectionTitle) {
                this.addCollection(doc, td);
            }
            const br1 = document.createElement("br");
            td.appendChild(br1);
            addMatchDetails(doc.MatchDetails, td);
            addRelevance(doc, td, topSimBigram);
            dTbody.appendChild(tr);
        }
        else {
            console.log("addDocument: no title for document ");
        }
    }
}
function addMatchDetails(md, td) {
    if (md.Snippet) {
        const snippet = md.Snippet;
        const snippetSpan = document.createElement("span");
        const lm = md.LongestMatch;
        const starts = snippet.indexOf(lm);
        if (starts > -1) {
            const snippetStart = snippet.substring(0, starts);
            const stn1 = document.createTextNode(snippetStart);
            snippetSpan.appendChild(stn1);
            const highlightSpan = document.createElement("span");
            highlightSpan.classList.add("usage-highlight");
            const stn2 = document.createTextNode(lm);
            highlightSpan.appendChild(stn2);
            snippetSpan.appendChild(highlightSpan);
            const ends = starts + lm.length;
            const snippetEnd = snippet.substring(ends);
            const stn3 = document.createTextNode(snippetEnd);
            snippetSpan.appendChild(stn3);
            td.appendChild(snippetSpan);
            const br2 = document.createElement("br");
            td.appendChild(br2);
        }
    }
    return td;
}
function addRelevance(doc, td, topSimBigram) {
    let relevance = "";
    if (parseFloat(doc.SimTitle) == 1.0) {
        relevance += "similar title; ";
    }
    if (doc.MatchDetails.ExactMatch) {
        relevance += "exact match; ";
    }
    else {
        if (doc.SimBitVector) {
            if (parseFloat(doc.SimBitVector) == 1.0) {
                relevance += "contains all query terms; ";
            }
        }
        if (doc.SimBigram) {
            const simBigram = parseFloat(doc.SimBigram);
            if (simBigram / topSimBigram > 0.5) {
                relevance += "query terms close together";
            }
        }
    }
    relevance = relevance.replace(/; $/, "");
    if (relevance == "") {
        relevance = "contains some query terms";
    }
    relevance = "Relevance: " + relevance;
    const tnRelevance = document.createTextNode(relevance);
    td.appendChild(tnRelevance);
}
function addTerm(term, nTerms, qBody, i) {
    const span = document.createElement("span");
    const a = document.createElement("a");
    a.setAttribute("class", "vocabulary");
    span.appendChild(a);
    const qText = term.QueryText;
    let pinyin = "";
    let wordURL = "";
    const textNode1 = document.createTextNode(qText);
    if (term.DictEntry && term.DictEntry.Senses) {
        pinyin = term.DictEntry.Pinyin;
        const hwId = term.DictEntry.Senses[0].HeadwordId;
        wordURL = "/words/" + hwId + ".html";
        a.setAttribute("href", wordURL);
        a.setAttribute("title", pinyin);
    }
    a.appendChild(textNode1);
    if (i < (nTerms - 1)) {
        const textNode2 = document.createTextNode("、");
        span.appendChild(textNode2);
    }
    qBody.appendChild(span);
}
//# sourceMappingURL=DocumentFinder.js.map