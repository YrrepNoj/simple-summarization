let heatmapOptionBool = false;
let awsLoadBalancerURL = "https://slkmjr3jsa.execute-api.us-east-1.amazonaws.com/Prod/summarize";
let lastSummarizedArticleURL = "";
let summarizedStrings = null;
let summarizedKeywords = null;
let currentTabForSummary = null;

window.onload = function () {
    init();
};

function init(){

    chrome.storage.sync.get('heatmapOption', function(data){
        heatmapOptionBool = data.heatmapOption;
        if(data.heatmapOption === null || data.heatmapOption === undefined){
            chrome.storage.sync.set({heatmapOption: false});
            heatmapOptionBool = false;
        }
        console.log(heatmapOptionBool)
        document.getElementById('heatmapCheckbox').checked = heatmapOptionBool
    });

    chrome.storage.sync.get('lastSummarizedArticleStrings', function(data){
       summarizedStrings = data.lastSummarizedArticleStrings;
    });
    chrome.storage.sync.get('lastSummarizedArticleURL', function(data){
        lastSummarizedArticleURL = data.lastSummarizedArticleURL;
    });
    chrome.storage.sync.get('lastSummarizedKeywords', function(data){
        summarizedKeywords = data.lastSummarizedKeywords;
    });

    // Get current tab and set li.onClick() to send message to that tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(tabs){
            currentTabForSummary = tabs[0];
        }
    });

    //check if we just summarized this article and need to refill out the <ul></ul> ...
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(lastSummarizedArticleURL && summarizedStrings && lastSummarizedArticleURL.length > 0
            && tabs && tabs[0] && tabs[0].url === lastSummarizedArticleURL){
            console.log("we are addding the summarized strings to the list..");
            if(heatmapOptionBool){
                addSummarizedStringsToList(summarizedKeywords);
                chrome.tabs.sendMessage(tabs[0].id, summarizedKeywords);
            } else {
                addSummarizedStringsToList(summarizedStrings);
                chrome.tabs.sendMessage(tabs[0].id, summarizedStrings);
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('heatmapCheckbox').addEventListener('change', heatmapCheckboxChange);
    document.getElementById('summarizeButton').addEventListener('click', summarizationButtonOnClick);
});


function heatmapCheckboxChange(){
    heatmapOptionBool = !heatmapOptionBool
    chrome.storage.sync.set({heatmapOption: heatmapOptionBool})

    // Only need to do things if this is the last article we summarized
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(lastSummarizedArticleURL && summarizedStrings && lastSummarizedArticleURL.length > 0
            && tabs && tabs[0] && tabs[0].url === lastSummarizedArticleURL){
            clearList();

            if(heatmapOptionBool){
                chrome.tabs.sendMessage(currentTabForSummary.id, summarizedKeywords);
                addSummarizedStringsToList(summarizedKeywords)
            } else {
                chrome.tabs.sendMessage(currentTabForSummary.id, summarizedStrings);
                addSummarizedStringsToList(summarizedStrings)
            }
        }
    });


}


function summarizationButtonOnClick(){
    setBadSummaryError("");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        console.log(tabs);
        if(tabs){
            let currentTab = tabs[0];
            if(currentTab){
                performQuery(currentTab);
            }
        }
    });
}

function performQuery(currTab){
    console.log("attempting to perform the ajax query with application/json");
    let articleURL = currTab.url;

    // Send POST request to my server to summerize the article
    const req = new XMLHttpRequest();

    const baseURL = awsLoadBalancerURL;
    var bodyData = {
        url: articleURL
    };
    let jsonBody = JSON.stringify(bodyData);

    req.open("POST", baseURL, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(jsonBody);
    setSpinnerDisplay("block");
    req.onreadystatechange = function() {
        if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
            setSpinnerDisplay("none");
            let summaryResponse = JSON.parse(this.responseText);
            summarizedStrings = summaryResponse.articleSummary.split("\n");
            summarizedKeywords = summaryResponse.articleKeywords;

            if (summarizedStrings.length <= 1){
                setBadSummaryError("Unable to summarize. The article may be too short.")
            } else {
                // Update the context of the page with highlights
                chrome.storage.sync.set({lastSummarizedArticleURL: currTab.url});
                chrome.storage.sync.set({lastSummarizedArticleStrings: summarizedStrings});
                chrome.storage.sync.set({lastSummarizedKeywords: summarizedKeywords});
                if(heatmapOptionBool){
                    chrome.tabs.sendMessage(currTab.id, summarizedKeywords);
                    addSummarizedStringsToList(summarizedKeywords)
                } else {
                    chrome.tabs.sendMessage(currTab.id, summarizedStrings);
                    addSummarizedStringsToList(summarizedStrings)
                }

            }
        } else if (this.readyState === XMLHttpRequest.DONE){
            setSpinnerDisplay("none");
            setBadSummaryError("Unable to summarize. Error when talking to API.");
        }
    };
}

function setBadSummaryError(notice){
    let successSpan = document.getElementById("success");
    successSpan.textContent = "";
    let errorSpan = document.getElementById("error");
    errorSpan.textContent = notice;
}

function setSuccessesNotice(notice){
    let errorSpan = document.getElementById("error");
    errorSpan.textContent = "";
    let successSpan = document.getElementById("success");
    successSpan.textContent = notice;
}

function setSpinnerDisplay(display){
    console.log("setting display for spinner: " + display);
    let spinner = document.getElementById("spinner");
    spinner.style.display = display;
}

function addSummarizedStringsToList(summarizedStrings){
    summarizedStrings.forEach(function(element, i){
        let ul = document.getElementById("summarization_texts");
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(element));
        li.setAttribute("id", "summarizedText" + i);
        li.setAttribute("class", "summarizedTextLI");

        // Get current tab and set li.onClick() to send message to that tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            if(tabs){
                let currentTab = tabs[0];
                if(currentTab){
                    li.onclick = function(){
                        chrome.tabs.sendMessage(currentTab.id, i);
                    }

                }
            }
        });
        ul.appendChild(li);
    });
}

function clearList(){
    let ul = document.getElementById("summarization_texts");
    ul.innerHTML = "";
}
