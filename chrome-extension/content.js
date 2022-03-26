/*
    This file does things to the document webpage (everything that isn't part of the chrome extension!)
*/

let originalXLocation = -1;
let originalYLocation = -1;

//TODO: The addListener function is deprecated.. find the new way to do this
chrome.runtime.onMessage.addListener(function(messageBody, sender, sendResponse){
    // Save scroll location so we can reset when we're done highlighting
    originalXLocation = window.scrollX;
    originalYLocation = window.scrollY;

    if (messageBody.toString().length > 3) {
        resetAllHighlights();
        highlightAllWords(messageBody);
    } else {
        goToSummarizedString(messageBody)
    }
    if(sendResponse) sendResponse({content: "highlight done!"});
});

// Navigates the user to where the highlighted text exists on the webpage
function goToSummarizedString(messageBody){
    let stringElement = document.getElementById("summarizedText" + messageBody);
    if (stringElement){
        stringElement.scrollIntoView();
    } else {
        console.log("Unable to move to string element because we couldn't find it..");
    }
}

// Highlights the summarized sentences within the webpage
function highlightAllWords(wordsList){
    if (window.find){
        let count = 0;
        wordsList.forEach(function(words){
            highlightWordsAcrossNode(words, count);
            count++;
        });
    } else {
        console.log('we were unable to find a window!');
    }
}

// Helper function to highlight the summarized sentences within the webpage
function highlightWordsAcrossNode(searchWords, count){
    //find keyword ranges
    let rangeList = [];
    let caseSensitive = false;
    let backwardsSearch = false;
    let originalWrapAroundSearch = true;
    let wrapAroundSearch = false;
    let wholeWordSearch = false;
    let searchInFrames = true;
    let showDialog = false;

    if(window.find(searchWords, caseSensitive, backwardsSearch, originalWrapAroundSearch, wholeWordSearch, searchInFrames, showDialog)){
        do{
            rangeList.push(window.getSelection().getRangeAt(0));
        } while (window.find(searchWords, caseSensitive, backwardsSearch, wrapAroundSearch, wholeWordSearch, searchInFrames, showDialog));
    }

    // highlight all ranges
    rangeList.forEach(function (r){
       highlightRange(r, count);
    });

    //reset scroll position, window.find() will select the last word...
    window.scrollTo(originalXLocation, originalYLocation);
}

// Helper function to highlight the summarized sentences within the webpage
function highlightRange(range, count){
    // create wrapping i
    let iNode = document.createElement("i");
    iNode.id = "summarizedText" + count;
    iNode.classList.add("summarization-extension-highlight");
    iNode.setAttribute("style", "background-color: rgb(255, 251, 120);");
    iNode.appendChild(range.extractContents());
    range.insertNode(iNode);
}

// Removes all of the highlights from the webpage
function resetAllHighlights(){
    let highlightElements = document.getElementsByClassName("summarization-extension-highlight");
    let iNodeElements = [];
    for(iNodeElement of highlightElements){
        iNodeElements.push(iNodeElement)
    }
    for(element of iNodeElements){
        let parentNode = element.parentNode;
        if (parentNode === null){
            continue;
        }
        let parentNodeString = parentNode.innerHTML.toString();
        parentNodeString = parentNodeString.replace(/<i id="summarizedText\d+" class="summarization-extension-highlight" style="background-color: rgb\(255, 251, 120\);">|<\/i>/g, "");
        parentNode.innerHTML = parentNodeString;
    }
}
