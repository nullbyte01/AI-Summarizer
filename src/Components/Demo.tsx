import React, { useEffect, useState } from "react";
import copy from "../assets/copy.svg";
import linkIcon from "../assets/link.svg";
import submitIcon from "../assets/submit.svg";
import loader from "../assets/loader.svg";
import tick from "../assets/tick.svg";
import { useLazyGetSummaryQuery } from "../services/article";

interface Article {
  url: string;
  summary: string;
}

const Demo: React.FC = () => {
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();
  const [copied, setCopied] = useState<string>("");

  const [article, setArticle] = useState<Article>({
    url: "",
    summary: "",
  });

  const [allArticles, setAllArticles] = useState<Article[]>([]);

  useEffect(() => {
    const articlesFromLocalStorage: Article[] = JSON.parse(
      localStorage.getItem("articles") || "{}"
    );
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [
        newArticle,
        ...(Array.isArray(allArticles) ? allArticles : []),
      ];

      setArticle(newArticle);
      setAllArticles(updatedAllArticles);

      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  const handleCopy = (copyUrl: string) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt=""
            className="absolute left-0 my-2 ml-3 w-5"
          />
          <input
            type="url"
            placeholder="Enter a url"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            required
            className="url_input peer"
          />
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            <img src={submitIcon} alt="" className="w-4" />
          </button>
        </form>

        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {Array.isArray(allArticles) ? (
            allArticles.map((item, index) => {
              return (
                <div
                  key={`link-${index}`}
                  onClick={() => setArticle(item)}
                  className="link_card"
                >
                  <div
                    className="copy_btn"
                    onClick={() => {
                      handleCopy(item.url);
                    }}
                  >
                    <img
                      src={copied == item.url ? tick : copy}
                      alt=""
                      className="w-[40%] h-[40%]"
                    />
                  </div>
                  <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                    {item.url}
                  </p>
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
      </div>

      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Seems like there is an error processing your request
            <br />{" "}
            <span className="font-satoshi font-normal text-gray-700">
              {(error && 'status' in error)?'error' in error?error.error:'Error occured':error.message}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article <span className="blue_gradient">Summary</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
