import json

from newspaper import Article

def lambda_handler(event, context):
    if event['body'] is None:
        return{
            'statusCode': 400,
            'body': "Need to include 'url' in body of POST request"
        }
    reqBody = json.loads(event['body'])

    if reqBody['url'] is None:
        return{
            'statusCode': 400,
            'body': "Need to include 'url' in body of POST request"
        }

    articleURL = reqBody['url']
    article = getArticleContents(articleURL)

    returnBody = {
        "articleURL" : articleURL,
        "articleText" : article.text,
        "articlePublishDate" : article.publish_date,
        "articleKeywords" : article.keywords,
        "articleSummary" : article.summary,
        "articleTitle" : article.title

    }

    return {
        'statusCode': 200,
        'body': json.dumps(returnBody, default=str)
    }


def getArticleContents(url, maxSummaryCount=10):
    #TODO Add some (better) logic to look out for invalid urls
    if not url.strip():
        return None

    article = Article(url)

    if article is None:
        return None

    article.download()
    article.parse()

    article.config.MAX_SUMMARY_SENT = maxSummaryCount

    article.nlp()
    return article
