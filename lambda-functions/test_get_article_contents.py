import unittest
import nltk
from lambda_function import getArticleContents

class TestGetArticleContents(unittest.TestCase):
    def test_valid_article_request(self):
        article = getArticleContents("https://news.yahoo.com/life-could-not-survive-nearest-191618877.html")
        self.assertIsNotNone(article)
        self.assertIsNotNone(article.text)
        self.assertIsNotNone(article.title)
        self.assertIsNotNone(article.url)


    def test_invalid_request(self):
        self.assertIsNone(getArticleContents(""))
        self.assertIsNone(getArticleContents("  "))


if __name__ == "__main__":
    nltk.download('punkt')
    unittest.main()