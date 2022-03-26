# Simple Chrome Extension

This is a Google Chrome Extension for using the Lambda Function defined elsewhere in this project for getting information from a web article.


The goal of this project is to make it easy to get quick glimpses of articles. This way, if you're not sure that you're interested in fully reading the article you can get a better idea by highlighting the important summary of the article for you. The summary of the article is presented within the extension popup for quick reading as well as being highlighted within the text of the webpage in the browser so the reader will know when they're coming up on an important piece of text when reading through the entire article.


## Getting Started
Until this project is polished up more and put on the Chrome Store, you can clone the repository and run the chrome extension locally.
1. Navigate to chrome://extensions
2. Toggle 'Developer mode' in the top right
3. Click the 'Load Unpacked' button
4. Select the 'chrome-extension' directory of your cloned repository
5. Refresh/Relaunch Chrome 

Once loaded, simple local changes should be reflected simply by closed and re-launching the Chrome Extension. If there are bigger changes (dependencies, imports, changes to the manifest file) you might need to navigate back to chrome://extensions and click the refresh button on the unpacked extension.


## (Potential) Roadmap 
1. Displaying the history of articles that have been summarized
2. Allowing users to add their own highlights to the summary
3. Allowing users to add articles for a list of 'nightly digests' that will be emailed to them before the next morning
